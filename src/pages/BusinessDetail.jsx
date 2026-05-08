import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../context/LanguageContext';
import BusinessReviews from '../components/BusinessReviews';
import SocialShare from '../components/SocialShare';
import Button from '../components/ui/Button';

export default function BusinessDetail() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = useUser();
  const { t, getLocalized } = useLanguage();
  const { favorites, toggleFavorite } = useFavorites(user?.id);
  const isSaved = user && favorites.businesses.has(parseInt(id));
  const shareUrl = window.location.href;

  useEffect(() => {
    const fetchBusiness = async () => {
      const { data, error } = await supabase.from('businesses').select('*').eq('id', id).single();
      if (!error) setBusiness(data);
      setLoading(false);
    };
    fetchBusiness();
  }, [id]);

  const name = business ? getLocalized(business, 'name', 'name_my') : '';
  const description = business ? getLocalized(business, 'description', 'description_my') : '';
  const address = business ? getLocalized(business, 'address', 'address_my') : '';

  if (loading) return <div className="container-custom flex justify-center"><div className="spinner"></div></div>;
  if (!business) return <NotFound />;

  return (
    <div className="bg-neutral-light min-h-screen">
      {/* Hero */}
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
            <Link to="/" className="hover:underline">Home</Link> / <Link to="/business" className="hover:underline">Directory</Link> / <span className="font-medium">{name}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl lg:text-4xl font-serif font-bold text-text mb-2">{name}</h1>
            <div className="flex items-center gap-2 text-text-soft mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {address}
            </div>
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-text-soft leading-relaxed">{description}</p>
            </div>
            <BusinessReviews businessId={business.id} />
          </div>

          {/* Sticky contact panel */}
          <div className="lg:w-80">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-mid">
                <h3 className="font-semibold text-text mb-4">Contact & booking</h3>
                <div className="space-y-3">
                  <a href={`tel:${business.phone}`} className="flex justify-between p-3 bg-neutral-light rounded-xl hover:bg-neutral-mid transition">
                    <span className="text-text">{business.phone}</span>
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </a>
                  <a href={`https://wa.me/${business.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex justify-center">
                    <Button variant="primary" size="md" className="w-full">WhatsApp</Button>
                  </a>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-neutral-mid">
                <h3 className="font-semibold text-text mb-3">Share</h3>
                <SocialShare title={name} url={shareUrl} description={description} image={business.image} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const NotFound = () => (
  <div className="container-custom text-center">
    <h2 className="text-2xl font-bold text-error">Business not found</h2>
    <Link to="/business" className="btn-primary mt-4 inline-block">Back to directory</Link>
  </div>
);