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
import {
  Building2,
  UtensilsCrossed,
  Bus,
  Compass,
  Mountain,
  Heart,
  Coffee,
} from 'lucide-react';
import { getOptimizedImage } from '../utils/imageHelpers';

export default function HomePage() {
  const { t } = useLanguage();
  const helmetTitle = t('home.title') || 'Hpa-An Travel Guide';
  const helmetDesc =
    t('home.subtitle') ||
    'Discover the beautiful landscapes, caves, and culture of Hpa-An, Myanmar';
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
        supabase
          .from('destinations')
          .select('*')
          .order('id', { ascending: true })
          .limit(6),
        ...['accommodation', 'restaurant', 'transport', 'tours'].map((cat) =>
          supabase
            .from('businesses')
            .select('*', { count: 'exact', head: true })
            .eq('category', cat),
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
    accommodation: {
      icon: Building2,
      labelKey: 'business.accommodation',
    },
    restaurant: { icon: UtensilsCrossed, labelKey: 'business.restaurant' },
    transport: { icon: Bus, labelKey: 'business.transport' },
    tours: { icon: Compass, labelKey: 'business.tours' },
  };

  return (
    <div className="bg-neutral-light dark:bg-neutral-dark">
      <Helmet>
        <title>{helmetTitle} | Hpa-An Travel</title>
        <meta name="description" content={helmetDesc} />
        <meta property="og:title" content={helmetTitle} />
        <meta property="og:description" content={helmetDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      {/* ── Compact Hero ── */}
      <section className="relative overflow-hidden -mt-[var(--header-h,96px)] flex flex-col items-center justify-center text-center" style={{ height: 'calc(50vh + 155px)' }}>
        <div className="absolute inset-0">
          <img
            src={getOptimizedImage(
              'https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/static/home.jpg',
              800,
            )}
            alt="Hpa-An landscape"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

        <div className="relative z-10 px-6 mt-16 md:mt-24">
          <p className="text-xs sm:text-sm uppercase tracking-[0.25em] mb-4 font-medium text-white/70">
            {t('home.hero_tagline') || 'Discover the Hidden Gem'}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white font-bold leading-tight mb-3">
            DISCOVER Hpa‑An
          </h1>
          <p className="max-w-md mx-auto text-white/85 text-sm md:text-base leading-relaxed mb-8 px-4">
            {t('home.hero_subtitle') ||
              'Explore limestone mountains, ancient caves, and authentic Kayin culture.'}
          </p>
          <div className="flex flex-row gap-3 w-full max-w-sm mx-auto px-4">
            <Link
              to="/destinations"
              className="flex-1 bg-white text-primary font-semibold py-3 px-4 rounded-xl shadow-lg active:scale-95 transition-transform text-xs whitespace-nowrap"
            >
              {t('home.explore_destinations') || 'Explore Destinations'}
            </Link>
            <Link
              to="/business"
              className="flex-1 bg-white/20 backdrop-blur-md text-white border border-white/30 font-semibold py-3 px-4 rounded-xl shadow-lg active:scale-95 transition-transform text-xs whitespace-nowrap"
            >
              {t('home.view_businesses') || 'Local Businesses'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Weather Alert ── */}
      <div className="container mx-auto px-4 pt-4 relative z-10">
        <WeatherAlert />
      </div>

      {/* ── Overlapping Content Panel ── */}
      <section className="relative z-10 bg-neutral-light dark:bg-neutral-dark rounded-t-3xl -mt-6 pt-8 pb-8 px-4 md:px-6 lg:px-8">
        {/* Weather & Events — side by side on desktop */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <WeatherWidget />
            <UpcomingEventsWidget />
          </div>
        </div>

        {/* Hidden Gems — horizontal scroll */}
        {!loadingDestinations && destinations.length > 0 && (
          <div className="max-w-7xl mx-auto mb-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-text dark:text-white">
                {t('home.popular_destinations') || 'Popular Destinations'}
              </h2>
              <Link
                to="/destinations"
                className="text-primary text-sm font-medium hover:underline"
              >
                {t('home.view_all') || 'See all'}
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar -mx-4 px-4 snap-x snap-mandatory">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  className="min-w-[240px] md:min-w-[280px] snap-start"
                >
                  <DestinationCard destination={dest} />
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingDestinations && (
          <div className="max-w-7xl mx-auto">
            <div className="flex overflow-x-auto gap-4 pb-4">
              <SkeletonCard count={3} />
            </div>
          </div>
        )}
      </section>

      {/* ── Directory Summary ── */}
      <section className="bg-white dark:bg-neutral-dark/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text max-w-3xl mx-auto leading-tight">
              {t('home.directory_summary') || 'Find Everything You Need'}
            </h2>
            <p className="text-text-soft mt-3 max-w-2xl mx-auto text-base md:text-lg">
              {t('home.directory_subtitle') ||
                'Curated local businesses — from cozy stays to authentic eats'}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(categoryConfig).map(
              ([cat, { icon: IconComponent, labelKey }]) => (
                <Link
                  key={cat}
                  to={`/business?category=${cat}`}
                  className="group block bg-neutral-light dark:bg-neutral-dark rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6 text-center"
                >
                  <IconComponent
                    className="w-12 h-12 mx-auto mb-3 text-primary"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-xl font-semibold text-text">
                    {t(labelKey)}
                  </h3>
                  <p className="text-text-soft text-sm mt-1">
                    {businessCounts[cat]}{' '}
                    {t('home.listings') || 'listings'}
                  </p>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── Why Hpa‑An ── */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text max-w-3xl mx-auto leading-tight">
            {t('home.why_visit_title') || 'Why Hpa‑An'}
          </h2>
          <p className="text-text-soft mt-3 max-w-2xl mx-auto text-base md:text-lg">
            {t('home.why_visit_subtitle') ||
              'Limestone, legends & local warmth'}
          </p>
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Mountain,
                title: t('home.nature') || 'Breathtaking Nature',
                desc: 'Limestone karsts, hidden caves, and the serene Thanlwin River.',
              },
              {
                icon: Heart,
                title: t('home.culture') || 'Rich Culture',
                desc: 'Experience Kayin traditions, festivals, and warm hospitality.',
              },
              {
                icon: Coffee,
                title: t('home.cuisine') || 'Delicious Cuisine',
                desc: "From tea leaf salad to Shan noodles – a food lover's paradise.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center p-8 bg-white dark:bg-neutral-dark rounded-2xl shadow-soft hover:shadow-elevated transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center">
                  <item.icon
                    className="w-7 h-7 text-primary"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">
                  {item.title}
                </h3>
                <p className="text-text-soft leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog Preview ── */}
      <BlogPreview />

      {/* ── CTA ── */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 max-w-3xl mx-auto">
            {t('home.cta_title') || 'Ready to Explore Hpa‑An?'}
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/85 leading-relaxed">
            {t('home.cta_subtitle') ||
              'Start planning your trip with our curated guides and local insights.'}
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
