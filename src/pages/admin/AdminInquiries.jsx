import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    const { data, error } = await supabase
      .from('booking_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setInquiries(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('booking_inquiries')
      .update({ status })
      .eq('id', id);
    if (error) {
      alert(error.message);
    } else {
      fetchInquiries();
    }
  };

  const handleDelete = async (id) => {
    if (confirm(t('admin.confirm_delete'))) {
      const { error } = await supabase
        .from('booking_inquiries')
        .delete()
        .eq('id', id);
      if (error) {
        alert(error.message);
      } else {
        fetchInquiries();
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="spinner mx-auto"></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('admin.inquiries')}</h2>
        <div className="text-sm text-gray-500">
          Total: {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Business</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Travel Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Message</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No booking inquiries yet.
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm whitespace-nowrap">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm">{inquiry.business_name}</td>
                  <td className="px-4 py-2 text-sm">
                    <div className="font-medium">{inquiry.user_name}</div>
                    <div className="text-xs text-gray-500">{inquiry.user_email}</div>
                  </td>
                  <td className="px-4 py-2 text-sm">{inquiry.travel_date || '—'}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm max-w-xs truncate" title={inquiry.message}>
                    {inquiry.message || '—'}
                  </td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap">
                    {inquiry.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(inquiry.id, 'confirmed')}
                        className="text-green-600 hover:underline mr-3"
                      >
                        Confirm
                      </button>
                    )}
                    {inquiry.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(inquiry.id, 'cancelled')}
                        className="text-orange-600 hover:underline mr-3"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inquiry.id)}
                      className="text-red-600 hover:underline"
                    >
                      {t('admin.delete')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}