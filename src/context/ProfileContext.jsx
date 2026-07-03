/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from './UserContext';

const ProfileContext = createContext();

export const useProfileContext = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const user = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
    } else if (!data) {
      // Create default profile if missing
      const defaultProfile = {
        id: user.id,
        display_name: user.email.split('@')[0],
        avatar_url: null,
        bio: null,
      };
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([defaultProfile]);
      if (insertError) {
        console.error('Failed to create profile:', insertError);
      } else {
        setProfile(defaultProfile);
      }
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) return false;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (!error) {
      setProfile(prev => ({ ...prev, ...updates }));
      return true;
    }
    return false;
  }, [user]);

  const refresh = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
};