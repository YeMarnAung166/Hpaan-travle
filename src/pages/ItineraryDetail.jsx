import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import SocialShare from '../components/SocialShare';
import LocationControl from '../components/LocationControl';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ItineraryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const title = getLocalized(itinerary, 'title', 'title_my');
  const description = getLocalized(itinerary, 'description', 'description_my');
  const days = language === 'my' && itinerary.days_my?.length ? itinerary.days_my : itinerary.days;
  const waypoints = itinerary.waypoints || [];

  const getDayLabel = (dayNumber) => {
    if (language === 'my') return `နေ့ ${dayNumber}`;
    return `${t('itinerary.day')} ${dayNumber}`;
  };

  const mapCenter = waypoints.length ? [waypoints[0].lat, waypoints[0].lng] : [16.889, 97.635];
  const polylinePositions = waypoints.map(p => [p.lat, p.lng]);

  const handleGetDirections = () => {
    if (!waypoints.length) {
      alert('No route available for this itinerary.');
      return;
    }
    const end = waypoints[0];
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/map?start=${latitude},${longitude}&end=${end.lat},${end.lng}`);
        },
        () => alert('Unable to get your location. Please allow location access.')
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="container-custom max-w-4xl">
      <Link to="/" className="text-green-600 hover:underline mb-4 inline-block">
        ← {t('itinerary.back')}
      </Link>

      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">{title}</h1>
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

      <p className="text-text-soft mb-4">{itinerary.duration}</p>

      {itinerary.image && (
        <img src={itinerary.image} alt={title} className="w-full h-64 object-cover rounded-lg mb-6" />
      )}

      <SocialShare title={title} url={window.location.href} description={description} image={itinerary.image} />

      {description && (
        <div className="mt-6 mb-6">
          <h2 className="text-xl font-semibold text-text mb-2">About this itinerary</h2>
          <p className="text-text-soft leading-relaxed">{description}</p>
        </div>
      )}

      {waypoints.length >= 2 ? (
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-semibold text-text mb-3">
            {language === 'my' ? 'လမ်းကြောင်းမြေပုံ' : 'Route Map'}
          </h2>
          <div className="h-80 w-full rounded-lg overflow-hidden shadow-md z-0">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {waypoints.map((point, idx) => (
                <Marker key={idx} position={[point.lat, point.lng]}>
                  <Popup>
                    {language === 'my' && itinerary.days_my?.[0]?.activities?.[idx]
                      ? itinerary.days_my[0].activities[idx]
                      : itinerary.days?.[0]?.activities?.[idx] || `Stop ${idx + 1}`}
                  </Popup>
                </Marker>
              ))}
              <Polyline positions={polylinePositions} color="#2D6A4F" weight={4} opacity={0.8} />
              <LocationControl />
            </MapContainer>
          </div>
          <button
            onClick={handleGetDirections}
            className="btn btn-secondary mt-3 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Get Directions to First Stop
          </button>
        </div>
      ) : (
        <div className="mt-8 mb-8 p-4 bg-neutral-light rounded-lg text-center">
          <p className="text-text-soft">
            {language === 'my'
              ? 'ဤခရီးစဉ်အတွက် လမ်းကြောင်းမြေပုံ မရှိသေးပါ။'
              : 'No route map available for this itinerary yet.'}
          </p>
        </div>
      )}

      {days && days.length > 0 && (
        <div className="bg-neutral-light p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-text mb-4">
            {language === 'my' ? 'နေ့စဉ်လုပ်ဆောင်မှုများ' : 'Daily Activities'}
          </h2>
          {days.map(day => (
            <div key={day.day} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-primary mb-2">{getDayLabel(day.day)}</h3>
              <ul className="list-disc pl-5 space-y-1 text-text-soft">
                {day.activities.map((activity, idx) => (
                  <li key={idx}>{activity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}