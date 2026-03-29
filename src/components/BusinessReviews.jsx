import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUser } from '../context/UserContext';
import StarRating from './StarRating';

export default function BusinessReviews({ businessId }) {
  const user = useUser();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [businessId]);

  const fetchReviews = async () => {
    setLoading(true);
    
    // Fetch all reviews for this business
    const { data, error } = await supabase
      .from('business_reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      setReviews(data);
      
      // Calculate average rating
      if (data.length > 0) {
        const sum = data.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating(sum / data.length);
        setTotalReviews(data.length);
      } else {
        setAverageRating(0);
        setTotalReviews(0);
      }
      
      // Find current user's review
      if (user) {
        const myReview = data.find(review => review.user_id === user.id);
        if (myReview) {
          setUserReview(myReview);
          setRating(myReview.rating);
          setComment(myReview.comment || '');
        }
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to leave a review');
      return;
    }
    
    setSubmitting(true);
    
    if (userReview) {
      // Update existing review
      const { error } = await supabase
        .from('business_reviews')
        .update({
          rating: rating,
          comment: comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', userReview.id);
      
      if (error) {
        alert('Error updating review: ' + error.message);
      } else {
        fetchReviews();
        setUserReview({ ...userReview, rating, comment });
      }
    } else {
      // Insert new review
      const { error } = await supabase
        .from('business_reviews')
        .insert({
          business_id: businessId,
          user_id: user.id,
          user_email: user.email,
          rating: rating,
          comment: comment
        });
      
      if (error) {
        alert('Error submitting review: ' + error.message);
      } else {
        fetchReviews();
        setComment('');
        setRating(5);
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!userReview) return;
    if (confirm('Are you sure you want to delete your review?')) {
      const { error } = await supabase
        .from('business_reviews')
        .delete()
        .eq('id', userReview.id);
      
      if (error) {
        alert('Error deleting review: ' + error.message);
      } else {
        setUserReview(null);
        setRating(5);
        setComment('');
        fetchReviews();
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Reviews & Ratings</h3>
      
      {/* Average Rating Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
            <StarRating rating={Math.round(averageRating)} readonly size="sm" />
            <div className="text-sm text-gray-500">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">Based on {totalReviews} traveler review{totalReviews !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
      
      {/* Review Form (only for logged-in users) */}
      {user ? (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h4 className="font-semibold mb-3">{userReview ? 'Edit Your Review' : 'Write a Review'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Your Rating</label>
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Your Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Share your experience with this business..."
                required
              ></textarea>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Submitting...' : (userReview ? 'Update Review' : 'Submit Review')}
              </button>
              {userReview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="btn btn-danger"
                >
                  Delete Review
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-600">Please <button onClick={() => alert('Click Login in header')} className="text-green-600 underline">log in</button> to leave a review.</p>
        </div>
      )}
      
      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.user_email.split('@')[0]}</span>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(review.created_at)}</div>
                </div>
                {review.user_id === user?.id && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Your Review</span>
                )}
              </div>
              {review.comment && (
                <p className="text-gray-700 mt-2">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}