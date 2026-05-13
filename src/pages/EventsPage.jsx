import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      if (!error) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  if (loading) return <div className="spinner mx-auto my-12"></div>;

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now);
  const pastEvents = events.filter(e => new Date(e.event_date) < now);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === 'my' ? 'my' : 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container-custom">
      <h1 className="page-title">{t('events.title') || 'Local Events & Festivals'}</h1>
      <p className="text-text-soft mb-8">{t('events.subtitle') || 'Discover cultural celebrations and festivals in Hpa‑An'}</p>

      {upcomingEvents.length === 0 && pastEvents.length === 0 && (
        <div className="text-center py-12"><p className="text-text-soft">{t('events.no_events') || 'No events found. Check back later!'}</p></div>
      )}

      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-semibold text-primary mb-6">{t('events.upcoming') || 'Upcoming Events'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} formatDate={formatDate} language={language} />
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif font-semibold text-text-soft mb-6">{t('events.past') || 'Past Events'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
            {pastEvents.map(event => (
              <EventCard key={event.id} event={event} formatDate={formatDate} language={language} past />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, formatDate, language, past }) {
  const title = language === 'my' && event.title_my ? event.title_my : event.title;
  const description = language === 'my' && event.description_my ? event.description_my : event.description;
  const location = language === 'my' && event.location_my ? event.location_my : event.location;

  return (
    <div className={`bg-white dark:bg-neutral-dark rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${past ? 'opacity-80' : ''}`}>
      {event.image && (
        <img src={event.image} alt={title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <div className="text-sm text-primary font-semibold mb-1">{formatDate(event.event_date)}</div>
        <h3 className="text-xl font-serif font-semibold text-text mb-2">{title}</h3>
        {location && (
          <div className="flex items-center gap-1 text-text-soft text-sm mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {location}
          </div>
        )}
        {description && <p className="text-text-soft text-sm line-clamp-3">{description}</p>}
      </div>
    </div>
  );
}