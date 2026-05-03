import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { useLanguage } from '../context/LanguageContext';

export default function SearchAndFilter({
  onSearch,
  onFilter,
  onSort,
  type = 'business',
  initialFilters = {},
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { t } = useLanguage();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply search when debounced value changes
  useEffect(() => {
    onSearch?.(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  // Apply filters when they change
  useEffect(() => {
    onFilter?.(filters);
  }, [filters, onFilter]);

  // Apply sort when it changes
  useEffect(() => {
    onSort?.(sortBy);
  }, [sortBy, onSort]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSortBy('newest');
  };

  // Helper for duration display
  const formatDuration = (durationCode) => {
    if (durationCode === '3+') return t('filters.duration_3plus');
    const num = parseInt(durationCode);
    if (num === 1) return t('filters.duration_1');
    return t('filters.duration_other', { count: num });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {t('common.filters')}
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="newest">{t('filters.newest')}</option>
          <option value="oldest">{t('filters.oldest')}</option>
          {type === 'business' && (
            <option value="rating">{t('filters.highest_rated')}</option>
          )}
          {type === 'itinerary' && (
            <option value="duration_asc">{t('filters.shortest')}</option>
          )}
          {type === 'itinerary' && (
            <option value="duration_desc">{t('filters.longest')}</option>
          )}
          <option value="name_asc">{t('filters.name_asc')}</option>
          <option value="name_desc">{t('filters.name_desc')}</option>
        </select>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter (for businesses) */}
            {type === 'business' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('business.category')}
                </label>
                <select
                  value={filters.category || 'all'}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">{t('business.all')}</option>
                  <option value="accommodation">{t('business.accommodation')}</option>
                  <option value="restaurant">{t('business.restaurant')}</option>
                  <option value="transport">{t('business.transport')}</option>
                  <option value="tours">{t('business.tours')}</option>
                </select>
              </div>
            )}

            {/* Duration Filter (for itineraries) */}
            {type === 'itinerary' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('filters.duration_label')}
                </label>
                <select
                  value={filters.duration || 'all'}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">{t('filters.duration_any')}</option>
                  <option value="1">{t('filters.duration_1')}</option>
                  <option value="2">{t('filters.duration_2')}</option>
                  <option value="3">{t('filters.duration_3')}</option>
                  <option value="3+">{t('filters.duration_3plus')}</option>
                </select>
              </div>
            )}

            {/* Rating Filter (for businesses) */}
            {type === 'business' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('filters.min_rating_label')}
                </label>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={filters.minRating || 0}
                    onRatingChange={(rating) => handleFilterChange('minRating', rating)}
                    size="md"
                  />
                  {filters.minRating > 0 && (
                    <button
                      onClick={() => handleFilterChange('minRating', 0)}
                      className="text-xs text-gray-500 hover:text-red-500"
                    >
                      {t('common.clear')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              {t('common.clear')}
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(searchTerm || Object.keys(filters).some(k => filters[k] && filters[k] !== 'all')) && (
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {t('common.search')}: {searchTerm}
              <button onClick={() => setSearchTerm('')} className="hover:text-red-500">×</button>
            </span>
          )}
          {filters.category && filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {t('business.category')}: {t(`business.${filters.category}`)}
              <button onClick={() => handleFilterChange('category', 'all')} className="hover:text-red-500">×</button>
            </span>
          )}
          {filters.duration && filters.duration !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {t('filters.duration_label')}: {formatDuration(filters.duration)}
              <button onClick={() => handleFilterChange('duration', 'all')} className="hover:text-red-500">×</button>
            </span>
          )}
          {filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              {t('filters.min_rating_label')}: {filters.minRating}+ {t('filters.stars')}
              <button onClick={() => handleFilterChange('minRating', 0)} className="hover:text-red-500">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}