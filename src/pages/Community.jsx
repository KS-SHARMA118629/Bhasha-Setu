import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import GroupCard from '../components/chat/GroupCard';
import UserCard from '../components/chat/UserCard';
import ChatWindow from '../components/chat/ChatWindow';
import { Search, Users, Plus, X, MessageCircle, User as UserIcon, TrendingUp } from 'lucide-react';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import { getOrCreateConversation, setPresence } from '../lib/chatUtils';

const Community = ({ session }) => {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [presenceMap, setPresenceMap] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeTab, setActiveTab] = useState('groups'); // 'groups' | 'trending' | 'users'

  // Chat state
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [activeConvoId, setActiveConvoId] = useState(null);
  const [openingChat, setOpeningChat] = useState(false);

  // Set own online status
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

  const fetchGroupsAndUsers = async () => {
    setLoading(true);
    // Fetch all group conversations and get member counts
    const { data: convos, error: convoError } = await supabase
      .from('conversations')
      .select(`
        id, name, description, avatar_url, created_at, created_by,
        conversation_members(count)
      `)
      .eq('is_group', true)
      .order('created_at', { ascending: false });

    if (!convoError && convos) {
      const formatted = convos.map(g => ({
        ...g,
        memberCount: g.conversation_members[0].count
      }));
      setGroups(formatted);
    }

    // Fetch users
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, name, username, avatar_url, profile_picture_url, verified, bio')
      .order('name');
    
    if (profilesData) setUsers(profilesData);

    setLoading(false);
  };

  useEffect(() => {
    fetchGroupsAndUsers();

    // Fetch initial presence
    const fetchPresence = async () => {
      const { data } = await supabase.from('user_presence').select('*');
      if (data) {
        const map = {};
        data.forEach((p) => (map[p.user_id] = p));
        setPresenceMap(map);
      }
    };
    fetchPresence();

    // Subscribe to presence
    const channel = supabase
      .channel('community-presence')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_presence' }, (payload) => {
        const p = payload.new || payload.old;
        if (p) setPresenceMap((prev) => ({ ...prev, [p.user_id]: p }));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleChatGroup = useCallback((group) => {
    if (openingChat) return;
    setOpeningChat(true);
    setActiveChatUser(null);
    setActiveConvoId(null);
    setActiveGroup(group);
    setOpeningChat(false);
  }, [openingChat]);

  const handleChatUser = useCallback(async (user) => {
    if (openingChat) return;
    setOpeningChat(true);
    try {
      const convoId = await getOrCreateConversation(session.user.id, user.id);
      setActiveGroup(null);
      setActiveConvoId(convoId);
      setActiveChatUser(user);
    } catch (err) {
      console.error('Error opening user chat:', err);
    } finally {
      setOpeningChat(false);
    }
  }, [session?.user?.id, openingChat]);

  const handleCloseChat = () => {
    setActiveGroup(null);
    setActiveChatUser(null);
    setActiveConvoId(null);
  };

  const handleGroupCreated = () => {
    setShowCreateGroup(false);
    fetchGroupsAndUsers();
  };

  const filteredGroups = groups.filter((g) => {
    const q = search.toLowerCase();
    return !search || g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q);
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (activeTab === 'trending') {
      return b.memberCount - a.memberCount;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return !search || u.name?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q);
  });

  if (!session) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-muted)' }}>
        Please login to see the community.
      </div>
    );
  }

  return (
    <div className="community-layout">
      {/* ── Left panel: group list ──────────────────────────────── */}
      <div className={`community-sidebar ${(activeGroup || activeChatUser) ? 'community-sidebar--hidden-mobile' : ''}`}>
        {/* Header */}
        <div className="community-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Community</h2>
            </div>
            {activeTab === 'groups' && (
              <button
                className="btn-primary"
                style={{ padding: '6px', borderRadius: '50%' }}
                onClick={() => setShowCreateGroup(true)}
                title="Create Group"
              >
                <Plus size={20} />
              </button>
            )}
           </div>

           {/* Tabs */}
           <div style={{ display: 'flex', gap: '8px', marginTop: '12px', background: 'var(--bg-color-alt)', padding: '4px', borderRadius: '12px' }}>
             <button
               onClick={() => setActiveTab('groups')}
               style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', background: activeTab === 'groups' ? 'var(--primary)' : 'transparent', color: activeTab === 'groups' ? '#fff' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
             >
               <Users size={16} /> Groups
             </button>
             <button
               onClick={() => setActiveTab('trending')}
               style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', background: activeTab === 'trending' ? 'var(--primary)' : 'transparent', color: activeTab === 'trending' ? '#fff' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
             >
               <TrendingUp size={16} /> Trending
             </button>
             <button
               onClick={() => setActiveTab('users')}
               style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', background: activeTab === 'users' ? 'var(--primary)' : 'transparent', color: activeTab === 'users' ? '#fff' : 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
             >
               <UserIcon size={16} /> Members
             </button>
           </div>
        </div>

        {/* Search */}
        <div className="community-search-wrap">
          <Search size={16} className="community-search-icon" />
          <input
            type="text"
            className="community-search"
            placeholder={activeTab === 'users' ? "Search members..." : "Search groups..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="community-search-clear" onClick={() => setSearch('')}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* List */}
        <div className="community-user-list">
          {loading ? (
            <div className="community-loading">Loading...</div>
          ) : activeTab === 'users' ? (
            filteredUsers.length === 0 ? (
              <div className="community-empty">No members found.</div>
            ) : (
              filteredUsers.map((u) => (
                <UserCard
                  key={u.id}
                  profile={u}
                  presence={presenceMap[u.id]}
                  onChat={handleChatUser}
                  isMe={u.id === session.user.id}
                />
              ))
            )
          ) : sortedGroups.length === 0 ? (
            <div className="community-empty">No groups found.</div>
          ) : (
            sortedGroups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                onChat={handleChatGroup}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: chat window ───────────────────────────── */}
      <div className={`community-chat-area ${(activeGroup || activeChatUser) ? 'community-chat-area--active' : ''}`}>
        {activeGroup ? (
          <ChatWindow
            conversationId={activeGroup.id}
            currentUser={{ id: session.user.id }}
            otherUser={null}
            isGroup={true}
            groupData={activeGroup}
            onBack={handleCloseChat}
            onGroupUpdated={fetchGroupsAndUsers}
          />
        ) : activeChatUser && activeConvoId ? (
          <ChatWindow
            conversationId={activeConvoId}
            currentUser={{ id: session.user.id }}
            otherUser={activeChatUser}
            isGroup={false}
            onBack={handleCloseChat}
          />
        ) : (
          <div className="community-chat-placeholder">
            <MessageCircle size={56} color="var(--border-color)" />
            <h3>Select a chat to begin</h3>
            <p>Click on any group or community member to start talking.</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          session={session}
          onClose={() => setShowCreateGroup(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </div>
  );
};

export default Community;
