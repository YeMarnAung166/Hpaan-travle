// src/components/BusinessCard.jsx
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useFavorites } from "../hooks/useFavorites";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import StarRating from "./StarRating";

export default function BusinessCard({ business }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.businesses.has(business.id);
  const [showShare, setShowShare] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);

  // Get localized content
  const name = getLocalized(business, "name", "name_my");
  const description = getLocalized(business, "description", "description_my");
  const address = getLocalized(business, "address", "address_my");

  // Share URL
  const shareUrl = `${window.location.origin}/business/${business.id}`;

  useEffect(() => {
    const fetchRating = async () => {
      const { data, error } = await supabase
        .from("business_reviews")
        .select("rating")
        .eq("business_id", business.id);

      if (!error && data && data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        setAvgRating(sum / data.length);
        setRatingCount(data.length);
      }
    };
    fetchRating();
  }, [business.id]);

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(name);

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
      {/* Image with hover zoom and gradient overlay */}
      <div className="relative overflow-hidden h-48">
        <img
          src={business.image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay to make text readable if overlaid, but we don't overlay text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-lg font-serif font-semibold text-gray-800 line-clamp-1">
            {name}
          </h3>
          {user && (
            <button
              onClick={() => toggleFavorite("business", business.id)}
              className={`flex-shrink-0 transition-all duration-200 hover:scale-110 ${
                isSaved ? "text-red-500" : "text-gray-400"
              }`}
              title={isSaved ? "Remove from favorites" : "Save to favorites"}
            >
              <svg
                className="w-5 h-5"
                fill={isSaved ? "currentColor" : "none"}
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

        {/* Rating and address row */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {avgRating && (
            <div className="flex items-center gap-1">
              <StarRating rating={Math.round(avgRating)} readonly size="sm" />
              <span className="text-xs text-text-soft">({ratingCount})</span>
            </div>
          )}
          <div className="flex items-center text-xs text-gray-400">
            <svg
              className="w-3 h-3 mr-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate max-w-[150px]">{address}</span>
          </div>
        </div>

        <p className="text-sm text-text-soft mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex justify-between items-center">
          <Link
            to={`/business/${business.id}`}
            className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700 transition-colors text-sm"
          >
            {t("business.details")}
            <svg
              className="w-3.5 h-3.5 ml-1"
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

          <div className="relative">
            <button
              onClick={() => setShowShare(!showShare)}
              className="text-gray-400 hover:text-amber-500 transition-colors p-1"
              title={t("social.share") || "Share"}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>

            {/* Share dropdown */}
            {showShare && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-lg p-1 z-10 border border-gray-100 min-w-[120px]">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <span className="text-blue-600">📘</span> Facebook
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <span className="text-green-500">💬</span> WhatsApp
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <span className="text-sky-500">🐦</span> Twitter
                </button>
                <button
                  onClick={() => handleShare("telegram")}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                >
                  <span className="text-blue-400">✈️</span> Telegram
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
