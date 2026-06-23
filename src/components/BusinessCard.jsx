import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
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

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xVal = (e.clientX - rect.left) / rect.width - 0.5;
    const yVal = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xVal);
    y.set(yVal);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="group relative bg-white dark:bg-neutral-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      style={{ perspective: 1000, rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={business.image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-lg font-serif font-semibold text-text line-clamp-1">
            {name}
          </h3>
          {user && (
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleFavorite("business", business.id)}
              className={`flex-shrink-0 transition-colors duration-200 ${
                isSaved ? "text-red-500" : "text-gray-400 hover:text-red-400"
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
            </motion.button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          {avgRating && (
            <div className="flex items-center gap-1">
              <StarRating rating={Math.round(avgRating)} readonly size="sm" />
              <span className="text-xs text-text-soft">({ratingCount})</span>
            </div>
          )}
          <div className="flex items-center text-xs text-text-soft">
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
            <motion.svg
              className="w-3.5 h-3.5 ml-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </motion.svg>
          </Link>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
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
            </motion.button>

            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full right-0 mb-2 bg-white dark:bg-neutral-dark rounded-xl shadow-lg p-1 z-10 border border-neutral-mid min-w-[120px]"
                >
                  {[
                    { name: "Facebook", icon: "📘", color: "text-blue-600", action: "facebook" },
                    { name: "WhatsApp", icon: "💬", color: "text-green-500", action: "whatsapp" },
                    { name: "Twitter", icon: "🐦", color: "text-sky-500", action: "twitter" },
                    { name: "Telegram", icon: "✈️", color: "text-blue-400", action: "telegram" },
                  ].map(item => (
                    <button
                      key={item.name}
                      onClick={() => handleShare(item.action)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text hover:bg-neutral-light rounded-lg transition"
                    >
                      <span className={item.color}>{item.icon}</span> {item.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
