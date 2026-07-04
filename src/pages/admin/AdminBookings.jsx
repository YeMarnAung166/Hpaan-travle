import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonTable } from '../../components/ui/Skeleton';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import Button from '../../components/ui/Button';
import { ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const STATUS_COLORS = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-error/10 text-error border-error/20',
};

export default function AdminBookings() {
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, businesses:business_id(name, name_my)')
        .order('created_at', { ascending: false });
      if (!cancelled) {
        if (!error) setBookings(data || []);
        setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleStatus = async (id, status) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('bookings').delete().eq('id', deleteTarget);
    setDeleteTarget(null);
    setBookings(prev => prev.filter(b => b.id !== deleteTarget));
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (val) => <span className="font-medium">{val}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'business_id',
      label: 'Business',
      render: (_, item) => {
        const name = language === 'my' && item.businesses?.name_my ? item.businesses.name_my : item.businesses?.name;
        return name || '—';
      },
    },
    {
      key: 'check_in',
      label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[val] || STATUS_COLORS.pending}`}>
          {val || 'pending'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (val) => val ? new Date(val).toLocaleDateString() : '—',
    },
  ];

  const filterTabs = (
    <div className="flex gap-1.5 mb-4 p-1 bg-neutral-light dark:bg-neutral-mid/20 rounded-xl border border-border w-fit">
      {['all', 'pending', 'confirmed', 'rejected'].map(f => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            filter === f
              ? 'bg-primary text-white shadow-soft'
              : 'text-text-soft hover:text-text hover:bg-white/50 dark:hover:bg-neutral-mid/30'
          }`}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );

  if (loading) return <div><SkeletonTable rows={5} /></div>;

  return (
    <div>
      <Helmet>
        <title>Manage Bookings | Hpa-An Travel</title>
        <meta name="description" content="Manage booking inquiries on Hpa-An Travel." />
        <meta property="og:title" content="Manage Bookings" />
        <meta property="og:description" content="Manage booking inquiries on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>

      {filterTabs}

      <DataTable
        title="Booking Inquiries"
        data={filtered}
        columns={columns}
        onDelete={handleDelete}
        searchable={true}
        searchPlaceholder="Search bookings..."
        exportable={true}
        selectable={true}
        onBulkDelete={(ids) => {
          ids.forEach(id => handleDelete(id));
        }}
        renderActions={(item) => (
          <div className="flex gap-1">
            {item.business_id && (
              <a
                href={`${window.location.origin}/business/${item.business_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg text-text-soft hover:text-primary hover:bg-primary/5 transition"
              >
                <ExternalLink size={14} />
                View
              </a>
            )}
            {item.status !== 'confirmed' && (
              <Button variant="success" size="sm" onClick={() => handleStatus(item.id, 'confirmed')}>Confirm</Button>
            )}
            {item.status !== 'rejected' && (
              <Button variant="danger" size="sm" onClick={() => handleStatus(item.id, 'rejected')}>Cancel</Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-error hover:text-error">{t('admin.delete')}</Button>
          </div>
        )}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        message={t('admin.confirm_delete')}
      />
    </div>
  );
}
