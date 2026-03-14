import { BadgeCheck, User } from 'lucide-react';
import './UserProfile.css';

/**
 * UserProfile Component
 *
 * Display-only card showing avatar, name, and optional verification badge.
 * For the interactive upload version, see AvatarUpload.
 *
 * @param {Object} profile - { name, avatar_url, profile_picture_url, verified }
 */
const UserProfile = ({ profile }) => {
  if (!profile) return null;

  const { name, avatar_url, profile_picture_url, verified } = profile;

  // Prefer avatar_url (Supabase Storage), fall back to profile_picture_url
  const imageUrl = avatar_url || profile_picture_url || null;

  return (
    <div className="modern-profile-card">
      <div className="avatar-section">
        <div className="avatar-ring">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name || 'Profile'}
              className="avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="avatar-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
            <User size={36} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      <div className="info-section">
        <div className="name-container">
          <h2 className="user-display-name">{name || 'Guest User'}</h2>
          {verified && (
            <div className="verification-badge" title="Official Verified Account">
              <BadgeCheck size={20} fill="#1DA1F2" color="#FFFFFF" />
            </div>
          )}
        </div>
        <p className="user-role">Official Member</p>
      </div>
    </div>
  );
};

export default UserProfile;
