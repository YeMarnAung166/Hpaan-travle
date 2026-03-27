import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function ItineraryDetail() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setItinerary(data);
      setLoading(false);
    };
    fetchItinerary();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  if (!itinerary) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Itinerary not found</h2>
        <Link to="/" className="text-green-600 underline">Back to itineraries</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/" className="text-green-600 hover:underline mb-4 inline-block">← Back to itineraries</Link>
      <img src={itinerary.image} alt={itinerary.title} className="w-full h-64 object-cover rounded-lg mb-6" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{itinerary.title}</h1>
      <p className="text-gray-600 mb-6">{itinerary.duration}</p>
      <div className="bg-gray-50 p-6 rounded-lg">
        {itinerary.days && itinerary.days.map(day => (
          <div key={day.day} className="mb-6">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Day {day.day}</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {day.activities.map((activity, idx) => (
                <li key={idx}>{activity}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}