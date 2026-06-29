import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from '../components/StarRating';
import Pagination from '../components/ui/Pagination';
import { SkeletonListItem } from '../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';

const PAGE_SIZE = 10;

export default function UserReviewsPage() {
  const user = useUser();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    const fetchReviews = async () => {
      const { data: bizReviews } = await supabase
        .from('business_reviews')
        .select('*, businesses(name, name_my)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
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

  if (loading) return <div className="container-custom"><h1 className="page-title">{t('reviews.title')}</h1><SkeletonListItem count={5} /></div>;

  const totalPages = Math.ceil(reviews.length / PAGE_SIZE);
  const paginated = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
      <Helmet>
        <title>My Reviews | Hpa-An Travel</title>
        <meta name="description" content="Reviews you've written on Hpa-An Travel." />
        <meta property="og:title" content="My Reviews" />
        <meta property="og:description" content="Reviews you've written on Hpa-An Travel." />
        <meta property="og:type" content="website" />
      </Helmet>
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
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-text-soft/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-text-soft text-lg mb-2">You haven't written any reviews yet.</p>
          <p className="text-text-soft/60 text-sm mb-6">Share your experience to help other travelers.</p>
          <a href="/business" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition text-sm font-medium">
            Browse Businesses
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((review) => (
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
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
