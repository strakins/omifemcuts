// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
// import { FashionStyle } from '@/types';
// import Link from 'next/link';

// interface StyleCarouselProps {
//   styles: FashionStyle[];
// }

// export default function StyleCarousel({ styles }: StyleCarouselProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => 
//         prevIndex === styles.length - 1 ? 0 : prevIndex + 1
//       );
//     }, 10000); // 10 seconds

//     return () => clearInterval(interval);
//   }, [styles.length]);

//   const goToSlide = (index: number) => {
//     setCurrentIndex(index);
//   };

//   const goToPrev = () => {
//     setCurrentIndex((prevIndex) => 
//       prevIndex === 0 ? styles.length - 1 : prevIndex - 1
//     );
//   };

//   const goToNext = () => {
//     setCurrentIndex((prevIndex) => 
//       prevIndex === styles.length - 1 ? 0 : prevIndex + 1
//     );
//   };

//   if (styles.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-gray-600">No styles available yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full max-w-6xl mx-auto">
//       <div className="overflow-hidden rounded-2xl shadow-xl">
//         <div
//           className="flex transition-transform duration-500 ease-in-out"
//           style={{ transform: `translateX(-${currentIndex * 100}%)` }}
//         >
//           {styles.map((style) => (
//             <div
//               key={style.id}
//               className="w-full flex-shrink-0"
//             >
//               <div className="relative h-[500px] md:h-[600px]">
//                 <img
//                   src={style.imageUrl}
//                   alt={style.title}
//                   className="object-cover"
//                   sizes="100vw"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
//                   <div className="absolute bottom-0 left-0 right-0 p-8">
//                     <div className="max-w-2xl mx-auto">
//                       <h3 className="text-3xl font-bold text-white mb-3">
//                         {style.title}
//                       </h3>
//                       <p className="text-gray-200 mb-4 line-clamp-2">
//                         {style.description}
//                       </p>
//                       <div className="flex items-center gap-4">
//                         <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
//                           {style.category}
//                         </span>
//                         <Link
//                           href={`/styles/${style.id}`}
//                           className="px-6 py-2 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
//                         >
//                           View Details
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Navigation buttons */}
//       <button
//         onClick={goToPrev}
//         className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
//         aria-label="Previous slide"
//       >
//         <ChevronLeft className="w-6 h-6" />
//       </button>
//       <button
//         onClick={goToNext}
//         className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
//         aria-label="Next slide"
//       >
//         <ChevronRight className="w-6 h-6" />
//       </button>

//       {/* Indicators */}
//       <div className="flex justify-center mt-6 gap-2">
//         {styles.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => goToSlide(index)}
//             className={`w-3 h-3 rounded-full transition-all ${
//               index === currentIndex 
//                 ? 'bg-blue-600 w-8' 
//                 : 'bg-gray-300 hover:bg-gray-400'
//             }`}
//             aria-label={`Go to slide ${index + 1}`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { FashionStyle } from '@/types';
import Link from 'next/link';

interface StyleCarouselProps {
  styles: FashionStyle[];
}

export default function StyleCarousel({ styles }: StyleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= styles.length - itemsPerView) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [styles.length, itemsPerView]);

  const goToSlide = useCallback((index: number) => {
    // Ensure index is within bounds
    const maxIndex = Math.max(0, styles.length - itemsPerView);
    setCurrentIndex(Math.min(index, maxIndex));
  }, [styles.length, itemsPerView]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return Math.max(0, styles.length - itemsPerView);
      }
      return prevIndex - 1;
    });
  }, [styles.length, itemsPerView]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex >= styles.length - itemsPerView) {
        return 0;
      }
      return prevIndex + 1;
    });
  }, [styles.length, itemsPerView]);

  if (styles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No styles available yet.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(styles.length * 100) / itemsPerView}%`
          }}
        >
          {styles.map((style) => (
            <div
              key={style.id}
              className="p-4"
              style={{ width: `${140 / itemsPerView}%` }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                {/* Image */}
                <Link href={`/styles/${style.id}`}>
                  <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
                    <img
                      src={style.imageUrl}
                      alt={style.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-sm font-medium">
                        {style.category}
                      </span>
                    </div>
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
                      className="w-full block text-center py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons - Only show if we have more items than can be displayed */}
      {styles.length > itemsPerView && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all hidden md:block"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all hidden md:block"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Indicators */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: Math.max(1, styles.length - itemsPerView + 1) }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-blue-600 w-8' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}