import { useState, useRef, useEffect } from 'react';
import { BadgeCheck, User, MoreVertical, Reply, Edit2, Trash2, Check, CheckCheck, Play, Pause, Download, Copy } from 'lucide-react';
import { resolveAvatar, formatTime } from '../../lib/chatUtils';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const DeliveryIcon = ({ msg, isMine }) => {
  if (!isMine) return null;
  if (msg.read_at)    return <CheckCheck size={14} color="#1DA1F2" />;
  if (msg.delivered_at) return <CheckCheck size={14} color="var(--text-muted)" />;
  return <Check size={14} color="var(--text-muted)" />;
};

const AudioPlayer = ({ url }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      <button className="audio-play-btn" onClick={toggle}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div className="audio-waveform">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="audio-bar" style={{ height: `${8 + Math.sin(i * 0.8) * 6}px` }} />
        ))}
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isMine, sender, onReact, onReply, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const avatar = resolveAvatar(sender);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowReactions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (message.deleted) {
    return (
      <div className={`bubble-row ${isMine ? 'bubble-row--mine' : ''}`}>
        <div className="bubble bubble--deleted">
          <em>This message was deleted</em>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="bubble-media">
            <img src={message.media_url} alt="Image" className="bubble-img" onClick={() => window.open(message.media_url, '_blank')} />
            {message.content && <p className="bubble-caption">{message.content}</p>}
          </div>
        );
      case 'video':
        return (
          <div className="bubble-media">
            <video src={message.media_url} controls className="bubble-video" />
            {message.content && <p className="bubble-caption">{message.content}</p>}
          </div>
        );
      case 'audio':
        return <AudioPlayer url={message.media_url} />;
      case 'file':
        return (
          <a href={message.media_url} target="_blank" rel="noreferrer" className="bubble-file">
            <Download size={18} />
            <span>{message.content || 'Download File'}</span>
          </a>
        );
      default:
        return <p className="bubble-text">{message.content}</p>;
    }
  };

  return (
    <div className={`bubble-row ${isMine ? 'bubble-row--mine' : ''}`}>
      {/* Sender avatar (only for received) */}
      {!isMine && (
        <div className="bubble-avatar">
          {avatar ? (
            <img src={avatar} alt={sender?.name} />
          ) : (
            <div className="bubble-avatar-placeholder"><User size={16} color="var(--text-muted)" /></div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '70%', position: 'relative' }} ref={menuRef}>
        {/* Sender name (group or received) */}
        {!isMine && sender && (
          <div className="bubble-sender-name">
            {sender.name || sender.username}
            {sender.verified && <BadgeCheck size={13} fill="#1DA1F2" color="#fff" style={{ marginLeft: 3 }} />}
          </div>
        )}

        {/* Reply preview */}
        {message.reply_to && (
          <div className="reply-preview">
            <div className="reply-bar" />
            <span>Replying to a message</span>
          </div>
        )}

        {/* Main bubble */}
        <div
          className={`bubble ${isMine ? 'bubble--mine' : 'bubble--theirs'} ${message.edited ? 'bubble--edited' : ''}`}
          onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
        >
          {renderContent()}

          <div className="bubble-meta">
            {message.edited && <span className="bubble-edited">edited</span>}
            <span className="bubble-time">{formatTime(message.created_at)}</span>
            <DeliveryIcon msg={message} isMine={isMine} />
          </div>
        </div>

        {/* Reactions display */}
        {message.reactions?.length > 0 && (
          <div className={`reactions-row ${isMine ? 'reactions-row--mine' : ''}`}>
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {})
            ).map(([emoji, count]) => (
              <span key={emoji} className="reaction-pill" onClick={() => onReact?.(message.id, emoji)}>
                {emoji} {count}
              </span>
            ))}
          </div>
        )}

        {/* Context menu trigger */}
        <button
          className={`bubble-menu-trigger ${isMine ? 'bubble-menu-trigger--mine' : ''}`}
          onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
          aria-label="Message options"
        >
          <MoreVertical size={15} />
        </button>

        {/* Context menu */}
        {showMenu && (
          <div className={`bubble-context-menu ${isMine ? 'bubble-context-menu--mine' : ''}`}>
            <button onClick={() => { setShowReactions(true); setShowMenu(false); }}>React 😊</button>
            <button onClick={() => { onReply?.(message); setShowMenu(false); }}>
              <Reply size={14} /> Reply
            </button>
            <button onClick={() => { navigator.clipboard.writeText(message.content || ''); setShowMenu(false); }}>
              <Copy size={14} /> Copy
            </button>
            {isMine && (
              <>
                <button onClick={() => { onEdit?.(message); setShowMenu(false); }}>
                  <Edit2 size={14} /> Edit
                </button>
                <button className="danger" onClick={() => { onDelete?.(message.id); setShowMenu(false); }}>
                  <Trash2 size={14} /> Delete
                </button>
              </>
            )}
          </div>
        )}

        {/* Reaction picker */}
        {showReactions && (
          <div className={`reaction-picker ${isMine ? 'reaction-picker--mine' : ''}`}>
            {REACTIONS.map((e) => (
              <button key={e} onClick={() => { onReact?.(message.id, e); setShowReactions(false); setShowMenu(false); }}>
                {e}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
