import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';

export default function AddToTripButton({ itemType, itemId, itemName }) {
  const user = useUser();
  const { t } = useLanguage();
  const { toast } = useToast();
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
    const { data: existing } = await supabase
      .from('trip_items')
      .select('id')
      .eq('trip_id', tripId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .maybeSingle();
    if (existing) {
      toast({ type: 'warning', message: t('trips.already_in_trip') });
      setLoading(false);
      return;
    }
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
      .insert({ trip_id: tripId, item_type: itemType, item_id: itemId, order_index: newOrder });
    if (!error) {
      const tripTitle = trips.find(t => t.id === tripId)?.title;
      toast({ type: 'success', message: t('trips.added_to_trip', { title: tripTitle }) });
      setShow(false);
    } else {
      toast({ type: 'error', message: t('trips.error_adding') });
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="btn btn-secondary mt-2 inline-flex items-center gap-1"
      >
        📌 {t('trips.add_place')}
      </button>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-3">{t('trips.add_modal_title')}</h3>
            {trips.length === 0 ? (
              <p className="text-text-soft">
                {t('trips.empty')} <Link to="/trips" className="text-primary">{t('trips.new_trip')}</Link>
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
              <Button variant="outline" onClick={() => setShow(false)}>{t('trips.cancel')}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}