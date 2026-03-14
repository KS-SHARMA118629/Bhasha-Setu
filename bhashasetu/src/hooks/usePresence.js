import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Keeps the authenticated user's presence (online/offline + last_seen)
 * updated in the user_presence table.
 * Marks online on mount, offline on unmount / tab hide.
 */
export const usePresence = (userId) => {
  const intervalRef = useRef(null);

  const setOnline = useCallback(async () => {
    if (!userId) return;
    await supabase.from('user_presence').upsert(
      { user_id: userId, is_online: true, last_seen: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }, [userId]);

  const setOffline = useCallback(async () => {
    if (!userId) return;
    await supabase.from('user_presence').upsert(
      { user_id: userId, is_online: false, last_seen: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    setOnline();
    // Heartbeat every 30 s
    intervalRef.current = setInterval(setOnline, 30_000);

    const onHide  = () => setOffline();
    const onShow  = () => setOnline();
    const onUnload = () => setOffline();

    document.addEventListener('visibilitychange', document.hidden ? onHide : onShow);
    window.addEventListener('beforeunload', onUnload);

    return () => {
      clearInterval(intervalRef.current);
      setOffline();
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [userId, setOnline, setOffline]);
};
