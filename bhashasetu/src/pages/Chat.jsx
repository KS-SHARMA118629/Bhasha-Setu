import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useChat } from '../hooks/useChat';
import {
  ArrowLeft, Send, Image as ImageIcon, Trash2, Smile, BadgeCheck,
  Loader2, Users, CheckCheck
} from 'lucide-react';

import './Chat.css';

const EMOJI_LIST = ['👍','❤️','😂','😮','😢','🔥','🎉','👏'];

const getAvatarUrl = (p) => p?.avatar_url || p?.profile_picture_url || null;

const Avatar = ({ profile, size = 40 }) => {
  const url = getAvatarUrl(profile);
  return (
    <div className="chat-av-ring" style={{ width: size, height: size, minWidth: size }}>
      {url
        ? <img src={url} alt={profile?.name} className="chat-av-img" />
        : <div className="chat-av-placeholder">{(profile?.name || '?')[0].toUpperCase()}</div>
      }
    </div>
  );
};

// ─── Chat Page ───────────────────────────────────────────────────────────────
const Chat = ({ session }) => {
  const { conversationId } = useParams();
  const location           = useLocation();
  const navigate           = useNavigate();

  // Peer info passed via navigation state (populated by Community page)
  const stateOtherUser  = location.state?.otherUser;
  const stateIsGroup    = location.state?.isGroup;
  const stateGroupName  = location.state?.groupName;

  const [otherUser,    setOtherUser]    = useState(stateOtherUser || null);
  const [convoInfo,    setConvoInfo]    = useState(null);
  const [isGroup,      setIsGroup]      = useState(stateIsGroup || false);
  const [presence,     setPresence]     = useState({});
  const [myProfile,    setMyProfile]    = useState(null);
  const [text,         setText]         = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [pickerMsgId,  setPickerMsgId]  = useState(null); // emoji picker open for which msg
  const [menuMsgId,    setMenuMsgId]    = useState(null); // context menu
  const [isAdmin,      setIsAdmin]      = useState(false);
  const [members,      setMembers]      = useState([]);

  const bottomRef    = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef  = useRef(null);

  const { messages, typingUsers, loading, sendMessage, deleteMessage, reactToMessage, startTyping } =
    useChat(conversationId, session?.user?.id);

  // ── Fetch meta ────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || !conversationId) return;
    const init = async () => {
      // My profile
      const { data: me } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setMyProfile(me);

      // Conversation info
      const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
      if (conv) { setConvoInfo(conv); setIsGroup(conv.is_group); }

      // Members
      const { data: mems } = await supabase
        .from('conversation_members')
        .select('*, profiles(id, name, avatar_url, profile_picture_url, verified, role)')
        .eq('conversation_id', conversationId);
      setMembers(mems || []);

      // Admin check
      const myMem = (mems || []).find(m => m.user_id === session.user.id);
      setIsAdmin(myMem?.is_admin || me?.role === 'admin');

      // If DM: get other user
      if (!conv?.is_group && !stateOtherUser) {
        const other = (mems || []).find(m => m.user_id !== session.user.id);
        if (other?.profiles) setOtherUser(other.profiles);
      }
    };
    init();
  }, [conversationId, session]);

  // ── Presence ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('user_presence').select('*');
      const map = {};
      (data || []).forEach(p => { map[p.user_id] = p; });
      setPresence(map);
    };
    fetch();
    const ch = supabase
      .channel('presence-chat-' + conversationId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [conversationId]);

  // ── Auto-scroll ───────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send text ─────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    await sendMessage(text);
    setText('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Image upload ──────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const ext  = file.name.split('.').pop();
    const path = `messages/${conversationId}/${Date.now()}.${ext}`;
    await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await sendMessage(null, publicUrl);
    setImageUploading(false);
    e.target.value = '';
  };

  // ── Helpers ───────────────────────────────────────────────────────
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const otherOnline  = otherUser ? presence[otherUser.id]?.is_online : false;
  const headerTitle  = isGroup ? (convoInfo?.group_name || stateGroupName || 'Group Chat') : otherUser?.name;
  const headerVerif  = !isGroup && otherUser?.verified;

  // Group emoji reactions by emoji for a message
  const groupReactions = (reactions = []) => {
    const map = {};
    reactions.forEach(r => { map[r.emoji] = (map[r.emoji] || 0) + 1; });
    return Object.entries(map);
  };

  // Check if current user reacted with an emoji
  const myReaction = (reactions = [], emoji) =>
    reactions.some(r => r.user_id === session?.user?.id && r.emoji === emoji);

  if (!session) return <div className="chat-auth-wall">Please log in to chat.</div>;

  return (
    <div className="chat-root">
      {/* ════ HEADER ═════════════════════════════════════════════════ */}
      <header className="chat-header">
        <button className="chat-back-btn" onClick={() => navigate('/community')}>
          <ArrowLeft size={20} />
        </button>

        <div className="chat-header-av">
          {isGroup ? (
            <div className="chat-group-icon"><Users size={22} color="var(--primary)" /></div>
          ) : (
            <div className="chat-header-av-wrap">
              <Avatar profile={otherUser} size={42} />
              <span className={`chat-online-dot ${otherOnline ? 'is-online' : ''}`} />
            </div>
          )}
        </div>

        <div className="chat-header-info">
          <div className="chat-header-name-row">
            <span className="chat-header-name">{headerTitle || '…'}</span>
            {headerVerif && <BadgeCheck size={18} fill="#1DA1F2" color="#fff" />}
          </div>
          <span className="chat-header-sub">
            {isGroup
              ? `${members.length} members`
              : otherOnline ? '● Online' : 'Offline'
            }
          </span>
        </div>
      </header>

      {/* ════ MESSAGES ═══════════════════════════════════════════════ */}
      <div className="chat-messages-area" onClick={() => { setPickerMsgId(null); setMenuMsgId(null); }}>
        {loading ? (
          <div className="chat-loading"><Loader2 size={30} className="chat-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <MessagePlaceholder />
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe  = msg.sender_id === session.user.id;
            const sender = msg.sender;
            const reactions = groupReactions(msg.reactions);

            return (
              <div key={msg.id} className={`chat-msg-row ${isMe ? 'mine' : 'theirs'}`}>
                {/* Avatar (group: always; DM: only theirs) */}
                {(!isMe || isGroup) && !isMe && (
                  <Avatar profile={sender} size={32} />
                )}

                <div className="chat-msg-col">
                  {/* Sender name in group */}
                  {isGroup && !isMe && (
                    <span className="chat-sender-name">
                      {sender?.name}
                      {sender?.verified && <BadgeCheck size={12} fill="#1DA1F2" color="#fff" />}
                    </span>
                  )}

                  {/* Bubble */}
                  <div className="chat-bubble-wrap">
                    <div
                      className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-them'} ${msg.is_deleted ? 'bubble-deleted' : ''}`}
                      onContextMenu={e => { e.preventDefault(); setMenuMsgId(msg.id); setPickerMsgId(null); }}
                    >
                      {msg.is_deleted ? (
                        <span className="chat-deleted-txt">🚫 Message deleted</span>
                      ) : (
                        <>
                          {msg.image_url && (
                            <img
                              src={msg.image_url}
                              alt="attachment"
                              className="chat-msg-img"
                              onClick={() => window.open(msg.image_url, '_blank')}
                            />
                          )}
                          {msg.content && <span>{msg.content}</span>}
                        </>
                      )}
                    </div>

                    {/* Emoji picker trigger */}
                    {!msg.is_deleted && (
                      <button
                        className="chat-react-btn"
                        onClick={e => { e.stopPropagation(); setPickerMsgId(pickerMsgId === msg.id ? null : msg.id); setMenuMsgId(null); }}
                      >
                        <Smile size={15} />
                      </button>
                    )}

                    {/* Context menu (delete) */}
                    {menuMsgId === msg.id && !msg.is_deleted && (
                      <div className={`chat-context-menu ${isMe ? 'menu-left' : 'menu-right'}`}
                        onClick={e => e.stopPropagation()}
                      >
                        {(isMe || isAdmin) && (
                          <button className="chat-ctx-item danger" onClick={() => { deleteMessage(msg.id); setMenuMsgId(null); }}>
                            <Trash2 size={14} /> {isMe ? 'Unsend' : 'Remove'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Emoji picker */}
                  {pickerMsgId === msg.id && (
                    <div className={`chat-emoji-picker ${isMe ? 'picker-left' : 'picker-right'}`}
                      onClick={e => e.stopPropagation()}
                    >
                      {EMOJI_LIST.map(em => (
                        <button
                          key={em}
                          className={`chat-emoji-btn ${myReaction(msg.reactions, em) ? 'active' : ''}`}
                          onClick={() => { reactToMessage(msg.id, em); setPickerMsgId(null); }}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reactions display */}
                  {reactions.length > 0 && (
                    <div className="chat-reactions">
                      {reactions.map(([em, count]) => (
                        <button
                          key={em}
                          className={`chat-reaction-pill ${myReaction(msg.reactions, em) ? 'reacted' : ''}`}
                          onClick={() => reactToMessage(msg.id, em)}
                        >
                          {em} <span>{count}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp + delivery */}
                  <span className={`chat-msg-time ${isMe ? 'time-right' : 'time-left'}`}>
                    {formatTime(msg.created_at)}
                    {isMe && <CheckCheck size={13} className="chat-delivered" />}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="chat-typing-row">
            <div className="chat-typing-bubble">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
            <span className="chat-typing-label">
              {typingUsers.map(t => t.profiles?.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ════ INPUT BAR ══════════════════════════════════════════════ */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          type="button"
          className="chat-icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={imageUploading}
          title="Send image"
        >
          {imageUploading ? <Loader2 size={20} className="chat-spin" /> : <ImageIcon size={20} />}
        </button>

        <textarea
          ref={textareaRef}
          className="chat-textarea"
          placeholder="Type a message…"
          rows={1}
          value={text}
          onChange={e => { setText(e.target.value); startTyping(); }}
          onKeyDown={handleKeyDown}
        />

        <button
          type="submit"
          className={`chat-send-btn ${text.trim() ? 'active' : ''}`}
          disabled={!text.trim() && !imageUploading}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

// Small SVG placeholder for empty chat
const MessagePlaceholder = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }}>
    <rect width="80" height="80" rx="40" fill="currentColor" fillOpacity=".08" />
    <path d="M20 28a4 4 0 014-4h32a4 4 0 014 4v24a4 4 0 01-4 4H36l-8 8v-8h-4a4 4 0 01-4-4V28z"
      stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

export default Chat;
