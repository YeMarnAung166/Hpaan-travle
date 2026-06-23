import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';

export default function DestinationCard({ destination }) {
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = favorites.destinations?.has(destination.id) || false;

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

  const name = getLocalized(destination, 'name', 'name_my');
  const description = getLocalized(destination, 'description', 'description_my');

  return (
    <motion.div
      className="group relative bg-white dark:bg-neutral-dark rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      style={{ perspective: 1000, rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative overflow-hidden h-56">
        <img
          src={destination.image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white text-xl font-serif font-bold leading-tight line-clamp-2">{name}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-text-soft text-sm line-clamp-2 mb-3">{description}</p>
        <div className="flex justify-between items-center">
          <Link
            to={`/destination/${destination.id}`}
            className="inline-flex items-center text-amber-600 font-medium hover:text-amber-700 transition-colors"
          >
            {t('destinations.view_details')}
            <motion.svg
              className="w-4 h-4 ml-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </motion.svg>
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
                className={`w-6 h-6 ${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
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
}