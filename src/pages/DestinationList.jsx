import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import DestinationCard from '../components/DestinationCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import SearchAndFilter from '../components/SearchAndFilter';
import { useLanguage } from '../context/LanguageContext';
import { Helmet } from 'react-helmet-async';

const PAGE_SIZE = 12;

export default function DestinationList() {
  const [destinations, setDestinations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const { t, language } = useLanguage();

  const fetchDestinations = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('destinations')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (language === 'my') {
        query = query.or(`name_my.ilike.%${term}%,description_my.ilike.%${term}%`);
      } else {
        query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
      }
    }

    if (filters.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }

    if (filters.minRating && filters.minRating > 0) {
      query = query.gte('avg_rating', filters.minRating);
    }

    const sortMap = {
      newest: { column: 'id', ascending: false },
      oldest: { column: 'id', ascending: true },
      name_asc: { column: 'name', ascending: true },
      name_desc: { column: 'name', ascending: false },
    };
    const s = sortMap[sortBy] || sortMap.newest;
    query = query.order(s.column, { ascending: s.ascending });

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (!error) {
      setDestinations(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, searchTerm, filters, sortBy, language]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDestinations();
  }, [fetchDestinations]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading && destinations.length === 0) {
    return (
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="page-title">{t('destinations.title') || 'Places to Visit'}</h1>
          <p className="text-text-soft text-lg">{t('destinations.subtitle') || 'Discover beautiful places in Hpa-An'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <Helmet>
        <title>Destinations in Hpa-An | Hpa-An Travel</title>
        <meta name="description" content="Explore beautiful destinations in Hpa-An, Myanmar - from ancient caves and pagodas to stunning landscapes." />
        <meta property="og:title" content="Destinations in Hpa-An" />
        <meta property="og:description" content="Explore beautiful destinations in Hpa-An, Myanmar - from ancient caves and pagodas to stunning landscapes." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="mb-8">
        <h1 className="page-title">{t('destinations.title') || 'Places to Visit'}</h1>
        <p className="text-text-soft text-lg">{t('destinations.subtitle') || 'Discover beautiful places in Hpa-An'}</p>
      </div>
      <SearchAndFilter
        type="destination"
        onSearch={setSearchTerm}
        onFilter={setFilters}
        onSort={setSortBy}
      />
      {destinations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-text-soft text-lg">{t('common.no_results')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
