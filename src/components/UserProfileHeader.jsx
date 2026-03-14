import React from 'react';
import { BadgeCheck, User } from 'lucide-react';

const UserProfileHeader = ({ profile }) => {
  if (!profile) return null;

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
    </div>
  );
};

export default UserProfileHeader;
