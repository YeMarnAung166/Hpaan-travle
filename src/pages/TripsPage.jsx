import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function TripsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setTrips(data);
    setLoading(false);
  };

  const createTrip = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from('trips')
      .insert({ user_id: user.id, title: newTitle })
      .select()
      .single();
    if (!error && data) {
      setTrips([data, ...trips]);
      setNewTitle('');
      navigate(`/trip/${data.id}`);
    }
    setCreating(false);
  };

  const deleteTrip = async (id) => {
    if (!confirm('Delete this trip?')) return;
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (!error) setTrips(trips.filter(t => t.id !== id));
  };

  if (!user) {
    return <div className="container-custom text-center"><p>Please log in to view your trips.</p></div>;
  }

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="container-custom max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">My Trip Plans</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Trip name (e.g., 'Weekend Adventure')"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <Button onClick={createTrip} disabled={creating || !newTitle.trim()}>
            + New Trip
          </Button>
        </div>
      </div>

      {trips.length === 0 ? (
        <p className="text-text-soft text-center">You haven't created any trips yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
              <Link to={`/trip/${trip.id}`} className="flex-1">
                <h3 className="text-lg font-semibold text-text">{trip.title}</h3>
                {trip.description && <p className="text-text-soft text-sm line-clamp-1">{trip.description}</p>}
                <p className="text-xs text-text-soft mt-1">{new Date(trip.created_at).toLocaleDateString()}</p>
              </Link>
              <button onClick={() => deleteTrip(trip.id)} className="text-red-500 hover:text-red-700 p-2">
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}