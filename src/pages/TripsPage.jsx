import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { SkeletonListItem } from '../components/ui/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import { Helmet } from 'react-helmet-async';

export default function TripsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [trips, setTrips] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTrips = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setTrips(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

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
    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (!error) {
      setTrips(trips.filter(t => t.id !== id));
      toast({ type: 'success', message: 'Trip deleted' });
    } else {
      toast({ type: 'error', message: 'Failed to delete trip' });
    }
    setDeleteId(null);
  };

  if (!user) {
    return (
      <div className="container-custom text-center">
        <p>{t('auth.login_required') || 'Please log in to view your trips.'}</p>
      </div>
    );
  }

  if (loading) return <div className="container-custom"><h1 className="page-title">{t('nav.trips')}</h1><SkeletonListItem count={5} /></div>;

  return (
    <div className="container-custom max-w-4xl">
      <Helmet>
        <title>My Trips | Hpa-An Travel</title>
        <meta name="description" content="Your custom itineraries and trip plans for Hpa-An." />
        <meta property="og:title" content="My Trips" />
        <meta property="og:description" content="Your custom itineraries and trip plans for Hpa-An." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h1 className="page-title text-2xl sm:text-3xl">{t('trips.title')}</h1>
        <div className="flex gap-2">
          <Link to="/generate-itinerary">
            <Button variant="outline" size="sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {t('trips.generate_itinerary') || 'Generate Itinerary'}
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={t('trips.placeholder')}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <Button onClick={createTrip} disabled={creating || !newTitle.trim()} className="w-full sm:w-auto">
            + {t('trips.new_trip')}
          </Button>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-text-soft/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-text-soft text-lg mb-2">{t('trips.empty')}</p>
          <p className="text-text-soft/60 text-sm mb-6">Create your first trip to start planning your Hpa-An adventure.</p>
          <Link to="/generate-itinerary" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition text-sm font-medium">
            Generate Itinerary
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
              <Link to={`/trip/${trip.id}`} className="flex-1">
                <h3 className="text-lg font-semibold text-text break-words">{trip.title}</h3>
                {trip.description && <p className="text-text-soft text-sm line-clamp-1">{trip.description}</p>}
                <p className="text-xs text-text-soft mt-1">{new Date(trip.created_at).toLocaleDateString()}</p>
              </Link>
              <button onClick={() => setDeleteId(trip.id)} className="text-red-500 hover:text-red-700 p-2 ml-2 flex-shrink-0" aria-label="Delete trip">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title={t('trips.delete_confirm')}
        message=""
        onConfirm={() => deleteTrip(deleteId)}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}