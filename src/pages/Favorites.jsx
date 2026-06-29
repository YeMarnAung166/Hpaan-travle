import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import BusinessCard from '../components/BusinessCard';
import DestinationCard from '../components/DestinationCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import { Helmet } from 'react-helmet-async';

const PAGE_SIZE = 9;

export default function Favorites() {
  const user = useUser();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState({ destinations: [], businesses: [] });
  const [ratings, setRatings] = useState({});
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

      if (bizIds.length) {
        const { data: ratingData } = await supabase
          .from('business_reviews')
          .select('business_id, rating')
          .in('business_id', bizIds);
        if (ratingData) {
          const agg = {};
          ratingData.forEach(r => {
            if (!agg[r.business_id]) agg[r.business_id] = { sum: 0, count: 0 };
            agg[r.business_id].sum += r.rating;
            agg[r.business_id].count += 1;
          });
          const ratingMap = {};
          Object.entries(agg).forEach(([id, { sum, count }]) => {
            ratingMap[id] = { avg: sum / count, count };
          });
          setRatings(ratingMap);
        }
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
      <div className="container-custom">
        <h1 className="page-title">{t('favorites.title')}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard count={6} />
        </div>
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
      {favorites.destinations.length === 0 && favorites.businesses.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-text-soft/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-text-soft text-lg mb-2">{t('favorites.empty')}</p>
          <p className="text-text-soft/60 text-sm mb-6">Start exploring destinations and businesses to save your favorites.</p>
          <a href="/destinations" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition text-sm font-medium">
            Browse Destinations
          </a>
        </div>
      ) : paginatedDests.length === 0 ? (
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

      {favorites.businesses.length > 0 && (
        <>
          <h2 className="section-title mt-8">{t('favorites.businesses')}</h2>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedBizs.map(biz => (
                <BusinessCard key={biz.id} business={biz} avgRating={ratings[biz.id]?.avg} ratingCount={ratings[biz.id]?.count} />
              ))}
            </div>
            <Pagination page={bizPage} totalPages={bizTotalPages} onPageChange={setBizPage} />
          </div>
        </>
      )}
    </div>
  );
}
