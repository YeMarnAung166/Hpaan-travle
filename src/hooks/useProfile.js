// src/hooks/useProfile.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [userId, refreshTrigger]);

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (!error) {
      setProfile(prev => ({ ...prev, ...updates }));
      refresh(); // optionally, but setProfile already updates state
      return true;
    }
    return false;
  };

  return { profile, loading, updateProfile, refresh };
}