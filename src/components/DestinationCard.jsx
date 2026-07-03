import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import { getOptimizedImage } from '../utils/imageHelpers';

const DestinationCard = memo(function DestinationCard({ destination }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.destinations?.has(destination.id) || false;
  const [imgError, setImgError] = useState(false);

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

  const name = getLocalized(destination, 'name', 'name_my');
  const description = getLocalized(destination, 'description', 'description_my');

  return (
    <motion.div
      className="group relative bg-white dark:bg-neutral-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      style={{ perspective: 1000, rotateX, rotateY }}
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
          <img
            src={getOptimizedImage(destination.image, 400)}
            alt={name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
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
              onClick={() => toggleFavorite('destination', destination.id)}
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