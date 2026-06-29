import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonListItem } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import { Helmet } from 'react-helmet-async';

export default function AdminBookings() {
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, businesses:business_id(name, name_my)')
      .order('created_at', { ascending: false });
    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const handleStatus = async (id, status) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) setBookings(prev => prev.filter(b => b.id !== id));
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  if (loading) return <div className="container-custom pt-8"><SkeletonListItem count={5} /></div>;

  return (
    <div>
      <Helmet>
        <title>Manage Bookings | Hpa-An Travel</title>
        <meta name="description" content="Manage booking inquiries on Hpa-An Travel." />
        <meta property="og:title" content="Manage Bookings" />
        <meta property="og:description" content="Manage booking inquiries on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <h1 className="text-2xl font-serif font-bold mb-4">Booking Inquiries</h1>
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === f ? 'bg-primary text-white' : 'bg-neutral-mid text-text-soft hover:bg-neutral-mid/70'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-text-soft">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-text">{booking.name}</h3>
                  <p className="text-sm text-text-soft">{booking.email}{booking.phone ? ` · ${booking.phone}` : ''}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                  booking.status === 'rejected' ? 'bg-error/10 text-error' :
                  'bg-warning/10 text-warning'
                }`}>
                  {booking.status || 'pending'}
                </span>
              </div>
              <div className="text-sm text-text-soft space-y-1 mb-3">
                <p><strong>Business:</strong> {language === 'my' && booking.businesses?.name_my ? booking.businesses.name_my : booking.businesses?.name}</p>
                {booking.check_in && <p><strong>Date:</strong> {new Date(booking.check_in).toLocaleDateString()}</p>}
                {booking.message && <p><strong>Notes:</strong> {booking.message}</p>}
                <p className="text-xs"><strong>Submitted:</strong> {new Date(booking.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {booking.status !== 'confirmed' && (
                  <Button variant="primary" size="sm" onClick={() => handleStatus(booking.id, 'confirmed')}>Confirm</Button>
                )}
                {booking.status !== 'rejected' && (
                  <Button variant="outline" size="sm" onClick={() => handleStatus(booking.id, 'rejected')}>Cancel</Button>
                )}
                <Button variant="outline" size="sm" className="text-error border-error/30 hover:bg-error/10" onClick={() => handleDelete(booking.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
