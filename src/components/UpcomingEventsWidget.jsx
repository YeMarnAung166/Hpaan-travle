import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchEvents = async () => {
      // Get today’s date in YYYY-MM-DD format (local timezone)
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .limit(3);
      if (!error && data) {
        setEvents(data);
      } else {
        console.error('Error fetching upcoming events:', error);
      }
    };
    fetchEvents();
  }, []);

  if (events.length === 0) return null; // Nothing to show

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'my' ? 'my' : 'en', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-neutral-dark rounded-xl shadow-md p-4 mb-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-text">
          {t('events.upcoming_events') || 'Upcoming Events'}
        </h3>
        <Link to="/events" className="text-primary text-sm hover:underline">
          {t('events.view_all') || 'View all'}
        </Link>
      </div>
      <div className="space-y-3">
        {events.map(event => {
          const title = language === 'my' && event.title_my ? event.title_my : event.title;
          const location = language === 'my' && event.location_my ? event.location_my : event.location;
          return (
            <div key={event.id} className="flex gap-3 items-start">
              <div className="bg-primary/10 text-primary rounded-lg px-2 py-1 text-center min-w-[60px]">
                <div className="text-lg font-bold">
                  {new Date(event.event_date).getDate()}
                </div>
                <div className="text-xs">
                  {formatDate(event.event_date)}
                </div>
              </div>
              <div>
                <div className="font-medium text-text">{title}</div>
                {location && (
                  <div className="text-xs text-text-soft">{location}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}