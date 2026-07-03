import { useUser } from '../context/UserContext';
import { isUserAdmin } from '../utils/adminCheck';
import { Link } from 'react-router-dom';
import { ShieldOff, Home } from 'lucide-react';
import Button from './ui/Button';

export default function ProtectedRoute({ children }) {
  const user = useUser();

  if (!user || !isUserAdmin(user)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
            <ShieldOff className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Access Denied</h1>
          <p className="text-text-soft mb-8">
            {!user
              ? 'You need to log in to access the admin panel.'
              : 'You do not have permission to access the admin panel.'}
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button variant="primary">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
