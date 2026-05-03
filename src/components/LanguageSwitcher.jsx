import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          language === 'en'
            ? 'bg-white text-green-700'
            : 'text-white hover:bg-primary'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('my')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          language === 'my'
            ? 'bg-white text-green-700'
            : 'text-white hover:bg-primary'
        }`}
      >
        မြန်
      </button>
    </div>
  );
}