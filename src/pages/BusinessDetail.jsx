import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import BookingModal from '../components/BookingModal';
import BusinessReviews from '../components/BusinessReviews';
import SocialShare from '../components/SocialShare';

export default function BusinessDetail() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
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

  // Get localized content
  const name = business ? getLocalized(business, 'name', 'name_my') : '';
  const description = business ? getLocalized(business, 'description', 'description_my') : '';
  const address = business ? getLocalized(business, 'address', 'address_my') : '';

  // Get current URL for sharing
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
    <div className="container-custom max-w-2xl">
      <Link to="/business" className="text-green-600 hover:underline mb-4 inline-block">
        ← {t('business.details')}
      </Link>

      <div className="flex justify-between items-start mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{name}</h1>
        {user && (
          <button
            onClick={() => toggleFavorite('business', business.id)}
            className={`favorite-btn text-2xl sm:text-3xl ${isSaved ? 'favorite-active' : 'favorite-inactive'}`}
            title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          >
            {isSaved ? '❤️' : '🤍'}
          </button>
        )}
      </div>

      <p className="text-gray-600 mb-2">{address}</p>
      <img
        src={business.image}
        alt={name}
        className="w-full h-48 sm:h-64 object-cover rounded-lg my-4"
      />
      <p className="text-gray-700 mb-4">{description}</p>

      {/* Social Share Buttons */}
      <SocialShare
        title={name}
        url={shareUrl}
        description={description}
        image={business.image}
      />

      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h3 className="font-semibold mb-2">{t('business.contact')}</h3>
        <p>
          {t('business.phone')}:{' '}
          <a href={`tel:${business.phone}`} className="text-green-600 hover:underline">
            {business.phone}
          </a>
        </p>
        <a
          href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-3 inline-block"
        >
          {t('business.whatsapp')}
        </a>
        <button
          onClick={() => setShowBookingModal(true)}
          className="btn btn-primary mt-3 ml-3 bg-blue-600 hover:bg-blue-700"
        >
          {t('business.request_booking')}
        </button>
      </div>

      <BusinessReviews businessId={business.id} />
      <BookingModal
        business={business}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
}