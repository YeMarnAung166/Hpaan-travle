import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import BusinessCard from '../components/BusinessCard';
import Pagination from '../components/ui/Pagination';
import SearchAndFilter from '../components/SearchAndFilter';
import { useLanguage } from '../context/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PAGE_SIZE = 12;

export default function BusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && ['accommodation', 'restaurant', 'transport', 'tours'].includes(urlCategory)) {
      setFilters(prev => ({ ...prev, category: urlCategory }));
    }
  }, [searchParams]);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (language === 'my') {
        query = query.or(`name_my.ilike.%${term}%,description_my.ilike.%${term}%,address_my.ilike.%${term}%`);
      } else {
        query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,address.ilike.%${term}%`);
      }
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.minRating && filters.minRating > 0) {
      query = query.gte('avg_rating', filters.minRating);
    }

    const sortMap = {
      newest: { column: 'id', ascending: false },
      oldest: { column: 'id', ascending: true },
      name_asc: { column: 'name', ascending: true },
      name_desc: { column: 'name', ascending: false },
      rating: { column: 'avg_rating', ascending: false },
    };
    const s = sortMap[sortBy] || sortMap.newest;
    query = query.order(s.column, { ascending: s.ascending, nullsLast: true });

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (!error) {
      setBusinesses(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, searchTerm, filters, sortBy, language]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, sortBy]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading && businesses.length === 0) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <Helmet>
        <title>Business Directory | Hpa-An Travel</title>
        <meta name="description" content="Find accommodation, restaurants, transport, and tour services in Hpa-An." />
        <meta property="og:title" content="Business Directory" />
        <meta property="og:description" content="Find accommodation, restaurants, transport, and tour services in Hpa-An." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h1 className="page-title">{t('business.title')}</h1>
      <SearchAndFilter
        type="business"
        onSearch={setSearchTerm}
        onFilter={setFilters}
        onSort={setSortBy}
      />
      {businesses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-soft">{t('common.no_results')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {businesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
