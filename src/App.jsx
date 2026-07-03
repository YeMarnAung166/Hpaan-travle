import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import { ProfileProvider } from './context/ProfileContext';
import { ToastProvider } from './context/ToastContext';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthSession } from './hooks/useAuthSession';
import useSwipeBack from './hooks/useSwipeBack';
import { pageTransition } from './utils/animations';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import GenerateItinerary from './pages/GenerateItinerary';
import OfflineIndicator from './components/OfflineIndicator';
import InstallBanner from './components/InstallBanner';
import UpdateToast from './components/UpdateToast';
import BottomNav from './components/BottomNav';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const DestinationList = lazy(() => import('./pages/DestinationList'));
const DestinationDetail = lazy(() => import('./pages/DestinationDetail'));
const MapPage = lazy(() => import('./pages/MapPage'));
const BusinessList = lazy(() => import('./pages/BusinessList'));
const BusinessDetail = lazy(() => import('./pages/BusinessDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const TravelTipsPage = lazy(() => import('./pages/TravelTipsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const UserPhotosPage = lazy(() => import('./pages/UserPhotosPage'));
const UserReviewsPage = lazy(() => import('./pages/UserReviewsPage'));
const MyAccountPage = lazy(() => import('./pages/MyAccountPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const TripDetailPage = lazy(() => import('./pages/TripDetailPage'));

// Admin pages (lazy)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDestinations = lazy(() => import('./pages/admin/AdminDestinations'));
const AdminBusinesses = lazy(() => import('./pages/admin/AdminBusinesses'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminUserPhotos = lazy(() => import('./pages/admin/AdminUserPhotos'));
const AdminContentPages = lazy(() => import('./pages/admin/AdminContentPages'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));

// 404 page
const NotFound = lazy(() => import('./pages/NotFound'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogPost = lazy(() => import('./pages/BlogPost'));

const AppContent = React.memo(function AppContent({ showAuthModal, setShowAuthModal, handleLogout }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  useSwipeBack(() => {
    if (window.history.length > 1) window.history.back();
  }, !isAdmin && !showAuthModal);

  return (
    <>
      <ScrollToTop />
      <OfflineIndicator />
      <InstallBanner />
      <UpdateToast />
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <div className="flex flex-col min-h-screen">
        {!isAdmin && (
          <Header
            onLoginClick={() => setShowAuthModal(true)}
            onLogoutClick={handleLogout}
          />
        )}
        <main id="main-content" className="flex-grow min-h-[calc(100vh-var(--header-h,96px))] pb-[72px] md:pb-0">
          <AnimatePresence mode="wait">
            <Motion.div key={isAdmin ? "/admin" : location.pathname} {...pageTransition}>
              <Suspense fallback={<LoadingSpinner size="lg" />}>
                <Routes location={location}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/destinations" element={<DestinationList />} />
                  <Route path="/destination/:id" element={<DestinationDetail />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/business" element={<BusinessList />} />
                  <Route path="/business/:id" element={<BusinessDetail />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/tips" element={<TravelTipsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/user-reviews" element={<UserReviewsPage />} />
                  <Route path="/account" element={<MyAccountPage />} />
                  <Route path="/profile" element={<Navigate to="/account" replace />} />
                  <Route path="/dashboard" element={<Navigate to="/account" replace />} />
                  <Route path="/user-photos/:userId" element={<UserPhotosPage />} />
                  <Route path="/trips" element={<TripsPage />} />
                  <Route path="/trip/:id" element={<TripDetailPage />} />
                  <Route path="/generate-itinerary" element={<GenerateItinerary />} />
                  <Route path="/blog" element={<BlogList />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="destinations" element={<AdminDestinations />} />
                    <Route path="businesses" element={<AdminBusinesses />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="user-photos" element={<AdminUserPhotos />} />
                    <Route path="pages" element={<AdminContentPages />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="blog" element={<AdminBlog />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Motion.div>
          </AnimatePresence>
        </main>
        {!isAdmin && <Footer />}
        {!isAdmin && <BottomNav />}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    </>
  );
});

function App() {
  const { user, showAuthModal, setShowAuthModal, handleLogout } = useAuthSession();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider value={user}>
          <ProfileProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <HelmetProvider>
                <ToastProvider>
                  <AppContent
                    showAuthModal={showAuthModal}
                    setShowAuthModal={setShowAuthModal}
                    handleLogout={handleLogout}
                  />
                </ToastProvider>
                </HelmetProvider>
              </ErrorBoundary>
            </BrowserRouter>
          </ProfileProvider>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;