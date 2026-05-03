// src/pages/BusinessDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import BusinessReviews from '../components/BusinessReviews';
import SocialShare from '../components/SocialShare';

export default function BusinessDetail() {
  const { id } = useParams();
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

  // Localized content
  const name = business ? getLocalized(business, 'name', 'name_my') : '';
  const description = business ? getLocalized(business, 'description', 'description_my') : '';
  const address = business ? getLocalized(business, 'address', 'address_my') : '';

  const shareUrl = window.location.href;

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
          {t('business.details')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section with Image and Overlay */}
      <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] w-full overflow-hidden">
        <img
          src={business.image}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Floating Favorite Button (visible on all screens) */}
        {user && (
          <button
            onClick={() => toggleFavorite('business', business.id)}
            className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isSaved
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
            title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          >
            <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Breadcrumb overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="container mx-auto px-4">
            <div className="text-sm text-white/80 flex items-center gap-2">
              <Link to="/" className="hover:text-white transition">Home</Link>
              <span>/</span>
              <Link to="/business" className="hover:text-white transition">{t('business.directory') || 'Directory'}</Link>
              <span>/</span>
              <span className="text-white font-medium line-clamp-1">{name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* Left Column – Business Information */}
          <div className="flex-1">
            {/* Name and Basic Info (hidden on hero, shown here on mobile) */}
            <div className="lg:hidden mb-6">
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{name}</h1>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{address}</span>
              </div>
            </div>

            {/* Description Section */}
            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <BusinessReviews businessId={business.id} />
            </div>
          </div>

          {/* Right Column – Sticky Contact & Actions Panel */}
          <div className="lg:w-96 mt-8 lg:mt-0">
            <div className="sticky top-24 space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t('business.contact')}
                </h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                  >
                    <span className="text-gray-700">{business.phone}</span>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-primary text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                      <path d="M17.611 14.982c-.094-.144-.331-.236-.689-.413-.358-.177-2.104-1.039-2.43-1.158-.326-.119-.562-.177-.799.177-.236.354-.915 1.158-1.121 1.397-.207.236-.413.266-.771.09-.358-.177-1.52-.561-2.892-1.789-1.067-.947-1.787-2.112-1.997-2.468-.209-.356-.022-.548.157-.725.162-.162.359-.424.539-.636.179-.212.239-.354.358-.591.12-.236.06-.443-.03-.62-.089-.177-.799-1.928-1.096-2.638-.288-.69-.581-.595-.799-.609-.206-.014-.442-.014-.678-.014-.236 0-.618.089-.942.443-.324.354-1.233 1.207-1.233 2.94 0 1.733 1.263 3.408 1.438 3.645.177.236 2.48 3.79 6.001 5.315.84.363 1.495.58 2.007.742.843.267 1.61.229 2.218.139.677-.101 2.087-.854 2.381-1.679.294-.825.294-1.531.206-1.679z"/>
                    </svg>
                    {t('business.whatsapp')}
                  </a>
                </div>
              </div>

              {/* Social Share Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-md font-semibold text-gray-700 mb-3">{t('social.share')}</h3>
                <SocialShare
                  title={name}
                  url={shareUrl}
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