'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { FashionStyle } from '@/types';
import Link from 'next/link';

interface StyleCarouselProps {
  styles: FashionStyle[];
  loading?: boolean; 
}

export default function StyleCarousel({ styles, loading = false }: StyleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3); 
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2); 
      } else {
        setItemsPerView(1); 
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning && styles.length > itemsPerView && !loading) {
        goToNext();
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isTransitioning, itemsPerView, styles.length, loading]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || styles.length <= itemsPerView || loading) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return Math.max(0, styles.length - itemsPerView);
      }
      return prevIndex - 1;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [styles.length, itemsPerView, isTransitioning, loading]);

  const goToNext = useCallback(() => {
    if (isTransitioning || styles.length <= itemsPerView || loading) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= styles.length - itemsPerView) {
        return 0;
      }
      return prevIndex + 1;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [styles.length, itemsPerView, isTransitioning, loading]);

  // Loading Skeleton Component
  if (loading) {
    return (
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          <div className={`
            grid gap-10
            ${itemsPerView === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
              itemsPerView === 2 ? 'grid-cols-1 md:grid-cols-2' : 
              'grid-cols-1'}
          `}>
            {Array.from({ length: itemsPerView }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg h-full animate-pulse"
              >
                <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent animate-shimmer"></div>
                  
                  <div className="absolute top-4 left-4">
                    <div className="w-20 h-6 bg-gray-300 rounded-full"></div>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded-full"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-3/4"></div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
                  </div>

                  <div className="mt-4">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx global>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
          }
        `}</style>
      </div>
    );
  }

  if (styles.length === 0) {
    return (
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block p-6 bg-gray-100 rounded-2xl mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Styles Available</h3>
          <p className="text-gray-600">Check back soon for new arrivals!</p>
        </div>
      </div>
    );
  }

  // Get only the visible items
  const visibleStyles = styles.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Navigation buttons - Only show if we have more items than can be displayed */}
        {styles.length > itemsPerView && (
          <>
            <button
              onClick={goToPrev}
              disabled={isTransitioning || styles.length <= itemsPerView}
              className={`
                absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8
                bg-white hover:bg-white p-3 rounded-full shadow-xl
                transition-all duration-300 z-10
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110'}
                flex items-center justify-center border border-gray-200
                ${styles.length <= itemsPerView ? 'hidden' : ''}
              `}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              disabled={isTransitioning || styles.length <= itemsPerView}
              className={`
                absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8
                bg-white hover:bg-white p-3 rounded-full shadow-xl
                transition-all duration-300 z-10
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110'}
                flex items-center justify-center border border-gray-200
                ${styles.length <= itemsPerView ? 'hidden' : ''}
              `}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )}

        <div className={`
          grid gap-10 transition-opacity duration-300
          ${isTransitioning ? 'opacity-90' : 'opacity-100'}
          ${itemsPerView === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
            itemsPerView === 2 ? 'grid-cols-1 md:grid-cols-2' : 
            'grid-cols-1'}
        `}>
          {visibleStyles.map((style) => (
            <div
              key={style.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full"
            >
              {/* Image */}
              <Link href={`/styles/${style.id}`} className="block">
                <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
                  <img
                    src={style.imageUrl}
                    alt={style.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-sm font-medium">
                      {style.category}
                    </span>
                  </div>
                  {/* Like Count */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                    <Heart className="w-4 h-4 text-white" />
                    <span className="text-white text-sm">{style.likes?.length || 0}</span>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-6">
                <Link href={`/styles/${style.id}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-1">
                    {style.title}
                  </h3>
                </Link>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {style.description}
                </p>

                <div className="mt-4">
                  <Link
                    href={`/styles/${style.id}`}
                    className="w-full block text-center py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors active:scale-95"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleStyles.length < itemsPerView && (
          Array.from({ length: itemsPerView - visibleStyles.length }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="invisible"
              aria-hidden="true"
            >
            </div>
          ))
        )}
      </div>
      
      <style jsx global>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}