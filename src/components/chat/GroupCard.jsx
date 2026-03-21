import { Users, ShieldCheck } from 'lucide-react';
import { resolveAvatar, formatLastSeen } from '../../lib/chatUtils';

/**
 * GroupCard
 * Displayed in the Community page for group chats.
 */
const GroupCard = ({ group, onChat }) => {
  const avatar = group.avatar_url;
  const memberCount = group.memberCount || 0;

  return (
    <div className="user-card" onClick={() => onChat?.(group)}>
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div className="user-card-avatar-ring">
          {avatar ? (
            <img src={avatar} alt={group.name} className="user-card-avatar-img" />
          ) : (
            <div className="user-card-avatar-placeholder">
              <Users size={24} color="var(--text-muted)" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="user-card-name">{group.name}</span>
        </div>
        <p className="user-card-status">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            {memberCount} members
          </span>
        </p>
        {group.description && (
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {group.description}
          </p>
        )}
      </div>

      {/* Chat button */}
      <div className="user-card-action">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>
    </div>
  );
};

export default GroupCard;
