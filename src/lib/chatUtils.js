import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/** Get the public URL for any storage bucket path */
export const getPublicUrl = (bucket, path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

/** Resolve avatar: prefer avatar_url, then profile_picture_url */
export const resolveAvatar = (profile) =>
  profile?.avatar_url || profile?.profile_picture_url || null;

/** Format a timestamp as a readable time string */
export const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/** Format a timestamp as date or "Today"/"Yesterday" */
export const formatDateLabel = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString();
};

/** Format last seen in human-readable form */
export const formatLastSeen = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
};

/**
 * Get or create a 1-on-1 conversation between two users.
 * Returns the conversation id.
 */
export const getOrCreateConversation = async (myId, otherId) => {
  try {
    console.log('--- Chat Initializer ---');
    console.log('Current User:', myId);
    console.log('Other User:', otherId);

    if (myId === otherId) throw new Error('Cannot start chat with yourself');

    // 1. Find conversations where the current user is a member
    const { data: myMemberships, error: memberError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', myId);

    if (memberError) {
      console.error('Error fetching memberships:', memberError);
      throw memberError;
    }

    if (myMemberships && myMemberships.length > 0) {
      const convoIds = myMemberships.map(m => m.conversation_id);
      
      // 2. See if the other user is also in one of these convos (and it's a DM)
      const { data: commonConvos, error: commonError } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          conversations!inner(id, is_group)
        `)
        .eq('user_id', otherId)
        .in('conversation_id', convoIds)
        .eq('conversations.is_group', false)
        .limit(1);

      if (commonError) {
        console.warn('Direct join lookup failed, trying manual filter');
      } else if (commonConvos && commonConvos.length > 0) {
        console.log('Found existing conversation:', commonConvos[0].conversation_id);
        return commonConvos[0].conversation_id;
      }
    }

    // 3. Create a new conversation if none exists
    console.log('Creating new conversation...');
    const { data: newConvo, error: createError } = await supabase
      .from('conversations')
      .insert({
        is_group: false,
        created_by: myId,
        name: 'Direct Chat'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      throw createError;
    }

    // 4. Add both users to the conversation
    const { error: joinError } = await supabase
      .from('conversation_members')
      .insert([
        { conversation_id: newConvo.id, user_id: myId, role: 'admin' },
        { conversation_id: newConvo.id, user_id: otherId, role: 'member' }
      ]);

    if (joinError) {
      console.error('Error adding members:', joinError);
      throw joinError;
    }

    console.log('Successfully created and joined conversation:', newConvo.id);
    return newConvo.id;
  } catch (err) {
    console.error('Chat logic failed:', err);
    throw err;
  }
};

/** Update online presence */
export const setPresence = async (userId, isOnline) => {
  await supabase.from('user_presence').upsert({
    user_id: userId,
    is_online: isOnline,
    last_seen: new Date().toISOString(),
  });
};
