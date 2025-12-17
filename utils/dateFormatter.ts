import { Timestamp } from 'firebase/firestore';

export function formatFirebaseDate(date: any): Date {
  if (!date) return new Date();
  
  // If it's a Firestore Timestamp
  if (date.toDate && typeof date.toDate === 'function') {
    return date.toDate();
  }
  
  // If it's a string
  if (typeof date === 'string') {
    return new Date(date);
  }
  
  // If it's already a Date
  if (date instanceof Date) {
    return date;
  }
  
  // Default to current date
  return new Date();
}

export function formatDate(date: any, format: 'short' | 'long' = 'long'): string {
  const jsDate = formatFirebaseDate(date);
  
  if (format === 'short') {
    return jsDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  return jsDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}