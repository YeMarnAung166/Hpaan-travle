import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useFavorites } from "../hooks/useFavorites";
import { useLanguage } from "../context/LanguageContext";
import { memo, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import StarRating from "./StarRating";
import ProgressiveImage from "./ui/ProgressiveImage";

const BusinessCard = memo(function BusinessCard({ business, avgRating: propAvgRating, ratingCount: propRatingCount }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.businesses.has(business.id);
  const [avgRating, setAvgRating] = useState(propAvgRating ?? null);
  const [ratingCount, setRatingCount] = useState(propRatingCount ?? 0);

  const name = getLocalized(business, "name", "name_my");
  const description = getLocalized(business, "description", "description_my");
  const address = getLocalized(business, "address", "address_my");

  useEffect(() => {
    if (propAvgRating != null && propAvgRating > 0) return;
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

  return (
    <div className="group bg-white dark:bg-neutral-dark rounded-xl overflow-hidden border border-border dark:border-border-light">
      <Link to={`/business/${business.id}`} className="block relative overflow-hidden h-48">
        <ProgressiveImage
          src={business.image ? `${business.image}?width=400&quality=80&resize=cover` : null}
          alt={name}
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {business.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 rounded-full text-[11px] font-medium text-white uppercase tracking-wider">
            {business.category}
          </span>
        )}
      </Link>

      <div className="p-4">
        <div className="flex justify-between items-center gap-2 mb-1">
          <h3 className="text-lg font-serif font-semibold text-text line-clamp-1">
            {name}
          </h3>
          {user && (
            <button
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
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-2">
          {avgRating > 0 && (
            <div className="flex items-center gap-1">
              <StarRating rating={avgRating} readonly size="sm" />
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
            className="inline-flex items-center text-amber-600 dark:text-amber-400 font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors text-sm"
          >
            {t("business.details")}
            <svg
              className="w-3.5 h-3.5 ml-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
});

export default BusinessCard;
