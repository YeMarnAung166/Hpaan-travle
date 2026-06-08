// src/components/AddToTripButton.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 🟢 IMPORTANT: This fixes the error
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import Button from './ui/Button';

export default function AddToTripButton({ itemType, itemId, itemName }) {
  const user = useUser();
  const [trips, setTrips] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && show) {
      supabase
        .from('trips')
        .select('id, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setTrips(data || []));
    }
  }, [user, show]);

  const addToTrip = async (tripId) => {
    setLoading(true);
    // Check if item already exists in the trip
    const { data: existing } = await supabase
      .from('trip_items')
      .select('id')
      .eq('trip_id', tripId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle();
      
    if (existing) {
      alert('Item already in this trip');
      setLoading(false);
      return;
    }
    
    // Get the current max order_index
    const { data: maxItem } = await supabase
      .from('trip_items')
      .select('order_index')
      .eq('trip_id', tripId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    const newOrder = maxItem ? maxItem.order_index + 1 : 0;

    const { error } = await supabase
      .from('trip_items')
      .insert({ 
        trip_id: tripId, 
        item_type: itemType, 
        item_id: itemId, 
        order_index: newOrder 
      });
      
    if (!error) {
      const tripTitle = trips.find(t => t.id === tripId)?.title;
      alert(`Added to "${tripTitle}"!`);
      setShow(false);
    } else {
      alert('Error adding to trip');
    }
    setLoading(false);
  };

  // Don't render anything if the user is not logged in
  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="btn btn-secondary mt-2 inline-flex items-center gap-1"
      >
        📌 Add to Trip
      </button>
      
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-3">
              Add "{itemName}" to trip
            </h3>
            
            {trips.length === 0 ? (
              <p className="text-text-soft">
                You have no trips yet. <Link to="/trips" className="text-primary">Create one</Link>
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {trips.map(trip => (
                  <button
                    key={trip.id}
                    onClick={() => addToTrip(trip.id)}
                    disabled={loading}
                    className="block w-full text-left px-3 py-2 border rounded hover:bg-gray-100"
                  >
                    {trip.title}
                  </button>
                ))}
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setShow(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}