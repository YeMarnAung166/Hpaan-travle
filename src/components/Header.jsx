import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { isUserAdmin } from "../utils/adminCheck";
import Button from "./ui/Button";
import Logo from "./Logo";

export default function Header({ onLoginClick, onLogoutClick }) {
  const user = useUser();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { to: "/", label: t("nav.itineraries") },
    { to: "/map", label: t("nav.map") },
    { to: "/business", label: t("nav.directory") },
    { to: '/events', label: t('nav.events') },
    { to: "/history", label: t("nav.history") },
  ];
  if (user) {
    navLinks.push({ to: "/favorites", label: t("nav.favorites") });
  }

  // Helper for active link styling
  const activeLinkClass = ({ isActive }) =>
    isActive
      ? "text-primary font-semibold border-b-2 border-primary"
      : "text-text hover:text-primary transition";

  const mobileActiveLinkClass = ({ isActive }) =>
    isActive ? "text-primary font-semibold" : "text-text";

  return (
    <header className="bg-white/80 dark:bg-neutral-dark/95 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-mid shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {
          // Inside the header, replace the <Link> text:
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <Logo className="h-10 w-auto" />
          </Link>
        }

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={activeLinkClass} end>
              {link.label}
            </NavLink>
          ))}
          {user && isUserAdmin(user) && (
            <NavLink to="/admin" className={activeLinkClass}>
              {t("nav.admin")}
            </NavLink>
          )}
        </nav>

        {/* Right side controls (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-full bg-neutral-light dark:bg-neutral-mid text-text hover:bg-neutral-mid dark:hover:bg-neutral-dark transition"
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {/* Language toggle */}
          <div className="flex gap-1 bg-neutral-light dark:bg-neutral-mid rounded-full p-0.5">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 text-sm rounded-full transition ${
                language === "en"
                  ? "bg-primary text-white"
                  : "text-text hover:bg-neutral-mid"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("my")}
              className={`px-2 py-1 text-sm rounded-full transition ${
                language === "my"
                  ? "bg-primary text-white"
                  : "text-text hover:bg-neutral-mid"
              }`}
            >
              မြန်
            </button>
          </div>

          {/* User auth */}
          {user ? (
            <Button variant="outline" size="sm" onClick={onLogoutClick}>
              {t("nav.logout")}
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={onLoginClick}>
              {t("nav.login")}
            </Button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg text-text hover:bg-neutral-light"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-dark border-t border-neutral-mid py-3 shadow-lg">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={mobileActiveLinkClass}
                onClick={closeMenu}
                end
              >
                {link.label}
              </NavLink>
            ))}
            {user && isUserAdmin(user) && (
              <NavLink
                to="/admin"
                className={mobileActiveLinkClass}
                onClick={closeMenu}
              >
                {t("nav.admin")}
              </NavLink>
            )}
            <div className="flex items-center gap-4 pt-2 border-t border-neutral-mid">
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2 rounded-full bg-neutral-light dark:bg-neutral-mid text-text"
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>
              <div className="flex gap-1 bg-neutral-light dark:bg-neutral-mid rounded-full p-0.5">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-1 text-sm rounded-full transition ${
                    language === "en" ? "bg-primary text-white" : "text-text"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("my")}
                  className={`px-2 py-1 text-sm rounded-full transition ${
                    language === "my" ? "bg-primary text-white" : "text-text"
                  }`}
                >
                  မြန်
                </button>
              </div>
            </div>
            {user ? (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    onLogoutClick();
                    closeMenu();
                  }}
                >
                  {t("nav.logout")}
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  onLoginClick();
                  closeMenu();
                }}
              >
                {t("nav.login")}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
