import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import { ProfileProvider } from './context/ProfileContext';
import { useAuthSession } from './hooks/useAuthSession';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import GenerateItinerary from './pages/GenerateItinerary';

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

function App() {
  const { user, showAuthModal, setShowAuthModal, handleLogout } = useAuthSession();

  return (
    <ThemeProvider>
      <LanguageProvider>
        <UserProvider value={user}>
          <ProfileProvider>
            <BrowserRouter>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen">
                <Header
                  onLoginClick={() => setShowAuthModal(true)}
                  onLogoutClick={handleLogout}
                />
                <main className="flex-grow">
                    <Suspense fallback={<LoadingSpinner size="lg" />}>
                      <Routes>
                        {/* Public routes */}
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

                        {/* Trip Planner routes */}
                        <Route path="/trips" element={<TripsPage />} />
                        <Route path="/trip/:id" element={<TripDetailPage />} />
                        <Route path="/generate-itinerary" element={<GenerateItinerary />} />
                        {/* Admin routes */}
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
                        </Route>
                      </Routes>
                    </Suspense>
                </main>
                <Footer />
                <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
              </div>
            </BrowserRouter>
          </ProfileProvider>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;