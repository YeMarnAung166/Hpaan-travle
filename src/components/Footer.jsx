import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';
import { Mail, Phone, MapPin, ChevronUp, ExternalLink } from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
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
  const reduceMotion = useReducedMotion();
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

  const SectionHeading = ({ children }) => (
    <div className="mb-5">
      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{children}</h4>
      <div className="w-8 h-0.5 bg-gradient-to-r from-gold to-gold/20 rounded-full mt-2" />
    </div>
  );

  return (
    <footer className="bg-[#1A1815] text-gray-300 relative overflow-hidden">
      {!reduceMotion && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gold/[0.02] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/[0.02] blur-3xl pointer-events-none" />
        </>
      )}
      <div className="container mx-auto px-4 py-16 md:py-20">
        <motion.div
          initial="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12"
        >
          <motion.div variants={itemVariants} className="space-y-5">
            <h3 className="text-2xl font-serif font-bold text-white tracking-tight">
              Hpa‑An Travel
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.description') || 'Your ultimate travel guide to Hpa‑An, Myanmar. Discover limestone mountains, ancient caves, and authentic Kayin culture.'}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: FacebookIcon, href: 'https://facebook.com/hpaantravel', name: 'Facebook' },
                { Icon: InstagramIcon, href: 'https://instagram.com/hpaantravel', name: 'Instagram' },
                { Icon: TwitterIcon, href: 'https://twitter.com/hpaantravel', name: 'Twitter' },
                { Icon: YoutubeIcon, href: 'https://youtube.com/@hpaantravel', name: 'YouTube' },
              ].map(({ href, Icon, name }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={!reduceMotion ? { scale: 1.15, y: -2 } : {}}
                  whileTap={!reduceMotion ? { scale: 0.95 } : {}}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-gold hover:text-white hover:shadow-lg hover:shadow-gold/20 transition-all duration-300"
                  aria-label={`Follow us on ${name}`}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SectionHeading>{t('footer.quick_links') || 'Quick Links'}</SectionHeading>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[...mainLinks, ...extraLinks].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center gap-1.5 text-gray-400 hover:text-gold transition-colors duration-200 text-sm"
                >
                  <span className="w-0 group-hover:w-1.5 h-px bg-gold transition-all duration-200" />
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SectionHeading>{t('footer.contact') || 'Contact'}</SectionHeading>
            <ul className="space-y-4 text-sm">
              {[
                { Icon: Mail, content: <a href="mailto:info@hpaan.travel" className="hover:text-gold transition-colors duration-200">info@hpaan.travel</a> },
                { Icon: Phone, content: <a href="tel:+95912345678" className="hover:text-gold transition-colors duration-200">+959 123 45678</a> },
                { Icon: MapPin, content: <span>Hpa‑An, Kayin State, Myanmar</span> },
              ].map(({ Icon, content }, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3 h-3 text-gold/70" />
                  </span>
                  <span className="leading-relaxed">{content}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <div>
              <SectionHeading>{t('footer.language') || 'Language'}</SectionHeading>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    language === 'en'
                      ? 'bg-gold text-white shadow-sm shadow-gold/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('my')}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    language === 'my'
                      ? 'bg-gold text-white shadow-sm shadow-gold/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  မြန်
                </button>
              </div>
            </div>
            <CurrencyConverter />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1 }}
          className="mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500"
        >
          <p>
            &copy; {new Date().getFullYear()} Hpa‑An Travel. {t('footer.rights') || 'All rights reserved.'}
          </p>
          <div className="flex gap-6">
            {[
              { to: '/privacy', label: t('footer.privacy') || 'Privacy Policy' },
              { to: '/terms', label: t('footer.terms') || 'Terms of Service' },
              { to: '/contact', label: t('footer.contact_us') || 'Contact Us' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="hover:text-gold transition-colors duration-200 flex items-center gap-1">
                {link.label}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          className="fixed bottom-[72px] right-6 z-40 w-10 h-10 rounded-full bg-gold text-white shadow-lg hover:bg-gold/90 hover:shadow-xl hover:shadow-gold/20 transition-all flex items-center justify-center md:bottom-6"
          whileHover={!reduceMotion ? { y: -2 } : {}}
          whileTap={!reduceMotion ? { scale: 0.95 } : {}}
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </footer>
  );
}
