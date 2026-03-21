import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, UserMinus, Shield, Search, UserPlus, LogOut } from 'lucide-react';
import { resolveAvatar } from '../../lib/chatUtils';

const GroupSettingsModal = ({ group, session, onClose, onGroupUpdated }) => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [group.id]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('conversation_members')
      .select('*, profiles!user_id(id, name, username, avatar_url)')
      .eq('conversation_id', group.id);

    if (data) {
      setMembers(data);
      const myMember = data.find((m) => m.user_id === session.user.id);
      setIsAdmin(myMember?.is_admin || false);
    }
    setLoading(false);
  };

  const handleSearch = async (term) => {
    setSearch(term);
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url')
      .or(`name.ilike.%${term}%,username.ilike.%${term}%`)
      .limit(10);
    
    // Filter out users already in group
    const memberIds = members.map(m => m.user_id);
    const filtered = (data || []).filter(u => !memberIds.includes(u.id));
    setSearchResults(filtered);
  };

  const addMember = async (user) => {
    await supabase.from('conversation_members').insert({
      conversation_id: group.id,
      user_id: user.id,
      role: 'member',
      is_admin: false,
    });
    setSearch('');
    setSearchResults([]);
    fetchMembers();
    onGroupUpdated?.();
  };

  const removeMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    await supabase.from('conversation_members').delete().eq('id', memberId);
    fetchMembers();
    onGroupUpdated?.();
  };

  const toggleAdmin = async (member) => {
    await supabase
      .from('conversation_members')
      .update({ is_admin: !member.is_admin, role: !member.is_admin ? 'admin' : 'member' })
      .eq('id', member.id);
    fetchMembers();
  };

  const leaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    const myMember = members.find((m) => m.user_id === session.user.id);
    if (myMember) {
      await supabase.from('conversation_members').delete().eq('id', myMember.id);
      onClose();
      onGroupUpdated?.();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Group Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 10 }}>
          {isAdmin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Add Users</h3>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              </div>
              
              {searchResults.length > 0 && (
                <div style={{ marginTop: '0.5rem', background: 'var(--bg-color-alt)', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                  {searchResults.map(u => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img src={resolveAvatar(u) || 'https://via.placeholder.com/30'} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{ fontSize: '0.9rem' }}>{u.name || u.username}</span>
                      </div>
                      <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={() => addMember(u)}>
                        <UserPlus size={14} style={{ marginRight: 4 }} /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Members ({members.length})</h3>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading members...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {members.map(m => {
                const profile = m.profiles;
                const isMe = m.user_id === session.user.id;
                
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--panel-bg)', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={resolveAvatar(profile) || 'https://via.placeholder.com/36'} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                          {profile?.name || profile?.username || 'Unknown'} {isMe && '(You)'}
                        </span>
                        {m.is_admin ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(37,99,235,0.1)', padding: '2px 8px', borderRadius: 12 }}>
                            <Shield size={12} /> Admin
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Member
                          </span>
                        )}
                      </div>
                    </div>

                    {isAdmin && !isMe && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          title={m.is_admin ? 'Remove Admin' : 'Make Admin'}
                          onClick={() => toggleAdmin(m)}
                          style={{ background: m.is_admin ? 'rgba(37,99,235,0.1)' : 'transparent', border: '1px solid var(--border-color)', borderRadius: 6, padding: 6, cursor: 'pointer', color: m.is_admin ? 'var(--primary)' : 'var(--text-muted)' }}
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          title="Remove User"
                          onClick={() => removeMember(m.id)}
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: 6, padding: 6, cursor: 'pointer', color: 'var(--danger)' }}
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
        
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button onClick={leaveGroup} style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem 1rem', width: '100%', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogOut size={18} /> Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsModal;
