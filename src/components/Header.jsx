import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useProfileContext } from '../context/ProfileContext';
import { isUserAdmin } from '../utils/adminCheck';
import Button from './ui/Button';

export default function Header({ onLoginClick, onLogoutClick }) {
  const user = useUser();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { profile, refresh } = useProfileContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Refresh profile when user changes
  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const navLinks = [
    { to: '/', label: t('nav.itineraries') },
    { to: '/map', label: t('nav.map') },
    { to: '/business', label: t('nav.directory') },
    { to: '/events', label: t('nav.events') },
    { to: '/tips', label: t('nav.tips') },
    { to: '/history', label: t('nav.history') },
  ];
  if (user) {
    navLinks.push({ to: '/favorites', label: t('nav.favorites') });
  }

  const activeLinkClass = ({ isActive }) =>
    isActive
      ? 'text-primary font-semibold border-b-2 border-primary'
      : 'text-text hover:text-primary transition';

  const mobileActiveLinkClass = ({ isActive }) =>
    isActive ? 'text-primary font-semibold' : 'text-text';

  const avatarUrl = profile?.avatar_url;
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="bg-white/80 dark:bg-neutral-dark/95 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-mid shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-serif font-bold text-primary" onClick={closeMenu}>
          {t('app.name')}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
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

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full bg-neutral-light dark:bg-neutral-mid text-text hover:bg-neutral-mid dark:hover:bg-neutral-dark transition"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className="flex gap-1 bg-neutral-light dark:bg-neutral-mid rounded-full p-0.5">
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
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 text-text hover:text-primary transition">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
                <span className="text-sm font-medium hidden lg:inline">{displayName}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={onLogoutClick}>
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={onLoginClick}>
              {t('nav.login')}
            </Button>
          )}
        </div>

        <button onClick={toggleMenu} className="md:hidden p-2 rounded-lg text-text hover:bg-neutral-light">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-dark border-t border-neutral-mid py-3 shadow-lg">
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
            <div className="flex items-center gap-4 pt-2 border-t border-neutral-mid">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 rounded-full bg-neutral-light dark:bg-neutral-mid text-text"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <div className="flex gap-1 bg-neutral-light dark:bg-neutral-mid rounded-full p-0.5">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 text-sm rounded-full transition ${
                    language === 'en' ? 'bg-primary text-white' : 'text-text'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('my')}
                  className={`px-2 py-1 text-sm rounded-full transition ${
                    language === 'my' ? 'bg-primary text-white' : 'text-text'
                  }`}
                >
                  မြန်
                </button>
              </div>
            </div>
            {user ? (
              <div className="pt-2 space-y-2">
                <Link to="/profile" className="flex items-center gap-3 py-2" onClick={closeMenu}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                  <span>{t('nav.profile')}</span>
                </Link>
                <Button variant="outline" size="sm" className="w-full" onClick={() => { onLogoutClick(); closeMenu(); }}>
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="sm" className="w-full" onClick={() => { onLoginClick(); closeMenu(); }}>
                {t('nav.login')}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}