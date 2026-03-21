import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Phone, MapPin, Globe, Link2, BadgeCheck, Share2, Copy, Check } from 'lucide-react';
import AvatarUpload from '../components/AvatarUpload';

const Profile = ({ session }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lang, setLang] = useState('en');
  const [govIdUrl, setGovIdUrl] = useState('');
  const [bio, setBio] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    if (session) fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setProfile(data);
      setName(data.name || '');
      setPhone(data.phone_number || '');
      setAddress(data.address || '');
      setLang(data.preferred_language || 'en');
      setGovIdUrl(data.government_id_url || '');
      setBio(data.bio || '');
      setAge(data.age || '');
    }
    setLoading(false);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        name, 
        phone_number: phone, 
        address, 
        preferred_language: lang, 
        government_id_url: govIdUrl,
        bio,
        age: age ? parseInt(age) : null
      })
      .eq('id', session.user.id);
    setSaving(false);
    if (!error) fetchProfile();
  };

  const requestVerification = async () => {
    setSaving(true);
    await supabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('id', session.user.id);
    fetchProfile();
    setSaving(false);
  };

  // Called by AvatarUpload after a successful upload
  const handleAvatarChange = (newUrl) => {
    setProfile((prev) => ({ ...prev, avatar_url: newUrl, profile_picture_url: newUrl }));
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/profile/${profile?.username || profile?.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${profile?.username || profile?.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name}'s Profile on BhashaSetu`,
        url,
      }).catch(err => console.error('Error sharing', err));
    } else {
      handleCopyLink();
    }
  };

  if (!session) return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Please Login</p>;
  if (loading)  return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</p>;

  const verificationBadgeColor =
    profile?.verification_status === 'verified'
      ? 'rgba(16, 185, 129, 0.12)'
      : profile?.verification_status === 'pending'
      ? 'rgba(37, 99, 235, 0.12)'
      : 'rgba(245, 158, 11, 0.12)';

  const verificationTextColor =
    profile?.verification_status === 'verified'
      ? 'var(--success)'
      : profile?.verification_status === 'pending'
      ? 'var(--primary)'
      : 'var(--warning)';

  return (
    <div className="container" style={{ maxWidth: '720px' }}>

      {/* ── Hero card: avatar + name + badge ──────────────────────── */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          textAlign: 'center',
        }}
      >
        {/* Clickable avatar upload */}
        <AvatarUpload
          userId={session.user.id}
          avatarUrl={profile?.avatar_url || profile?.profile_picture_url}
          name={profile?.name}
          onUpload={handleAvatarChange}
        />

        {/* Name + verification */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              {profile?.name || 'Your Name'}
            </h1>
            {profile?.verified && (
              <BadgeCheck size={22} fill="#1DA1F2" color="#fff" title="Verified Account" />
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            {session.user.email}
          </p>
        </div>

        {/* Verification status pill */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 14px',
            borderRadius: '20px',
            background: verificationBadgeColor,
            color: verificationTextColor,
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '10px'
          }}
        >
          {profile?.verification_status === 'verified' && <BadgeCheck size={14} />}
          {profile?.verification_status?.replace(/_/g, ' ')}
        </span>

        {/* Share Profile Actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button 
            type="button"
            onClick={handleCopyLink} 
            className="btn-secondary" 
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Copy Profile Link"
          >
            {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
          </button>
          <button 
            type="button"
            onClick={handleShare} 
            className="btn-primary" 
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Share2 size={18} /> Share Profile
          </button>
        </div>
      </div>

      {/* ── Edit form ─────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.75rem' }}>
          Edit Profile Information
        </h2>

        <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Full Name */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              Full Name
            </label>
            <User size={18} style={{ position: 'absolute', top: '41px', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
            />
          </div>

          {/* Phone */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              Phone Number
            </label>
            <Phone size={18} style={{ position: 'absolute', top: '41px', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="tel"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          {/* Address */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              Address
            </label>
            <MapPin size={18} style={{ position: 'absolute', top: '41px', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your address"
            />
          </div>

          {/* Preferred Language */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              Preferred Language
            </label>
            <Globe size={18} style={{ position: 'absolute', top: '41px', left: '14px', color: 'var(--text-muted)' }} />
            <select
              className="input-field"
              style={{ paddingLeft: '42px', appearance: 'none' }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="bn">Bengali (বাংলা)</option>
              <option value="mr">Marathi (मराठी)</option>
            </select>
          </div>

          {/* Age */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              Age
            </label>
            <input
              type="number"
              className="input-field"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
            />
          </div>

          {/* Bio */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              Bio
            </label>
            <textarea
              className="input-field"
              style={{ minHeight: '100px', paddingTop: '10px' }}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <hr style={{ borderColor: 'var(--border-color)', margin: '0.25rem 0' }} />

          {/* Government ID URL */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
              Government ID URL <span style={{ fontWeight: 400, opacity: 0.6 }}>(Optional)</span>
            </label>
            <Link2 size={18} style={{ position: 'absolute', top: '41px', left: '14px', color: 'var(--text-muted)' }} />
            <input
              type="url"
              className="input-field"
              style={{ paddingLeft: '42px' }}
              placeholder="Link to ID proof image/document"
              value={govIdUrl}
              onChange={(e) => setGovIdUrl(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>

        {/* Request verification section */}
        {profile?.verification_status === 'not_verified' && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.25rem',
              background: 'rgba(245, 158, 11, 0.06)',
              border: '1px dashed rgba(245, 158, 11, 0.4)',
              borderRadius: '12px',
            }}
          >
            <h4 style={{ color: 'var(--warning)', marginBottom: '0.5rem', fontSize: '1rem' }}>
              Want faster support?
            </h4>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Verify your identity by providing a Government ID and clicking the button below.
            </p>
            <button
              onClick={requestVerification}
              disabled={saving}
              className="btn-secondary"
              style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}
            >
              Request Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
