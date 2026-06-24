import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Home, Compass, MapPin, Search } from 'lucide-react';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white dark:bg-neutral-dark px-4">
      <div className="max-w-md w-full text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl font-serif font-bold text-text mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-text mb-4">
          {t('errors.page_not_found') || 'Page Not Found'}
        </h2>
        <p className="text-text-soft mb-8 max-w-sm mx-auto">
          {t('errors.page_not_found_desc') || 'Sorry, we couldn\'t find the page you\'re looking for. It might have been moved or doesn\'t exist.'}
        </p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link
            to="/"
            className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition flex flex-col items-center gap-1"
          >
            <Home className="w-5 h-5" />
            <span className="text-sm font-medium">{t('nav.home')}</span>
          </Link>
          <Link
            to="/destinations"
            className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition flex flex-col items-center gap-1"
          >
            <Compass className="w-5 h-5" />
            <span className="text-sm font-medium">{t('nav.destinations')}</span>
          </Link>
          <Link
            to="/map"
            className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition flex flex-col items-center gap-1"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-sm font-medium">{t('nav.map')}</span>
          </Link>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition"
        >
          <Home className="w-4 h-4" />
          {t('errors.back_home') || 'Back to Homepage'}
        </Link>
      </div>
    </div>
  );
}