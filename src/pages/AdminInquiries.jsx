import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';

export default function AdminInquiries() {
  const user = useUser();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Simple admin check – replace with your email
  const ADMIN_EMAIL = 'yemarnaung166@gmail.com';

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      setIsAdmin(true);
      fetchInquiries();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchInquiries = async () => {
    const { data, error } = await supabase
      .from('booking_inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    else setInquiries(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const { error } = await supabase
      .from('booking_inquiries')
      .update({ status })
      .eq('id', id);
    if (error) console.error(error);
    else fetchInquiries();
  };

  if (!user || !isAdmin) {
    return (
      <div className="container-custom text-center py-8">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You need admin privileges to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="page-title">Booking Inquiries</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Business</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Travel Date</th>
              <th className="px-4 py-2 text-left">Message</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-t">
                <td className="px-4 py-2">{new Date(inquiry.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2">{inquiry.business_name}</td>
                <td className="px-4 py-2">{inquiry.user_name}</td>
                <td className="px-4 py-2">{inquiry.user_email}</td>
                <td className="px-4 py-2">{inquiry.travel_date || '—'}</td>
                <td className="px-4 py-2 max-w-xs truncate">{inquiry.message}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    inquiry.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {inquiry.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {inquiry.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(inquiry.id, 'confirmed')}
                      className="btn btn-primary btn-sm text-xs"
                    >
                      Mark Confirmed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}