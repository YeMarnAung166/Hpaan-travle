import { useState, useEffect, useRef, memo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, MapPin, Map, Store, Calendar, Lightbulb, BookOpen, FileEdit, Heart, X } from 'lucide-react';
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
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      const h = headerRef.current.offsetHeight;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    }
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') { closeMenu(); hamburgerRef.current?.focus(); return; }
      if (e.key === 'Tab' && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    menuRef.current?.querySelector('a, button')?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isHomepage = location.pathname === '/';
  const isTransparent = isHomepage && !scrolled;

  const navLinks = [
    { to: "/", label: t("nav.home"), icon: Compass },
    { to: "/destinations", label: t("nav.destinations"), icon: MapPin },
    { to: "/map", label: t("nav.map"), icon: Map },
    { to: "/business", label: t("nav.directory"), icon: Store },
    { to: "/events", label: t("nav.events"), icon: Calendar },
    { to: "/tips", label: t("nav.tips"), icon: Lightbulb },
    { to: "/history", label: t("nav.history"), icon: BookOpen },
    { to: "/blog", label: "Blog", icon: FileEdit },
  ];
  if (user) {
    navLinks.push({ to: "/trips", label: t("nav.trips") || "My Trips", icon: MapPin });
    navLinks.push({ to: "/favorites", label: t("nav.favorites"), icon: Heart });
  }

  const desktopLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm font-medium whitespace-nowrap rounded-full transition-colors duration-200 ${
      isActive
        ? isTransparent
          ? 'text-white'
          : 'text-primary dark:text-primary-light'
        : isTransparent
          ? 'text-white/70 hover:text-white'
          : 'text-text-soft dark:text-text-soft/80 hover:text-text dark:hover:text-white'
    }`;

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 w-full backdrop-blur-sm transition-colors duration-500 ${
        isTransparent
          ? 'bg-transparent shadow-none'
          : 'bg-glass border-b border-border dark:border-border shadow-glass backdrop-blur-2xl'
      }`}
    >
      <div className="container mx-auto px-4 py-2">
        <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_auto_1fr] items-center gap-1 md:gap-2">
          <Link to="/" className="flex items-center gap-3 md:col-start-2 md:justify-self-center" onClick={closeMenu}>
            <img
              src="/pwa-192x192.png"
              alt="Hpa-An Travel"
              className="h-9 md:h-10 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <span className={`text-base md:text-lg font-bold transition-colors duration-500 ${
                isTransparent ? 'text-white' : 'text-text dark:text-white'
              }`}>Hpa‑An</span>
              <span className={`text-[10px] md:text-xs font-medium tracking-[0.15em] uppercase transition-colors duration-500 ${
                isTransparent ? 'text-white/60' : 'text-text-soft dark:text-white/70'
              }`}>Travel</span>
            </div>
          </Link>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`md:hidden flex items-center justify-center w-9 h-9 rounded-full transition ${
              isTransparent
                ? 'text-white/70 hover:text-white hover:bg-white/10'
                : 'text-text-soft dark:text-text-soft/80 hover:text-text dark:hover:text-white hover:bg-overlay dark:hover:bg-white/10'
            }`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>

          <button
            ref={hamburgerRef}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className={`md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition ${
              isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-text-soft hover:text-text hover:bg-overlay dark:hover:bg-white/10'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="hidden md:flex items-center justify-end gap-2">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`flex items-center justify-center w-9 h-9 rounded-full transition ${
                isTransparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-text-soft dark:text-text-soft/80 hover:text-text dark:hover:text-white hover:bg-overlay dark:hover:bg-white/10'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
            <div className={`flex gap-0.5 rounded-full p-0.5 ${isTransparent ? '' : 'bg-overlay dark:bg-white/10'}`}>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                  language === 'en'
                    ? isTransparent ? 'bg-white/20 text-white' : 'bg-primary text-white'
                    : isTransparent ? 'text-white/60 hover:text-white' : 'text-text-soft dark:text-text-soft/80 hover:text-text dark:hover:text-white'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('my')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                  language === 'my'
                    ? isTransparent ? 'bg-white/20 text-white' : 'bg-primary text-white'
                    : isTransparent ? 'text-white/60 hover:text-white' : 'text-text-soft dark:text-text-soft/80 hover:text-text dark:hover:text-white'
                }`}
                aria-label="Switch to Myanmar"
              >
                မြန်
              </button>
            </div>
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/account"
                  className={`flex items-center gap-2 transition ${
                    isTransparent ? 'text-white/80 hover:text-white' : 'text-text-soft dark:text-text-soft/80 hover:text-text dark:hover:text-white'
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
                  className={isTransparent ? 'text-white/80 hover:text-white dark:text-white/80 dark:hover:text-white' : ''}
                >
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  isTransparent
                    ? 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 hover:shadow-lg'
                    : 'bg-primary text-white hover:bg-primary-light shadow-soft hover:shadow-md'
                }`}
              >
                {t('nav.login')}
              </button>
            )}
          </div>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-0.5 mt-2 overflow-x-auto scrollbar-hide" aria-label="Main navigation">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass} end={link.to === '/'}>
              {({ isActive }) => (
                <span className="relative inline-flex items-center gap-1.5 px-1.5 py-1">
                  <Icon size={14} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${
                        isTransparent ? 'bg-white' : 'bg-primary dark:bg-primary-light'
                      }`}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
        </nav>
      </div>
    </header>
    {isMenuOpen && (
      <div
        className="fixed inset-0 z-[100] bg-black/70"
        onClick={closeMenu}
        aria-hidden="true"
      />
    )}
    <div
      ref={menuRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      onKeyDown={(e) => { if (e.key === 'Escape') { closeMenu(); hamburgerRef.current?.focus(); } }}
      className={`md:hidden fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] z-[110] shadow-2xl flex flex-col transition-transform duration-200 ease-out bg-white dark:bg-gray-900 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-white dark:bg-gray-900">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <img src="/pwa-192x192.png" alt="Hpa-An Travel" className="h-8 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-gray-900 dark:text-white">Hpa‑An</span>
            <span className="text-[9px] font-medium tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400">Travel</span>
          </div>
        </Link>
        <button
          onClick={closeMenu}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {user ? (
          <div className="p-4 border-b border-border bg-white dark:bg-gray-900">
            <Link
              to="/account"
              onClick={closeMenu}
              className="flex items-center gap-3 group"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-primary transition">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('nav.account') || 'Account'}</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="p-4 border-b border-border bg-white dark:bg-gray-900">
            <button
              onClick={() => { onLoginClick(); closeMenu(); }}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-light transition shadow-soft"
            >
              {t('nav.login')}
            </button>
          </div>
        )}

        <div className="p-2 space-y-0.5 bg-white dark:bg-gray-900">
          {navLinks.map(link => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'font-semibold text-primary bg-primary/5'
                      : 'text-gray-800 dark:text-gray-200 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.5} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-border bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
              <span className="text-sm">{t('nav.theme') || 'Theme'}</span>
            </button>
            <div className="flex gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                  language === 'en' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('my')}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition ${
                  language === 'my' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                }`}
                aria-label="Switch to Myanmar"
              >
                မြန်
              </button>
            </div>
          </div>
        </div>

        {user && (
          <div className="px-4 pb-4 bg-white dark:bg-gray-900">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => { onLogoutClick(); closeMenu(); }}
            >
              {t('nav.logout')}
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
});

export default Header;