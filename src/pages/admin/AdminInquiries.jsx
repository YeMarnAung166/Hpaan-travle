import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const { data, error } = await supabase
          .from('booking_inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setInquiries(data || []);
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInquiries();
  }, []);

  if (loading) return <div className="spinner mx-auto"></div>;
  
  if (error) return (
    <div className="text-center py-8 text-red-600">
      Error loading inquiries: {error}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Booking Inquiries</h2>
        <div className="text-sm text-gray-500">
          Total: {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'}
        </div>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No booking inquiries yet.
        </div>
      ) : (
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
              {inquiries.map((inquiry) => (
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
                    <span className={`px-2 py-1 rounded text-xs ${
                      inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      inquiry.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      inquiry.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm max-w-xs truncate" title={inquiry.message}>
                    {inquiry.message || '—'}
                  </td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap">
                    {inquiry.status === 'pending' && (
                      <button
                        onClick={async () => {
                          await supabase
                            .from('booking_inquiries')
                            .update({ status: 'confirmed' })
                            .eq('id', inquiry.id);
                          fetchInquiries();
                        }}
                        className="text-green-600 hover:underline mr-3"
                      >
                        Confirm
                      </button>
                    )}
                    {inquiry.status === 'confirmed' && (
                      <button
                        onClick={async () => {
                          await supabase
                            .from('booking_inquiries')
                            .update({ status: 'cancelled' })
                            .eq('id', inquiry.id);
                          fetchInquiries();
                        }}
                        className="text-orange-600 hover:underline mr-3"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm('Delete this inquiry?')) {
                          await supabase
                            .from('booking_inquiries')
                            .delete()
                            .eq('id', inquiry.id);
                          fetchInquiries();
                        }
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}