// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    destinations: 0,
    businesses: 0,
    events: 0,
    reviews: 0,
    pendingPhotos: 0,
  });
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchStats = async () => {
      const [
        destinations,
        businesses,
        events,
        reviews,
        pendingPhotos,
      ] = await Promise.all([
        supabase.from('destinations').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('business_reviews').select('*', { count: 'exact', head: true }),
        supabase.from('user_photos').select('*', { count: 'exact', head: true }).eq('moderated', false),
      ]);

      setStats({
        destinations: destinations.count || 0,
        businesses: businesses.count || 0,
        events: events.count || 0,
        reviews: reviews.count || 0,
        pendingPhotos: pendingPhotos.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="container-custom pt-8"><SkeletonStatCard count={5} /></div>;

  const statCards = [
    { title: t('admin.destinations') || 'Destinations', value: stats.destinations, link: '/admin/destinations', color: 'bg-blue-500' },
    { title: t('admin.businesses') || 'Businesses', value: stats.businesses, link: '/admin/businesses', color: 'bg-green-500' },
    { title: t('admin.events') || 'Events', value: stats.events, link: '/admin/events', color: 'bg-yellow-500' },
    { title: t('admin.reviews') || 'Reviews', value: stats.reviews, link: '/admin/reviews', color: 'bg-purple-500' },
    { title: t('admin.pending_photos') || 'Pending Photos', value: stats.pendingPhotos, link: '/admin/user-photos', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <Helmet>
        <title>Admin Dashboard | Hpa-An Travel</title>
        <meta name="description" content="Manage your site content, destinations, businesses, and more." />
        <meta property="og:title" content="Admin Dashboard" />
        <meta property="og:description" content="Manage your site content, destinations, businesses, and more." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h2 className="text-2xl font-bold mb-6">{t('admin.dashboard')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`${card.color} text-white rounded-lg p-6 hover:opacity-90 transition-opacity`}
          >
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm opacity-90 mt-2">{card.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}