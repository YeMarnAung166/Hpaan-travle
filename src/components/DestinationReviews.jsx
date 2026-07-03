import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StarRating from './StarRating';
import Button from './ui/Button';
import ConfirmDialog from './ConfirmDialog';

export default function DestinationReviews({ destinationId }) {
  const user = useUser();
  useLanguage();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('destination_reviews')
      .select('*')
      .eq('destination_id', destinationId)
      .order('created_at', { ascending: false });
    if (!error) {
      setReviews(data);
      if (data.length) {
        const sum = data.reduce((a, r) => a + r.rating, 0);
        setAverageRating(sum / data.length);
        setTotalReviews(data.length);
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [destinationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ type: 'warning', message: 'Please log in to leave a review' });
      return;
    }
    setSubmitting(true);
    if (userReview) {
      const { error } = await supabase
        .from('destination_reviews')
        .update({ rating, comment, updated_at: new Date() })
        .eq('id', userReview.id);
      if (!error) fetchReviews();
    } else {
      const { error } = await supabase
        .from('destination_reviews')
        .insert({ destination_id: destinationId, user_id: user.id, user_email: user.email, rating, comment });
      if (!error) {
        fetchReviews();
        setComment('');
        setRating(5);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    await supabase.from('destination_reviews').delete().eq('id', userReview.id);
    setUserReview(null);
    setShowConfirmDelete(false);
    toast({ type: 'success', message: 'Review deleted' });
    fetchReviews();
  };

  if (loading) return <div className="text-center py-4">Loading reviews...</div>;

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Reviews & Ratings</h3>
      <div className="bg-neutral-light p-4 rounded-lg mb-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-text">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} readonly size="sm" />
            <div className="text-sm text-text-soft">{totalReviews} reviews</div>
          </div>
          <div className="text-sm text-text-soft">Based on {totalReviews} traveler reviews</div>
        </div>
      </div>
      {user ? (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">{userReview ? 'Edit Your Review' : 'Write a Review'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Your Rating</label>
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>
            <div className="mb-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full border rounded px-3 py-2"
                placeholder="Share your experience..."
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                {submitting ? 'Saving...' : (userReview ? 'Update Review' : 'Submit Review')}
              </Button>
              {userReview && (
                <Button type="button" variant="danger" size="sm" onClick={() => setShowConfirmDelete(true)}>
                  Delete Review
                </Button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-neutral-light border rounded-lg p-4 mb-6 text-center">
          <p className="text-text-soft">Please log in to leave a review.</p>
        </div>
      )}
      <div className="space-y-4">
        {reviews.length === 0 && <p className="text-text-soft text-center">No reviews yet. Be the first!</p>}
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

      <ConfirmDialog
        open={showConfirmDelete}
        title="Delete your review?"
        message="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
}