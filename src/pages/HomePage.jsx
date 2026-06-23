import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { fadeInUp, staggerContainer, fadeIn, scaleIn } from '../utils/animations';
import { useScrollReveal } from '../hooks/useScrollReveal';
import WeatherWidget from '../components/WeatherWidget';
import UpcomingEventsWidget from '../components/UpcomingEventsWidget';
import DestinationCard from '../components/DestinationCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import WeatherAlert from '../components/WeatherAlert';
import { Building2, UtensilsCrossed, Bus, Compass, Mountain, Heart, Coffee, ChevronDown } from 'lucide-react';

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
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 1.1]);
  const [destinationsRef, destinationsInView] = useScrollReveal();
  const [directoryRef, directoryInView] = useScrollReveal();
  const [whyVisitRef, whyVisitInView] = useScrollReveal();
  const [ctaRef, ctaInView] = useScrollReveal();

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
    <div className="bg-white dark:bg-neutral-dark">
      {/* Hero Section – Cinematic with parallax */}
      <section className="relative h-[100vh] overflow-hidden -mt-24">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <img
            src="https://hqzodqvstvdemmqxphbv.supabase.co/storage/v1/object/public/hpaan-assets/static/home.jpg"
            alt="Hpa-An landscape"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80"
        />

        {/* Floating decorative shapes */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 rounded-full border border-white/10"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-40 right-16 w-20 h-20 rounded-full border border-white/10"
          animate={{ y: [0, 15, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white/5"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center text-white"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm uppercase tracking-[0.2em] mb-4 opacity-80"
          >
            {t('home.hero_tagline') || 'Discover the Hidden Gem'}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold mb-4 leading-tight"
          >
            Hpa‑An
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 opacity-90"
          >
            {t('home.hero_subtitle') || 'Explore limestone mountains, ancient caves, and authentic Kayin culture.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/destinations"
                className="block px-8 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary-light transition shadow-lg hover:shadow-xl"
              >
                {t('home.explore_destinations') || 'Explore Destinations'}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/business"
                className="block px-8 py-3 bg-transparent border-2 border-white text-white font-medium rounded-full hover:bg-white hover:text-primary transition"
              >
                {t('home.view_businesses') || 'View Local Businesses'}
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xs uppercase tracking-widest opacity-60"
            >
              {t('home.scroll') || 'Scroll for More Info'}
            </motion.span>
            <ChevronDown className="w-5 h-5 opacity-60" />
          </motion.div>
        </motion.div>
      </section>
      <div className="container mx-auto px-4 pt-4">
      <WeatherAlert />
    </div>
      {/* Weather & Events */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={fadeInUp}
        className="container mx-auto px-4 py-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WeatherWidget />
          <UpcomingEventsWidget />
        </div>
      </motion.div>

      {/* Popular Destinations */}
      <motion.section
        ref={destinationsRef}
        initial="hidden"
        animate={destinationsInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="container mx-auto px-4 py-16"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text">
            {t('home.popular_destinations') || 'Popular Destinations'}
          </h2>
          <p className="text-text-soft mt-2 max-w-2xl mx-auto">
            {t('home.popular_subtitle') || 'Must‑visit places recommended by travelers'}
          </p>
        </motion.div>
        {loadingDestinations ? (
          <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
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
            <motion.svg
              className="w-4 h-4 ml-1"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </motion.svg>
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
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text">
              {t('home.directory_summary') || 'Explore Local Businesses'}
            </h2>
            <p className="text-text-soft mt-2">
              {t('home.directory_subtitle') || 'Find accommodation, restaurants, transport, and tours'}
            </p>
          </motion.div>
          <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(categoryConfig).map(([cat, { icon: Icon, labelKey }]) => (
              <motion.div key={cat} variants={fadeInUp}>
                <Link
                  to={`/business?category=${cat}`}
                  className="group block bg-white dark:bg-neutral-dark rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center hover:-translate-y-2"
                >
                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon className="w-12 h-12 mx-auto mb-3 text-primary" strokeWidth={1.5} />
                  </motion.div>
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
        className="container mx-auto px-4 py-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Mountain, title: t('home.nature') || 'Breathtaking Nature', desc: 'Limestone karsts, hidden caves, and the serene Thanlwin River.' },
            { icon: Heart, title: t('home.culture') || 'Rich Culture', desc: 'Experience Kayin traditions, festivals, and warm hospitality.' },
            { icon: Coffee, title: t('home.cuisine') || 'Delicious Cuisine', desc: 'From tea leaf salad to Shan noodles – a food lover\'s paradise.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="text-center p-6 group"
            >
              <motion.div
                whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
              >
                <item.icon className="w-12 h-12 mx-auto mb-3 text-primary transition-colors" strokeWidth={1.5} />
              </motion.div>
              <h3 className="text-xl font-semibold text-text mb-2">{item.title}</h3>
              <p className="text-text-soft">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        ref={ctaRef}
        initial="hidden"
        animate={ctaInView ? 'visible' : 'hidden'}
        variants={fadeIn}
        className="bg-primary text-white py-16 relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-dark/50 via-transparent to-primary-dark/50"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-serif font-bold mb-4"
          >
            {t('home.cta_title') || 'Ready to Explore Hpa‑An?'}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg mb-8 max-w-2xl mx-auto opacity-90"
          >
            {t('home.cta_subtitle') || 'Start planning your trip with our curated guides and local insights.'}
          </motion.p>
          <motion.div variants={fadeInUp} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/destinations"
              className="inline-block bg-white text-primary px-10 py-3 text-lg rounded-full font-medium hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
              {t('home.start_journey') || 'Start Your Journey'}
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}