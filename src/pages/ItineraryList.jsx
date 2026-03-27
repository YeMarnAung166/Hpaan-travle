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

  if (loading) return <div className="text-center py-8">Loading itineraries...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Travel Itineraries</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {itineraries.map(itinerary => (
          <ItineraryCard key={itinerary.id} itinerary={itinerary} />
        ))}
      </div>
    </div>
  );
}