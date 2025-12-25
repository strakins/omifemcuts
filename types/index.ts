export type User = {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: Date;
};

export type UserRole = 'user' | 'admin';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
}

export type StyleCategory = 'casual' | 'official' | 'traditional' | 'party' | 'native';

export type FashionStyle = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: StyleCategory;
  priceWithoutFabrics?: number;
  priceWithFabrics?: number;
  deliveryTime?: string;
  likes: string[]; // array of user IDs who liked this style
  createdAt: Date;
  updatedAt: Date;
  source?: 'upload' | 'pinterest';
  tags: string[];
};

export type Feedback = {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  comment: string;
  rating: number;
  createdAt: Date;
  approved: boolean;
};

export type Analytics = {
  totalUsers: number;
  totalStyles: number;
  totalFeedback: number;
  totalLikes: number;
  recentSignups: User[];
  popularStyles: FashionStyle[];
};