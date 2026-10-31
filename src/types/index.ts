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
  avatar: string;
  rating: number;
  totalSales: number;
  verified: boolean;
  bio?: string;
  location: string;
  phone?: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  seller: User;
  title: string;
  price: number;
  currency: string;
  condition: ProductCondition;
  category: ProductCategory;
  description: string;
  images: string[];
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  location: string;
  createdAt: string;
  isSaved?: boolean;
  status: 'disponivel' | 'reservado' | 'vendido';
  viewsCount?: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  offerPrice?: number;
}

export interface Conversation {
  id: string;
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
  type: 'like' | 'comment' | 'message' | 'offer' | 'sale';
  title: string;
  description: string;
  time: string;
  read: boolean;
  postId?: string;
  userAvatar?: string;
}

export type ThemeChoice = 'dark' | 'light' | 'pure_black';

export type ActiveTab = 'feed' | 'messages' | 'notifications' | 'settings';
