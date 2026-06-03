import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import WeatherWidget from '../components/WeatherWidget';
import UpcomingEventsWidget from '../components/UpcomingEventsWidget';
import DestinationCard from '../components/DestinationCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Building2, UtensilsCrossed, Bus, Compass, Mountain, Heart, Coffee } from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [businessCounts, setBusinessCounts] = useState({
    accommodation: 0,
    restaurant: 0,
    transport: 0,
    tours: 0,
  });

  useEffect(() => {
    const fetchDestinations = async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('id', { ascending: true })
        .limit(6);
      if (!error) setDestinations(data);
      setLoadingDestinations(false);
    };
    fetchDestinations();

    const fetchBusinessCounts = async () => {
      const counts = {};
      const categories = ['accommodation', 'restaurant', 'transport', 'tours'];
      for (const cat of categories) {
        const { count, error } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat);
        if (!error) counts[cat] = count || 0;
      }
      setBusinessCounts(counts);
    };
    fetchBusinessCounts();
  }, []);

  const categoryConfig = {
    accommodation: { icon: Building2, labelKey: 'business.accommodation' },
    restaurant: { icon: UtensilsCrossed, labelKey: 'business.restaurant' },
    transport: { icon: Bus, labelKey: 'business.transport' },
    tours: { icon: Compass, labelKey: 'business.tours' },
  };

  return (
    <div>
      {/* Hero Section with Video Background */}
      <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600"
        >
          <source
            src="https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/static/homepage.mp4"
            type="video/mp4"
          />
          {/* Fallback image if video fails */}
          <img
            src="https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/static/history.jpg"
            alt="Hpa-An landscape"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </video>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Centered text content */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center text-white text-center z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-4">
            {t('home.hero_title') || 'Discover the Hidden Gem of Myanmar'}
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            {t('home.hero_subtitle') || 'Explore limestone mountains, ancient caves, and authentic Kayin culture in Hpa‑An.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/destinations" className="btn btn-primary px-8 py-3 text-lg">
              {t('home.explore_destinations') || 'Explore Destinations'}
            </Link>
            <Link to="/business" className="btn btn-outline px-8 py-3 text-lg bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20">
              {t('home.view_businesses') || 'View Local Businesses'}
            </Link>
          </div>
        </div>
      </section>

      {/* Weather & Events */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WeatherWidget />
          <UpcomingEventsWidget />
        </div>
      </div>

      {/* Popular Destinations */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text">
            {t('home.popular_destinations') || 'Popular Destinations'}
          </h2>
          <p className="text-text-soft mt-2 max-w-2xl mx-auto">
            {t('home.popular_subtitle') || 'Must‑visit places recommended by travelers'}
          </p>
        </div>
        {loadingDestinations ? (
          <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(dest => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/destinations" className="text-primary hover:underline font-medium">
            {t('home.view_all_destinations') || 'View all destinations →'}
          </Link>
        </div>
      </section>

      {/* Directory Summary – with SVG icons */}
      <section className="bg-neutral-light py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
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
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition group"
              >
                <Icon className="w-12 h-12 mx-auto mb-3 text-primary group-hover:scale-105 transition" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-text">{t(labelKey)}</h3>
                <p className="text-text-soft text-sm mt-1">
                  {businessCounts[cat]} {t('home.listings') || 'listings'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Visit Hpa‑An – with SVG icons */}
      <section className="container mx-auto px-4 py-12">
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
      <section className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">{t('home.cta_title') || 'Ready to Explore Hpa‑An?'}</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
            {t('home.cta_subtitle') || 'Start planning your trip with our curated guides and local insights.'}
          </p>
          <Link to="/destinations" className="btn bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg rounded-full">
            {t('home.start_journey') || 'Start Your Journey'}
          </Link>
        </div>
      </section>
    </div>
  );
}