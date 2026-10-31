export type ProductCondition = 'novo' | 'usado';

export type ProductCategory = 
  | 'Todos'
  | 'Eletrônicos & Tech'
  | 'Moda & Calçados'
  | 'Música & Áudio'
  | 'Casa & Design'
  | 'Fotografia'
  | 'Outros';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverPhoto?: string;
  rating: number;
  totalSales: number;
  reviewCount?: number;
  verified: boolean;
  bio?: string;
  location: string;
  phone?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerUsername: string;
  buyerAvatar: string;
  rating: number;
  comment: string;
  productId?: string;
  productTitle?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  seller: User;
  sellerId: string;
  title: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  category: ProductCategory;
  description: string;
  images: string[];
  likes: number;
  likedBy: string[];
  isLiked?: boolean;
  comments: Comment[];
  commentsCount?: number;
  location: string;
  createdAt: string;
  isSaved?: boolean;
  status: 'disponivel' | 'reservado' | 'vendido';
  buyerId?: string;
  viewsCount?: number;
}

export interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  offerPrice?: number;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participant: User;
  product?: {
    id: string;
    title: string;
    price: number;
    image: string;
    condition: ProductCondition;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'message' | 'offer' | 'sale';
  title: string;
  description: string;
  time: string;
  read: boolean;
  postId?: string;
  userAvatar?: string;
}

export type ThemeChoice = 'dark' | 'light' | 'pure_black';

export type ActiveTab = 'feed' | 'messages' | 'notifications' | 'settings' | 'profile';
