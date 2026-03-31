import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import DataTable from '../../components/admin/DataTable';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('business_reviews')
      .select('*, businesses(name)')
      .order('created_at', { ascending: false });
    if (!error) setReviews(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm(t('admin.confirm_delete'))) {
      await supabase.from('business_reviews').delete().eq('id', id);
      fetchReviews();
    }
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'businesses',
      label: 'Business',
      render: (_, item) => item.businesses?.name || 'Unknown',
    },
    { key: 'user_email', label: 'User' },
    {
      key: 'rating',
      label: 'Rating',
      render: (value) => '★'.repeat(value) + '☆'.repeat(5 - value),
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '—'}
        </div>
      ),
    },
  ];

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <DataTable
      title={t('admin.reviews')}
      data={reviews}
      columns={columns}
      onAdd={() => alert('Reviews are created by users')}
      onEdit={() => alert('Reviews cannot be edited')}
      onDelete={handleDelete}
      addButtonLabel="+ Add (Not Available)"
      searchPlaceholder={t('common.search')}
    />
  );
}