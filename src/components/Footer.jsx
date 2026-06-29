import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { Mail, Phone, MapPin, ChevronUp } from 'lucide-react';
import CurrencyConverter from './CurrencyConverter';

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export default function Footer() {
  const { t, language, setLanguage } = useLanguage();
  const user = useUser();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/destinations', label: t('nav.destinations') },
    { to: '/map', label: t('nav.map') },
    { to: '/business', label: t('nav.directory') },
  ];
  const extraLinks = [
    { to: '/events', label: t('nav.events') },
    { to: '/tips', label: t('nav.tips') },
    { to: '/history', label: t('nav.history') },
  ];
  if (user) {
    extraLinks.push({ to: '/trips', label: t('nav.trips') || 'My Trips' });
    extraLinks.push({ to: '/favorites', label: t('nav.favorites') });
    extraLinks.push({ to: '/account', label: t('nav.profile') || 'My Account' });
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <footer className="bg-[#1A1815] text-gray-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="footer-grid-pattern" />
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-serif font-bold text-white mb-4 tracking-tight">
              Hpa‑An Travel
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description') || 'Your ultimate travel guide to Hpa‑An, Myanmar. Discover limestone mountains, ancient caves, and authentic Kayin culture.'}
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { Icon: FacebookIcon, href: 'https://facebook.com/hpaantravel' },
                { Icon: InstagramIcon, href: 'https://instagram.com/hpaantravel' },
                { Icon: TwitterIcon, href: 'https://twitter.com/hpaantravel' },
                { Icon: YoutubeIcon, href: 'https://youtube.com/@hpaantravel' },
              ].map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-gold hover:text-white transition"
                  aria-label={`Follow us on ${['Facebook', 'Instagram', 'Twitter', 'YouTube'][i]}`}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {t('footer.quick_links') || 'Quick Links'}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[...mainLinks, ...extraLinks].map(link => (
                <Link key={link.to} to={link.to} className="text-gray-400 hover:text-gold transition text-sm">
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {t('footer.contact') || 'Contact'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0 text-gold/60" />
                <a href="mailto:info@hpaan.travel" className="hover:text-gold transition">
                  info@hpaan.travel
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0 text-gold/60" />
                <a href="tel:+95912345678" className="hover:text-gold transition">
                  +959 123 45678
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4 flex-shrink-0 text-gold/60" />
                <span>Hpa‑An, Kayin State, Myanmar</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <CurrencyConverter />
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                {t('footer.language') || 'Language'}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    language === 'en'
                      ? 'bg-gold text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('my')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    language === 'my'
                      ? 'bg-gold text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  မြန်
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1 }}
          className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500"
        >
          <p>
            &copy; {new Date().getFullYear()} Hpa‑An Travel. {t('footer.rights') || 'All rights reserved.'}
          </p>
          <div className="flex gap-5">
            {[
              { to: '/privacy', label: t('footer.privacy') || 'Privacy Policy' },
              { to: '/terms', label: t('footer.terms') || 'Terms of Service' },
              { to: '/contact', label: t('footer.contact_us') || 'Contact Us' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="hover:text-gold transition">
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-gold text-white shadow-lg hover:bg-gold/90 transition flex items-center justify-center"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </footer>
  );
}
