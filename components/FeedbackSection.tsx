'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { Star, MessageSquare, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
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

interface CarouselStats {
  averageRating: number;
  satisfactionRate: number;
  totalReviews: number;
  supportHours: string;
}

export default function FeedbackSection({ feedbacks, loading }: FeedbackSectionProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [itemsPerView, setItemsPerView] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Calculate items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3); // Large screens: 3 items
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2); // Medium screens: 2 items
      } else {
        setItemsPerView(1); // Small screens: 1 item
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning && feedbacks.length > itemsPerView) {
        goToNext();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTransitioning, itemsPerView, feedbacks.length]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || feedbacks.length <= itemsPerView) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex: number) => {
      if (prevIndex === 0) {
        return Math.max(0, feedbacks.length - itemsPerView);
      }
      return prevIndex - 1;
    });
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [feedbacks.length, itemsPerView, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning || feedbacks.length <= itemsPerView) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex: number) => {
      if (prevIndex >= feedbacks.length - itemsPerView) {
        return 0;
      }
      return prevIndex + 1;
    });
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [feedbacks.length, itemsPerView, isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    const maxIndex = Math.max(0, feedbacks.length - itemsPerView);
    const targetIndex = Math.min(Math.max(0, index), maxIndex);
    
    if (targetIndex !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(targetIndex);
      setTimeout(() => setIsTransitioning(false), 1000);
    }
  }, [feedbacks.length, itemsPerView, currentIndex]);

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

  const onSubmit = async (data: FeedbackFormData): Promise<void> => {
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
        userPhoto: user.photoURL,
        comment: data.comment.trim(),
        rating: data.rating,
        createdAt: serverTimestamp(),
        approved: user.role === 'admin',
      };

      const docRef = await addDoc(collection(db, 'feedbacks'), feedbackData);
      
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

  const handleRating = (value: number): void => {
    setRating(value);
    setValue('rating', value, { shouldValidate: true });
  };

  // Calculate statistics
  const calculateStats = (): CarouselStats => {
    const totalRatings = feedbacks.reduce((sum: number, fb: Feedback) => sum + fb.rating, 0);
    const averageRating = feedbacks.length > 0 ? totalRatings / feedbacks.length : 4.9;
    
    const positiveReviews = feedbacks.filter((fb: Feedback) => fb.rating >= 4).length;
    const satisfactionRate = feedbacks.length > 0 ? (positiveReviews / feedbacks.length) * 100 : 98;
    
    return {
      averageRating: parseFloat(averageRating.toFixed(1)),
      satisfactionRate: Math.round(satisfactionRate),
      totalReviews: feedbacks.length,
      supportHours: '24/7',
    };
  };

  const stats: CarouselStats = calculateStats();

  // Get visible feedback items
  const visibleFeedbacks = feedbacks.slice(currentIndex, currentIndex + itemsPerView);

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
        {/* Header */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of satisfied customers who trust OmifemCuts for their tailoring needs.
          </p>
        </div>

        {/* Add Feedback Button */}
        <div className="text-center mb-6 md:mb-12">
          {!user ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-sm md:text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 animate-pulse-glow"
            >
              <MessageSquare className="w-5 h-5" />
              Add Your Feedback
            </button>
          ) : (
            !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-sm md:text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                <MessageSquare className="w-5 h-5" />
                Share Your Experience
              </button>
            )
          )}
        </div>

        {/* Feedback Form Modals */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {!user ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
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
                      onClick={() => setShowForm(false)}
                    >
                      Login Now
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
                      onClick={() => setShowForm(false)}
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
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm md:text-xl font-bold text-gray-900">
                      Share Your Experience
                    </h3>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        reset();
                        setRating(0);
                      }}
                      className="text-red-600 hover:text-gray-700 text-2xl"
                      type="button"
                    >
                      &times;
                    </button>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Rating Stars */}
                    <div className="text-center">
                      <p className="text-gray-700 mb-4 text-sm font-medium">How would you rate your experience?</p>
                      <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star: number) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transform hover:scale-110 transition-transform focus:outline-none"
                          >
                            <Star
                              className={`w-6 h-6 md:w-12 md:h-12 transition-colors ${
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
                        maxLength={500}
                        className="w-full px-4 py-3 text-sm md:text-lg text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Share your experience with OmifemCuts... What did you like? What could be improved?"
                      />
                      <div className="flex justify-between mt-1">
                        {errors.comment && (
                          <p className="text-sm text-red-600">{errors.comment.message}</p>
                        )}
                        <p className="text-sm text-gray-500 ml-auto">
                          {(commentValue?.length || 0)}/500
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="flex-1 md:px-8 md:py-3 text-[12px] md:text-lg bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          reset();
                          setRating(0);
                        }}
                        className="px-4 py-2 md:px-8 md:py-3 text-sm md:text-lg bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Carousel */}
        <div className="relative mb-12">
          {/* Navigation Buttons */}
          {feedbacks.length > itemsPerView && (
            <>
              <button
                onClick={goToPrev}
                disabled={isTransitioning}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 bg-white hover:bg-white p-3 rounded-full shadow-xl transition-all duration-300 z-10 opacity-100 hover:scale-110 hidden md:flex items-center justify-center border border-gray-200"
                aria-label="Previous feedback"
              >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
              </button>
              <button
                onClick={goToNext}
                disabled={isTransitioning}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 bg-white hover:bg-white p-3 rounded-full shadow-xl transition-all duration-300 z-10 opacity-100 hover:scale-110 hidden md:flex items-center justify-center border border-gray-200"
                aria-label="Next feedback"
              >
                <ChevronRight className="w-6 h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div
              className={`
                grid gap-8 transition-opacity duration-1000
                ${isTransitioning ? 'opacity-90' : 'opacity-100'}
                ${itemsPerView === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
                  itemsPerView === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                  'grid-cols-1'}
              `}
            >
              {loading ? (
                // Loading skeletons
                Array.from({ length: itemsPerView }).map((_, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-2xl p-8 animate-pulse"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : visibleFeedbacks.length > 0 ? (
                visibleFeedbacks.map((feedback: Feedback) => (
                  <div
                    key={feedback.id}
                    className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border border-blue-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-slideUp"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {feedback.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                          <Star className="w-2.5 h-2.5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm md:text-lg font-bold text-gray-900">{feedback.userName}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i: number) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < feedback.rating
                                  ? 'text-yellow-400 fill-current animate-pulse'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-2">{feedback.rating}.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-sm md:text-md text-gray-700 italic mb-6 relative">
                      <span className="text-3xl text-blue-200 absolute -top-2 -left-2">"</span>
                      {feedback.comment}
                      <span className="text-3xl text-blue-200 absolute -bottom-4 -right-2">"</span>
                    </p>

                    {/* Date */}
                    <div className="flex items-center justify-between pt-4 border-t border-blue-100">
                      <p className="text-sm text-gray-500">
                        {formatDate(feedback.createdAt, 'short')}
                      </p>
                      
                    </div>
                  </div>
                ))
              ) : (
                // Empty state
                <div className="col-span-full text-center py-12 animate-fadeIn">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
                    <MessageSquare className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Feedback Yet</h3>
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
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-3 px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Add Your Feedback
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Carousel Indicators */}
          {feedbacks.length > itemsPerView && (
            <div className="flex justify-center gap-3 mt-8">
              {Array.from({ length: Math.ceil(feedbacks.length / itemsPerView) }).map((_, groupIndex: number) => (
                <button
                  key={groupIndex}
                  onClick={() => goToSlide(groupIndex * itemsPerView)}
                  disabled={isTransitioning}
                  className="relative p-1 rounded-full transition-all duration-300 hover:scale-110"
                  aria-label={`Go to feedback group ${groupIndex + 1}`}
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ 
                      length: Math.min(itemsPerView, feedbacks.length - (groupIndex * itemsPerView)) 
                    }).map((_, dotIndex: number) => (
                      <div
                        key={dotIndex}
                        className={`
                          w-2 h-2 rounded-full transition-all duration-300
                          ${currentIndex >= (groupIndex * itemsPerView) + dotIndex && 
                           currentIndex < (groupIndex * itemsPerView) + dotIndex + 1
                            ? 'bg-blue-600' 
                            : 'bg-gray-300'
                          }
                        `}
                      />
                    ))}
                  </div>
                  {Math.floor(currentIndex / itemsPerView) === groupIndex && (
                    <div className="absolute inset-0 border-2 border-blue-600 rounded-full animate-pulse-ring" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Average Rating', value: stats.averageRating, suffix: '' },
            { label: 'Customer Satisfaction', value: stats.satisfactionRate, suffix: '%' },
            { label: 'Total Reviews', value: stats.totalReviews, suffix: '' },
            { label: 'Customer Support', value: stats.supportHours, suffix: '' },
          ].map((stat, index: number) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300 animate-slideUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 animate-countUp">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Add custom animations */}
        <style jsx global>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(37, 99, 235, 0);
            }
          }
          
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes countUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-slideUp {
            animation: slideUp 0.6s ease-out forwards;
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          .animate-pulse-glow {
            animation: pulse-glow 2s infinite;
          }
          
          .animate-pulse-ring {
            animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          .animate-countUp {
            animation: countUp 0.8s ease-out forwards;
          }
        `}</style>
      </div>
    </section>
  );
}