'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Search, Filter, Heart, Loader2 } from 'lucide-react';
import { FashionStyle, StyleCategory } from '@/types';

const categories: StyleCategory[] = ['casual', 'official', 'traditional', 'party', 'native'];
const STYLES_PER_PAGE = 9; // Optimal for 3-column grid

export default function StylesPage() {
  const [styles, setStyles] = useState<FashionStyle[]>([]);
  const [filteredStyles, setFilteredStyles] = useState<FashionStyle[]>([]);
  const [displayedStyles, setDisplayedStyles] = useState<FashionStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const stylesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch initial styles
  useEffect(() => {
    fetchInitialStyles();
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let result = [...styles];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(style => style.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(style =>
        style.title.toLowerCase().includes(query) ||
        style.description.toLowerCase().includes(query) ||
        style.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
    }

    setFilteredStyles(result);
    setDisplayedStyles(result.slice(0, STYLES_PER_PAGE));
    setPageNumber(1);
    setHasMore(result.length > STYLES_PER_PAGE);
  }, [styles, selectedCategory, searchQuery, sortBy]);

  // Intersection Observer setup for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !loadingMore && hasMore) {
          loadMoreStyles();
        }
      },
      {
        root: null, // viewport
        rootMargin: '0px 0px 200px 0px', // Load 200px before reaching the end
        threshold: 0.1,
      }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, filteredStyles, pageNumber]);

  const fetchInitialStyles = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'styles'),
        orderBy('createdAt', 'desc'),
        limit(STYLES_PER_PAGE * 2) // Fetch 2 pages initially for better UX
      );
      const snapshot = await getDocs(q);
      const stylesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FashionStyle[];
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setStyles(stylesData);
    } catch (error) {
      console.error('Error fetching initial styles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreStyles = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      
      // Simulate network delay for testing
      await new Promise(resolve => setTimeout(resolve, 500));

      const nextBatchStart = pageNumber * STYLES_PER_PAGE;
      const nextBatchEnd = nextBatchStart + STYLES_PER_PAGE;
      
      if (nextBatchStart < filteredStyles.length) {
        // Load from already filtered styles (client-side)
        const nextStyles = filteredStyles.slice(nextBatchStart, nextBatchEnd);
        setDisplayedStyles(prev => [...prev, ...nextStyles]);
        
        // Check if we have more styles to load
        if (nextBatchEnd >= filteredStyles.length) {
          setHasMore(false);
        }
      } else {
        // Fetch more from Firestore if needed
        const q = query(
          collection(db, 'styles'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(STYLES_PER_PAGE)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setHasMore(false);
          return;
        }
        
        const newStyles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FashionStyle[];
        
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc);
        setStyles(prev => [...prev, ...newStyles]);
      }
      
      setPageNumber(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more styles:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, pageNumber, filteredStyles, lastVisible]);

  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Scroll to top when filter changes
    stylesContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12" ref={stylesContainerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-5 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore Our Style Collection
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover premium men's fashion designs tailored to perfection. From traditional to contemporary styles.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search styles by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Categories
              </button>
              
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-2 justify-center md:justify-end">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
                className="px-4 py-2 border-0 text-white bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>


        {/* Styles Grid */}
        {displayedStyles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
              {displayedStyles.map((style) => (
                <div
                  key={style.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Image */}
                  <Link href={`/styles/${style.id}`}>
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={style.imageUrl}
                        alt={style.title}
                        loading="lazy"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                        <Heart className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">{style.likes?.length || 0}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    <Link href={`/styles/${style.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {style.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {style.description}
                    </p>

                    {/* Price Range */}
                    {style.priceWithFabrics && (
                      <div className="mb-4">
                        <p className="text-lg font-bold text-gray-900">
                          ₦{Number(style.priceWithFabrics).toLocaleString('en-US')}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {/* {style.tags && style.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {style.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        {style.tags.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            +{style.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )} */}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/styles/${style.id}`}
                        className="flex-1 text-center py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Indicator and Sentinel */}
            <div className="mt-12 space-y-4">
              {loadingMore && (
                <div className="flex justify-center items-center py-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading more styles...</span>
                  </div>
                </div>
              )}
              
              {/* Intersection Observer Sentinel */}
              <div 
                ref={sentinelRef} 
                className="h-4 w-full"
                aria-hidden="true"
              />
              
              {!hasMore && displayedStyles.length > 0 && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 font-medium">All styles loaded</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Styles Found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try a different search term' : 'Check back soon for new styles!'}
            </p>
            {(selectedCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Load More Button (Fallback for users without Intersection Observer) */}
        {hasMore && !loadingMore && (
          <div className="mt-8 text-center md:hidden"> {/* Show only on mobile as fallback */}
            <button
              onClick={loadMoreStyles}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load More Styles
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12">
            <h2 className="text-xl md:text-4xl font-bold text-white mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-blue-100 text-sm md:text-xl mb-8 max-w-2xl mx-auto">
              Contact us for custom designs. We can create any style you imagine!
            </p>
            <a
              href={`https://wa.me/2348032205341?text=${encodeURIComponent('Hello OmifemCuts, I would like to discuss a custom design.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-3 py-2 md:px-8 md:py-4 bg-white text-blue-600 text-[10px] md:text-lg font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
              </svg>
              Chat us for Custom Designs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}