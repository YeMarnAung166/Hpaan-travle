import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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

  if (loading) return <div className="text-center py-8">Loading businesses...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Local Businesses</h1>
      
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded ${
              category === cat.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map(business => (
          <div key={business.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={business.image} alt={business.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{business.name}</h2>
              <p className="text-gray-600 text-sm mb-2">{business.address}</p>
              <p className="text-gray-700 mb-4">{business.description}</p>
              <Link
                to={`/business/${business.id}`}
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Details & Contact
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}