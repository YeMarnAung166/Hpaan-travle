import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import BusinessCard from '../components/BusinessCard';
import DestinationCard from '../components/DestinationCard';

export default function Favorites() {
  const user = useUser();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState({ destinations: [], businesses: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      const { data: favData, error: favError } = await supabase
        .from('user_favorites')
        .select('item_type, item_id')
        .eq('user_id', user.id);
      if (favError) {
        console.error(favError);
        setLoading(false);
        return;
      }

      const destIds = favData.filter(f => f.item_type === 'destination').map(f => f.item_id);
      const bizIds = favData.filter(f => f.item_type === 'business').map(f => f.item_id);

      let destinations = [];
      let businesses = [];
      if (destIds.length) {
        const { data: destData } = await supabase
          .from('destinations')
          .select('*')
          .in('id', destIds);
        if (destData) destinations = destData;
      }
      if (bizIds.length) {
        const { data: bizData } = await supabase
          .from('businesses')
          .select('*')
          .in('id', bizIds);
        if (bizData) businesses = bizData;
      }

      setFavorites({ destinations, businesses });
      setLoading(false);
    };
    fetchFavorites();
  }, [user]);

  if (!user) {
    return (
      <div className="container-custom text-center py-8">
        <h2 className="text-2xl font-bold">{t('favorites.login_required')}</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="page-title">{t('favorites.title')}</h1>

      <h2 className="section-title">{t('favorites.destinations')}</h2>
      {favorites.destinations.length === 0 ? (
        <p className="text-text-soft">{t('favorites.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {favorites.destinations.map(dest => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      )}

      <h2 className="section-title mt-8">{t('favorites.businesses')}</h2>
      {favorites.businesses.length === 0 ? (
        <p className="text-text-soft">{t('favorites.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {favorites.businesses.map(biz => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      )}
    </div>
  );
}