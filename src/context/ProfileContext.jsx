import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from './UserContext';

const ProfileContext = createContext();

export const useProfileContext = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const user = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchProfile = useCallback(async (force = false) => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    if (fetchingRef.current && !force) return;
    fetchingRef.current = true;
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
      // Compare with current profile to avoid unnecessary updates
      setProfile(prev => {
        if (prev && JSON.stringify(prev) === JSON.stringify(data)) return prev;
        return data;
      });
    }
    setLoading(false);
    fetchingRef.current = false;
  }, [user]);

  useEffect(() => {
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
    fetchProfile(true);
  }, [fetchProfile]);

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile, refresh }}>
      {children}
    </ProfileContext.Provider>
  );
};