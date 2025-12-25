'use client';

import { User } from 'lucide-react';
import { useState } from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  if (src && !error) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center ${className}`}
    >
      <User className={`${iconSizes[size]} text-white`} />
    </div>
  );
}