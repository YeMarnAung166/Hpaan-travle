import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState({ itineraries: new Set(), businesses: new Set() });

  useEffect(() => {
    if (!userId) {
      setFavorites({ itineraries: new Set(), businesses: new Set() });
      return;
    }

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('item_type, item_id')
        .eq('user_id', userId);
      if (error) return;
      const favItins = new Set();
      const favBiz = new Set();
      data.forEach((fav) => {
        if (fav.item_type === 'itinerary') favItins.add(fav.item_id);
        else if (fav.item_type === 'business') favBiz.add(fav.item_id);
      });
      setFavorites({ itineraries: favItins, businesses: favBiz });
    };
    fetchFavorites();
  }, [userId]);

  const toggleFavorite = async (itemType, itemId) => {
    if (!userId) {
      alert('Please log in to save favorites.');
      return false;
    }

    const isFavorite = favorites[itemType === 'itinerary' ? 'itineraries' : 'businesses'].has(itemId);
    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId);
      if (error) return false;
      // update local state
      setFavorites((prev) => {
        const newSet = new Set(prev[itemType === 'itinerary' ? 'itineraries' : 'businesses']);
        newSet.delete(itemId);
        return {
          ...prev,
          [itemType === 'itinerary' ? 'itineraries' : 'businesses']: newSet,
        };
      });
      return false;
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, item_type: itemType, item_id: itemId });
      if (error) return false;
      setFavorites((prev) => {
        const newSet = new Set(prev[itemType === 'itinerary' ? 'itineraries' : 'businesses']);
        newSet.add(itemId);
        return {
          ...prev,
          [itemType === 'itinerary' ? 'itineraries' : 'businesses']: newSet,
        };
      });
      return true;
    }
  };

  return { favorites, toggleFavorite };
}