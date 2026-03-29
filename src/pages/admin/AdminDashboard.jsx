import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    itineraries: 0,
    businesses: 0,
    inquiries: 0,
    reviews: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [itineraries, businesses, inquiries, reviews, users] = await Promise.all([
        supabase.from('itineraries').select('*', { count: 'exact', head: true }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('booking_inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('business_reviews').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);
      
      setStats({
        itineraries: itineraries.count || 0,
        businesses: businesses.count || 0,
        inquiries: inquiries.count || 0,
        reviews: reviews.count || 0,
        users: users.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="spinner mx-auto"></div>;

  const statCards = [
    { title: 'Itineraries', value: stats.itineraries, link: '/admin/itineraries', color: 'bg-blue-500' },
    { title: 'Businesses', value: stats.businesses, link: '/admin/businesses', color: 'bg-green-500' },
    { title: 'Booking Inquiries', value: stats.inquiries, link: '/admin/inquiries', color: 'bg-yellow-500' },
    { title: 'Reviews', value: stats.reviews, link: '/admin/reviews', color: 'bg-purple-500' },
    { title: 'Users', value: stats.users, link: '#', color: 'bg-gray-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          card.link !== '#' ? (
            <Link
              key={card.title}
              to={card.link}
              className={`${card.color} text-white rounded-lg p-6 hover:opacity-90 transition-opacity`}
            >
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm opacity-90 mt-2">{card.title}</div>
            </Link>
          ) : (
            <div
              key={card.title}
              className={`${card.color} text-white rounded-lg p-6 opacity-70`}
            >
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="text-sm opacity-90 mt-2">{card.title}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}