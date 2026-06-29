// src/hooks/useFavorites.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

function getCacheKey(userId) { return `hpaan_favorites_${userId}`; }

export function useFavorites(userId) {
  const [favorites, setFavorites] = useState({ businesses: new Set(), destinations: new Set() });

  const loadFromCache = useCallback((uid) => {
    try {
      const cached = localStorage.getItem(getCacheKey(uid));
      if (cached) {
        const { data } = JSON.parse(cached);
        setFavorites({
          businesses: new Set(data.businesses),
          destinations: new Set(data.destinations),
        });
        return true;
      }
    } catch (_) {}
    return false;
  }, []);

  useEffect(() => {
    if (!userId) {
      setFavorites({ businesses: new Set(), destinations: new Set() });
      return;
    }

    if (loadFromCache(userId)) return;

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
      localStorage.setItem(getCacheKey(userId), JSON.stringify({
        data: { businesses: [...favBiz], destinations: [...favDests] },
      }));
    };
    fetchFavorites();
  }, [userId, loadFromCache]);

  const updateCache = useCallback((uid, businesses, destinations) => {
    localStorage.setItem(getCacheKey(uid), JSON.stringify({
      data: { businesses: [...businesses], destinations: [...destinations] },
    }));
  }, []);

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
        const biz = new Set(prev.businesses);
        const dests = new Set(prev.destinations);
        if (itemType === 'business') biz.delete(itemId);
        else dests.delete(itemId);
        updateCache(userId, biz, dests);
        return { businesses: biz, destinations: dests };
      });
      return false;
    } else {
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, item_type: itemType, item_id: itemId });
      if (error) return false;
      setFavorites((prev) => {
        const biz = new Set(prev.businesses);
        const dests = new Set(prev.destinations);
        if (itemType === 'business') biz.add(itemId);
        else dests.add(itemId);
        updateCache(userId, biz, dests);
        return { businesses: biz, destinations: dests };
      });
      return true;
    }
  };

  return { favorites, toggleFavorite };
}