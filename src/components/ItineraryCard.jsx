import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';

export default function ItineraryCard({ itinerary }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.itineraries.has(itinerary.id);

  // Get localized content
  const title = getLocalized(itinerary, 'title', 'title_my');
  const description = getLocalized(itinerary, 'description', 'description_my');

  return (
    <div className="card card-hover">
      <img src={itinerary.image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">{itinerary.duration}</p>
        <p className="text-xs sm:text-sm text-gray-500 mb-4 line-clamp-3">{description}</p>
        <div className="flex justify-between items-center">
          <Link to={`/itinerary/${itinerary.id}`} className="btn btn-primary">
            {t('itinerary.view_details')}
          </Link>
          {user && (
            <button
              onClick={() => toggleFavorite('itinerary', itinerary.id)}
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