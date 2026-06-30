import { Link, useLocation } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { isUserAdmin } from '../utils/adminCheck';

export default function AdminButton() {
  const user = useUser();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (!user || !isUserAdmin(user)) return null;

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bottom-6 left-6 z-50"
    >
      <Link
        to={isAdmin ? '/' : '/admin'}
        aria-label={isAdmin ? 'Back to Site' : 'Admin Panel'}
        className="flex items-center gap-2 px-3 py-2.5 md:py-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary-light transition shadow-primary/20 min-h-11"
        title={isAdmin ? 'Back to Site' : 'Admin Panel'}
      >
        {isAdmin ? <ArrowLeft size={16} /> : <Shield size={16} />}
        <span className="text-sm font-medium">{isAdmin ? 'Site' : 'Admin'}</span>
      </Link>
    </Motion.div>
  );
}
