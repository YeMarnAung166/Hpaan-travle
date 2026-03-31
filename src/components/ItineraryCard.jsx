import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

export default function ItineraryCard({ itinerary }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.itineraries.has(itinerary.id);
  const [showShare, setShowShare] = useState(false);

  // Get localized content
  const title = getLocalized(itinerary, 'title', 'title_my');
  const description = getLocalized(itinerary, 'description', 'description_my');

  // Share URL
  const shareUrl = `${window.location.origin}/itinerary/${itinerary.id}`;

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle} - ${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    };
    
    if (links[platform]) {
      window.open(links[platform], '_blank', 'noopener,noreferrer');
    }
    setShowShare(false);
  };

  return (
    <div className="card card-hover relative">
      <img src={itinerary.image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">{itinerary.duration}</p>
        <p className="text-xs sm:text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center">
          <Link to={`/itinerary/${itinerary.id}`} className="btn btn-primary">
            {t('itinerary.view_details')}
          </Link>
          <div className="flex gap-2">
            {/* Share Button */}
            <button
              onClick={() => setShowShare(!showShare)}
              className="text-gray-400 hover:text-green-600 transition-colors"
              title={t('social.share') || 'Share'}
            >
              📤
            </button>
            {/* Favorite Button */}
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
        
        {/* Share options dropdown */}
        {showShare && (
          <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-lg p-2 z-10 border">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleShare('facebook')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap"
              >
                📘 Facebook
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 whitespace-nowrap"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="px-3 py-1 bg-sky-500 text-white rounded text-sm hover:bg-sky-600 whitespace-nowrap"
              >
                🐦 Twitter
              </button>
              <button
                onClick={() => handleShare('telegram')}
                className="px-3 py-1 bg-blue-400 text-white rounded text-sm hover:bg-blue-500 whitespace-nowrap"
              >
                ✈️ Telegram
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}