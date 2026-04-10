import { useState, useEffect } from 'react';
import { BadgeCheck, User, Phone, Video, ChevronLeft, MoreVertical, Settings, Languages, ShieldAlert, UserX } from 'lucide-react';
import { resolveAvatar, formatLastSeen } from '../../lib/chatUtils';
import GroupSettingsModal from './GroupSettingsModal';
import { supabase } from '../../lib/supabase';

const ChatHeader = ({ conversation, otherUser, presence, onBack, isGroup, session, onGroupUpdated }) => {
  const isOnline = presence?.is_online;
  const lastSeen = presence?.last_seen;
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreOpts, setShowMoreOpts] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

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
        <div className="chat-header-actions" style={{ position: 'relative' }}>
          {isGroup ? (
            <>
              {!isMember ? (
                <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={handleJoin}>
                  Join Group
                </button>
              ) : (
                <>
                  <button className={`chat-header-action-btn ${isTranslating ? 'active-translate' : ''}`} title="AI Translation" onClick={() => setIsTranslating(!isTranslating)}>
                    <Languages size={20} color={isTranslating ? 'var(--primary)' : 'currentColor'} />
                  </button>
                  <button className="chat-header-action-btn" title="Voice call">
                    <Phone size={20} />
                  </button>
                  <button className="chat-header-action-btn" title="Video call">
                    <Video size={20} />
                  </button>
                  <button className="chat-header-action-btn" title="Group Settings" onClick={() => setShowSettings(true)}>
                    <Settings size={20} />
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button className={`chat-header-action-btn ${isTranslating ? 'active-translate' : ''}`} title="AI Translation" onClick={() => setIsTranslating(!isTranslating)}>
                <Languages size={20} color={isTranslating ? 'var(--primary)' : 'currentColor'} />
              </button>
              <button className="chat-header-action-btn" title="Voice call">
                <Phone size={20} />
              </button>
              <button className="chat-header-action-btn" title="Video call">
                <Video size={20} />
              </button>
              <button className="chat-header-action-btn" title="More options" onClick={() => setShowMoreOpts(!showMoreOpts)}>
                <MoreVertical size={20} />
              </button>
              
              {showMoreOpts && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, background: 'var(--bg-color)', 
                  border: '1px solid var(--border-color)', borderRadius: '8px', padding: '5px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 100, minWidth: '150px'
                }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', textAlign: 'left' }} onClick={() => { alert('User Reported'); setShowMoreOpts(false); }}>
                    <ShieldAlert size={16} /> Report User
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px', background: 'transparent', border: 'none', color: 'var(--error-color, #ef4444)', cursor: 'pointer', textAlign: 'left' }} onClick={() => { alert('User Blocked'); setShowMoreOpts(false); }}>
                    <UserX size={16} /> Block User
                  </button>
                </div>
              )}
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
