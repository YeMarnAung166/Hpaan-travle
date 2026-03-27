import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ItineraryCard from '../components/ItineraryCard';

export default function ItineraryList() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItineraries = async () => {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*');
      if (error) console.error(error);
      else setItineraries(data);
      setLoading(false);
    };
    fetchItineraries();
  }, []);

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="page-title">Travel Itineraries</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {itineraries.map(itinerary => (
          <ItineraryCard key={itinerary.id} itinerary={itinerary} />
        ))}
      </div>
    </div>
  );
}