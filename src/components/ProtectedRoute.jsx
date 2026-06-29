import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { isUserAdmin } from '../utils/adminCheck';

export default function ProtectedRoute({ children }) {
  const user = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !isUserAdmin(user)) {
      toast({ type: 'warning', message: 'Admin access required. Redirecting to homepage.' });
      navigate('/', { replace: true });
    }
  }, [user, navigate, toast]);

  if (!user || !isUserAdmin(user)) return null;

  return children;
}