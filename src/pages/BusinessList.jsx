import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import BusinessCard from '../components/BusinessCard';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'transport', label: 'Transport' },
  { value: 'tours', label: 'Tours & Activities' },
];

export default function BusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchBusinesses = async () => {
      let query = supabase.from('businesses').select('*');
      if (category !== 'all') {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) console.error(error);
      else setBusinesses(data);
      setLoading(false);
    };
    fetchBusinesses();
  }, [category]);

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="page-title">Local Businesses</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`btn ${category === cat.value ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {businesses.map(business => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
}