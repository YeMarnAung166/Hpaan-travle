import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useFavorites } from "../hooks/useFavorites";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

export default function ItineraryCard({ itinerary }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.itineraries.has(itinerary.id);
  const [showShare, setShowShare] = useState(false);

  // Get localized content
  const title = getLocalized(itinerary, "title", "title_my");
  const description = getLocalized(itinerary, "description", "description_my");

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
      window.open(links[platform], "_blank", "noopener,noreferrer");
    }
    setShowShare(false);
  };

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden h-56">
        <img
          src={itinerary.image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-xl font-serif font-bold leading-tight">
            {title}
          </h3>
          <p className="text-white/80 text-sm">{itinerary.duration}</p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>
        <Link
          to={`/itinerary/${itinerary.id}`}
          className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700 transition-colors"
        >
          Explore itinerary
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
