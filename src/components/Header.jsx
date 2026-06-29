import { useState, useEffect, useRef, memo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useProfileContext } from '../context/ProfileContext';
import { useScroll } from '../hooks/useScroll';
import Button from './ui/Button';

const Header = memo(function Header({ onLoginClick, onLogoutClick }) {
  const user = useUser();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { profile, refresh } = useProfileContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const scrolled = useScroll();
  const headerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      const h = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isHomepage = location.pathname === '/';
  const isTransparent = isHomepage && !scrolled;

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/destinations", label: t("nav.destinations") },
    { to: "/map", label: t("nav.map") },
    { to: "/business", label: t("nav.directory") },
    { to: "/events", label: t("nav.events") },
    { to: "/tips", label: t("nav.tips") },
    { to: "/history", label: t("nav.history") },
    { to: "/blog", label: "Blog" },
  ];
  if (user) {
    navLinks.push({ to: "/trips", label: t("nav.trips") || "My Trips" });
    navLinks.push({ to: "/favorites", label: t("nav.favorites") });
  }

  const desktopLinkClass = ({ isActive }) =>
    `relative px-1 py-1 font-medium transition ${
      isActive
        ? isTransparent ? 'text-white' : 'text-primary'
        : isTransparent ? 'text-white/80 hover:text-white' : 'text-text hover:text-primary'
    }`;

  // Mobile link styles
  const mobileLinkClass = ({ isActive }) =>
    `block w-full px-4 py-2 rounded-lg ${
      isActive
        ? 'font-semibold text-primary bg-primary/5'
        : 'text-text hover:text-primary hover:bg-overlay transition'
    }`;

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 w-full backdrop-blur-sm transition-colors duration-500 ${
        isTransparent
          ? 'bg-transparent shadow-none'
          : 'bg-glass border-b border-border dark:border-border shadow-glass backdrop-blur-2xl'
      }`}
    >
      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex justify-between items-center relative">
          <div className="flex-1 flex justify-start md:justify-center">
            <Link
              to="/"
              className={`text-2xl md:text-3xl font-serif font-bold tracking-tight transition ${
                isTransparent ? 'text-white' : 'text-primary'
              }`}
              onClick={closeMenu}
            >
              Hpa‑An Travel
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-2 absolute right-0">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-full transition ${
                isTransparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-text-soft hover:text-text hover:bg-overlay'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
            <div className={`flex gap-0.5 rounded-full p-0.5 ${isTransparent ? '' : 'bg-overlay'}`}>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                  language === 'en'
                    ? isTransparent ? 'bg-white/20 text-white' : 'bg-primary text-white'
                    : isTransparent ? 'text-white/60 hover:text-white' : 'text-text-soft hover:text-text'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('my')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                  language === 'my'
                    ? isTransparent ? 'bg-white/20 text-white' : 'bg-primary text-white'
                    : isTransparent ? 'text-white/60 hover:text-white' : 'text-text-soft hover:text-text'
                }`}
              >
                မြန်
              </button>
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/account"
                  className={`flex items-center gap-2 transition ${
                    isTransparent ? 'text-white/80 hover:text-white' : 'text-text-soft hover:text-text'
                  }`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/20" />
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium hidden lg:inline">{displayName}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogoutClick}
                  className={isTransparent ? 'text-white/80 hover:text-white' : ''}
                >
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  isTransparent
                    ? 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25'
                    : 'bg-primary text-white hover:bg-primary-light shadow-soft'
                }`}
              >
                {t('nav.login')}
              </button>
            )}
          </div>
          <button
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className={`md:hidden p-2 rounded-lg transition ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-text-soft hover:text-text hover:bg-overlay'
            } absolute right-0`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-1 mt-2">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass} end={link.to === '/'}>
              {({ isActive }) => (
                <span className="relative px-2 py-1 text-sm">
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                        isTransparent ? 'bg-white' : 'bg-primary'
                      }`}
                    />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeMenu} aria-hidden="true" />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="md:hidden absolute left-0 right-0 top-full mt-1 z-50 glass-card rounded-xl shadow-lg overflow-hidden"
              >
              <div className="flex flex-col">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                  >
                    <NavLink
                      to={link.to}
                      className={mobileLinkClass}
                      onClick={closeMenu}
                      end={link.to === '/'}
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2 rounded-full bg-overlay text-text hover:bg-border transition"
                  >
                    {theme === 'light' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    )}
                  </button>
                  <div className="flex gap-0.5 bg-overlay rounded-full p-0.5">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                        language === 'en' ? 'bg-primary text-white' : 'text-text-soft hover:text-text'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage('my')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                        language === 'my' ? 'bg-primary text-white' : 'text-text-soft hover:text-text'
                      }`}
                    >
                      မြန်
                    </button>
                  </div>
                </div>
                {user ? (
                  <div className="pt-1 space-y-2">
                    <Link
                      to="/account"
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-text hover:text-primary hover:bg-overlay transition"
                      onClick={closeMenu}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full ring-2 ring-primary/20" />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="font-medium">{displayName}</span>
                    </Link>
                      <Button
                      variant="ghost"
                      size="sm"
                      className="w-full px-4"
                      onClick={() => { onLogoutClick(); closeMenu(); }}
                      >
                      {t('nav.logout')}
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => { onLoginClick(); closeMenu(); }}
                      className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-light transition shadow-soft"
                  >
                    {t('nav.login')}
                  </button>
                )}
              </div>
            </motion.div>
          </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
});

export default Header;