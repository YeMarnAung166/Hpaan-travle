import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from './StarRating';
import Button from './ui/Button';

export default function BusinessReviews({ businessId }) {
  const user = useUser();
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => { fetchReviews(); }, [businessId]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('business_reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    if (!error) {
      setReviews(data);
      if (data.length) {
        const sum = data.reduce((a, r) => a + r.rating, 0);
        setAverageRating(sum / data.length);
        setTotalReviews(data.length);
      } else {
        setAverageRating(0);
        setTotalReviews(0);
      }
      if (user) {
        const my = data.find(r => r.user_id === user.id);
        if (my) {
          setUserReview(my);
          setRating(my.rating);
          setComment(my.comment || '');
        }
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in');
    setSubmitting(true);
    if (userReview) {
      const { error } = await supabase
        .from('business_reviews')
        .update({ rating, comment, updated_at: new Date() })
        .eq('id', userReview.id);
      if (!error) fetchReviews();
    } else {
      const { error } = await supabase
        .from('business_reviews')
        .insert({ business_id: businessId, user_id: user.id, user_email: user.email, rating, comment });
      if (!error) {
        fetchReviews();
        setComment('');
        setRating(5);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (confirm('Delete review?')) {
      await supabase.from('business_reviews').delete().eq('id', userReview.id);
      setUserReview(null);
      fetchReviews();
    }
  };

  if (loading) return <div className="text-center py-4">{t('common.loading')}</div>;

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">{t('reviews.title')}</h3>
      <div className="bg-neutral-light p-4 rounded-lg mb-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-text">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} readonly size="sm" />
            <div className="text-sm text-text-soft">{totalReviews} {t('reviews.reviews_count')}</div>
          </div>
          <div className="text-sm text-text-soft">{t('reviews.based_on')} {totalReviews} {t('reviews.traveler_reviews')}</div>
        </div>
      </div>
      {user ? (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">{userReview ? t('reviews.edit_review') : t('reviews.write_review')}</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">{t('reviews.your_rating')}</label>
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>
            <div className="mb-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full border border-neutral-mid rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/50"
                placeholder={t('reviews.comment')}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                {submitting ? t('common.loading') : (userReview ? t('reviews.update') : t('reviews.submit'))}
              </Button>
              {userReview && (
                <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
                  {t('reviews.delete')}
                </Button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-neutral-light border rounded-lg p-4 mb-6 text-center">
          <p className="text-text-soft">{t('reviews.login_to_review')}</p>
        </div>
      )}
      <div className="space-y-4">
        {reviews.length === 0 && <p className="text-text-soft text-center">{t('reviews.no_reviews')}</p>}
        {reviews.map(review => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{review.user_email.split('@')[0]}</span>
                  <StarRating rating={review.rating} readonly size="sm" />
                </div>
                <div className="text-xs text-text-soft">{new Date(review.created_at).toLocaleDateString()}</div>
              </div>
              {review.user_id === user?.id && <span className="text-xs text-primary">Your Review</span>}
            </div>
            {review.comment && <p className="text-text mt-2">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}