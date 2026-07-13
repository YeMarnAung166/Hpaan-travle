import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { fadeInUp, staggerContainer, fadeIn } from '../utils/animations';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useReducedMotion } from '../hooks/useReducedMotion';
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
  const reduceMotion = useReducedMotion();
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
  const [destinationsRef, destinationsInView] = useScrollReveal();
  const [directoryRef, directoryInView] = useScrollReveal();
  const [whyVisitRef, whyVisitInView] = useScrollReveal();
  const [ctaRef, ctaInView] = useScrollReveal();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 500], [0, 150]);
  const parallaxEnabled = !reduceMotion && !isMobile;
  const heroTransition = reduceMotion ? { duration: 0.01 } : { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] };

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
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={parallaxEnabled ? { y: heroImageY } : {}}
        >
          <img
            src={getOptimizedImage("https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/static/home.jpg", 800)}
            alt="Hpa-An landscape"
            className="absolute inset-0 w-full h-full object-cover scale-110"
            loading="eager"
            decoding="async"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A3A3A]/50 via-[#1A3A3A]/30 to-[#1A1815]/80" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={heroTransition}
          className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.01 } : { duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm uppercase tracking-[0.25em] mb-4 opacity-70 font-medium"
          >
            {t('home.hero_tagline') || 'Discover the Hidden Gem'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.01 } : { duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-bold leading-none tracking-tight"
          >
            Hpa‑An
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.01 } : { duration: 0.6, delay: 0.6 }}
            className="text-base sm:text-lg md:text-xl max-w-xl mx-auto mt-4 mb-10 opacity-80 leading-relaxed"
          >
            {t('home.hero_subtitle') || 'Explore limestone mountains, ancient caves, and authentic Kayin culture.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.01 } : { duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/destinations"
              className="px-8 py-3 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 hover:shadow-xl transition-all shadow-lg"
            >
              {t('home.explore_destinations') || 'Explore Destinations'}
            </Link>
            <Link
              to="/business"
              className="px-8 py-3 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-full border border-white/25 hover:bg-white/25 hover:shadow-xl transition-all"
            >
              {t('home.view_businesses') || 'View Local Businesses'}
            </Link>
          </motion.div>
        </motion.div>
      </section>
      <div className="container mx-auto px-4 pt-4 relative z-10">
        <WeatherAlert />
      </div>

      {/* Stats Bar */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
          >
            {[
              { value: destinations.length || '—', label: t('home.stat_destinations') || 'Destinations', suffix: '+' },
              { value: Object.values(businessCounts).reduce((a, b) => a + b, 0) || '—', label: t('home.stat_businesses') || 'Local Businesses', suffix: '+' },
              { value: '10+', label: t('home.stat_events') || 'Yearly Events', suffix: '' },
              { value: '4.8', label: t('home.stat_rating') || 'Traveler Rating', suffix: '' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center"
              >
                <span className="block text-2xl md:text-3xl font-bold font-serif text-text">
                  {stat.value}
                  {stat.suffix && <span className="text-primary">{stat.suffix}</span>}
                </span>
                <span className="block text-xs md:text-sm text-text-soft mt-0.5 uppercase tracking-wider font-medium">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-transparent to-neutral-light dark:to-neutral-dark pointer-events-none" />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeInUp}
          className="container mx-auto px-4 py-16 relative z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <WeatherWidget />
            <UpcomingEventsWidget />
          </div>
        </motion.div>
      </div>

      <motion.section
        ref={destinationsRef}
        initial="hidden"
        animate={destinationsInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="container mx-auto px-4 py-16"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text max-w-3xl mx-auto leading-tight">
            {t('home.popular_destinations') || 'Popular Destinations'}
          </h2>
          <p className="text-text-soft mt-3 max-w-2xl mx-auto text-base md:text-lg">
            {t('home.popular_subtitle') || 'Must‑visit places recommended by fellow travelers'}
          </p>
        </motion.div>
        {loadingDestinations ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"><SkeletonCard count={3} /></div>
        ) : (
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(dest => (
              <motion.div key={dest.id} variants={fadeInUp}>
                <DestinationCard destination={dest} />
              </motion.div>
            ))}
          </motion.div>
        )}
        <motion.div variants={fadeInUp} className="text-center mt-8">
          <Link to="/destinations" className="inline-flex items-center text-primary font-medium hover:underline group">
            {t('home.view_all_destinations') || 'View all destinations'}
            {!reduceMotion && (
              <motion.svg
                className="w-4 h-4 ml-1"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </motion.svg>
            )}
          </Link>
        </motion.div>
      </motion.section>

      {/* Directory Summary */}
      <motion.section
        ref={directoryRef}
        initial="hidden"
        animate={directoryInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="bg-neutral-light dark:bg-neutral-dark/50 py-16"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text max-w-3xl mx-auto leading-tight">
              {t('home.directory_summary') || 'Find Everything You Need'}
            </h2>
            <p className="text-text-soft mt-3 max-w-2xl mx-auto text-base md:text-lg">
              {t('home.directory_subtitle') || 'Curated local businesses — from cozy stays to authentic eats'}
            </p>
          </motion.div>
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {// eslint-disable-next-line no-unused-vars
            Object.entries(categoryConfig).map(([cat, { icon: IconComponent, labelKey }]) => (
              <motion.div key={cat} variants={fadeInUp}>
                <Link
                  to={`/business?category=${cat}`}
                  className="group block bg-white dark:bg-neutral-dark rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center hover:-translate-y-2"
                >
                  {!reduceMotion && (
                    <motion.div
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <IconComponent className="w-12 h-12 mx-auto mb-3 text-primary" strokeWidth={1.5} />
                    </motion.div>
                  )}
                  {reduceMotion && <IconComponent className="w-12 h-12 mx-auto mb-3 text-primary transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />}
                  <h3 className="text-xl font-semibold text-text">{t(labelKey)}</h3>
                  <p className="text-text-soft text-sm mt-1">
                    {businessCounts[cat]} {t('home.listings') || 'listings'}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Why Visit */}
      <motion.section
        ref={whyVisitRef}
        initial="hidden"
        animate={whyVisitInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="py-16"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text max-w-3xl mx-auto leading-tight">
            {t('home.why_visit_title') || 'Why Hpa‑An'}
          </h2>
          <p className="text-text-soft mt-3 max-w-2xl mx-auto text-base md:text-lg">
            {t('home.why_visit_subtitle') || 'Limestone, legends & local warmth'}
          </p>
        </motion.div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Mountain, title: t('home.nature') || 'Breathtaking Nature', desc: 'Limestone karsts, hidden caves, and the serene Thanlwin River.' },
              { icon: Heart, title: t('home.culture') || 'Rich Culture', desc: 'Experience Kayin traditions, festivals, and warm hospitality.' },
              { icon: Coffee, title: t('home.cuisine') || 'Delicious Cuisine', desc: 'From tea leaf salad to Shan noodles – a food lover\'s paradise.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="text-center p-8 bg-white dark:bg-neutral-dark rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">{item.title}</h3>
                <p className="text-text-soft leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Blog Preview */}
      <BlogPreview />

      {/* Call to Action */}
      <motion.section
        ref={ctaRef}
        initial="hidden"
        animate={ctaInView ? 'visible' : 'hidden'}
        variants={fadeIn}
        className="bg-primary text-white py-16 relative overflow-hidden"
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 max-w-3xl mx-auto"
          >
            {t('home.cta_title') || 'Ready to Explore Hpa‑An?'}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-85 leading-relaxed"
          >
            {t('home.cta_subtitle') || 'Start planning your trip with our curated guides and local insights.'}
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              to="/destinations"
              className="inline-block bg-white text-primary px-10 py-3.5 text-lg rounded-full font-semibold hover:bg-gray-100 hover:shadow-2xl hover:-translate-y-0.5 transition-all shadow-xl"
            >
              {t('home.start_journey') || 'Start Your Journey'}
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
