import { Link, Outlet, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminLayout() {
  const location = useLocation();
  const { t } = useLanguage();
  
  const navItems = [
    { path: '/admin', label: t('admin.dashboard') },
    { path: '/admin/itineraries', label: t('admin.itineraries') },
    { path: '/admin/businesses', label: t('admin.businesses') },
    { path: '/admin/inquiries', label: t('admin.inquiries') },
    { path: '/admin/reviews', label: t('admin.reviews') },
  ];
  
  return (
    <div className="container-custom">
      <h1 className="page-title">{t('admin.title')}</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="md:w-64 bg-white rounded-lg shadow p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded transition-colors ${
                  location.pathname === item.path
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 bg-white rounded-lg shadow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}