'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Heart, Share2, Clock, Package, PackageCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { FashionStyle } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function StyleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [style, setStyle] = useState<FashionStyle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recommendedStyles, setRecommendedStyles] = useState<FashionStyle[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [hasFabric, setHasFabric] = useState<boolean>(true);

  useEffect(() => {
    if (params.id) {
      fetchStyle();
    }
  }, [params.id]);

  useEffect(() => {
    if (style) {
      fetchRecommendedStyles();
    }
  }, [style]);

  useEffect(() => {
    if (user && style && user.id) {
      const likesArray = Array.isArray(style.likes) ? style.likes : [];
      setLiked(likesArray.includes(user.id));
      setLikesCount(likesArray.length);
    }
  }, [user, style]);

  const fetchStyle = async (): Promise<void> => {
    try {
      const docRef = doc(db, 'styles', params.id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        const styleData: FashionStyle = {
          id: docSnap.id,
          title: data.title || 'Untitled Style',
          description: data.description || 'No description available',
          imageUrl: data.imageUrl || 'https://via.placeholder.com/600x800?text=Style+Image',
          category: data.category || 'casual',
          priceWithoutFabrics: data.priceWithoutFabrics,
          priceWithFabrics: data.priceWithFabrics,
          deliveryTime: data.deliveryTime || '7-14 days',
          likes: Array.isArray(data.likes) ? data.likes.filter(Boolean) : [],
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
          source: data.source || 'upload',
          tags: Array.isArray(data.tags) ? data.tags : [],
        };
        
        setStyle(styleData);
        setLikesCount(styleData.likes.length);
      } else {
        toast.error('Style not found');
      }
    } catch (error) {
      console.error('Error fetching style:', error);
      toast.error('Failed to load style details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedStyles = useCallback(async () => {
    if (!style) return;

    try {
      setLoadingRecommended(true);
      
      // Fetch styles with same category first (excluding current style)
      let recommendedQuery = query(
        collection(db, 'styles'),
        where('category', '==', style.category),
        limit(6) // Fetch more to filter out current
      );
      
      const snapshot = await getDocs(recommendedQuery);
      let recommended = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FashionStyle))
        .filter(s => s.id !== style.id); 

      if (recommended.length < 3) {
        const popularQuery = query(
          collection(db, 'styles'),
          limit(6)
        );
        const popularSnapshot = await getDocs(popularQuery);
        const popular = popularSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as FashionStyle))
          .filter(s => s.id !== style.id && !recommended.find(r => r.id === s.id));

        recommended = [...recommended, ...popular];
      }

      recommended.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      setRecommendedStyles(recommended.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recommended styles:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoadingRecommended(false);
    }
  }, [style]);

  const handleLike = async (): Promise<void> => {
    if (!user || !user.id) {
      toast.error('Please login to like styles');
      return;
    }

    if (!style) return;

    try {
      const styleRef = doc(db, 'styles', style.id);
      
      if (liked) {
        await updateDoc(styleRef, {
          likes: arrayRemove(user.id)
        });
        setLiked(false);
        setLikesCount(prev => prev - 1);
        
        setStyle(prev => prev ? {
          ...prev,
          likes: prev.likes.filter(uid => uid !== user.id)
        } : null);
        toast.success('Removed from likes');
      } else {
        await updateDoc(styleRef, {
          likes: arrayUnion(user.id)
        });
        setLiked(true);
        setLikesCount(prev => prev + 1);
        
        setStyle(prev => prev ? {
          ...prev,
          likes: [...prev.likes, user.id]
        } : null);
        toast.success('Added to likes');
      }
    } catch (error: any) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like. Please try again.');
    }
  };

  const handleWhatsAppRedirect = (): void => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    const priceValue = hasFabric 
      ? (style?.priceWithFabrics?.toLocaleString('en-NG') || 'TBD')
      : (style?.priceWithoutFabrics?.toLocaleString('en-NG') || 'TBD');
    
    const priceType = hasFabric ? 'with fabric included' : 'with your own fabric';
    
    const message = encodeURIComponent(
      `Hello OmifemCuts, I'm interested in this style:\n\n` +
      `*${style?.title}*\n` +
      `${style?.description}\n\n` +
      `💰 Price (${priceType}): ₦${priceValue}\n` +
      `⏰ Delivery: ${style?.deliveryTime || '7-14 days'} days\n` +
      `🔗 View Style: ${currentUrl}\n\n` +
      `I ${hasFabric ? "have" : " don't have"} my own fabric. How much will it cost and how many days will delivery take?`
    );
    
    const whatsappUrl = `https://wa.me/2348032205341?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const PriceToggleSection = () => {
    if (!style) return null;

    const showWithFabric = hasFabric;
    const priceValue = Number(showWithFabric ? style.priceWithFabrics : style.priceWithoutFabrics);
    const priceTitle = showWithFabric ? "Price (Customer provides Fabric)" : "Price (We Source the Best Fabric for You)";
    const priceDescription = showWithFabric 
      ? "Tailoring cost only."
      : "Complete package includes fabric + tailoring";

    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
              <p className="text-base sm:text-lg font-semibold text-gray-800 text-center sm:text-left">
                {priceTitle}
              </p>
              {priceValue ? (
                <p className="text-2xl xs:text-3xl sm:text-4xl font-bold text-red-900 text-center sm:text-right">
                  ₦{priceValue.toLocaleString('en-NG')}
                </p>
              ) : (
                <p className="text-lg sm:text-xl font-bold text-gray-500 text-center sm:text-right">
                  Price on request
                </p>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-3 text-center sm:text-left">
              {priceDescription}
            </p>
            
            <button
              onClick={() => setHasFabric(!hasFabric)}
              className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300 group active:scale-[0.98]"
              aria-label={`Switch to ${hasFabric ? 'bring your own fabric' : 'full package with fabric'} pricing`}
            >
              <div className="flex-shrink-0">
                {hasFabric ? (
                  <Package className="w-5 h-5 text-blue-600" />
                ) : (
                  <PackageCheck className="w-5 h-5 text-green-600" />
                )}
              </div>
              <span className="font-medium text-gray-800 text-sm sm:text-base">
                {hasFabric ? "No fabric?" : "Have fabric?"}
              </span>
              <span className="hidden xs:inline text-sm text-blue-600 font-semibold group-hover:translate-x-1 transition-transform ml-auto sm:ml-0">
                Switch →
              </span>
              <span className="xs:hidden text-sm text-blue-600 font-semibold">
                →
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 md:pt-4 border-t border-blue-100">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Delivery Time: <span className="md:text-lg font-bold text-gray-900">
                    {style.deliveryTime} Days
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  From order confirmation • {hasFabric ? 'Includes fabric sourcing time' : 'Tailoring only'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RecommendedStylesSection = () => {
    if (loadingRecommended) {
      return (
        <div className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading recommendations...</span>
          </div>
        </div>
      );
    }

    if (recommendedStyles.length === 0) {
      return null;
    }

    return (
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900">You Might Also Like</h2>
            <p className="text-sm md:text-xl text-gray-600 mt-2">Explore more {style?.category} styles you might love</p>
          </div>
          <div className='hidden md:block'>
            <Link 
              href="/styles" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedStyles.map((recommendedStyle) => (
            <div
              key={recommendedStyle.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Link href={`/styles/${recommendedStyle.id}`}>
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={recommendedStyle.imageUrl}
                    alt={recommendedStyle.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-xs font-medium">
                      {recommendedStyle.category}
                    </span>
                  </div>
                  {recommendedStyle.likes && recommendedStyle.likes.length > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                      <Heart className="w-3 h-3 text-white" />
                      <span className="text-white text-xs">{recommendedStyle.likes.length}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 hover:text-blue-600 transition-colors">
                    {recommendedStyle.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recommendedStyle.description}
                  </p>

                  {recommendedStyle.priceWithFabrics && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="font-bold text-gray-900">
                        ₦{Number(recommendedStyle.priceWithFabrics).toLocaleString('en-NG')}
                      </p>
                      <span className="text-xs text-gray-500">
                        {recommendedStyle.deliveryTime || '7-14'} days
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!style) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Style Not Found</h2>
          <p className="text-gray-600">The requested style could not be found.</p>
          <Link 
            href="/styles" 
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Styles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-6">
          <div className="relative h-[350px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl">
            <img
              src={style.imageUrl}
              alt={style.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className="px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                {style.category.charAt(0).toUpperCase() + style.category.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleLike}
              disabled={!user}
              className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold transition-colors ${
                liked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-600 text-red-600' : ''}`} />
              {liked ? 'Liked' : 'Like'} ({likesCount})
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleWhatsAppRedirect}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-8">
          <div>
            <h1 className="text-lg md:text-3xl capitalize font-bold text-black mb-2">{style.title}</h1>
            <p className="text-gray-500 text-sm md:text-xl leading-relaxed">{style.description}</p>
          </div>

          {/* Price & Delivery Toggle Section */}
          <PriceToggleSection />

          {/* Tags */}
          {style.tags && style.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Style Features</h3>
              <div className="flex flex-wrap gap-2">
                {style.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Button */}
          <div className="space-y-4 pt-4">
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white text-base md:text-lg font-bold rounded-2xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg"
            >
              <svg className="w-5 md:w-7 h-5 md:h-7 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
              </svg>
              Contact via WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Styles Section */}
      <RecommendedStylesSection />
    </div>
  );
}