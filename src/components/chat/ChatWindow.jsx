import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const PAGE_SIZE = 40;

const ChatWindow = ({ conversationId, currentUser, otherUser, isGroup, groupData, onBack, onGroupUpdated }) => {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});    // { userId: profileObj }
  const [typingUsers, setTypingUsers] = useState([]);
  const [presence, setPresence] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const channelRef = useRef(null);
  const typingChannelRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────
  const buildProfileMap = useCallback(async (msgs) => {
    const ids = [...new Set(msgs.map((m) => m.sender_id))];
    if (!ids.length) return;
    const { data } = await supabase.from('profiles').select('id, name, username, avatar_url, profile_picture_url, verified').in('id', ids);
    if (data) {
      setProfiles((prev) => {
        const next = { ...prev };
        data.forEach((p) => (next[p.id] = p));
        return next;
      });
    }
  }, []);

  const fetchReactions = async (msgIds) => {
    if (!msgIds.length) return {};
    const { data } = await supabase.from('message_reactions').select('*').in('message_id', msgIds);
    const map = {};
    data?.forEach((r) => {
      if (!map[r.message_id]) map[r.message_id] = [];
      map[r.message_id].push(r);
    });
    return map;
  };

  // ── Load initial messages ─────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    setMessages([]);

    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (data) {
        const sorted = data.reverse();
        const reactions = await fetchReactions(sorted.map((m) => m.id));
        const merged = sorted.map((m) => ({ ...m, reactions: reactions[m.id] || [] }));
        setMessages(merged);
        await buildProfileMap(sorted);
        setHasMore(data.length === PAGE_SIZE);
      }
      setLoading(false);

      // Mark messages delivered
      await supabase
        .from('messages')
        .update({ delivered_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUser.id)
        .is('delivered_at', null);
    };

    load();
  }, [conversationId]);

  // ── Supabase Realtime subscriptions ──────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    // Messages channel
    const msgChannel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        const newMsg = { ...payload.new, reactions: [] };
        setMessages((prev) => [...prev, newMsg]);
        await buildProfileMap([newMsg]);
        // Mark delivered immediately if not mine
        if (newMsg.sender_id !== currentUser.id) {
          await supabase.from('messages').update({ delivered_at: new Date().toISOString() }).eq('id', newMsg.id);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m))
        );
      })
      .subscribe();

    // Typing status (using typing_indicators table as that's what exists)
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const { user_id, is_typing } = payload.new || payload.old;
        if (user_id === currentUser.id) return;
        setTypingUsers((prev) =>
          is_typing ? [...new Set([...prev, user_id])] : prev.filter((id) => id !== user_id)
        );
      })
      .subscribe();

    // Presence channel for other user
    if (otherUser?.id) {
      const presChannel = supabase
        .channel(`presence:${otherUser.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${otherUser.id}`,
        }, (payload) => setPresence(payload.new))
        .subscribe();

      // Load initial presence
      supabase.from('user_presence').select('*').eq('user_id', otherUser.id).single().then(({ data }) => {
        if (data) setPresence(data);
      });

      return () => {
        supabase.removeChannel(msgChannel);
        supabase.removeChannel(typingChannel);
        supabase.removeChannel(presChannel);
      };
    }

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId, otherUser?.id]);

  // ── Actions ───────────────────────────────────────────────────────────
  const handleSend = async (msgData) => {
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUser.id,
      ...msgData,
    });
    if (!error) setReplyTo(null);
  };

  const handleTyping = async (isTyping = true) => {
    await supabase.from('typing_indicators').upsert({
      conversation_id: conversationId,
      user_id: currentUser.id,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });
  };

  const handleDelete = async (msgId) => {
    await supabase.from('messages').update({ deleted: true, content: null }).eq('id', msgId);
  };

  const handleReact = async (msgId, emoji) => {
    // Toggle: add if not there, remove if already there
    const existing = messages
      .find((m) => m.id === msgId)
      ?.reactions?.find((r) => r.user_id === currentUser.id && r.emoji === emoji);

    if (existing) {
      await supabase.from('message_reactions').delete().eq('id', existing.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, reactions: m.reactions.filter((r) => r.id !== existing.id) }
            : m
        )
      );
    } else {
      const { data } = await supabase
        .from('message_reactions')
        .insert({ message_id: msgId, user_id: currentUser.id, emoji })
        .select()
        .single();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, reactions: [...(m.reactions || []), data] } : m
        )
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  const conversation = isGroup ? groupData : { id: conversationId };

  return (
    <div className="chat-window">
      <ChatHeader
        conversation={conversation}
        otherUser={otherUser}
        presence={presence}
        onBack={onBack}
        isGroup={isGroup}
        onGroupUpdated={onGroupUpdated}
        session={{user: currentUser}}
      />

      <div className="chat-window-body">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <p>Start the conversation! Say hi 👋</p>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUser.id}
            profiles={profiles}
            typingUsers={typingUsers}
            onReact={handleReact}
            onReply={setReplyTo}
            onDelete={handleDelete}
            onEdit={setEditingMessage}
          />
        )}
      </div>

      <ChatInput
        conversationId={conversationId}
        senderId={currentUser.id}
        onSend={handleSend}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
      />
    </div>
  );
};

export default ChatWindow;
