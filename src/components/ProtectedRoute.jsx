import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { isUserAdmin } from '../utils/adminCheck';

export default function ProtectedRoute({ children }) {
  const user = useUser();
  
  if (!user || !isUserAdmin(user)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}