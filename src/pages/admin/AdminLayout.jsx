import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useUser } from "../../context/UserContext";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MapPin, Store, Calendar, Star, Camera,
  FileText, CalendarCheck, FileEdit, LogOut, Menu, X, PanelLeftClose, PanelLeft, ExternalLink,
} from "lucide-react";

const NAV_ICONS = {
  "/admin": LayoutDashboard,
  "/admin/destinations": MapPin,
  "/admin/businesses": Store,
  "/admin/events": Calendar,
  "/admin/reviews": Star,
  "/admin/user-photos": Camera,
  "/admin/pages": FileText,
  "/admin/bookings": CalendarCheck,
  "/admin/blog": FileEdit,
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();
  const { user, handleLogout } = useUser();

  const navItems = [
    { path: "/admin", label: t("admin.dashboard") },
    { path: "/admin/destinations", label: t("admin.destinations") },
    { path: "/admin/businesses", label: t("admin.businesses") },
    { path: "/admin/events", label: t("admin.events") },
    { path: "/admin/reviews", label: t("admin.reviews") },
    { path: "/admin/user-photos", label: t("admin.user_photos") },
    { path: "/admin/pages", label: "Pages" },
    { path: "/admin/bookings", label: t("admin.bookings") },
    { path: "/admin/blog", label: "Blog" },
  ];

  return (
    <div className="h-screen overflow-hidden bg-neutral-light/50 dark:bg-neutral-mid/10">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <div className="flex h-full">
        {/* Sidebar - always visible on desktop */}
        <aside
          className={`
            flex-shrink-0 h-full bg-white dark:bg-neutral-dark border-r border-border
            flex flex-col
            transition-all duration-300 ease-in-out
            fixed md:relative z-50
            top-0 left-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            ${collapsed ? "w-[72px]" : "w-64"}
          `}
        >
          {/* Header */}
          <div className="flex items-center h-14 px-4 border-b border-border shrink-0">
            <div className="flex-1 flex items-center">
              <span
                className={`text-sm font-semibold text-text tracking-wide uppercase whitespace-nowrap ${
                  collapsed ? "md:hidden" : ""
                }`}
              >
                Pages
              </span>
              {collapsed && (
                <span className="hidden md:flex text-sm font-semibold text-text tracking-wide uppercase mx-auto">
                  P
                </span>
              )}
            </div>
            <button
              onClick={() => { setSidebarOpen(false); setCollapsed(false); }}
              className="md:hidden p-1.5 rounded-lg text-text-soft hover:text-text hover:bg-overlay transition"
            >
              <X size={18} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-text-soft hover:text-text hover:bg-overlay transition"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </div>

          {/* User info */}
          {user && (
            <div
              className={`flex items-center gap-3 px-3 py-2.5 mx-2 mt-3 mb-2 border-b border-border ${
                collapsed ? "md:justify-center" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white text-xs font-bold flex items-center justify-center shrink-0">
                {(user.email || "A")[0].toUpperCase()}
              </div>
              <div
                className={`overflow-hidden whitespace-nowrap ${
                  collapsed ? "md:hidden" : ""
                }`}
              >
                <p className="text-xs font-medium text-text truncate max-w-[140px] leading-tight">
                  {user.email}
                </p>
                <p className="text-[10px] text-text-soft leading-tight">
                  {t("admin.title")}
                </p>
              </div>
            </div>
          )}

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 scrollbar-thin">
            {navItems.map((item) => {
              const Icon = NAV_ICONS[item.path] || LayoutDashboard;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group ${
                    collapsed ? "md:justify-center" : ""
                  } ${
                    isActive
                      ? "text-primary bg-primary/8 font-medium"
                      : "text-text hover:bg-overlay"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <Motion.span
                      layoutId="activeTab"
                      className="absolute left-0 inset-y-2 w-0.5 bg-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="shrink-0"
                  />
                  <span
                    className={`text-sm whitespace-nowrap ${
                      collapsed ? "md:hidden" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Visit Site */}
          <div className={`px-2 py-2 border-t border-border ${collapsed ? "md:flex md:justify-center" : ""}`}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-soft hover:text-primary hover:bg-primary/5 transition w-full ${collapsed ? "md:justify-center" : ""}`}
              title={collapsed ? "Visit Site" : undefined}
            >
              <ExternalLink size={18} className="shrink-0" />
              <span className={collapsed ? "md:hidden" : ""}>Visit Site</span>
            </a>
          </div>

          {/* Logout */}
          <div
            className={`px-2 py-3 border-t border-border ${
              collapsed ? "md:flex md:justify-center" : ""
            }`}
          >
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-soft hover:text-error hover:bg-error/5 transition w-full ${
                collapsed ? "md:justify-center" : ""
              }`}
              title={collapsed ? t("admin.logout") : undefined}
            >
              <LogOut size={18} className="shrink-0" />
              <span className={collapsed ? "md:hidden" : ""}>
                {t("admin.logout")}
              </span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 h-full overflow-y-auto">
          {/* Mobile top bar */}
          <div className="md:hidden sticky top-0 z-30 h-12 bg-white/80 dark:bg-neutral-dark/80 backdrop-blur-md border-b border-border flex items-center px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-text-soft hover:text-text hover:bg-overlay transition"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <span className="ml-auto text-sm font-semibold text-text">Admin</span>
          </div>

          <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
