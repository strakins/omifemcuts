'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Star, MessageSquare, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { Feedback } from '@/types';
import Link from 'next/link';
import { formatDate } from '@/utils/dateFormatter';

const feedbackSchema = z.object({
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  rating: z.number().min(1).max(5),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackSectionProps {
  feedbacks: Feedback[];
  loading: boolean;
}

export default function FeedbackSection({ feedbacks, loading }: FeedbackSectionProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      comment: '',
      rating: 0,
    },
  });

  const commentValue = watch('comment');

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user) {
      toast.error('Please login to submit feedback');
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      const feedbackData = {
        userId: user.id,
        userName: user.name,
        comment: data.comment.trim(),
        rating: data.rating,
        createdAt: serverTimestamp(),
        approved: user.role === 'admin',
      };

      console.log('Submitting feedback:', feedbackData);

      const docRef = await addDoc(collection(db, 'feedbacks'), feedbackData);
      
      console.log('Feedback submitted successfully:', docRef.id);

      toast.success(
        user.role === 'admin' 
          ? 'Feedback submitted!' 
          : 'Thank you for your feedback! It will be visible after approval.'
      );
      
      reset();
      setRating(0);
      setShowForm(false);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(`Failed to submit feedback: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRating = (value: number) => {
    setRating(value);
    setValue('rating', value, { shouldValidate: true });
  };

  // Prevent SSR issues
  if (!mounted) {
    return (
      <section id="feedback-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="feedback-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust OmifemCuts for their tailoring needs.
          </p>
        </div>

        {/* Add Feedback Button (Only when user is NOT logged in) */}
        {!user && !showForm && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              Add Your Feedback
            </button>
            <p className="text-gray-600 mt-4">
              Login to share your experience with us
            </p>
          </div>
        )}

        {/* Login Prompt Form */}
        {!user && showForm && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 mb-12 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Login to Share Your Feedback
            </h3>
            
            <p className="text-gray-600 mb-8">
              Please login to share your experience and help others make better decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login Now
              </Link>
              
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Create Account
              </Link>
              
              <button
                onClick={() => setShowForm(false)}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 text-gray-600 font-semibold rounded-lg hover:text-gray-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {/* Feedback Form for Logged-in Users */}
        {user && (showForm || !feedbacks.some(f => f.userId === user.id)) && (
          <div className="bg-gray-50 rounded-2xl p-8 mb-12 max-w-2xl mx-auto border-2 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Share Your Experience
              </h3>
              {showForm && (
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  type="button"
                >
                  &times;
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Rating Stars */}
              <div className="text-center">
                <p className="text-gray-700 mb-4 font-medium">How would you rate your experience?</p>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transform hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-12 h-12 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  {rating === 0 ? 'Select a rating' : `${rating} out of 5 stars`}
                </p>
                {errors.rating && (
                  <p className="text-sm text-red-600 mt-1">{errors.rating.message}</p>
                )}
                <input
                  type="hidden"
                  {...register('rating')}
                  value={rating}
                />
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  id="comment"
                  {...register('comment')}
                  rows={4}
                  value={commentValue}
                  onChange={(e) => {
                    setValue('comment', e.target.value, { shouldValidate: true });
                  }}
                  placeholder="Share your experience with OmifemCuts... What did you like? What could be improved?"
                  className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between mt-1">
                  {errors.comment && (
                    <p className="text-sm text-red-600">{errors.comment.message}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {commentValue?.length || 0}/500
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="flex-1 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
                {showForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      reset();
                      setRating(0);
                    }}
                    className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Customer Feedback Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : feedbacks.length > 0 ? (
          <>
            {/* Add Feedback Button for Logged-in Users */}
            {user && !showForm && (
              <div className="text-center mb-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-3 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Add Your Feedback
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-200"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-4 mb-6">
                    
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{feedback.userName}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 ${
                              i < feedback.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm md:text-base text-gray-700 italic mb-4">{feedback.comment}</p>

                  {/* Date */}
                  <p className="text-sm text-gray-500">
                    {formatDate(feedback.createdAt, 'short')}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              <MessageSquare className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">No Feedback Yet</h3>
            <p className="text-gray-600 mb-8">Be the first to share your experience!</p>
            {user ? (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-3 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Be the First to Review
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Login to Review
              </Link>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">4.9</div>
            <div className="text-sm md:text-base text-gray-600">Average Rating</div>
          </div>
          
          <div>
            <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-sm md:text-base text-gray-600">Customer Satisfaction</div>
          </div>
          
          <div>
            <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">{feedbacks.length}</div>
            <div className="text-sm md:text-base text-gray-600">Total Reviews</div>
          </div>
          
          <div>
            <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-sm md:text-base text-gray-600">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}