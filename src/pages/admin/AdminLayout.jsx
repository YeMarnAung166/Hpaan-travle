import { Link, Outlet, useLocation } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/itineraries', label: 'Itineraries' },
    { path: '/admin/businesses', label: 'Businesses' },
    { path: '/admin/inquiries', label: 'Inquiries' },
    { path: '/admin/reviews', label: 'Reviews' },
  ];
  
  return (
    <div className="container-custom">
      <h1 className="page-title">Admin Panel</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - stays visible */}
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
        
        {/* Main content - changes based on route */}
        <main className="flex-1 bg-white rounded-lg shadow p-6">
          <Outlet />  {/* This is crucial - it renders the child routes */}
        </main>
      </div>
    </div>
  );
}