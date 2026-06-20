import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import WeatherWidget from '../components/WeatherWidget';
import UpcomingEventsWidget from '../components/UpcomingEventsWidget';
import DestinationCard from '../components/DestinationCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Building2, UtensilsCrossed, Bus, Compass, Mountain, Heart, Coffee, ChevronDown } from 'lucide-react';

// ---- Configuration (unchanged) ----
const categoryConfig = {
  accommodation: { icon: Building2, labelKey: 'business.accommodation' },
  restaurant: { icon: UtensilsCrossed, labelKey: 'business.restaurant' },
  transport: { icon: Bus, labelKey: 'business.transport' },
  tours: { icon: Compass, labelKey: 'business.tours' },
};

const CATEGORIES = ['accommodation', 'restaurant', 'transport', 'tours'];

// ---- Custom hook for fetching destinations ----
function useDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('id', { ascending: true })
        .limit(6);
      if (!error) setDestinations(data);
      setLoading(false);
    };
    fetchDestinations();
  }, []);

  return { destinations, loading };
}

// ---- Custom hook for fetching business counts ----
function useBusinessCounts() {
  const [counts, setCounts] = useState({
    accommodation: 0,
    restaurant: 0,
    transport: 0,
    tours: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const newCounts = {};
      for (const cat of CATEGORIES) {
        const { count, error } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat);
        if (!error) newCounts[cat] = count || 0;
      }
      setCounts(newCounts);
    };
    fetchCounts();
  }, []);

  return counts;
}

// ---- Main Component ----
export default function HomePage() {
  const { t } = useLanguage();
  const { destinations, loading: destinationsLoading } = useDestinations();
  const businessCounts = useBusinessCounts();

  return (
    <div className="bg-white dark:bg-neutral-dark">
      {/* Hero Section */}
      <section className="relative h-[100vh] sm:h-[100vh] overflow-hidden -mt-24 md:-mt-24">
        <img
          src="https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/static/home.jpg"
          alt="Hpa-An landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />

        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white">
          <p className="text-sm uppercase tracking-[0.2em] mb-4 opacity-80">
            {t('home.hero_tagline') || 'Discover the Hidden Gem'}
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold mb-4 leading-tight">
            Hpa‑An
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 opacity-90">
            {t('home.hero_subtitle') || 'Explore limestone mountains, ancient caves, and authentic Kayin culture.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/destinations"
              className="px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-light transition shadow-lg hover:shadow-xl"
            >
              {t('home.explore_destinations') || 'Explore Destinations'}
            </Link>
            <Link
              to="/business"
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-full hover:bg-white hover:text-primary transition"
            >
              {t('home.view_businesses') || 'View Local Businesses'}
            </Link>
          </div>
          <div className="absolute bottom-8 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs uppercase tracking-widest opacity-60">
              {t('home.scroll') || 'Scroll for More Info'}
            </span>
            <ChevronDown className="w-5 h-5 opacity-60" />
          </div>
        </div>
      </section>

      {/* Weather & Events */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WeatherWidget />
          <UpcomingEventsWidget />
        </div>
      </div>

      {/* Popular Destinations */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text">
            {t('home.popular_destinations') || 'Popular Destinations'}
          </h2>
          <p className="text-text-soft mt-2 max-w-2xl mx-auto">
            {t('home.popular_subtitle') || 'Must‑visit places recommended by travelers'}
          </p>
        </div>
        {destinationsLoading ? (
          <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/destinations" className="inline-flex items-center text-primary font-medium hover:underline">
            {t('home.view_all_destinations') || 'View all destinations'}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Directory Summary */}
      <section className="bg-neutral-light dark:bg-neutral-dark/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text">
              {t('home.directory_summary') || 'Explore Local Businesses'}
            </h2>
            <p className="text-text-soft mt-2">
              {t('home.directory_subtitle') || 'Find accommodation, restaurants, transport, and tours'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(categoryConfig).map(([cat, { icon: Icon, labelKey }]) => (
              <Link
                key={cat}
                to={`/business?category=${cat}`}
                className="group bg-white dark:bg-neutral-dark rounded-2xl shadow-md hover:shadow-xl transition p-6 text-center hover:-translate-y-1 duration-300"
              >
                <Icon className="w-12 h-12 mx-auto mb-3 text-primary group-hover:scale-110 transition" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-text">{t(labelKey)}</h3>
                <p className="text-text-soft text-sm mt-1">
                  {businessCounts[cat]} {t('home.listings') || 'listings'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Visit */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <Mountain className="w-12 h-12 mx-auto mb-3 text-primary" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-text mb-2">{t('home.nature') || 'Breathtaking Nature'}</h3>
            <p className="text-text-soft">Limestone karsts, hidden caves, and the serene Thanlwin River.</p>
          </div>
          <div className="text-center p-6">
            <Heart className="w-12 h-12 mx-auto mb-3 text-primary" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-text mb-2">{t('home.culture') || 'Rich Culture'}</h3>
            <p className="text-text-soft">Experience Kayin traditions, festivals, and warm hospitality.</p>
          </div>
          <div className="text-center p-6">
            <Coffee className="w-12 h-12 mx-auto mb-3 text-primary" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-text mb-2">{t('home.cuisine') || 'Delicious Cuisine'}</h3>
            <p className="text-text-soft">From tea leaf salad to Shan noodles – a food lover’s paradise.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            {t('home.cta_title') || 'Ready to Explore Hpa‑An?'}
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            {t('home.cta_subtitle') || 'Start planning your trip with our curated guides and local insights.'}
          </p>
          <Link
            to="/destinations"
            className="inline-block bg-white text-primary px-10 py-3 text-lg rounded-full font-medium hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
          >
            {t('home.start_journey') || 'Start Your Journey'}
          </Link>
        </div>
      </section>
    </div>
  );
}