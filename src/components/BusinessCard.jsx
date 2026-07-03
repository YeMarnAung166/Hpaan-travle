import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";
import { useFavorites } from "../hooks/useFavorites";
import { useLanguage } from "../context/LanguageContext";
import { memo, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import StarRating from "./StarRating";
import { getOptimizedImage } from "../utils/imageHelpers";

const BusinessCard = memo(function BusinessCard({ business, avgRating: propAvgRating, ratingCount: propRatingCount }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.businesses.has(business.id);
  const [showShare, setShowShare] = useState(false);
  const [avgRating, setAvgRating] = useState(propAvgRating ?? null);
  const [ratingCount, setRatingCount] = useState(propRatingCount ?? 0);

  const name = getLocalized(business, "name", "name_my");
  const description = getLocalized(business, "description", "description_my");
  const address = getLocalized(business, "address", "address_my");

  const shareUrl = `${window.location.origin}/business/${business.id}`;

  useEffect(() => {
    if (propAvgRating !== undefined) return;
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
  }, [business.id, propAvgRating]);

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

  function handlePointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const xVal = (cx - rect.left) / rect.width - 0.5;
    const yVal = (cy - rect.top) / rect.height - 0.5;
    x.set(xVal);
    y.set(yVal);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="group relative bg-white dark:bg-neutral-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      style={{ perspective: 1000, rotateX, rotateY }}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onTouchEnd={handlePointerLeave}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={`/business/${business.id}`} className="block relative overflow-hidden h-48">
        <img
          src={getOptimizedImage(business.image, 400)}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/10 via-gold/5 to-transparent" />
        {business.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-medium text-white uppercase tracking-wider">
            {business.category}
          </span>
        )}
      </Link>

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
            <span className="truncate max-w-[120px] sm:max-w-[200px]">{address}</span>
          </div>
        </div>

        <p className="text-sm text-text mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        <div className="flex justify-between items-center">
          <Link
            to={`/business/${business.id}`}
            className="inline-flex items-center text-amber-600 dark:text-amber-400 font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors text-sm group/link"
          >
            {t("business.details")}
            <svg
              className="w-3.5 h-3.5 ml-1 transition-transform duration-300 group-hover/link:translate-x-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
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
                    { name: "Facebook", color: "text-blue-600", action: "facebook", icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
                    { name: "WhatsApp", color: "text-green-500", action: "whatsapp", icon: <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /> },
                    { name: "Twitter", color: "text-sky-500", action: "twitter", icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /> },
                    { name: "Telegram", color: "text-blue-400", action: "telegram", icon: <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /> },
                  ].map(item => (
                    <button
                      key={item.name}
                      onClick={() => handleShare(item.action)}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text hover:bg-neutral-light rounded-lg transition"
                    >
                      <svg className={`w-4 h-4 ${item.color}`} fill="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                      {item.name}
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
});

export default BusinessCard;
