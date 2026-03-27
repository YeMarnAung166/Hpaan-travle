import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';

export default function BusinessCard({ business }) {
  const user = useUser();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.businesses.has(business.id);

  return (
    <div className="card card-hover">
      <img src={business.image} alt={business.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{business.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{business.address}</p>
        <p className="text-xs sm:text-sm text-gray-500 mb-4">{business.description}</p>
        <div className="flex justify-between items-center">
          <Link to={`/business/${business.id}`} className="btn btn-primary">
            Details & Contact
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