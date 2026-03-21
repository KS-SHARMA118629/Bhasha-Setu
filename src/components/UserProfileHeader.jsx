import { BadgeCheck, User, Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const UserProfileHeader = ({ profile }) => {
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const profileUrl = `${window.location.origin}/profile/${profile.username || profile.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name}'s Profile on BhashaSetu`,
        url: profileUrl,
      }).catch(err => console.error('Error sharing', err));
    } else {
      handleCopy();
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      padding: '1.5rem',
      background: 'var(--panel-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--panel-border)',
      borderRadius: '16px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'var(--input-bg)',
        border: '3px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {profile.profile_picture_url ? (
          <img 
            src={profile.profile_picture_url} 
            alt={profile.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <User size={40} color="var(--text-muted)" />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {profile.name}
          </h2>
          {profile.verified && (
            <div title="Verified Account">
              <BadgeCheck 
                size={24} 
                fill="#1DA1F2" 
                color="#ffffff" 
              />
            </div>
          )}
        </div>
        
        <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Govt Profile</span>
          &bull;
          <span style={{ padding: '2px 8px', background: 'var(--bg-color-alt)', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>
            {profile.preferred_language ? profile.preferred_language.toUpperCase() : 'EN'} Enabled
          </span>
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleCopy} 
          className="btn-secondary" 
          style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          title="Copy Link"
        >
          {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
        </button>
        <button 
          onClick={handleShare} 
          className="btn-primary" 
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Share2 size={18} /> Share Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfileHeader;
