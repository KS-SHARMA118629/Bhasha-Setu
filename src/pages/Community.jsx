import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  BadgeCheck, MessageCircle, Users, Search, Plus, Loader2
} from 'lucide-react';
import './Community.css';


const getAvatarUrl = (profile) =>
  profile?.avatar_url || profile?.profile_picture_url || null;

const Avatar = ({ profile, size = 48 }) => {
  const url = getAvatarUrl(profile);
  return (
    <div className="cm-avatar-ring" style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt={profile?.name} className="cm-avatar-img" />
      ) : (
        <div className="cm-avatar-placeholder">
          {(profile?.name || '?')[0].toUpperCase()}
        </div>
      )}
    </div>
  );
};

const OnlineDot = ({ isOnline }) => (
  <span className={`cm-online-dot ${isOnline ? 'cm-online' : 'cm-offline'}`} />
);

// ─── Community Page ──────────────────────────────────────────────────────────
const Community = ({ session }) => {
  const navigate   = useNavigate();
  const [users,    setUsers]    = useState([]);
  const [presence, setPresence] = useState({});
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [creating, setCreating] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Fetch all users except self
  useEffect(() => {
    if (!session) return;
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, profile_picture_url, verified, role')
        .neq('id', session.user.id)
        .order('name');
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, [session]);

  // Fetch & subscribe to presence
  useEffect(() => {
    const fetchPresence = async () => {
      const { data } = await supabase.from('user_presence').select('*');
      const map = {};
      (data || []).forEach(p => { map[p.user_id] = p; });
      setPresence(map);
    };
    fetchPresence();

    const channel = supabase
      .channel('presence-community')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, fetchPresence)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // Find or create DM conversation then navigate to chat
  const openDM = async (otherUser) => {
    setCreating(true);
    // Check if DM already exists
    const { data: existing } = await supabase.rpc
      ? null : null; // Skip RPC, do manual check

    // Get all conversations where current user is a member
    const { data: myConvs } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', session.user.id);

    const myIds = (myConvs || []).map(c => c.conversation_id);

    let convId = null;
    if (myIds.length > 0) {
      // Find a non-group conversation that also has otherUser
      const { data: shared } = await supabase
        .from('conversation_members')
        .select('conversation_id, conversations!inner(is_group)')
        .eq('user_id', otherUser.id)
        .in('conversation_id', myIds)
        .eq('conversations.is_group', false);

      if (shared?.length > 0) convId = shared[0].conversation_id;
    }

    if (!convId) {
      // Create new DM conversation
      const { data: conv } = await supabase
        .from('conversations')
        .insert({ is_group: false, created_by: session.user.id })
        .select()
        .single();
      convId = conv.id;
      await supabase.from('conversation_members').insert([
        { conversation_id: convId, user_id: session.user.id },
        { conversation_id: convId, user_id: otherUser.id },
      ]);
    }

    setCreating(false);
    navigate(`/community/chat/${convId}`, { state: { otherUser } });
  };

  // Create group chat
  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) return;
    setCreating(true);
    const { data: conv } = await supabase
      .from('conversations')
      .insert({ is_group: true, group_name: groupName.trim(), created_by: session.user.id })
      .select().single();

    const members = [
      { conversation_id: conv.id, user_id: session.user.id, is_admin: true },
      ...selectedUsers.map(uid => ({ conversation_id: conv.id, user_id: uid })),
    ];
    await supabase.from('conversation_members').insert(members);
    setCreating(false);
    setShowGroupModal(false);
    setGroupName('');
    setSelectedUsers([]);
    navigate(`/community/chat/${conv.id}`, { state: { isGroup: true, groupName: groupName.trim() } });
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (!session) return (
    <div className="cm-auth-wall">
      <MessageCircle size={48} color="var(--primary)" />
      <p>Please log in to access the Community.</p>
    </div>
  );

  return (
    <div className="cm-page">
      {/* ── Sidebar header ── */}
      <div className="cm-header">
        <div className="cm-header-top">
          <div className="cm-header-title">
            <Users size={22} color="var(--primary)" />
            <h1>Community</h1>
          </div>
          <button className="cm-group-btn" title="Create group chat" onClick={() => setShowGroupModal(true)}>
            <Plus size={20} />
          </button>
        </div>

        <div className="cm-search-wrap">
          <Search size={16} className="cm-search-icon" />
          <input
            className="cm-search"
            placeholder="Search people…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── User list ── */}
      <div className="cm-list">
        {loading ? (
          <div className="cm-loading"><Loader2 size={28} className="cm-spin" /></div>
        ) : filtered.length === 0 ? (
          <p className="cm-empty">No users found.</p>
        ) : (
          filtered.map(user => {
            const isOnline = presence[user.id]?.is_online;
            return (
              <button
                key={user.id}
                className="cm-user-card"
                onClick={() => openDM(user)}
                disabled={creating}
              >
                <div className="cm-user-avatar-wrap">
                  <Avatar profile={user} size={52} />
                  <OnlineDot isOnline={isOnline} />
                </div>
                <div className="cm-user-info">
                  <div className="cm-user-name-row">
                    <span className="cm-user-name">{user.name}</span>
                    {user.verified && (
                      <BadgeCheck size={16} fill="#1DA1F2" color="#fff" className="cm-verified" />
                    )}
                  </div>
                  <span className="cm-user-status">
                    {isOnline ? 'Online' : 'Offline'}
                    {user.role === 'admin' && <span className="cm-role-chip">Admin</span>}
                  </span>
                </div>
                <MessageCircle size={18} className="cm-dm-icon" />
              </button>
            );
          })
        )}
      </div>

      {/* ── Group chat modal ── */}
      {showGroupModal && (
        <div className="cm-modal-backdrop" onClick={() => setShowGroupModal(false)}>
          <div className="cm-modal" onClick={e => e.stopPropagation()}>
            <h2>Create Group Chat</h2>
            <input
              className="cm-modal-input"
              placeholder="Group name…"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
            <p className="cm-modal-sub">Select members</p>
            <div className="cm-modal-users">
              {users.map(u => (
                <label key={u.id} className="cm-modal-user">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.id)}
                    onChange={e => {
                      setSelectedUsers(prev =>
                        e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id)
                      );
                    }}
                  />
                  <Avatar profile={u} size={32} />
                  <span>{u.name}</span>
                  {u.verified && <BadgeCheck size={14} fill="#1DA1F2" color="#fff" />}
                </label>
              ))}
            </div>
            <div className="cm-modal-actions">
              <button className="btn-secondary" onClick={() => setShowGroupModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={createGroup} disabled={creating || !groupName.trim() || selectedUsers.length < 1}>
                {creating ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
