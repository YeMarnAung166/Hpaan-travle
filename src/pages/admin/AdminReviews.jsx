import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('business');
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { toast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    if (tab === 'business') {
      const { data, error } = await supabase
        .from('business_reviews')
        .select('*, businesses(name)')
        .order('created_at', { ascending: false });
      if (!error) setReviews(data);
    } else {
      const { data, error } = await supabase
        .from('destination_reviews')
        .select('*, destinations(name)')
        .order('created_at', { ascending: false });
      if (!error) setReviews(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [tab]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === reviews.length) setSelected(new Set());
    else setSelected(new Set(reviews.map(r => r.id)));
  };

  const handleDelete = async (id) => {
    const table = tab === 'business' ? 'business_reviews' : 'destination_reviews';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      toast({ type: 'success', message: 'Review deleted' });
      fetchReviews();
    } else {
      toast({ type: 'error', message: 'Failed to delete' });
    }
    setConfirmDelete(null);
  };

  const handleBatchDelete = async () => {
    const ids = [...selected];
    const table = tab === 'business' ? 'business_reviews' : 'destination_reviews';
    const { error } = await supabase.from(table).delete().in('id', ids);
    if (!error) {
      toast({ type: 'success', message: `${ids.length} reviews deleted` });
      fetchReviews();
    } else {
      toast({ type: 'error', message: 'Failed to delete reviews' });
    }
    setSelected(new Set());
    setConfirmDelete(null);
  };

  return (
    <div>
      <Helmet>
        <title>Manage Reviews | Hpa-An Travel</title>
        <meta name="description" content="Manage user reviews on Hpa-An Travel." />
        <meta property="og:title" content="Manage Reviews" />
        <meta property="og:description" content="Manage user reviews on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setTab('business'); setSelected(new Set()); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'business' ? 'bg-primary text-white' : 'bg-overlay text-text hover:bg-border'}`}
        >
          Business Reviews
        </button>
        <button
          onClick={() => { setTab('destination'); setSelected(new Set()); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'destination' ? 'bg-primary text-white' : 'bg-overlay text-text hover:bg-border'}`}
        >
          Destination Reviews
        </button>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-error/5 border border-error/20 rounded-lg">
          <span className="text-sm font-medium text-text">{selected.size} selected</span>
          <button onClick={() => setConfirmDelete('batch')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm">
            Delete Selected
          </button>
          <button onClick={() => setSelected(new Set())} className="px-3 py-1 border border-border rounded text-sm hover:bg-overlay transition">
            Clear
          </button>
        </div>
      )}

      {loading ? <SkeletonTable rows={6} cols={5} /> : reviews.length === 0 ? (
        <p className="text-center py-12 text-text-soft">No reviews found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-neutral-dark rounded-xl border border-border">
            <thead className="bg-neutral-light dark:bg-neutral-dark/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.size === reviews.length && reviews.length > 0} onChange={toggleSelectAll} className="accent-primary" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">{tab === 'business' ? 'Business' : 'Destination'}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Comment</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((item) => (
                <tr key={item.id} className={`border-t border-border hover:bg-overlay/30 transition ${selected.has(item.id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="accent-primary" />
                  </td>
                  <td className="px-4 py-3 text-sm text-text">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-text">{item.businesses?.name || item.destinations?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-text">{item.user_email}</td>
                  <td className="px-4 py-3 text-sm text-gold">{'★'.repeat(item.rating) + '☆'.repeat(5 - item.rating)}</td>
                  <td className="px-4 py-3 text-sm text-text"><div className="max-w-xs truncate">{item.comment || '—'}</div></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setConfirmDelete(item.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={confirmDelete === 'batch' ? `Delete ${selected.size} reviews?` : 'Delete this review?'}
        message="This action cannot be undone."
        onConfirm={() => confirmDelete === 'batch' ? handleBatchDelete() : handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
