import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import DestinationCard from '../components/DestinationCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import SearchAndFilter from '../components/SearchAndFilter';
import { useLanguage } from '../context/LanguageContext';

export default function DestinationList() {
  const [destinations, setDestinations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [ratings, setRatings] = useState({});
  const { t } = useLanguage();

  useEffect(() => {
    fetchDestinationsAndRatings();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [destinations, searchTerm, filters, sortBy, ratings]);

  const fetchDestinationsAndRatings = async () => {
    // Fetch all destinations
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('id');
    if (!error) setDestinations(data);

    // Fetch all destination reviews to compute average ratings
    const { data: reviews, error: revError } = await supabase
      .from('destination_reviews')
      .select('destination_id, rating');
    if (!revError && reviews) {
      const ratingMap = {};
      reviews.forEach(r => {
        if (!ratingMap[r.destination_id]) {
          ratingMap[r.destination_id] = { sum: 0, count: 0 };
        }
        ratingMap[r.destination_id].sum += r.rating;
        ratingMap[r.destination_id].count += 1;
      });
      const avgMap = {};
      Object.keys(ratingMap).forEach(id => {
        avgMap[id] = ratingMap[id].sum / ratingMap[id].count;
      });
      setRatings(avgMap);
    }
    setLoading(false);
  };

  const applyFiltersAndSearch = () => {
    let results = [...destinations];

    // 1. Search filter (English + Burmese)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        d =>
          d.name.toLowerCase().includes(term) ||
          (d.name_my && d.name_my.toLowerCase().includes(term)) ||
          d.description.toLowerCase().includes(term) ||
          (d.description_my && d.description_my.toLowerCase().includes(term))
      );
    }

    // 2. Type filter (cave, mountain, pagoda, lake, waterfall)
    if (filters.type && filters.type !== 'all') {
      results = results.filter(d => d.type === filters.type);
    }

    // 3. Minimum rating filter
    if (filters.minRating && filters.minRating > 0) {
      results = results.filter(d => (ratings[d.id] || 0) >= filters.minRating);
    }

    // 4. Sorting
    const sorts = {
      newest: (a, b) => b.id - a.id,
      oldest: (a, b) => a.id - b.id,
      name_asc: (a, b) => a.name.localeCompare(b.name),
      name_desc: (a, b) => b.name.localeCompare(a.name),
    };
    if (sorts[sortBy]) results.sort(sorts[sortBy]);

    setFiltered(results);
  };

  if (loading) {
    return (
      <div className="container-custom">
        <h1 className="page-title">{t('destinations.title') || 'Places to Visit'}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="page-title">{t('destinations.title') || 'Places to Visit'}</h1>
      <SearchAndFilter
        type="destination"
        onSearch={setSearchTerm}
        onFilter={setFilters}
        onSort={setSortBy}
      />
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-soft">{t('common.no_results')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(dest => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
}