import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { UserProvider } from './context/UserContext';
import { ProfileProvider } from './context/ProfileContext';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ItineraryList from './pages/ItineraryList';
import ItineraryDetail from './pages/ItineraryDetail';
import MapPage from './pages/MapPage';
import BusinessList from './pages/BusinessList';
import BusinessDetail from './pages/BusinessDetail';
import Favorites from './pages/Favorites';
import EventsPage from './pages/EventsPage';
import TravelTipsPage from './pages/TravelTipsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import UserPhotosPage from './pages/UserPhotosPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminItineraries from './pages/admin/AdminItineraries';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminEvents from './pages/admin/AdminEvents';
import AdminReviews from './pages/admin/AdminReviews';
import AdminUserPhotos from './pages/admin/AdminUserPhotos';

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

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
                  <Routes>
                    <Route path="/" element={<ItineraryList />} />
                    <Route path="/itinerary/:id" element={<ItineraryDetail />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/business" element={<BusinessList />} />
                    <Route path="/business/:id" element={<BusinessDetail />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/tips" element={<TravelTipsPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/user-photos/:userId" element={<UserPhotosPage />} />
                    <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="itineraries" element={<AdminItineraries />} />
                      <Route path="businesses" element={<AdminBusinesses />} />
                      <Route path="events" element={<AdminEvents />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="user-photos" element={<AdminUserPhotos />} />
                    </Route>
                  </Routes>
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