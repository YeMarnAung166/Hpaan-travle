import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ user, onLoginClick, onLogoutClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = (
    <>
      <Link to="/" className="block px-4 py-2 hover:bg-green-600 rounded" onClick={closeMenu}>
        Itineraries
      </Link>
      <Link to="/map" className="block px-4 py-2 hover:bg-green-600 rounded" onClick={closeMenu}>
        Map
      </Link>
      <Link to="/business" className="block px-4 py-2 hover:bg-green-600 rounded" onClick={closeMenu}>
        Directory
      </Link>
      {user && (
        <Link to="/favorites" className="block px-4 py-2 hover:bg-green-600 rounded" onClick={closeMenu}>
          Favorites
        </Link>
      )}
    </>
  );

  return (
    <header className="bg-green-700 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl font-bold">Hpa-An Travel</Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Link to="/" className="hover:underline">Itineraries</Link>
          <Link to="/map" className="hover:underline">Map</Link>
          <Link to="/business" className="hover:underline">Directory</Link>
          {user && (
            <>
              <Link to="/favorites" className="hover:underline">Favorites</Link>
              <span className="text-sm">Hi, {user.email}</span>
              <button onClick={onLogoutClick} className="btn btn-danger btn-sm">
                Logout
              </button>
            </>
          )}
          {!user && (
            <button onClick={onLoginClick} className="btn bg-white text-green-700 hover:bg-gray-100">
              Login / Sign Up
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-700 border-t border-green-600 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            {navLinks}
            {user ? (
              <div className="pt-2 border-t border-green-600">
                <div className="px-4 py-2 text-sm">Hi, {user.email}</div>
                <button
                  onClick={() => { onLogoutClick(); closeMenu(); }}
                  className="block w-full text-left px-4 py-2 hover:bg-green-600 rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onLoginClick(); closeMenu(); }}
                className="block w-full text-left px-4 py-2 hover:bg-green-600 rounded"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}