import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ItineraryList from './pages/ItineraryList';
import ItineraryDetail from './pages/ItineraryDetail';
import MapPage from './pages/MapPage';
import BusinessList from './pages/BusinessList';
import BusinessDetail from './pages/BusinessDetail';
import Header from './components/Header';

function App() {
  return (
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path="/" element={<ItineraryList />} />
        <Route path="/itinerary/:id" element={<ItineraryDetail />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/business" element={<BusinessList />} />
        <Route path="/business/:id" element={<BusinessDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;