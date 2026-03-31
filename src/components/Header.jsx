import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isUserAdmin } from '../utils/adminCheck';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ user, onLoginClick, onLogoutClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = (
    <>
      <Link
        to="/"
        className="block px-4 py-2 hover:bg-green-600 rounded"
        onClick={closeMenu}
      >
        {t('nav.itineraries')}
      </Link>
      <Link
        to="/map"
        className="block px-4 py-2 hover:bg-green-600 rounded"
        onClick={closeMenu}
      >
        {t('nav.map')}
      </Link>
      <Link
        to="/business"
        className="block px-4 py-2 hover:bg-green-600 rounded"
        onClick={closeMenu}
      >
        {t('nav.directory')}
      </Link>
      {user && (
        <Link
          to="/favorites"
          className="block px-4 py-2 hover:bg-green-600 rounded"
          onClick={closeMenu}
        >
          {t('nav.favorites')}
        </Link>
      )}
    </>
  );

  return (
    <header className="bg-green-700 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl font-bold">
          {t('app.name')}
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="hover:underline">{t('nav.itineraries')}</Link>
          <Link to="/map" className="hover:underline">{t('nav.map')}</Link>
          <Link to="/business" className="hover:underline">{t('nav.directory')}</Link>
          {user && (
            <>
              <Link to="/favorites" className="hover:underline">{t('nav.favorites')}</Link>
              {isUserAdmin(user) && (
                <Link to="/admin" className="hover:underline">{t('nav.admin')}</Link>
              )}
              <span className="text-sm">{t('nav.hi')}, {user.email}</span>
              <button onClick={onLogoutClick} className="btn btn-danger btn-sm">
                {t('nav.logout')}
              </button>
            </>
          )}
          {!user && (
            <button onClick={onLoginClick} className="btn bg-white text-green-700 hover:bg-gray-100">
              {t('nav.login')}
            </button>
          )}
          <LanguageSwitcher />
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button onClick={toggleMenu} className="focus:outline-none" aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-700 border-t border-green-600 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            {navLinks}
            {user ? (
              <div className="pt-2 border-t border-green-600">
                <div className="px-4 py-2 text-sm">{t('nav.hi')}, {user.email}</div>
                {isUserAdmin(user) && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 hover:bg-green-600 rounded"
                    onClick={closeMenu}
                  >
                    {t('nav.admin')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    onLogoutClick();
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-green-600 rounded"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  closeMenu();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-green-600 rounded"
              >
                {t('nav.login')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}