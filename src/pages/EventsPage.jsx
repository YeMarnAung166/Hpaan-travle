import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import Pagination from '../components/ui/Pagination';
import { SkeletonCard } from '../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';
import { getOptimizedImage } from '../utils/imageHelpers';

const PAGE_SIZE = 9;

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      if (!error) setAllEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="container-custom">
        <h1 className="page-title">{t('events.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard count={6} />
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcoming = allEvents.filter(e => new Date(e.event_date) >= now);
  const past = allEvents.filter(e => new Date(e.event_date) < now);

  const totalUpcomingPages = Math.ceil(upcoming.length / PAGE_SIZE);
  const paginatedUpcoming = upcoming.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === 'my' ? 'my' : 'en', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="container-custom">
      <Helmet>
        <title>Events in Hpa-An | Hpa-An Travel</title>
        <meta name="description" content="Upcoming events and festivals in Hpa-An, Myanmar." />
        <meta property="og:title" content="Events in Hpa-An" />
        <meta property="og:description" content="Upcoming events and festivals in Hpa-An, Myanmar." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h1 className="page-title">{t('events.title') || 'Local Events & Festivals'}</h1>
      <p className="text-text-soft mb-8">{t('events.subtitle') || 'Discover cultural celebrations and festivals in Hpa‑An'}</p>

      {allEvents.length === 0 && (
        <div className="text-center py-12"><p className="text-text-soft">{t('events.no_events') || 'No events found. Check back later!'}</p></div>
      )}

      {paginatedUpcoming.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-semibold text-primary mb-6">{t('events.upcoming') || 'Upcoming Events'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedUpcoming.map(event => (
              <EventCard key={event.id} event={event} formatDate={formatDate} language={language} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalUpcomingPages} onPageChange={setPage} />
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif font-semibold text-text-soft mb-6">{t('events.past') || 'Past Events'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
            {past.map(event => (
              <EventCard key={event.id} event={event} formatDate={formatDate} language={language} past />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, formatDate, language, past }) {
  const [imgError, setImgError] = useState(false);
  const title = language === 'my' && event.title_my ? event.title_my : event.title;
  const description = language === 'my' && event.description_my ? event.description_my : event.description;
  const location = language === 'my' && event.location_my ? event.location_my : event.location;

  return (
    <div className={`bg-white dark:bg-neutral-dark rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${past ? 'opacity-80' : ''}`}>
      {event.image && !imgError ? (
        <img src={getOptimizedImage(event.image, 400)} alt={title} loading="lazy" decoding="async" onError={() => setImgError(true)} className="w-full h-48 object-cover" />
      ) : event.image ? (
        <div className="w-full h-48 bg-neutral-mid dark:bg-neutral-dark flex items-center justify-center">
          <svg className="w-10 h-10 text-text-soft/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ) : null}
      <div className="p-4">
        <div className="text-sm text-primary font-semibold mb-1">{formatDate(event.event_date)}</div>
        <h3 className="text-xl font-serif font-semibold text-text mb-2">{title}</h3>
        {location && (
          <div className="flex items-center gap-1 text-text text-sm mb-2">
            <svg className="w-4 h-4 text-text-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {location}
          </div>
        )}
        {description && <p className="text-text text-sm line-clamp-3 leading-relaxed">{description}</p>}
      </div>
    </div>
  );
}
