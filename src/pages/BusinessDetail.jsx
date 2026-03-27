import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';

export default function BusinessDetail() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = user && favorites.businesses.has(parseInt(id));

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setBusiness(data);
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container-custom text-center">
        <h2 className="text-2xl font-bold text-red-600">Business not found</h2>
        <Link to="/business" className="btn btn-primary mt-4 inline-block">Back to directory</Link>
      </div>
    );
  }

  return (
    <div className="container-custom max-w-2xl">
      <Link to="/business" className="text-green-600 hover:underline mb-4 inline-block">
        ← Back to directory
      </Link>
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{business.name}</h1>
        {user && (
          <button
            onClick={() => toggleFavorite('business', business.id)}
            className={`favorite-btn text-2xl sm:text-3xl ${isSaved ? 'favorite-active' : 'favorite-inactive'}`}
            title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          >
            {isSaved ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <p className="text-gray-600 mb-2">{business.address}</p>
      <img
        src={business.image}
        alt={business.name}
        className="w-full h-48 sm:h-64 object-cover rounded-lg my-4"
      />
      <p className="text-gray-700 mb-4">{business.description}</p>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Contact</h3>
        <p>
          Phone:{' '}
          <a href={`tel:${business.phone}`} className="text-green-600 hover:underline">
            {business.phone}
          </a>
        </p>
        <a
          href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-3 inline-block"
        >
          Contact via WhatsApp
        </a>
      </div>
    </div>
  );
}