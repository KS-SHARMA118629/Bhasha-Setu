import { BadgeCheck, User, Phone, Video, ChevronLeft, MoreVertical } from 'lucide-react';
import { resolveAvatar, formatLastSeen } from '../../lib/chatUtils';

const ChatHeader = ({ conversation, otherUser, presence, onBack, isGroup }) => {
  const isOnline = presence?.is_online;
  const lastSeen = presence?.last_seen;

  const avatar = isGroup
    ? conversation?.avatar_url || null
    : resolveAvatar(otherUser);

  const displayName = isGroup
    ? conversation?.name || 'Group Chat'
    : otherUser?.name || otherUser?.username || 'Unknown';

  const statusText = isGroup
    ? `${conversation?.memberCount || ''} members`
    : isOnline
    ? 'Online'
    : lastSeen
    ? `Last seen ${formatLastSeen(lastSeen)}`
    : 'Offline';

  return (
    <div className="chat-header">
      {/* Back button (mobile) */}
      <button className="chat-header-back" onClick={onBack} aria-label="Back">
        <ChevronLeft size={24} />
      </button>

      {/* Avatar */}
      <div style={{ position: 'relative' }}>
        <div className="chat-header-avatar">
          {avatar ? (
            <img src={avatar} alt={displayName} />
          ) : (
            <div className="chat-header-avatar-placeholder">
              <User size={22} color="var(--text-muted)" />
            </div>
          )}
        </div>
        {!isGroup && (
          <span className={`presence-dot ${isOnline ? 'presence-dot--online' : 'presence-dot--offline'}`} />
        )}
      </div>

      {/* Name & status */}
      <div className="chat-header-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="chat-header-name">{displayName}</span>
          {!isGroup && otherUser?.verified && (
            <BadgeCheck size={16} fill="#1DA1F2" color="#fff" />
          )}
        </div>
        <span className={`chat-header-status ${isOnline && !isGroup ? 'chat-header-status--online' : ''}`}>
          {statusText}
        </span>
      </div>

      {/* Actions */}
      <div className="chat-header-actions">
        <button className="chat-header-action-btn" title="Voice call (coming soon)">
          <Phone size={20} />
        </button>
        <button className="chat-header-action-btn" title="Video call (coming soon)">
          <Video size={20} />
        </button>
        <button className="chat-header-action-btn" title="More options">
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
