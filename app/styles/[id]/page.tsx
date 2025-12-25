'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Heart, Share2, Clock} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { FashionStyle } from '@/types';
import toast from 'react-hot-toast';

export default function StyleDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [style, setStyle] = useState<FashionStyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchStyle();
    }
  }, [params.id]);

  useEffect(() => {
    if (user && style && user.id) {
      const likesArray = Array.isArray(style.likes) ? style.likes : [];
      setLiked(likesArray.includes(user.id));
      setLikesCount(likesArray.length);
    }
  }, [user, style]);

  const fetchStyle = async () => {
    try {
      const docRef = doc(db, 'styles', params.id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(data)
        
        // Ensure all fields are properly set
        const styleData: FashionStyle = {
          id: docSnap.id,
          title: data.title || 'Untitled Style',
          description: data.description || 'No description available',
          imageUrl: data.imageUrl || 'https://via.placeholder.com/600x800?text=Style+Image',
          category: data.category || 'casual',
          priceWithoutFabrics: data.priceWithoutFabrics,
          priceWithFabrics: data.priceWithFabrics,
          deliveryTime: data.deliveryTime || '7-14 days',
          likes: Array.isArray(data.likes) ? data.likes.filter(Boolean) : [], // Filter out any null/undefined
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

  const handleLike = async () => {
    // Check if user is logged in and has a valid ID
    if (!user || !user.id) {
      toast.error('Please login to like styles');
      return;
    }

    if (!style) return;

    try {
      const styleRef = doc(db, 'styles', style.id);
      
      if (liked) {
        // Remove like
        await updateDoc(styleRef, {
          likes: arrayRemove(user.id)
        });
        setLiked(false);
        setLikesCount(prev => prev - 1);
        
        // Update local state
        setStyle(prev => prev ? {
          ...prev,
          likes: prev.likes.filter(uid => uid !== user.id)
        } : null);
        toast.success('Removed from likes');
      } else {
        // Add like - ensure we're passing a valid string
        await updateDoc(styleRef, {
          likes: arrayUnion(user.id)
        });
        setLiked(true);
        setLikesCount(prev => prev + 1);
        
        // Update local state
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

  const handleWhatsAppRedirect = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const message = encodeURIComponent(
      `Hello OmifemCuts, I'm interested in this style:\n\n` +
      `✨ *${style?.title}* ✨\n` +
      `${style?.description}\n\n` +
      `💰 Price With Fabric: ₦${style?.priceWithFabrics?.toLocaleString() || 'TBD'} Price With Fabric${style?.priceWithoutFabrics?.toLocaleString() || 'TBD'}\n` +
      `⏰ Delivery: ${style?.deliveryTime || '7-14 days'}\n` +
      `🔗 View Style: ${currentUrl}\n\n` +
      `How much will it cost to get this dress and how many days will it take to be delivered?`
    );
    
    const whatsappUrl = `https://wa.me/2348032205341?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="space-y-6">
          <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl">
            <img
              src={style.imageUrl}
              alt={style.title}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
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
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">{style.title}</h1>
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed">{style.description}</p>
          </div>

          {/* Price & Delivery Info */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 space-y-6">
            {style.priceWithFabrics && (
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price </p>
                  <p className="text-[12px] text-black italic mt-1">Cost of tailoring only. (Customer Provides Fabrics)</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-900">
                    ₦{style.priceWithFabrics.toLocaleString()}

                  </p>
                </div>
              </div>
            )}

      
            {style.priceWithoutFabrics && (
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price </p>
                  <p className="text-[12px] text-black italic mt-1">Cost of tailoring only. (Customer Provides Fabrics)</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-900">
                    ₦{style.priceWithoutFabrics.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
      
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Delivery Time: <span className="text-md md:text-lg font-semibold text-gray-900">{style.deliveryTime} Days</span></p>
                <p >
                  
                </p>
                <p className="text-[12px] text-gray-500 mt-1 italic">From order confirmation</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {style.tags && style.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Style Features</h3>
              <div className="flex flex-wrap gap-2">
                {style.tags.map((tag) => (
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

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-bold rounded-2xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-lg"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411"/>
              </svg>
              Contact via WhatsApp
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}