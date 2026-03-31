import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import StarRating from './StarRating';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function BusinessCard({ business }) {
  const user = useUser();
  const { t, getLocalized, language } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.businesses.has(business.id);
  const [avgRating, setAvgRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);

  // Get localized content
  const name = getLocalized(business, 'name', 'name_my');
  const description = getLocalized(business, 'description', 'description_my');
  const address = getLocalized(business, 'address', 'address_my');

  useEffect(() => {
    const fetchRating = async () => {
      const { data, error } = await supabase
        .from('business_reviews')
        .select('rating')
        .eq('business_id', business.id);
      
      if (!error && data && data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        setAvgRating(sum / data.length);
        setRatingCount(data.length);
      }
    };
    fetchRating();
  }, [business.id]);

  return (
    <div className="card card-hover">
      <img src={business.image} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{name}</h3>
        
        {/* Rating Display */}
        {avgRating && (
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={Math.round(avgRating)} readonly size="sm" />
            <span className="text-sm text-gray-600">({ratingCount})</span>
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-2">{address}</p>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <Link to={`/business/${business.id}`} className="btn btn-primary">
            {t('business.details')}
          </Link>
          {user && (
            <button
              onClick={() => toggleFavorite('business', business.id)}
              className={`favorite-btn ${isSaved ? 'favorite-active' : 'favorite-inactive'}`}
              title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
            >
              {isSaved ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}