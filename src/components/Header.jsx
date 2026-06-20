import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
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

  const activeLinkClass = ({ isActive }) =>
    isActive
      ? `font-semibold border-b-2 ${isTransparent ? 'border-white text-white' : 'border-primary text-primary'}`
      : `transition ${isTransparent ? 'text-white/80 hover:text-white' : 'text-text hover:text-primary'}`;

  const mobileActiveLinkClass = ({ isActive }) =>
    isActive ? `font-semibold ${isTransparent ? 'text-white' : 'text-primary'}` : `transition ${isTransparent ? 'text-white/80' : 'text-text'}`;

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent shadow-none border-transparent'
          : 'bg-white dark:bg-neutral-dark border-b border-neutral-mid shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
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
            <NavLink key={link.to} to={link.to} className={activeLinkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
          {user && isUserAdmin(user) && (
            <NavLink to="/admin" className={activeLinkClass}>
              {t('nav.admin')}
            </NavLink>
          )}
        </nav>

        {/* Mobile dropdown menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-t ${
            isTransparent ? 'border-white/10 bg-black/50 backdrop-blur-md' : 'border-neutral-mid bg-white dark:bg-neutral-dark'
          } py-3 mt-2`}>
            <div className="container mx-auto px-4 flex flex-col space-y-3">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={mobileActiveLinkClass}
                  onClick={closeMenu}
                  end={link.to === '/'}
                >
                  {link.label}
                </NavLink>
              ))}
              {user && isUserAdmin(user) && (
                <NavLink to="/admin" className={mobileActiveLinkClass} onClick={closeMenu}>
                  {t('nav.admin')}
                </NavLink>
              )}
              <div className={`flex items-center gap-4 pt-2 border-t ${
                isTransparent ? 'border-white/10' : 'border-neutral-mid'
              }`}>
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className={`p-2 rounded-full transition ${
                    isTransparent ? 'text-white hover:bg-white/20' : 'text-text hover:bg-neutral-light'
                  }`}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <div className={`flex gap-1 rounded-full p-0.5 ${isTransparent ? '' : 'bg-neutral-light'}`}>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 text-sm rounded-full transition ${
                      language === 'en'
                        ? isTransparent ? 'bg-white text-primary' : 'bg-primary text-white'
                        : isTransparent ? 'text-white' : 'text-text'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => setLanguage('my')}
                    className={`px-2 py-1 text-sm rounded-full transition ${
                      language === 'my'
                        ? isTransparent ? 'bg-white text-primary' : 'bg-primary text-white'
                        : isTransparent ? 'text-white' : 'text-text'
                    }`}
                  >
                    မြန်
                  </button>
                </div>
              </div>
              {user ? (
                <div className="pt-2 space-y-2">
                  <Link to="/account" className={`flex items-center gap-3 py-2 transition ${
                    isTransparent ? 'text-white' : 'text-text'
                  }`} onClick={closeMenu}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                    <span>{displayName}</span>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full ${
                      isTransparent
                        ? 'border-white text-white hover:bg-white/20'
                        : 'border-primary text-primary hover:bg-primary/10'
                    }`}
                    onClick={() => { onLogoutClick(); closeMenu(); }}
                  >
                    {t('nav.logout')}
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => { onLoginClick(); closeMenu(); }}
                  className={`w-full text-center py-2 rounded-full font-medium transition ${
                    isTransparent
                      ? 'bg-white text-primary hover:bg-gray-100'
                      : 'bg-primary text-white hover:bg-primary-light'
                  }`}
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}