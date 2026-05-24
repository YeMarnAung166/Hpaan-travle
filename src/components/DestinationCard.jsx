import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';

export default function DestinationCard({ destination }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.destinations?.has(destination.id) || false;

  const name = getLocalized(destination, 'name', 'name_my');
  const description = getLocalized(destination, 'description', 'description_my');

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden h-56">
        <img
          src={destination.image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-xl font-serif font-bold leading-tight line-clamp-2">{name}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-text-soft text-sm line-clamp-2 mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <Link
            to={`/destination/${destination.id}`}
            className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700 transition-colors"
          >
            {t('destinations.view_details')}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          {user && (
            <button
              onClick={() => toggleFavorite('destination', destination.id)}
              className="transition-all duration-200 hover:scale-110 focus:outline-none"
              title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
            >
              <svg
                className={`w-6 h-6 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}