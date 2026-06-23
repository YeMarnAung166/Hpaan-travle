import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useProfileContext } from '../context/ProfileContext';
import { isUserAdmin } from '../utils/adminCheck';
import { useScroll } from '../hooks/useScroll';
import Button from './ui/Button';

export default function Header({ onLoginClick, onLogoutClick }) {
  const user = useUser();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { profile, refresh } = useProfileContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const scrolled = useScroll();

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

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

  // Mobile link styles – always dark (on white background)
  const mobileLinkClass = ({ isActive }) =>
    isActive
      ? 'font-semibold text-primary'
      : 'text-text hover:text-primary transition';

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent shadow-none border-transparent'
          : 'bg-white/80 dark:bg-neutral-dark/80 backdrop-blur-xl border-b border-neutral-mid/50 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4 py-3 relative">
        {/* Top row: Logo centered, actions on far right */}
        <div className="flex justify-between items-center relative">
          <div className="flex-1 flex justify-start md:justify-center">
            <Link
              to="/"
              className={`text-3xl font-serif font-bold transition ${
                isTransparent ? 'text-white' : 'text-primary'
              }`}
              onClick={closeMenu}
            >
              Hpa‑An Travel
            </Link>
          </div>
          {/* Right actions (desktop) */}
          <div className="hidden md:flex items-center gap-3 absolute right-0">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-full transition ${
                isTransparent
                  ? 'text-white hover:bg-white/20'
                  : 'text-text hover:bg-neutral-light'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <div className={`flex gap-1 rounded-full p-0.5 ${isTransparent ? '' : 'bg-neutral-light'}`}>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-sm rounded-full transition ${
                  language === 'en'
                    ? isTransparent ? 'bg-white text-primary' : 'bg-primary text-white'
                    : isTransparent ? 'text-white hover:bg-white/20' : 'text-text hover:bg-neutral-mid'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('my')}
                className={`px-2 py-1 text-sm rounded-full transition ${
                  language === 'my'
                    ? isTransparent ? 'bg-white text-primary' : 'bg-primary text-white'
                    : isTransparent ? 'text-white hover:bg-white/20' : 'text-text hover:bg-neutral-mid'
                }`}
              >
                မြန်
              </button>
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/account"
                  className={`flex items-center gap-2 transition ${
                    isTransparent ? 'text-white hover:text-white/80' : 'text-text hover:text-primary'
                  }`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-primary/30" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                  <span className="text-sm font-medium hidden lg:inline">{displayName}</span>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogoutClick}
                  className={`${
                    isTransparent
                      ? 'border-white text-white hover:bg-white/20'
                      : 'border-primary text-primary hover:bg-primary/10'
                  }`}
                >
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  isTransparent
                    ? 'bg-white text-primary hover:bg-gray-100'
                    : 'bg-primary text-white hover:bg-primary-light'
                }`}
              >
                {t('nav.login')}
              </button>
            )}
          </div>
          {/* Mobile menu button (right) */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 rounded-lg transition ${
              isTransparent ? 'text-white hover:bg-white/20' : 'text-text hover:bg-neutral-light'
            } absolute right-0`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Bottom row: Navigation links (desktop) */}
        <nav className="hidden md:flex items-center justify-center gap-6 mt-2">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={desktopLinkClass} end={link.to === '/'}>
              {({ isActive }) => (
                <span className="relative">
                  {link.label}
                  <motion.span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                      isTransparent ? 'bg-white' : 'bg-primary'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    layoutId="nav-underline"
                  />
                </span>
              )}
            </NavLink>
          ))}
          {user && isUserAdmin(user) && (
            <NavLink to="/admin" className={desktopLinkClass}>
              {({ isActive }) => (
                <span className="relative">
                  {t('nav.admin')}
                  <motion.span
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                      isTransparent ? 'bg-white' : 'bg-primary'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </span>
              )}
            </NavLink>
          )}
        </nav>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden absolute left-0 right-0 top-full mt-1 z-50 bg-white/90 dark:bg-neutral-dark/90 backdrop-blur-xl rounded-xl shadow-xl border border-neutral-mid/50 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
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
                {user && isUserAdmin(user) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.03, duration: 0.2 }}
                  >
                    <NavLink to="/admin" className={mobileLinkClass} onClick={closeMenu}>
                      {t('nav.admin')}
                    </NavLink>
                  </motion.div>
                )}
                <div className="flex items-center gap-4 pt-2 border-t border-neutral-mid">
                  <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2 rounded-full bg-neutral-light text-text hover:bg-neutral-mid transition"
                  >
                    {theme === 'light' ? '🌙' : '☀️'}
                  </button>
                  <div className="flex gap-1 bg-neutral-light rounded-full p-0.5">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-2 py-1 text-sm rounded-full transition ${
                        language === 'en' ? 'bg-primary text-white' : 'text-text hover:bg-neutral-mid'
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage('my')}
                      className={`px-2 py-1 text-sm rounded-full transition ${
                        language === 'my' ? 'bg-primary text-white' : 'text-text hover:bg-neutral-mid'
                      }`}
                    >
                      မြန်
                    </button>
                  </div>
                </div>
                {user ? (
                  <div className="pt-2 space-y-2">
                    <Link
                      to="/account"
                      className="flex items-center gap-3 py-2 text-text hover:text-primary transition"
                      onClick={closeMenu}
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}
                      <span className="font-medium">{displayName}</span>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => { onLogoutClick(); closeMenu(); }}
                    >
                      {t('nav.logout')}
                    </Button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onLoginClick(); closeMenu(); }}
                    className="w-full text-center py-2 rounded-full font-medium bg-primary text-white hover:bg-primary-light transition"
                  >
                    {t('nav.login')}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}