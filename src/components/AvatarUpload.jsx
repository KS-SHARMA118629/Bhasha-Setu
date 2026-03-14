import { useRef, useState } from 'react';
import { Camera, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AvatarUpload.css';

/**
 * AvatarUpload Component
 *
 * Clickable circular avatar with camera hover overlay.
 * Uploads to Supabase Storage (avatars bucket) using user ID as filename,
 * then saves the public URL into profiles.avatar_url.
 *
 * @param {string}   userId     - Authenticated user's UUID
 * @param {string}   avatarUrl  - Current public avatar URL
 * @param {string}   name       - User's display name (alt text)
 * @param {Function} onUpload   - Callback(newUrl) fired after successful upload
 */
const AvatarUpload = ({ userId, avatarUrl, name, onUpload }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(avatarUrl || null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarClick = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image must be smaller than 5MB.');
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}.${fileExt}`;

      // Upload to Supabase Storage (upsert to overwrite existing)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Cache-bust the URL so the browser re-fetches the new image
      const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

      // Save the URL to profiles table in both avatar_url and profile_picture_url
      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          avatar_url: cacheBustedUrl,
          profile_picture_url: cacheBustedUrl,
        })
        .eq('id', userId);

      if (dbError) throw dbError;

      setPreview(cacheBustedUrl);
      onUpload?.(cacheBustedUrl);
      showToast('success', 'Profile picture updated!');
    } catch (err) {
      console.error('Avatar upload error:', err);
      // Revert the preview on failure
      setPreview(avatarUrl || null);
      showToast('error', err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    }
  };

  return (
    <div className="avatar-upload-wrapper">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="avatar-file-input"
        aria-label="Upload profile picture"
      />

      {/* Clickable circular avatar */}
      <div
        className={`avatar-upload-circle ${uploading ? 'avatar-uploading' : ''}`}
        onClick={handleAvatarClick}
        role="button"
        tabIndex={0}
        aria-label="Click to change profile picture"
        onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
        title="Click to change your profile picture"
      >
        {/* Avatar image / placeholder */}
        {preview ? (
          <img
            src={preview}
            alt={name || 'Profile avatar'}
            className="avatar-upload-img"
            onError={(e) => {
              e.target.onerror = null;
              setPreview(null);
            }}
          />
        ) : (
          <div className="avatar-upload-placeholder">
            <User size={44} color="var(--text-muted)" />
          </div>
        )}

        {/* Hover / uploading overlay */}
        <div className="avatar-upload-overlay">
          {uploading ? (
            <Loader2 size={28} className="avatar-spinner" color="#fff" />
          ) : (
            <>
              <Camera size={24} color="#fff" />
              <span className="overlay-label">Change</span>
            </>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`avatar-toast avatar-toast--${toast.type}`}>
          {toast.type === 'success'
            ? <CheckCircle size={16} />
            : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
