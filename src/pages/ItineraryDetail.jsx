import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';

export default function ItineraryDetail() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { t, getLocalized, language } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = user && favorites.itineraries.has(parseInt(id));

  useEffect(() => {
    const fetchItinerary = async () => {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setItinerary(data);
      setLoading(false);
    };
    fetchItinerary();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="container-custom text-center">
        <h2 className="text-2xl font-bold text-red-600">{t('itinerary.not_found')}</h2>
        <Link to="/" className="btn btn-primary mt-4 inline-block">{t('itinerary.back')}</Link>
      </div>
    );
  }

  // Get localized content
  const title = getLocalized(itinerary, 'title', 'title_my');
  const description = getLocalized(itinerary, 'description', 'description_my');
  
  // Get localized days (if Burmese days exist, use them, otherwise use English)
  const getLocalizedDays = () => {
    if (!itinerary || !itinerary.days) return [];
    if (language === 'my' && itinerary.days_my && itinerary.days_my.length > 0) {
      return itinerary.days_my;
    }
    return itinerary.days;
  };
  
  const days = getLocalizedDays();

  // Get day label in current language
  const getDayLabel = (dayNumber) => {
    if (language === 'my') {
      return `နေ့ ${dayNumber}`;
    }
    return `${t('itinerary.day')} ${dayNumber}`;
  };

  return (
    <div className="container-custom max-w-3xl">
      <Link to="/" className="text-green-600 hover:underline mb-4 inline-block">
        ← {t('itinerary.back')}
      </Link>
      
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h1>
        {user && (
          <button
            onClick={() => toggleFavorite('itinerary', itinerary.id)}
            className={`favorite-btn text-2xl sm:text-3xl ${isSaved ? 'favorite-active' : 'favorite-inactive'}`}
            title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          >
            {isSaved ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      
      <p className="text-gray-600 mb-6">{itinerary.duration}</p>
      
      <img 
        src={itinerary.image} 
        alt={title} 
        className="w-full h-48 sm:h-64 object-cover rounded-lg mb-6" 
      />
      
      {/* Description Section */}
      {description && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            {language === 'my' ? 'ခရီးစဉ်အကြောင်း' : 'About This Itinerary'}
          </h2>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>
      )}
      
      {/* Days Activities Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {language === 'my' ? 'နေ့စဉ်လုပ်ဆောင်မှုများ' : 'Daily Activities'}
        </h2>
        {days && days.map(day => (
          <div key={day.day} className="mb-6 last:mb-0">
            <h3 className="text-lg font-semibold text-green-700 mb-2">
              {getDayLabel(day.day)}
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {day.activities && day.activities.map((activity, idx) => (
                <li key={idx}>{activity}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}