import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{6,20}$/;

export default function BookingModal({ business, isOpen, onClose }) {
  const user = useUser();
  const { toast } = useToast();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!name || name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email) errs.email = 'Email is required';
    else if (!EMAIL_REGEX.test(email)) errs.email = 'Invalid email format';
    if (phone && !PHONE_REGEX.test(phone)) errs.phone = 'Invalid phone number';
    if (date) {
      const d = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) errs.date = 'Date must be in the future';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.from('bookings').insert({
      business_id: business.id,
      user_id: user?.id || null,
      guest_name: name,
      guest_email: email,
      guest_phone: phone || null,
      requested_date: date || null,
      guest_count: guests,
      notes: notes || null,
    });
    setLoading(false);
    if (error) {
      toast({ type: 'error', message: 'Failed to submit booking inquiry.' });
      return;
    }
    toast({ type: 'success', message: 'Booking inquiry submitted! The business will contact you soon.' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white dark:bg-neutral-dark rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-serif font-bold text-text mb-1">Booking Inquiry</h2>
        <p className="text-text-soft text-sm mb-4">Send a booking request to {business.name || business.name_my}</p>
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Name *</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: null })); }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 text-sm ${errors.name ? 'border-error' : ''}`} />
            {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email *</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })); }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 text-sm ${errors.email ? 'border-error' : ''}`} />
            {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Phone</label>
            <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: null })); }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 text-sm ${errors.phone ? 'border-error' : ''}`} />
            {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text mb-1">Preferred Date</label>
              <input type="date" value={date} onChange={e => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: null })); }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 text-sm ${errors.date ? 'border-error' : ''}`} />
              {errors.date && <p className="text-xs text-error mt-1">{errors.date}</p>}
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-text mb-1">Guests</label>
              <input type="number" min="1" max="50" value={guests} onChange={e => setGuests(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 text-sm resize-none" placeholder="Any special requests..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Send Inquiry'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
        <button onClick={onClose} className="absolute top-3 right-3 text-text-soft hover:text-text transition">✕</button>
      </div>
    </div>
  );
}
