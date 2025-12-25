'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { FashionStyle } from '@/types';
import Link from 'next/link';

interface StyleCarouselProps {
  styles: FashionStyle[];
}

export default function StyleCarousel({ styles }: StyleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning && styles.length > itemsPerView) {
        goToNext();
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [isTransitioning, itemsPerView, styles.length]);

  const goToSlide = useCallback((index: number) => {
    const maxIndex = Math.max(0, styles.length - itemsPerView);
    const targetIndex = Math.min(Math.max(0, index), maxIndex);
    
    if (targetIndex !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(targetIndex);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [styles.length, itemsPerView, currentIndex]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || styles.length <= itemsPerView) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return Math.max(0, styles.length - itemsPerView);
      }
      return prevIndex - 1;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [styles.length, itemsPerView, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning || styles.length <= itemsPerView) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= styles.length - itemsPerView) {
        return 0;
      }
      return prevIndex + 1;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [styles.length, itemsPerView, isTransitioning]);

  if (styles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No styles available yet.</p>
      </div>
    );
  }

  // Get only the visible items
  const visibleStyles = styles.slice(currentIndex, currentIndex + itemsPerView);
  const totalGroups = Math.ceil(styles.length / itemsPerView);
  const currentGroup = Math.floor(currentIndex / itemsPerView);

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Main Carousel Container with Fixed Grid */}
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

        {/* Fixed Grid Container - Always shows exact number of items */}
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

                {/* Action Button */}
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

        {/* If we have fewer items than itemsPerView, add placeholders */}
        {visibleStyles.length < itemsPerView && (
          Array.from({ length: itemsPerView - visibleStyles.length }).map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="invisible"
              aria-hidden="true"
            >
              {/* Invisible placeholder to maintain grid layout */}
            </div>
          ))
        )}
      </div>
      
      {/* Add custom animation for pulse ring */}
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