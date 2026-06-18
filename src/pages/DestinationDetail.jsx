import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import SocialShare from '../components/SocialShare';
import LocationControl from '../components/LocationControl';
import DestinationReviews from '../components/DestinationReviews';
import Button from '../components/ui/Button';
import AddToTripButton from '../components/AddToTripButton';
import { getYouTubeEmbedUrl } from '../utils/videoHelpers';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DestinationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { t, getLocalized, language } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = user && favorites.destinations?.has(parseInt(id));

  useEffect(() => {
    const fetchDestination = async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setDestination(data);
      setLoading(false);
    };
    fetchDestination();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container-custom text-center">
        <h2 className="text-2xl font-bold text-red-600">Destination not found</h2>
        <Link to="/" className="btn btn-primary mt-4 inline-block">Back to destinations</Link>
      </div>
    );
  }

  const name = getLocalized(destination, 'name', 'name_my');
  const description = getLocalized(destination, 'description', 'description_my');
  const hasCoordinates = destination?.lat && destination?.lng;
  const mapCenter = hasCoordinates ? [destination.lat, destination.lng] : [16.89, 97.65];
  const videoEmbedUrl = getYouTubeEmbedUrl(destination.video_url);

  const handleGetDirections = () => {
    if (!hasCoordinates) {
      alert('Location not available for this destination.');
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/map?start=${latitude},${longitude}&end=${destination.lat},${destination.lng}`);
        },
        () => alert('Unable to get your location. Please allow location access.')
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="bg-neutral-light min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        <img src={destination.image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {user && (
          <button
            onClick={() => toggleFavorite('destination', destination.id)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm transition hover:scale-110"
          >
            <svg className={`w-6 h-6 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-sm opacity-80 flex gap-2">
            <Link to="/" className="hover:underline">Home</Link> / <span className="font-medium">{name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-text mb-2">{name}</h1>
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-text-soft leading-relaxed">{description}</p>
            </div>

            {/* Add to Trip button - placed after description */}
            <div className="flex flex-wrap items-center gap-3 mt-4 mb-6">
              <AddToTripButton itemType="destination" itemId={destination.id} itemName={name} />
            </div>

            {/* Embedded Video */}
            {videoEmbedUrl && (
              <div className="mt-6 mb-6">
                <h3 className="text-xl font-semibold text-text mb-3">
                  {language === 'my' ? 'ဗီဒီယို' : 'Video'}
                </h3>
                <div className="relative w-full pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src={videoEmbedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`Video for ${name}`}
                  />
                </div>
              </div>
            )}

            {/* Embedded Map */}
            {hasCoordinates && (
              <div className="mt-6 mb-6">
                <h3 className="text-xl font-semibold text-text mb-3">
                  {language === 'my' ? 'တည်နေရာ' : 'Location'}
                </h3>
                <div className="h-80 w-full rounded-lg overflow-hidden shadow-md z-0">
                  <MapContainer
                    center={mapCenter}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={mapCenter}>
                      <Popup>{name}</Popup>
                    </Marker>
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
                  Get Directions
                </button>
              </div>
            )}

            <DestinationReviews destinationId={destination.id} />
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-mid">
                <h3 className="font-semibold text-text mb-3">Share</h3>
                <SocialShare title={name} url={window.location.href} description={description} image={destination.image} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}