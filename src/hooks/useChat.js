import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * All messaging logic in one hook.
 * Returns messages, send/delete/react helpers, typing subscribers, etc.
 */
export const useChat = (conversationId, currentUserId) => {
  const [messages,   setMessages]   = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const typingTimer = useRef(null);

  // ── Fetch initial messages ───────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles(id, name, avatar_url, profile_picture_url, verified), reactions:message_reactions(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── Real-time message subscription ──────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, () => fetchMessages())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
      }, () => fetchMessages())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`,
      }, async () => {
        const { data } = await supabase
          .from('typing_indicators')
          .select('user_id, profiles(name)')
          .eq('conversation_id', conversationId)
          .neq('user_id', currentUserId);
        setTypingUsers(data || []);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [conversationId, currentUserId, fetchMessages]);

  // ── Send a message ───────────────────────────────────────────────
  const sendMessage = useCallback(async (content, imageUrl = null) => {
    if (!content?.trim() && !imageUrl) return;
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content?.trim() || null,
      image_url: imageUrl,
    });
    stopTyping();
  }, [conversationId, currentUserId]);

  // ── Delete / unsend ──────────────────────────────────────────────
  const deleteMessage = useCallback(async (messageId) => {
    await supabase.from('messages').update({ is_deleted: true, content: null, image_url: null })
      .eq('id', messageId);
  }, []);

  // ── React to a message ───────────────────────────────────────────
  const reactToMessage = useCallback(async (messageId, emoji) => {
    // Toggle: if reaction exists delete, else insert
    const { data: existing } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', currentUserId)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing) {
      await supabase.from('message_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('message_reactions').insert({ message_id: messageId, user_id: currentUserId, emoji });
    }
  }, [currentUserId]);

  // ── Typing indicator ─────────────────────────────────────────────
  const startTyping = useCallback(async () => {
    clearTimeout(typingTimer.current);
    await supabase.from('typing_indicators').upsert(
      { conversation_id: conversationId, user_id: currentUserId, updated_at: new Date().toISOString() },
      { onConflict: 'conversation_id,user_id' }
    );
    typingTimer.current = setTimeout(stopTyping, 3000);
  }, [conversationId, currentUserId]);

  const stopTyping = useCallback(async () => {
    clearTimeout(typingTimer.current);
    await supabase.from('typing_indicators').delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', currentUserId);
  }, [conversationId, currentUserId]);

  return { messages, typingUsers, loading, sendMessage, deleteMessage, reactToMessage, startTyping };
};
