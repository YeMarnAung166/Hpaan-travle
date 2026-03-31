import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

export default function BookingModal({ business, isOpen, onClose }) {
  const user = useUser();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    travel_date: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: insertError } = await supabase
      .from('booking_inquiries')
      .insert({
        business_id: business.id,
        business_name: business.name,
        user_id: user?.id || null,
        user_name: formData.name,
        user_email: formData.email,
        travel_date: formData.travel_date || null,
        message: formData.message,
        status: 'pending'
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ name: '', email: '', travel_date: '', message: '' });
      }, 2000);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">{t('booking.title')}</h2>
        <p className="text-gray-600 mb-4">Send an inquiry to <strong>{business.name}</strong></p>

        {success ? (
          <div className="message-success">{t('booking.success')}</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="message-error mb-4">{error}</div>}

            <input
              type="text"
              name="name"
              placeholder={t('booking.name')}
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

            <input
              type="email"
              name="email"
              placeholder={t('booking.email')}
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />

            <input
              type="date"
              name="travel_date"
              placeholder={t('booking.travel_date')}
              value={formData.travel_date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <textarea
              name="message"
              placeholder={t('booking.message')}
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? t('booking.sending') : t('booking.send')}
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}