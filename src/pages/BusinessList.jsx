import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import BusinessCard from '../components/BusinessCard';
import Pagination from '../components/ui/Pagination';
import SearchAndFilter from '../components/SearchAndFilter';
import { useLanguage } from '../context/LanguageContext';
import { useSearchParams, Link } from 'react-router-dom';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';

const PAGE_SIZE = 12;

export default function BusinessList() {
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

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, sortBy]);

  const { data, isLoading } = useQuery({
    queryKey: ['businesses', 'list', { page, searchTerm, filters, sortBy, language }],
    queryFn: async () => {
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
      if (error) throw error;

      let ratings = {};
      if (data && data.length > 0) {
        const ids = data.map(b => b.id);
        const { data: ratingData } = await supabase
          .from('business_reviews')
          .select('business_id, rating')
          .in('business_id', ids);
        if (ratingData) {
          const agg = {};
          ratingData.forEach(r => {
            if (!agg[r.business_id]) agg[r.business_id] = { sum: 0, count: 0 };
            agg[r.business_id].sum += r.rating;
            agg[r.business_id].count += 1;
          });
          Object.entries(agg).forEach(([id, { sum, count }]) => {
            ratings[id] = { avg: sum / count, count };
          });
        }
      }

      return { data: data || [], totalCount: count || 0, ratings };
    },
    placeholderData: (prev) => prev,
  });

  const businesses = data?.data || [];
  const ratings = data?.ratings || {};
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (isLoading && businesses.length === 0) {
    return (
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="page-title">{t('business.title')}</h1>
          <p className="text-text-soft text-lg">{t('business.subtitle') || 'Find the best local services'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard count={6} />
        </div>
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
      <div className="mb-8">
        <h1 className="page-title">{t('business.title')}</h1>
        <p className="text-text-soft text-lg">{t('business.subtitle') || 'Find the best local services'}</p>
      </div>
      <SearchAndFilter
        type="business"
        onSearch={setSearchTerm}
        onFilter={setFilters}
        onSort={setSortBy}
      />
      {businesses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-text-soft text-lg mb-4">{t('common.no_results')}</p>
          <Link to="/map" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-light transition-colors shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            {t('business.view_on_map') || 'View on Map'}
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {businesses.map(business => (
              <BusinessCard key={business.id} business={business} avgRating={ratings[business.id]?.avg} ratingCount={ratings[business.id]?.count} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
