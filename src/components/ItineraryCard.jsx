import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import { useFavorites } from '../hooks/useFavorites';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

export default function ItineraryCard({ itinerary }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.itineraries.has(itinerary.id);
  const title = getLocalized(itinerary, 'title', 'title_my');
  const description = getLocalized(itinerary, 'description', 'description_my');

  return (
    <Card hover>
      <div className="relative h-56 overflow-hidden">
        <img
          src={itinerary.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-xl font-serif font-bold line-clamp-2">{title}</h3>
          <p className="text-white/80 text-sm">{itinerary.duration}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-text-soft text-sm line-clamp-2 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <Link to={`/itinerary/${itinerary.id}`}>
            <Button variant="outline" size="sm">View Details →</Button>
          </Link>
          {user && (
            <button onClick={() => toggleFavorite('itinerary', itinerary.id)}>
              <svg className={`w-6 h-6 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}