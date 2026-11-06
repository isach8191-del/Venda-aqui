import { LanguageCode } from '../i18n/types';

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
  role?: 'user' | 'admin';
  isAdmin?: boolean;
  isBlocked?: boolean;
  blockedUserIds?: string[];
  bio?: string;
  location: string;
  country?: string;
  locationUpdatedAt?: string;
  phone?: string;
  preferredLanguage?: LanguageCode;
  preferredCurrency?: string;
  createdAt?: string;
  lastSeen?: string;
}

export function isUserOnline(lastSeen?: string): boolean {
  if (!lastSeen) return false;
  const time = new Date(lastSeen).getTime();
  if (isNaN(time)) return false;
  return Date.now() - time < 60000;
}

export type ShopType = 
  | 'Roupa e calçados'
  | 'Eletrónicos e telemóveis'
  | 'Supermercado e mercearia'
  | 'Material de construção'
  | 'Cosméticos e beleza'
  | 'Móveis e casa'
  | 'Peças e oficinas'
  | 'Alimentação e restaurantes'
  | 'Serviços (reparações, transporte, etc.)'
  | 'Outros';

export interface ShopProduct {
  id: string;
  shopId: string;
  title: string;
  description?: string;
  price: number;
  image: string;
  status: 'disponivel' | 'esgotado';
  createdAt: string;
}

export interface ShopReview {
  id: string;
  shopId: string;
  userId: string;
  userName: string;
  userUsername?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  ownerEmail?: string;
  name: string;
  shopType: ShopType;
  country?: string;
  city: string;
  address: string; // bairro / endereço
  phone: string; // telefone / WhatsApp
  whatsapp?: string;
  openingHours: string; // horário de funcionamento
  hasDelivery: boolean; // se faz entregas (sim/não)
  logo: string;
  coverPhoto: string;
  description: string;
  verified: boolean; // selo de verificada gerido só pelo administrador
  rating: number; // 1 a 5 estrelas
  reviewCount: number;
  currency?: string;
  createdAt: string;
}

export type ReportReason = 'golpe' | 'conteudo_ofensivo' | 'produto_proibido' | 'outro';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'post' | 'user' | 'shop';
  targetId: string;
  targetTitle?: string;
  targetUserId?: string;
  reason: ReportReason;
  description: string;
  status: 'pendente' | 'resolvido' | 'descartado';
  createdAt: string;
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
  country?: string;
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
  audioUrl?: string;
  audioDuration?: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: 'image' | 'file' | 'audio';
  timestamp: string;
  createdAt?: string;
  seenAt?: string | null;
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
  userId?: string;
  type: 'like' | 'comment' | 'message' | 'offer' | 'sale' | 'review' | 'system';
  title: string;
  description: string;
  time?: string;
  createdAt?: string;
  read: boolean;
  postId?: string;
  postTitle?: string;
  commentText?: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  userAvatar?: string;
}

export type ThemeChoice = 'dark' | 'light' | 'pure_black';

export type ActiveTab = 'feed' | 'shops' | 'messages' | 'notifications' | 'settings' | 'profile' | 'shop_detail';
