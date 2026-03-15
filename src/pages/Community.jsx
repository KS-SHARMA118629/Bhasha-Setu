import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getOrCreateConversation, setPresence } from '../lib/chatUtils';
import UserCard from '../components/chat/UserCard';
import ChatWindow from '../components/chat/ChatWindow';
import { Search, Users, CheckCircle, X, MessageCircle } from 'lucide-react';

const Community = ({ session }) => {
  const [users, setUsers] = useState([]);
  const [presence, setPresenceMap] = useState({}); // { userId: { is_online, last_seen } }
  const [search, setSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [openingChat, setOpeningChat] = useState(false);

  // ── Set own online status ─────────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    setPresence(session.user.id, true);

    const handleUnload = () => setPresence(session.user.id, false);
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      setPresence(session.user.id, false);
    };
  }, [session?.user?.id]);

  // ── Fetch users ───────────────────────────────────────────────────
  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, profile_picture_url, verified, bio')
        .order('name');

      if (data) setUsers(data);
      setLoading(false);
    };
    loadUsers();
  }, []);

  // ── Subscribe to presence ─────────────────────────────────────────
  useEffect(() => {
    const fetchPresence = async () => {
      const { data } = await supabase.from('user_presence').select('*');
      if (data) {
        const map = {};
        data.forEach((p) => (map[p.user_id] = p));
        setPresenceMap(map);
      }
    };
    fetchPresence();

    const channel = supabase
      .channel('community-presence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, (payload) => {
        const p = payload.new || payload.old;
        if (p) setPresenceMap((prev) => ({ ...prev, [p.user_id]: p }));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ── Open chat with a user ─────────────────────────────────────────
  const handleChatUser = useCallback(async (user) => {
    if (openingChat) return;
    console.log('[Community] Attempting to open chat with user:', user.name || user.id);
    setOpeningChat(true);
    
    try {
      const convoId = await getOrCreateConversation(session.user.id, user.id);
      console.log('[Community] Convo initialized with ID:', convoId);
      setActiveConvoId(convoId);
      setActiveChatUser(user);
    } catch (err) {
      console.error('[Community] Critical Error opening chat:', err);
      // Detailed error in alert for debugging
      const msg = err.message || JSON.stringify(err);
      alert(`Chat Error: ${msg}\n\nPlease check the browser console for details.`);
    } finally {
      setOpeningChat(false);
    }
  }, [session?.user?.id, openingChat]);

  const handleCloseChat = () => {
    setActiveChatUser(null);
    setActiveConvoId(null);
  };

  // ── Filter users ──────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q);
    const matchVerified = !filterVerified || u.verified;
    return matchSearch && matchVerified;
  });

  const onlineCount = Object.values(presence).filter((p) => p.is_online).length;

  if (!session) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
        Please login to see the community.
      </div>
    );
  }

  return (
    <div className="community-layout">
      {/* ── Left panel: user list ──────────────────────────────── */}
      <div className={`community-sidebar ${activeChatUser ? 'community-sidebar--hidden-mobile' : ''}`}>
        {/* Header */}
        <div className="community-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageCircle size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Community</h2>
          </div>
          <div className="community-stats">
            <span className="online-pill">
              <span className="online-dot-sm" /> {onlineCount} online
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{users.length} members</span>
          </div>
        </div>

        {/* Search */}
        <div className="community-search-wrap">
          <Search size={16} className="community-search-icon" />
          <input
            type="text"
            className="community-search"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="community-search-clear" onClick={() => setSearch('')}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="community-filters">
          <button
            className={`filter-chip ${filterVerified ? 'filter-chip--active' : ''}`}
            onClick={() => setFilterVerified((v) => !v)}
          >
            <CheckCircle size={14} />
            Verified only
          </button>
        </div>

        {/* User list */}
        <div className="community-user-list">
          {loading ? (
            <div className="community-loading">Loading members...</div>
          ) : filtered.length === 0 ? (
            <div className="community-empty">No members found.</div>
          ) : (
            filtered.map((u) => (
              <UserCard
                key={u.id}
                profile={u}
                presence={presence[u.id]}
                onChat={handleChatUser}
                isMe={u.id === session.user.id}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: chat window ───────────────────────────── */}
      <div className={`community-chat-area ${activeChatUser ? 'community-chat-area--active' : ''}`}>
        {activeChatUser && activeConvoId ? (
          <ChatWindow
            conversationId={activeConvoId}
            currentUser={{ id: session.user.id }}
            otherUser={activeChatUser}
            onBack={handleCloseChat}
          />
        ) : (
          <div className="community-chat-placeholder">
            <MessageCircle size={56} color="var(--border-color)" />
            <h3>Select someone to chat with</h3>
            <p>Click on any community member to start a conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
