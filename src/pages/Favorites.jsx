import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import BusinessCard from '../components/BusinessCard';
import DestinationCard from '../components/DestinationCard';
import Pagination from '../components/ui/Pagination';
import { Helmet } from 'react-helmet-async';

const PAGE_SIZE = 9;

export default function Favorites() {
  const user = useUser();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState({ destinations: [], businesses: [] });
  const [loading, setLoading] = useState(true);
  const [destPage, setDestPage] = useState(1);
  const [bizPage, setBizPage] = useState(1);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      const { data: favData } = await supabase
        .from('user_favorites')
        .select('item_type, item_id')
        .eq('user_id', user.id);

      const destIds = (favData || []).filter(f => f.item_type === 'destination').map(f => f.item_id);
      const bizIds = (favData || []).filter(f => f.item_type === 'business').map(f => f.item_id);

      let destinations = [];
      let businesses = [];
      if (destIds.length) {
        const { data: destData } = await supabase.from('destinations').select('*').in('id', destIds);
        if (destData) destinations = destData;
      }
      if (bizIds.length) {
        const { data: bizData } = await supabase.from('businesses').select('*').in('id', bizIds);
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

  const paginatedDests = favorites.destinations.slice((destPage - 1) * PAGE_SIZE, destPage * PAGE_SIZE);
  const destTotalPages = Math.ceil(favorites.destinations.length / PAGE_SIZE);
  const paginatedBizs = favorites.businesses.slice((bizPage - 1) * PAGE_SIZE, bizPage * PAGE_SIZE);
  const bizTotalPages = Math.ceil(favorites.businesses.length / PAGE_SIZE);

  return (
    <div className="container-custom">
      <Helmet>
        <title>My Favorites | Hpa-An Travel</title>
        <meta name="description" content="Your saved destinations and businesses in Hpa-An." />
        <meta property="og:title" content="My Favorites" />
        <meta property="og:description" content="Your saved destinations and businesses in Hpa-An." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h1 className="page-title">{t('favorites.title')}</h1>

      <h2 className="section-title">{t('favorites.destinations')}</h2>
      {paginatedDests.length === 0 ? (
        <p className="text-text-soft">{t('favorites.empty')}</p>
      ) : (
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedDests.map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
          <Pagination page={destPage} totalPages={destTotalPages} onPageChange={setDestPage} />
        </div>
      )}

      <h2 className="section-title mt-8">{t('favorites.businesses')}</h2>
      {paginatedBizs.length === 0 ? (
        <p className="text-text-soft">{t('favorites.empty')}</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedBizs.map(biz => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
          <Pagination page={bizPage} totalPages={bizTotalPages} onPageChange={setBizPage} />
        </div>
      )}
    </div>
  );
}
