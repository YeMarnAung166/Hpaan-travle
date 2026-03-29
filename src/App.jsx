import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";
import AuthModal from "./components/AuthModal";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { UserProvider } from "./context/UserContext";
import ItineraryList from "./pages/ItineraryList";
import ItineraryDetail from "./pages/ItineraryDetail";
import MapPage from "./pages/MapPage";
import BusinessList from "./pages/BusinessList";
import BusinessDetail from "./pages/BusinessDetail";
import Favorites from "./pages/Favorites";
import AdminInquiries from "./pages/admin/AdminInquiries";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminItineraries from "./pages/admin/AdminItineraries";
import AdminBusinesses from "./pages/admin/AdminBusinesses";
import AdminReviews from "./pages/admin/AdminReviews";

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
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserProvider value={user}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header
            user={user}
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
              <Route path="/admin/inquiries" element={<AdminInquiries />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="itineraries" element={<AdminItineraries />} />
                <Route path="businesses" element={<AdminBusinesses />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="reviews" element={<AdminReviews />} />
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
    </UserProvider>
  );
}

export default App;
