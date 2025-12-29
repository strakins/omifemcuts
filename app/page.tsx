'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import HeroSection from '@/components/HeroSection';
import StyleCarousel from '@/components/StyleCarousel';
import ServicesSection from '@/components/ServicesSection';
import FeedbackSection from '@/components/FeedbackSection';
import { FashionStyle, Feedback } from '@/types';

export default function Home() {
  const [latestStyles, setLatestStyles] = useState<FashionStyle[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestStyles();
    setLoading(true)
    fetchFeedbacks();
  }, []);

  //   try {
  //     const q = query(
  //       collection(db, 'styles'),
  //       orderBy('createdAt', 'desc'),
  //       limit(7)
  //     );
  //     const snapshot = await getDocs(q);
  //     const styles = snapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //     })) as FashionStyle[];
  //     setLatestStyles(styles);
  //   } catch (error) {
  //     console.error('Error fetching styles:', error);
  //   }
  // };

  // Fisher-Yates shuffle algorithm for better randomization
  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchLatestStyles = async () => {
    try {
      // Fetch all styles from database
      const q = query(
        collection(db, 'styles')
        // Remove orderBy to get true random, but keep for consistency
      );
      const snapshot = await getDocs(q);
      const allStyles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FashionStyle[];

      // Shuffle using Fisher-Yates algorithm
      const randomStyles = shuffleArray(allStyles);

      setLatestStyles(randomStyles);
    } catch (error) {
      console.error('Error fetching styles:', error);
    }
  };
  const fetchFeedbacks = async () => {
    try {
      const q = query(
        collection(db, 'feedbacks'),
        orderBy('createdAt', 'desc'),
        limit(6)
      );
      const snapshot = await getDocs(q);
      const feedbacks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Feedback[];
      setFeedbacks(feedbacks.filter(fb => fb.approved));
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Latest Styles
        </h2>
        <StyleCarousel 
          styles={latestStyles} 
          loading={loading}
        />
      </section>
      
      <ServicesSection />
      
      <FeedbackSection feedbacks={feedbacks} loading={loading} />
    </div>
  );
}