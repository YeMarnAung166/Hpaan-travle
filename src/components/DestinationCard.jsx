import { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import StarRating from './StarRating';
import ProgressiveImage from './ui/ProgressiveImage';

const DestinationCard = memo(function DestinationCard({ destination }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const isSaved = favorites.destinations?.has(destination.id) || false;
  const [imgError, setImgError] = useState(false);

  const handleFavorite = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite('destination', destination.id);
    toast({
      type: isSaved ? 'info' : 'success',
      message: isSaved
        ? (t('favorites.removed') || 'Removed from favorites')
        : (t('favorites.added') || 'Added to favorites'),
      duration: 2000,
    });
  }, [destination.id, isSaved, toggleFavorite, toast, t]);

  const x = !reduceMotion ? useMotionValue(0) : null;
  const y = !reduceMotion ? useMotionValue(0) : null;
  const rotateX = !reduceMotion ? useTransform(y, [-0.5, 0.5], [5, -5]) : null;
  const rotateY = !reduceMotion ? useTransform(x, [-0.5, 0.5], [-5, 5]) : null;

  function handlePointerMove(e) {
    if (reduceMotion || !x || !y) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const xVal = (cx - rect.left) / rect.width - 0.5;
    const yVal = (cy - rect.top) / rect.height - 0.5;
    x.set(xVal);
    y.set(yVal);
  }

  function handlePointerLeave() {
    if (reduceMotion || !x || !y) return;
    x.set(0);
    y.set(0);
  }

  const name = getLocalized(destination, 'name', 'name_my');
  const description = getLocalized(destination, 'description', 'description_my');

  return (
    <motion.div
      className="group relative bg-white dark:bg-neutral-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      style={!reduceMotion ? { perspective: 1000, rotateX, rotateY } : {}}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onTouchEnd={handlePointerLeave}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Link to={`/destination/${destination.id}`} className="block relative overflow-hidden h-56">
        {imgError ? (
          <div className="w-full h-full bg-neutral-mid dark:bg-neutral-dark flex items-center justify-center">
            <svg className="w-12 h-12 text-text-soft/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <ProgressiveImage
            src={destination.image ? `${destination.image}?width=400&quality=80&resize=cover` : null}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            wrapperClassName="w-full h-full"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {destination.type && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-medium text-white uppercase tracking-wider">
            {destination.type}
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-xl font-serif font-bold leading-tight line-clamp-2 drop-shadow-sm">{name}</h3>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-text text-sm line-clamp-2 mb-3 leading-relaxed">{description}</p>
        {destination.avg_rating && (
          <div className="flex items-center gap-1 mb-3">
            <StarRating rating={destination.avg_rating} readonly size="sm" />
            <span className="text-xs text-text-soft">({destination.review_count || 0})</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <Link
            to={`/destination/${destination.id}`}
            className="inline-flex items-center text-primary font-semibold hover:text-primary-light transition-colors text-sm group/link"
          >
            {t('destinations.view_details')}
            <svg
              className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          {user && (
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavorite}
              className="transition-all duration-200 focus:outline-none"
              title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
            >
              <svg
                className={`w-6 h-6 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-400'}`}
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
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default DestinationCard;