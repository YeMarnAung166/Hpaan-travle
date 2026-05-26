import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from '../components/StarRating';

export default function UserReviewsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchReviews = async () => {
      // Business reviews
      const { data: bizReviews } = await supabase
        .from('business_reviews')
        .select('*, businesses(name, name_my)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      // Destination reviews
      const { data: destReviews } = await supabase
        .from('destination_reviews')
        .select('*, destinations(name, name_my)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const all = [...(bizReviews || []), ...(destReviews || [])];
      all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(all);
      setLoading(false);
    };
    fetchReviews();
  }, [user]);

  if (!user) {
    return (
      <div className="container-custom text-center py-12">
        <h2 className="text-2xl font-bold">Please log in to view your reviews</h2>
      </div>
    );
  }

  if (loading) return <div className="spinner mx-auto my-12"></div>;

  const getTargetName = (review) => {
    if (review.businesses) {
      return language === 'my' && review.businesses.name_my
        ? review.businesses.name_my
        : review.businesses.name;
    }
    if (review.destinations) {
      return language === 'my' && review.destinations.name_my
        ? review.destinations.name_my
        : review.destinations.name;
    }
    return 'Item';
  };

  const getTargetLink = (review) => {
    if (review.businesses) return `/business/${review.business_id}`;
    if (review.destinations) return `/destination/${review.destination_id}`;
    return '#';
  };

  return (
    <div className="container-custom max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-text-soft hover:text-primary transition"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{t('nav.back') || 'Back'}</span>
        </button>
      </div>

      <h1 className="page-title">My Reviews</h1>

      {reviews.length === 0 ? (
        <p className="text-text-soft text-center py-12">You haven't written any reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-4 border border-neutral-mid">
              <div className="flex justify-between flex-wrap gap-2 mb-2">
                <Link to={getTargetLink(review)} className="font-semibold text-primary hover:underline">
                  {getTargetName(review)}
                </Link>
                <div className="flex items-center gap-1">
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
              </div>
              {review.comment && <p className="text-text-soft text-sm mt-2">{review.comment}</p>}
              <div className="text-xs text-text-soft mt-3">
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}