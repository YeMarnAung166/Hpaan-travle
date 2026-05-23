import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import BusinessReviews from '../components/BusinessReviews';
import SocialShare from '../components/SocialShare';
import Button from '../components/ui/Button';
import LocationControl from '../components/LocationControl';
import UserPhotoUpload from '../components/UserPhotoUpload';
import UserPhotoGallery from '../components/UserPhotoGallery';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { t, getLocalized, language } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = user && favorites.businesses.has(parseInt(id));

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
      if (error) console.error(error);
      else setBusiness(data);
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  const name = getLocalized(business, 'name', 'name_my');
  const description = getLocalized(business, 'description', 'description_my');
  const address = getLocalized(business, 'address', 'address_my');
  const hasCoordinates = business?.lat && business?.lng;
  const mapCenter = hasCoordinates ? [business.lat, business.lng] : [16.89, 97.65];

  const handleGetDirections = () => {
    if (!hasCoordinates) {
      alert('Location not available for this business.');
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/map?start=${latitude},${longitude}&end=${business.lat},${business.lng}`);
        },
        () => alert('Unable to get your location. Please allow location access.')
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (loading) {
    return (
      <div className="container-custom flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container-custom text-center">
        <h2 className="text-2xl font-bold text-red-600">Business not found</h2>
        <Link to="/business" className="btn btn-primary mt-4 inline-block">
          Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-light min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        <img src={business.image} alt={name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        {user && (
          <button
            onClick={() => toggleFavorite('business', business.id)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm transition hover:scale-110"
          >
            <svg className={`w-6 h-6 ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-sm opacity-80 flex gap-2">
            <Link to="/" className="hover:underline">Home</Link> /{' '}
            <Link to="/business" className="hover:underline">Directory</Link> /{' '}
            <span className="font-medium">{name}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column – Business Information */}
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-text mb-2">{name}</h1>
            <div className="flex items-center gap-2 text-text-soft mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {address}
            </div>
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-text-soft leading-relaxed">{description}</p>
            </div>

            {/* User Photos (Upload & Gallery) */}
            <UserPhotoUpload businessId={business.id} onUploadComplete={() => window.location.reload()} />
            <UserPhotoGallery businessId={business.id} />

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

            {/* Reviews */}
            <BusinessReviews businessId={business.id} />
          </div>

          {/* Right Column – Sticky Contact & Share */}
          <div className="lg:w-80">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-mid">
                <h3 className="font-semibold text-text mb-4">Contact & booking</h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${business.phone}`}
                    className="flex justify-between p-3 bg-neutral-light rounded-xl hover:bg-neutral-mid transition"
                  >
                    <span className="text-text">{business.phone}</span>
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-center"
                  >
                    <Button variant="primary" size="md" className="w-full">
                      WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-mid">
                <h3 className="font-semibold text-text mb-3">Share</h3>
                <SocialShare
                  title={name}
                  url={window.location.href}
                  description={description}
                  image={business.image}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}