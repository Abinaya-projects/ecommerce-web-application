import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  MessageSquarePlus,
  Filter,
  Send,
  Sparkles,
  User as UserIcon,
  ThumbsUp,
  LogIn,
} from 'lucide-react';
import { Product, Review } from '../types';
import { StarRating } from './StarRating';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { productApi } from '../services/api';

interface ProductReviewsSectionProps {
  product: Product;
  onProductUpdated: (updatedProduct: Product) => void;
}

export function ProductReviewsSection({ product, onProductUpdated }: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const reviews = useMemo(() => product.reviews || [], [product.reviews]);

  // Existing user review if already submitted
  const userExistingReview = useMemo(() => {
    if (!user) return null;
    return reviews.find((r) => r.userId === user._id) || null;
  }, [reviews, user]);

  // Review Form States
  const [rating, setRating] = useState<number>(userExistingReview?.rating || 5);
  const [title, setTitle] = useState<string>(userExistingReview?.title || '');
  const [comment, setComment] = useState<string>(userExistingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Filter & Sort States
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Rating Distribution
  const distribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  // Filtered & Sorted Reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];

    if (selectedRatingFilter !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === selectedRatingFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [reviews, selectedRatingFilter, sortBy]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Authentication Required', 'info', 'Please sign in to submit a review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      showToast('Invalid Rating', 'error', 'Please select between 1 and 5 stars.');
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      showToast('Review Too Short', 'error', 'Please write at least 5 characters in your feedback.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await productApi.addReview(product._id, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      });

      onProductUpdated(res.product);
      showToast(
        userExistingReview ? 'Review Updated' : 'Review Published',
        'success',
        'Thank you for your valuable feedback on this artifact.'
      );
      setShowForm(false);
    } catch (err: any) {
      showToast('Submission Failed', 'error', err.message || 'Unable to save review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = () => {
    if (userExistingReview) {
      setRating(userExistingReview.rating);
      setTitle(userExistingReview.title || '');
      setComment(userExistingReview.comment || '');
    }
    setShowForm(true);
  };

  return (
    <section className="mt-16 pt-12 border-t border-stone-200/90" id="customer-reviews">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Patron Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 mt-1">
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Verified reflections from owners, industrial architects, and interior designers.
          </p>
        </div>

        {user && !showForm && (
          <button
            type="button"
            onClick={handleEditClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer self-start md:self-auto active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-300" />
            <span>{userExistingReview ? 'Edit Your Review' : 'Write a Review'}</span>
          </button>
        )}
      </div>

      {/* Aggregate Rating & Star Breakdown Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-sm mb-10">
        {/* Big Overall Rating Score */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-stone-50/70 border border-stone-200/70 rounded-2xl text-center space-y-2">
          <span className="text-5xl sm:text-6xl font-serif font-bold text-stone-950 tabular-nums">
            {product.rating.toFixed(1)}
          </span>
          <StarRating value={product.rating} size="md" />
          <p className="text-xs text-stone-500 font-medium pt-1">
            Based on <strong className="text-stone-900 font-semibold">{product.numReviews || reviews.length}</strong> verified reviews
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Authentic Purchases</span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="lg:col-span-8 space-y-2.5 self-center">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const total = reviews.length > 0 ? reviews.length : 1;
            const percent = reviews.length > 0 ? Math.round((count / total) * 100) : 0;
            const isSelected = selectedRatingFilter === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedRatingFilter(isSelected ? 'all' : star)}
                className={`w-full flex items-center gap-3 p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                  isSelected ? 'bg-amber-50/80 ring-1 ring-amber-400' : 'hover:bg-stone-50'
                }`}
                title={`Filter by ${star} star reviews (${count})`}
              >
                <div className="flex items-center gap-1 text-xs font-semibold text-stone-700 w-16 shrink-0">
                  <span>{star} stars</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      star >= 4
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : star === 3
                        ? 'bg-amber-400'
                        : 'bg-stone-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="text-xs font-semibold tabular-nums text-stone-500 w-12 text-right shrink-0">
                  <span>{count}</span>
                  <span className="text-[10px] text-stone-400 ml-1">({percent}%)</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form Container */}
      {showForm && user && (
        <div className="mb-12 bg-white border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-950">
                {userExistingReview ? 'Edit Your Review' : 'Write a Verified Review'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Posting publicly as <strong className="text-stone-800">{user.name}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-stone-500 hover:text-stone-800 font-semibold px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Interactive Star Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-2">
                Overall Quality Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 w-fit">
                <StarRating
                  value={rating}
                  onChange={setRating}
                  interactive={true}
                  size="lg"
                  showLabel={true}
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Click any star to calibrate your overall appraisal.
              </p>
            </div>

            {/* Headline / Title */}
            <div>
              <label htmlFor="review-title" className="block text-xs font-semibold text-stone-800 mb-1">
                Review Headline <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                id="review-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterful acoustics and tactile walnut finish"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            {/* Detailed Feedback Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="review-comment" className="block text-xs font-semibold text-stone-800">
                  Detailed Experience & Observations <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-stone-400 tabular-nums">
                  {comment.trim().length} / 500 characters
                </span>
              </div>
              <textarea
                id="review-comment"
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                placeholder="Share your thoughts on the material provenance, craftsmanship, ergonomics, or how it performs in your daily space..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs leading-relaxed"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Minimum 5 characters. Authentic feedback helps other collectors make informed acquisitions.
              </p>
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || comment.trim().length < 5}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Publishing Review...' : userExistingReview ? 'Update My Review' : 'Publish Review'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Non-logged in callout */}
      {!user && (
        <div className="mb-10 bg-gradient-to-r from-amber-50 via-stone-50 to-orange-50 border border-amber-200/80 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-serif font-bold text-stone-900">
              Own this piece? Share your appraisal.
            </h4>
            <p className="text-xs text-stone-600 max-w-xl">
              Sign in to your Aura account to leave verified customer feedback, rate craftsmanship, and help guide fellow design enthusiasts.
            </p>
          </div>

          <Link
            to={`/login?redirect=/products/${product._id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-300" />
            <span>Sign In to Review</span>
          </Link>
        </div>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 mb-6">
        {/* Rating Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedRatingFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedRatingFilter === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            All Ratings ({reviews.length})
          </button>

          {[5, 4, 3, 2, 1].map((s) => {
            const count = distribution[s] || 0;
            if (count === 0 && selectedRatingFilter !== s) return null;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedRatingFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedRatingFilter === s
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <span>{s}★</span>
                <span className="text-[11px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-stone-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-stone-300 text-stone-800 text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold cursor-pointer shadow-2xs"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {displayedReviews.length === 0 ? (
        <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center max-w-md mx-auto my-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-900">
            {selectedRatingFilter !== 'all'
              ? `No ${selectedRatingFilter}-star reviews found`
              : 'No reviews submitted yet'}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            {selectedRatingFilter !== 'all'
              ? 'Try selecting a different rating filter or clear the selection.'
              : 'Be the first collector or designer to review this architectural piece.'}
          </p>
          {selectedRatingFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => setSelectedRatingFilter('all')}
              className="text-xs font-semibold text-amber-700 hover:underline pt-2 inline-block"
            >
              Clear filter
            </button>
          ) : user && !showForm ? (
            <button
              type="button"
              onClick={handleEditClick}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Write First Review
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((rev) => {
            const isAuthor = user && user._id === rev.userId;
            const reviewDate = new Date(rev.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={rev._id}
                className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs hover:border-stone-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Reviewer info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 font-bold text-xs flex items-center justify-center border border-amber-200/80 shadow-2xs">
                      {rev.userName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-stone-950">
                          {rev.userName}
                        </span>
                        {isAuthor && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            Your Review
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Purchaser</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        {reviewDate}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <StarRating value={rev.rating} size="sm" />
                    <span className="text-xs font-bold tabular-nums text-stone-800">
                      {rev.rating}.0
                    </span>
                  </div>
                </div>

                {/* Review Title if present */}
                {rev.title && (
                  <h4 className="text-sm sm:text-base font-bold text-stone-950 pt-1">
                    {rev.title}
                  </h4>
                )}

                {/* Review Comment Narrative */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
