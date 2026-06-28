import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const navItems = [
    { path: "/admin", label: t("admin.dashboard") },
    { path: '/admin/destinations', label: t('admin.destinations') || 'Destinations' },
    { path: "/admin/businesses", label: t("admin.businesses") },
    { path: "/admin/events", label: t("admin.events") },
    { path: "/admin/reviews", label: t("admin.reviews") },
    { path: "/admin/user-photos", label: t("admin.user_photos") },
    { path: "/admin/pages", label: "Pages" },
    { path: "/admin/bookings", label: "Bookings" },
    { path: "/admin/blog", label: "Blog" },
  ];

  return (
    <div className="container-custom">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="page-title mb-0">{t("admin.title")}</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded-lg text-text-soft hover:text-text hover:bg-overlay transition"
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <aside className={`md:w-64 md:block ${sidebarOpen ? 'block' : 'hidden'}`}>
          <nav className="bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-border p-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`block px-4 py-2.5 rounded-lg transition text-sm ${location.pathname === item.path ? "bg-primary text-white font-medium" : "text-text hover:bg-overlay"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 bg-white dark:bg-neutral-dark rounded-xl shadow-sm border border-border p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
