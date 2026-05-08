import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { useLanguage } from '../context/LanguageContext';
import Button from './ui/Button';

export default function SearchAndFilter({ onSearch, onFilter, onSort, type = 'business', initialFilters = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [debounced, setDebounced] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => { onSearch?.(debounced); }, [debounced]);
  useEffect(() => { onFilter?.(filters); }, [filters]);
  useEffect(() => { onSort?.(sortBy); }, [sortBy]);

  const handleFilterChange = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
  const clearFilters = () => { setFilters({}); setSearchTerm(''); setSortBy('newest'); };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        <input type="text" placeholder={t('common.search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border border-neutral-mid rounded-lg focus:ring-2 focus:ring-primary/50" />
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} size="md">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          {t('common.filters')}
        </Button>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 border border-neutral-mid rounded-lg focus:ring-2 focus:ring-primary/50">
          <option value="newest">{t('filters.newest')}</option>
          <option value="oldest">{t('filters.oldest')}</option>
          {type === 'business' && <option value="rating">{t('filters.highest_rated')}</option>}
          {type === 'itinerary' && <option value="duration_asc">{t('filters.shortest')}</option>}
          {type === 'itinerary' && <option value="duration_desc">{t('filters.longest')}</option>}
          <option value="name_asc">{t('filters.name_asc')}</option>
          <option value="name_desc">{t('filters.name_desc')}</option>
        </select>
      </div>
      {showFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {type === 'business' && (
              <div>
                <label className="block text-sm font-medium mb-1">{t('business.category')}</label>
                <select value={filters.category || 'all'} onChange={e => handleFilterChange('category', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="all">{t('business.all')}</option>
                  <option value="accommodation">{t('business.accommodation')}</option>
                  <option value="restaurant">{t('business.restaurant')}</option>
                  <option value="transport">{t('business.transport')}</option>
                  <option value="tours">{t('business.tours')}</option>
                </select>
              </div>
            )}
            {type === 'itinerary' && (
              <div>
                <label className="block text-sm font-medium mb-1">{t('filters.duration_label')}</label>
                <select value={filters.duration || 'all'} onChange={e => handleFilterChange('duration', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="all">{t('filters.duration_any')}</option>
                  <option value="1">{t('filters.duration_1')}</option>
                  <option value="2">{t('filters.duration_2')}</option>
                  <option value="3">{t('filters.duration_3')}</option>
                  <option value="3+">{t('filters.duration_3plus')}</option>
                </select>
              </div>
            )}
            {type === 'business' && (
              <div>
                <label className="block text-sm font-medium mb-1">{t('filters.min_rating_label')}</label>
                <div className="flex items-center gap-2">
                  <StarRating rating={filters.minRating || 0} onRatingChange={r => handleFilterChange('minRating', r)} size="md" />
                  {filters.minRating > 0 && <button onClick={() => handleFilterChange('minRating', 0)} className="text-xs text-text-soft hover:text-error">Clear</button>}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>{t('common.clear')}</Button>
          </div>
        </div>
      )}
      {(searchTerm || Object.values(filters).some(v => v && v !== 'all')) && (
        <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
          {searchTerm && <FilterChip label={`${t('common.search')}: ${searchTerm}`} onRemove={() => setSearchTerm('')} />}
          {filters.category && filters.category !== 'all' && <FilterChip label={`${t('business.category')}: ${filters.category}`} onRemove={() => handleFilterChange('category', 'all')} />}
          {filters.duration && filters.duration !== 'all' && <FilterChip label={`Duration: ${filters.duration}`} onRemove={() => handleFilterChange('duration', 'all')} />}
          {filters.minRating > 0 && <FilterChip label={`Rating: ${filters.minRating}+`} onRemove={() => handleFilterChange('minRating', 0)} />}
        </div>
      )}
    </div>
  );
}

const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-mid text-text rounded-full text-sm">
    {label}
    <button onClick={onRemove} className="hover:text-error">×</button>
  </span>
);