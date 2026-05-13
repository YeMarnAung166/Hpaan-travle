import { Link, Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminLayout() {
  const location = useLocation();
  const { t } = useLanguage();
  const navItems = [
    { path: '/admin', label: t('admin.dashboard') },
    { path: '/admin/itineraries', label: t('admin.itineraries') },
    { path: '/admin/businesses', label: t('admin.businesses') },
    { path: '/admin/reviews', label: t('admin.reviews') },
    { path: '/admin/events', label: t('admin.events') || 'Events' },
  ];
  return (
    <div className="container-custom">
      <h1 className="page-title">{t('admin.title')}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-64 bg-white rounded-xl shadow p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-lg transition ${location.pathname === item.path ? 'bg-primary text-white' : 'text-text hover:bg-neutral-light'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 bg-white rounded-xl shadow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}