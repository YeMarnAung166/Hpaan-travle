import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import WeatherWidget from '../components/WeatherWidget';
import UpcomingEventsWidget from '../components/UpcomingEventsWidget';
import DestinationCard from '../components/DestinationCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import WeatherAlert from '../components/WeatherAlert';
import BlogPreview from '../components/BlogPreview';
import { Building2, UtensilsCrossed, Bus, Compass, Mountain, Heart, Coffee } from 'lucide-react';
import { getOptimizedImage } from '../utils/imageHelpers';

export default function HomePage() {
  const { t } = useLanguage();
  const helmetTitle = t('home.title') || 'Hpa-An Travel Guide';
  const helmetDesc = t('home.subtitle') || 'Discover the beautiful landscapes, caves, and culture of Hpa-An, Myanmar';
  const [destinations, setDestinations] = useState([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [businessCounts, setBusinessCounts] = useState({
    accommodation: 0,
    restaurant: 0,
    transport: 0,
    tours: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [destResult, ...countResults] = await Promise.all([
        supabase.from('destinations').select('*').order('id', { ascending: true }).limit(6),
        ...['accommodation', 'restaurant', 'transport', 'tours'].map(cat =>
          supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('category', cat)
        ),
      ]);

      if (!destResult.error) setDestinations(destResult.data);
      setLoadingDestinations(false);

      const counts = {};
      const categories = ['accommodation', 'restaurant', 'transport', 'tours'];
      countResults.forEach((result, i) => {
        if (!result.error) counts[categories[i]] = result.count || 0;
      });
      setBusinessCounts(counts);
    };
    fetchData();
  }, []);

  const categoryConfig = {
    accommodation: { icon: Building2, labelKey: 'business.accommodation' },
    restaurant: { icon: UtensilsCrossed, labelKey: 'business.restaurant' },
    transport: { icon: Bus, labelKey: 'business.transport' },
    tours: { icon: Compass, labelKey: 'business.tours' },
  };

  return (
    <div className="bg-white dark:bg-neutral-dark">
      <Helmet>
        <title>{helmetTitle} | Hpa-An Travel</title>
        <meta name="description" content={helmetDesc} />
        <meta property="og:title" content={helmetTitle} />
        <meta property="og:description" content={helmetDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <section className="relative h-dvh overflow-hidden -mt-[var(--header-h,96px)]">
        <div className="absolute inset-0">
          <img
            src={getOptimizedImage("https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/static/home.jpg", 800)}
            alt="Hpa-An landscape"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] mb-4 font-medium text-white/70">
            {t('home.hero_tagline') || 'Discover the Hidden Gem'}
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold leading-none tracking-tight">
            Hpa‑An
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-xl mx-auto mt-4 mb-10 text-white/80 leading-relaxed">
            {t('home.hero_subtitle') || 'Explore limestone mountains, ancient caves, and authentic Kayin culture.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/destinations"
              className="px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 hover:shadow-xl transition-all shadow-lg"
            >
              {t('home.explore_destinations') || 'Explore Destinations'}
            </Link>
            <Link
              to="/business"
              className="px-8 py-3 bg-white/15 text-white font-semibold rounded-full border border-white/25 hover:bg-white/25 hover:shadow-xl transition-all"
            >
              {t('home.view_businesses') || 'View Local Businesses'}
            </Link>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 pt-4 relative z-10">
        <WeatherAlert />
      </div>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { value: destinations.length || '—', label: t('home.stat_destinations') || 'Destinations', suffix: '+' },
              { value: Object.values(businessCounts).reduce((a, b) => a + b, 0) || '—', label: t('home.stat_businesses') || 'Local Businesses', suffix: '+' },
              { value: '10+', label: t('home.stat_events') || 'Yearly Events', suffix: '' },
              { value: '4.8', label: t('home.stat_rating') || 'Traveler Rating', suffix: '' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <span className="block text-2xl md:text-3xl font-bold font-serif text-text">
                  {stat.value}
                  {stat.suffix && <span className="text-primary">{stat.suffix}</span>}
                </span>
                <span className="block text-xs md:text-sm text-text-soft mt-0.5 uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WeatherWidget />
          <UpcomingEventsWidget />
        </div>
      </div>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text max-w-3xl mx-auto leading-tight">
            {t('home.popular_destinations') || 'Popular Destinations'}
          </h2>
          <p className="text-text-soft mt-3 max-w-2xl mx-auto text-base md:text-lg">
            {t('home.popular_subtitle') || 'Must‑visit places recommended by fellow travelers'}
          </p>
        </div>
        {loadingDestinations ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"><SkeletonCard count={3} /></div>
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

      <section className="bg-neutral-light dark:bg-neutral-dark/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text max-w-3xl mx-auto leading-tight">
              {t('home.directory_summary') || 'Find Everything You Need'}
            </h2>
            <p className="text-text-soft mt-3 max-w-2xl mx-auto text-base md:text-lg">
              {t('home.directory_subtitle') || 'Curated local businesses — from cozy stays to authentic eats'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(categoryConfig).map(([cat, { icon: IconComponent, labelKey }]) => (
              <Link
                key={cat}
                to={`/business?category=${cat}`}
                className="group block bg-white dark:bg-neutral-dark rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 text-center"
              >
                <IconComponent className="w-12 h-12 mx-auto mb-3 text-primary" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-text">{t(labelKey)}</h3>
                <p className="text-text-soft text-sm mt-1">
                  {businessCounts[cat]} {t('home.listings') || 'listings'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text max-w-3xl mx-auto leading-tight">
            {t('home.why_visit_title') || 'Why Hpa‑An'}
          </h2>
          <p className="text-text-soft mt-3 max-w-2xl mx-auto text-base md:text-lg">
            {t('home.why_visit_subtitle') || 'Limestone, legends & local warmth'}
          </p>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Mountain, title: t('home.nature') || 'Breathtaking Nature', desc: 'Limestone karsts, hidden caves, and the serene Thanlwin River.' },
              { icon: Heart, title: t('home.culture') || 'Rich Culture', desc: 'Experience Kayin traditions, festivals, and warm hospitality.' },
              { icon: Coffee, title: t('home.cuisine') || 'Delicious Cuisine', desc: 'From tea leaf salad to Shan noodles – a food lover\'s paradise.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 bg-white dark:bg-neutral-dark rounded-2xl shadow-soft hover:shadow-elevated transition-shadow">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">{item.title}</h3>
                <p className="text-text-soft leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BlogPreview />

      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 max-w-3xl mx-auto">
            {t('home.cta_title') || 'Ready to Explore Hpa‑An?'}
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/85 leading-relaxed">
            {t('home.cta_subtitle') || 'Start planning your trip with our curated guides and local insights.'}
          </p>
          <Link
            to="/destinations"
            className="inline-block bg-white text-primary px-10 py-3.5 text-lg rounded-full font-semibold hover:bg-gray-100 hover:shadow-2xl transition-all shadow-xl"
          >
            {t('home.start_journey') || 'Start Your Journey'}
          </Link>
        </div>
      </section>
    </div>
  );
}
