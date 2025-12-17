'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Filter, Heart } from 'lucide-react';
import { FashionStyle, StyleCategory } from '@/types';

const categories: StyleCategory[] = ['casual', 'official', 'traditional', 'party', 'native'];

export default function StylesPage() {
  const [styles, setStyles] = useState<FashionStyle[]>([]);
  const [filteredStyles, setFilteredStyles] = useState<FashionStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  useEffect(() => {
    fetchStyles();
  }, []);

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
        style.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.likes.length - a.likes.length);
    }

    setFilteredStyles(result);
  }, [styles, selectedCategory, searchQuery, sortBy]);

  const fetchStyles = async () => {
    try {
      const q = query(
        collection(db, 'styles'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const stylesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FashionStyle[];
      
      setStyles(stylesData);
      setFilteredStyles(stylesData);
    } catch (error) {
      console.error('Error fetching styles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Our Style Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
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
                  onClick={() => setSelectedCategory(category)}
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
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Styles Grid */}
        {filteredStyles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
            {filteredStyles.map((style) => (
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
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-sm font-medium">
                        {style.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                      <Heart className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">{style.likes.length}</span>
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
                  {style.priceRange && (
                    <div className="mb-4">
                      <p className="text-lg font-bold text-gray-900">
                        ₦{style.priceRange.min.toLocaleString()} - ₦{style.priceRange.max.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {style.tags && style.tags.length > 0 && (
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
                  )}

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
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
              Contact us for custom designs. We can create any style you imagine!
            </p>
            <a
              href={`https://wa.me/2348032205341?text=${encodeURIComponent('Hello OmifemCuts, I would like to discuss a custom design.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105"
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
              </svg>
              WhatsApp for Custom Designs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}