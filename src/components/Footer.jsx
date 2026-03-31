import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white mt-12 py-6">
      <div className="container-custom text-center text-sm">
        <p>© {new Date().getFullYear()} {t('app.name')}. All rights reserved.</p>
        <p className="mt-2">{t('app.tagline')}</p>
      </div>
    </footer>
  );
}