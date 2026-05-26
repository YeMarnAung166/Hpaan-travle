import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { UserProvider } from "./context/UserContext";
import { ProfileProvider } from "./context/ProfileContext";
import AuthModal from "./components/AuthModal";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import DestinationList from "./pages/DestinationList";
import DestinationDetail from "./pages/DestinationDetail";
import MapPage from "./pages/MapPage";
import BusinessList from "./pages/BusinessList";
import BusinessDetail from "./pages/BusinessDetail";
import Favorites from "./pages/Favorites";
import EventsPage from "./pages/EventsPage";
import TravelTipsPage from "./pages/TravelTipsPage";
import HistoryPage from "./pages/HistoryPage";
import UserPhotosPage from "./pages/UserPhotosPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDestinations from "./pages/admin/AdminDestinations";
import AdminBusinesses from "./pages/admin/AdminBusinesses";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminUserPhotos from "./pages/admin/AdminUserPhotos";
import UserReviewsPage from "./pages/UserReviewsPage";
import MyAccountPage from "./pages/MyAccountPage";

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );
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
                    <Route path="/" element={<DestinationList />} />
                    <Route
                      path="/destination/:id"
                      element={<DestinationDetail />}
                    />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/business" element={<BusinessList />} />
                    <Route path="/business/:id" element={<BusinessDetail />} />
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/tips" element={<TravelTipsPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/user-reviews" element={<UserReviewsPage />} />
                    <Route path="/account" element={<MyAccountPage />} />
                    <Route
                      path="/profile"
                      element={<Navigate to="/account" replace />}
                    />
                    <Route
                      path="/dashboard"
                      element={<Navigate to="/account" replace />}
                    />
                    <Route
                      path="/user-photos/:userId"
                      element={<UserPhotosPage />}
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <AdminLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route
                        path="destinations"
                        element={<AdminDestinations />}
                      />
                      <Route path="businesses" element={<AdminBusinesses />} />
                      <Route path="events" element={<AdminEvents />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="user-photos" element={<AdminUserPhotos />} />
                    </Route>
                  </Routes>
                </main>
                <Footer />
                <AuthModal
                  isOpen={showAuthModal}
                  onClose={() => setShowAuthModal(false)}
                />
              </div>
            </BrowserRouter>
          </ProfileProvider>
        </UserProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
