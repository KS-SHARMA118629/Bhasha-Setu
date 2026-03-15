import { BadgeCheck, Circle, User } from 'lucide-react';
import { resolveAvatar, formatLastSeen } from '../../lib/chatUtils';

/**
 * UserCard
 * Displayed in the Community page user list.
 */
const UserCard = ({ profile, presence, onChat, isMe }) => {
  const avatar = resolveAvatar(profile);
  const isOnline = presence?.is_online;
  const lastSeen = presence?.last_seen;

  return (
    <div className="user-card" onClick={() => !isMe && onChat?.(profile)}>
      {/* Avatar + online dot */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className="user-card-avatar-ring">
          {avatar ? (
            <img src={avatar} alt={profile.name} className="user-card-avatar-img" />
          ) : (
            <div className="user-card-avatar-placeholder">
              <User size={24} color="var(--text-muted)" />
            </div>
          )}
        </div>
        <span
          className={`presence-dot ${isOnline ? 'presence-dot--online' : 'presence-dot--offline'}`}
          title={isOnline ? 'Online' : `Last seen ${formatLastSeen(lastSeen)}`}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="user-card-name">{profile.name || profile.username || 'Unknown'}</span>
          {profile.verified && (
            <BadgeCheck size={16} fill="#1DA1F2" color="#fff" title="Verified" />
          )}
          {isMe && (
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(37,99,235,0.15)', color: 'var(--primary)', borderRadius: 8 }}>You</span>
          )}
        </div>
        <p className="user-card-status">
          {isOnline ? (
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.78rem' }}>● Online now</span>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
            </span>
          )}
        </p>
        {profile.bio && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* Chat button */}
      {!isMe && (
        <div className="user-card-action">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default UserCard;
