import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, Search, Calendar, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/map', icon: Map, label: 'Map', exact: false },
  { to: '/destinations', icon: Search, label: 'Explore', exact: false },
  { to: '/events', icon: Calendar, label: 'Events', exact: false },
  { to: '/account', icon: User, label: 'Account', exact: false },
];

export default function BottomNav() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-dark backdrop-blur-xl border-t border-border dark:border-border safe-bottom-pb shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-[64px] px-2">
        {tabs.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && to !== '/';

          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition min-w-[56px] min-h-[44px] ${
                isActive
                  ? 'text-primary dark:text-primary-light'
                  : 'text-text-soft dark:text-text-soft/60 hover:text-text dark:hover:text-text'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute -top-0.5 w-6 h-0.5 rounded-full bg-primary dark:bg-primary-light" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'fill-primary/15 dark:fill-primary-light/15' : ''}`} />
              <span className={`text-[10px] font-medium leading-tight ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
