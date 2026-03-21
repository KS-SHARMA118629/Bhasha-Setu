import { useState, useEffect } from 'react';
import { BadgeCheck, User, Phone, Video, ChevronLeft, MoreVertical, Settings } from 'lucide-react';
import { resolveAvatar, formatLastSeen } from '../../lib/chatUtils';
import GroupSettingsModal from './GroupSettingsModal';
import { supabase } from '../../lib/supabase';

const ChatHeader = ({ conversation, otherUser, presence, onBack, isGroup, session, onGroupUpdated }) => {
  const isOnline = presence?.is_online;
  const lastSeen = presence?.last_seen;
  const [showSettings, setShowSettings] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (isGroup && session?.user?.id) {
      checkMembership();
    }
  }, [isGroup, session?.user?.id, conversation?.id]);

  const checkMembership = async () => {
    const { data } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', conversation.id)
      .eq('user_id', session.user.id)
      .single();
    
    setIsMember(!!data);
  };

  const handleJoin = async () => {
    const { error } = await supabase.from('conversation_members').insert({
      conversation_id: conversation.id,
      user_id: session.user.id,
      role: 'member',
      is_admin: false,
    });
    if (!error) {
      setIsMember(true);
      onGroupUpdated?.();
    }
  };

  const avatar = isGroup
    ? conversation?.avatar_url || null
    : resolveAvatar(otherUser);

  const displayName = isGroup
    ? conversation?.name || 'Group Chat'
    : otherUser?.name || otherUser?.username || 'Unknown';

  const statusText = isGroup
    ? `${conversation?.memberCount || 0} members`
    : isOnline
    ? 'Online'
    : lastSeen
    ? `Last seen ${formatLastSeen(lastSeen)}`
    : 'Offline';

  return (
    <>
      <div className="chat-header">
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className={`chat-header-status ${isOnline && !isGroup ? 'chat-header-status--online' : ''}`}>
              {statusText}
            </span>
            {isGroup && conversation?.description && (
              <span className="chat-header-status" style={{ fontSize: '0.72rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {conversation.description}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="chat-header-actions">
          {isGroup ? (
            <>
              {!isMember ? (
                <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={handleJoin}>
                  Join Group
                </button>
              ) : (
                <button className="chat-header-action-btn" title="Group Settings" onClick={() => setShowSettings(true)}>
                  <Settings size={20} />
                </button>
              )}
            </>
          ) : (
            <>
              <button className="chat-header-action-btn" title="Voice call">
                <Phone size={20} />
              </button>
              <button className="chat-header-action-btn" title="Video call">
                <Video size={20} />
              </button>
              <button className="chat-header-action-btn" title="More options">
                <MoreVertical size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {showSettings && isGroup && (
        <GroupSettingsModal
          group={conversation}
          session={session}
          onClose={() => setShowSettings(false)}
          onGroupUpdated={onGroupUpdated}
        />
      )}
    </>
  );
};

export default ChatHeader;
