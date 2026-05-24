// src/hooks/useFavorites.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState({ businesses: new Set(), destinations: new Set() });

  useEffect(() => {
    if (!userId) {
      setFavorites({ businesses: new Set(), destinations: new Set() });
      return;
    }

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('item_type, item_id')
        .eq('user_id', userId);
      if (error) return;
      const favBiz = new Set();
      const favDests = new Set();
      data.forEach((fav) => {
        if (fav.item_type === 'business') favBiz.add(fav.item_id);
        else if (fav.item_type === 'destination') favDests.add(fav.item_id);
      });
      setFavorites({ businesses: favBiz, destinations: favDests });
    };
    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (itemType, itemId) => {
    if (!userId) {
      alert('Please log in to save favorites.');
      return false;
    }

    const isFavorite = favorites[itemType === 'business' ? 'businesses' : 'destinations'].has(itemId);
    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);
      if (error) return false;
      setFavorites((prev) => {
        const newSet = new Set(prev[itemType === 'business' ? 'businesses' : 'destinations']);
        newSet.delete(itemId);
        return {
          ...prev,
          [itemType === 'business' ? 'businesses' : 'destinations']: newSet,
        };
      });
      return false;
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, item_type: itemType, item_id: itemId });
      if (error) return false;
      setFavorites((prev) => {
        const newSet = new Set(prev[itemType === 'business' ? 'businesses' : 'destinations']);
        newSet.add(itemId);
        return {
          ...prev,
          [itemType === 'business' ? 'businesses' : 'destinations']: newSet,
        };
      });
      return true;
    }
  };

  return { favorites, toggleFavorite };
}