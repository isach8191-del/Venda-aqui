import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Post, 
  Comment,
  Conversation, 
  NotificationItem, 
  ThemeChoice, 
  ActiveTab, 
  ProductCondition, 
  ProductCategory,
  Shop,
  ShopType,
  ShopProduct,
  ShopReview,
  Report,
  ReportReason
} from '../types';
import { 
  auth, 
  db, 
  storage, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  deleteDoc, 
  where,
  getDocs 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DEFAULT_AVATAR, DEFAULT_COVER } from '../data/seedData';
import { 
  LanguageCode, 
  TranslationSchema, 
  CurrencyCode,
  detectDeviceLanguage, 
  getTranslation, 
  getLanguageInfo, 
  formatCurrency, 
  formatDate, 
  formatRelativeTime,
  TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  SUPPORTED_CURRENCIES,
  POPULAR_COUNTRIES,
  getCountryName
} from '../i18n';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Multilingual & Region State
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: TranslationSchema;
  isRTL: boolean;
  preferredCountry: string;
  setPreferredCountry: (country: string) => void;
  preferredCurrency: CurrencyCode;
  setPreferredCurrency: (curr: CurrencyCode) => void;
  selectedCountryFilter: string;
  setSelectedCountryFilter: (c: string) => void;
  formatPrice: (amount: number, currency?: string) => string;
  formatPostDate: (date: string | number | Date) => string;
  formatRelativePostTime: (date: string | number | Date) => string;
  translatePost: (post: Post) => Promise<{ title: string; description: string }>;
  postTranslations: Record<string, { title: string; description: string; lang: LanguageCode }>;
  
  posts: Post[];
  postsLoading: boolean;
  activeFilter: 'todos' | 'novo' | 'usado';
  setActiveFilter: (filter: 'todos' | 'novo' | 'usado') => void;
  activeCategory: ProductCategory;
  setActiveCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;
  activeCommentsPost: Post | null;
  setActiveCommentsPost: (post: Post | null) => void;
  activeOfferPost: Post | null;
  setActiveOfferPost: (post: Post | null) => void;
  selectedProfileUser: User | null;
  openUserProfile: (userOrId: User | string) => Promise<void>;
  closeUserProfile: () => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Auth Actions
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, username: string, location: string, country?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Marketplace Actions
  createPost: (data: {
    title: string;
    price: number;
    currency?: string;
    condition: ProductCondition;
    category: ProductCategory;
    description: string;
    imageFile?: File | null;
    imagePreviewUrl?: string;
    location: string;
    country?: string;
  }) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string, offerPrice?: number) => Promise<void>;
  startChatWithSeller: (post: Post, initialGreeting?: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  updateUserProfile: (data: {
    name: string;
    bio: string;
    location: string;
    country?: string;
    phone?: string;
    preferredLanguage?: LanguageCode;
    preferredCurrency?: string;
    avatarFile?: File | null;
    coverFile?: File | null;
  }) => Promise<void>;
  activeReviewTarget: { seller: User; post?: Post } | null;
  setActiveReviewTarget: (target: { seller: User; post?: Post } | null) => void;
  addReviewToSeller: (sellerId: string, rating: number, comment: string, productId?: string, productTitle?: string) => Promise<void>;
  markPostAsCompleted: (postId: string) => Promise<void>;
  fetchSellerReviews: (sellerId: string) => Promise<any[]>;

  // Admin & Reports & Blocking
  isAdmin: boolean;
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (open: boolean) => void;
  activeReportTarget: { targetType: 'post' | 'user' | 'shop'; targetId: string; targetTitle?: string; targetUserId?: string } | null;
  setActiveReportTarget: (target: { targetType: 'post' | 'user' | 'shop'; targetId: string; targetTitle?: string; targetUserId?: string } | null) => void;
  submitReport: (data: {
    targetType: 'post' | 'user' | 'shop';
    targetId: string;
    targetTitle?: string;
    targetUserId?: string;
    reason: ReportReason;
    description: string;
  }) => Promise<void>;
  blockUser: (targetUserId: string) => Promise<void>;
  unblockUser: (targetUserId: string) => Promise<void>;
  isTermsModalOpen: boolean;
  setIsTermsModalOpen: (open: boolean) => void;
  termsModalMode: 'terms' | 'about';
  setTermsModalMode: (mode: 'terms' | 'about') => void;

  // Lojas & Negócios (Shops)
  shops: Shop[];
  shopsLoading: boolean;
  selectedShop: Shop | null;
  openShopDetail: (shopOrId: Shop | string) => Promise<void>;
  closeShopDetail: () => void;
  isRegisterShopModalOpen: boolean;
  setIsRegisterShopModalOpen: (open: boolean) => void;
  isEditShopModalOpen: boolean;
  setIsEditShopModalOpen: (open: boolean) => void;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  activeShopReviewModal: Shop | null;
  setActiveShopReviewModal: (shop: Shop | null) => void;
  shopProducts: ShopProduct[];
  shopProductsLoading: boolean;
  registerShop: (data: {
    name: string;
    shopType: ShopType;
    city: string;
    address: string;
    phone: string;
    whatsapp?: string;
    openingHours: string;
    hasDelivery: boolean;
    description: string;
    logoFile?: File | null;
    coverFile?: File | null;
  }) => Promise<void>;
  updateShop: (shopId: string, data: Partial<Shop> & { logoFile?: File | null; coverFile?: File | null }) => Promise<void>;
  deleteShop: (shopId: string) => Promise<void>;
  toggleShopVerification: (shopId: string, currentStatus: boolean) => Promise<void>;
  addShopProduct: (shopId: string, data: {
    title: string;
    description?: string;
    price: number;
    status: 'disponivel' | 'esgotado';
    imageFile?: File | null;
    imageUrl?: string;
  }) => Promise<void>;
  toggleShopProductStatus: (shopId: string, productId: string, currentStatus: 'disponivel' | 'esgotado') => Promise<void>;
  deleteShopProduct: (shopId: string, productId: string) => Promise<void>;
  addShopReview: (shopId: string, rating: number, comment: string) => Promise<void>;
  fetchShopReviews: (shopId: string) => Promise<ShopReview[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const saved = localStorage.getItem('venda_aqui_theme');
    return (saved as ThemeChoice) || 'dark';
  });

  // Multilingual & Regional state
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('venda_aqui_language');
    if (saved && TRANSLATIONS[saved as LanguageCode]) {
      return saved as LanguageCode;
    }
    return detectDeviceLanguage();
  });

  const [preferredCountry, setPreferredCountryState] = useState<string>(() => {
    return localStorage.getItem('venda_aqui_country') || '';
  });

  const [preferredCurrency, setPreferredCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('venda_aqui_currency');
    if (saved) return saved as CurrencyCode;
    return getLanguageInfo(language).defaultCurrency;
  });

  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('');
  const [postTranslations, setPostTranslations] = useState<Record<string, { title: string; description: string; lang: LanguageCode }>>({});

  const t = getTranslation(language);
  const isRTL = language === 'ar';

  // Synchronize HTML attributes, direction (RTL for Arabic) and SEO title/description
  useEffect(() => {
    localStorage.setItem('venda_aqui_language', language);
    const root = document.documentElement;
    root.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    root.setAttribute('lang', language);

    // Update document title & metadata dynamically
    document.title = t.seo.title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t.seo.description);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t.seo.title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', t.seo.description);
    }
  }, [language, isRTL, t]);

  const setPreferredCountry = (countryCode: string) => {
    setPreferredCountryState(countryCode);
    localStorage.setItem('venda_aqui_country', countryCode);
  };

  const setPreferredCurrency = (curr: CurrencyCode) => {
    setPreferredCurrencyState(curr);
    localStorage.setItem('venda_aqui_currency', curr);
  };

  const setLanguage = async (newLang: LanguageCode) => {
    setLanguageState(newLang);
    localStorage.setItem('venda_aqui_language', newLang);
    const info = getLanguageInfo(newLang);
    if (info) {
      setPreferredCurrencyState(info.defaultCurrency);
      localStorage.setItem('venda_aqui_currency', info.defaultCurrency);
    }

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          preferredLanguage: newLang,
          preferredCurrency: info?.defaultCurrency || 'MZN',
        });
        setUser((prev) => prev ? { ...prev, preferredLanguage: newLang, preferredCurrency: info?.defaultCurrency } : null);
      } catch (err) {
        console.warn('Could not persist language to user document:', err);
      }
    }
  };

  const formatPrice = (amount: number, currency?: string) => {
    return formatCurrency(amount, currency || preferredCurrency, language);
  };

  const formatPostDate = (date: string | number | Date) => {
    return formatDate(date, language);
  };

  const formatRelativePostTime = (date: string | number | Date) => {
    return formatRelativeTime(date, language);
  };

  // Translation of listing via backend Gemini API
  const translatePost = async (post: Post): Promise<{ title: string; description: string }> => {
    const cacheKey = `${post.id}_${language}`;
    if (postTranslations[cacheKey]) {
      return postTranslations[cacheKey];
    }

    try {
      const langInfo = getLanguageInfo(language);
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: post.title,
          description: post.description,
          targetLang: language,
          targetLangName: langInfo.nativeName,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const result = {
        title: data.translatedTitle || post.title,
        description: data.translatedDescription || post.description,
        lang: language,
      };

      setPostTranslations((prev) => ({
        ...prev,
        [cacheKey]: result,
      }));

      return result;
    } catch (err) {
      console.error('Translation error:', err);
      return {
        title: post.title,
        description: post.description,
        lang: language,
      };
    }
  };

  // Auth & Profile State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');

  // Selected Profile for Facebook-style user page
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Real Marketplace Data
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'novo' | 'usado'>('todos');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Lojas & Negócios State
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [shopProductsLoading, setShopProductsLoading] = useState(false);
  const [isRegisterShopModalOpen, setIsRegisterShopModalOpen] = useState(false);
  const [isEditShopModalOpen, setIsEditShopModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [activeShopReviewModal, setActiveShopReviewModal] = useState<Shop | null>(null);

  // Conversations & Notifications
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & Panels
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [activeOfferPost, setActiveOfferPost] = useState<Post | null>(null);
  const [activeReviewTarget, setActiveReviewTarget] = useState<{ seller: User; post?: Post } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin & Reports & Terms
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [activeReportTarget, setActiveReportTarget] = useState<{
    targetType: 'post' | 'user' | 'shop';
    targetId: string;
    targetTitle?: string;
    targetUserId?: string;
  } | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsModalMode, setTermsModalMode] = useState<'terms' | 'about'>('terms');

  const isAdmin = user?.email === 'isach8191@gmail.com';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  // Sync theme
  useEffect(() => {
    localStorage.setItem('venda_aqui_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark' || theme === 'pure_black') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    if (theme === 'pure_black') {
      root.setAttribute('data-pure-black', 'true');
    } else {
      root.removeAttribute('data-pure-black');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeChoice) => {
    setThemeState(newTheme);
    showToast(`Tema: ${newTheme === 'dark' ? 'Preto Clássico' : newTheme === 'pure_black' ? 'Preto Puro OLED' : 'Branco Minimalista'}`);
  };

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data();
            const adminStatus = firebaseUser.email === 'isach8191@gmail.com';
            if (data.preferredLanguage && TRANSLATIONS[data.preferredLanguage as LanguageCode]) {
              setLanguageState(data.preferredLanguage as LanguageCode);
              localStorage.setItem('venda_aqui_language', data.preferredLanguage);
            }
            if (data.country) {
              setPreferredCountryState(data.country);
              localStorage.setItem('venda_aqui_country', data.country);
            }
            if (data.preferredCurrency) {
              setPreferredCurrencyState(data.preferredCurrency as CurrencyCode);
              localStorage.setItem('venda_aqui_currency', data.preferredCurrency);
            }

            setUser({
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Utilizador',
              username: data.username || firebaseUser.email?.split('@')[0] || 'vendedor',
              email: firebaseUser.email || '',
              avatar: data.avatar || firebaseUser.photoURL || DEFAULT_AVATAR,
              coverPhoto: data.coverPhoto || DEFAULT_COVER,
              rating: data.rating ?? 5.0,
              totalSales: data.totalSales ?? 0,
              reviewCount: data.reviewCount ?? 0,
              verified: data.verified ?? true,
              role: adminStatus ? 'admin' : (data.role || 'user'),
              isAdmin: adminStatus,
              isBlocked: !!data.isBlocked,
              blockedUserIds: Array.isArray(data.blockedUserIds) ? data.blockedUserIds : [],
              bio: data.bio ?? 'Vendedor no VENDA AQUI.',
              location: data.location ?? 'Portugal / Brasil',
              country: data.country ?? preferredCountry ?? 'MZ',
              phone: data.phone ?? '',
              preferredLanguage: (data.preferredLanguage as LanguageCode) || language,
              preferredCurrency: (data.preferredCurrency as CurrencyCode) || preferredCurrency,
              createdAt: data.createdAt ?? new Date().toISOString(),
            });
          } else {
            // First time login - create user document
            const adminStatus = firebaseUser.email === 'isach8191@gmail.com';
            const cleanUser = (firebaseUser.email?.split('@')[0] || 'vendedor').replace(/[^a-zA-Z0-9_]/g, '');
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Utilizador',
              username: cleanUser,
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || DEFAULT_AVATAR,
              coverPhoto: DEFAULT_COVER,
              rating: 5.0,
              totalSales: 0,
              reviewCount: 0,
              verified: true,
              role: adminStatus ? 'admin' : 'user',
              isAdmin: adminStatus,
              isBlocked: false,
              blockedUserIds: [],
              bio: 'Vendedor no VENDA AQUI.',
              location: 'Moçambique / Portugal',
              country: preferredCountry || 'MZ',
              phone: '',
              preferredLanguage: language,
              preferredCurrency: preferredCurrency,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Real Posts from Firestore
  useEffect(() => {
    if (!user) {
      setPosts([]);
      setPostsLoading(false);
      return;
    }

    setPostsLoading(true);
    const postsQuery = query(collection(db, 'posts'));
    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const loadedPosts: Post[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const seller: User = {
            id: data.sellerId,
            name: data.sellerName || 'Vendedor',
            username: data.sellerUsername || 'vendedor',
            email: data.sellerEmail || '',
            avatar: data.sellerAvatar || DEFAULT_AVATAR,
            coverPhoto: data.sellerCoverPhoto || DEFAULT_COVER,
            rating: data.sellerRating || 5.0,
            totalSales: data.sellerTotalSales || 0,
            verified: data.sellerVerified ?? true,
            location: data.sellerLocation || data.location || 'Local não informado',
          };

          const likedByArray: string[] = Array.isArray(data.likedBy) ? data.likedBy : [];
          const isLiked = user ? likedByArray.includes(user.id) : false;

          return {
            id: docSnap.id,
            seller,
            sellerId: data.sellerId,
            title: data.title,
            price: Number(data.price) || 0,
            currency: data.currency || 'R$',
            condition: data.condition || 'usado',
            category: data.category || 'Outros',
            description: data.description || '',
            images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [DEFAULT_COVER],
            likes: Number(data.likes) || likedByArray.length,
            likedBy: likedByArray,
            isLiked,
            comments: [],
            commentsCount: Number(data.commentsCount) || 0,
            location: data.location || seller.location,
            createdAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : 'Recente',
            status: data.status || 'disponivel',
          };
        });

        // Filter out posts from blocked users if current user has blocked them
        const filtered = loadedPosts.filter(
          (p) => !user.blockedUserIds || !user.blockedUserIds.includes(p.sellerId)
        );

        // Sort descending by id or timestamp
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        setPosts(filtered);
        setPostsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
        setPostsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to Real Shops & Businesses from Firestore
  useEffect(() => {
    if (!user) {
      setShops([]);
      setShopsLoading(false);
      return;
    }

    setShopsLoading(true);
    const shopsQuery = query(collection(db, 'shops'));
    const unsubscribe = onSnapshot(
      shopsQuery,
      (snapshot) => {
        const loadedShops: Shop[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            ownerId: d.ownerId,
            ownerEmail: d.ownerEmail || '',
            name: d.name,
            shopType: d.shopType || 'Outros',
            city: d.city || '',
            address: d.address || '',
            phone: d.phone || '',
            whatsapp: d.whatsapp || d.phone || '',
            openingHours: d.openingHours || '08:00 às 18:00',
            hasDelivery: !!d.hasDelivery,
            logo: d.logo || DEFAULT_AVATAR,
            coverPhoto: d.coverPhoto || DEFAULT_COVER,
            description: d.description || '',
            verified: !!d.verified,
            rating: Number(d.rating) || 5.0,
            reviewCount: Number(d.reviewCount) || 0,
            createdAt: d.createdAt || new Date().toISOString(),
          };
        });

        // Sort: verified shops first, then recent
        loadedShops.sort((a, b) => {
          if (a.verified !== b.verified) {
            return b.verified ? 1 : -1;
          }
          return b.id.localeCompare(a.id);
        });

        setShops(loadedShops);
        setShopsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'shops');
        setShopsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to Products of active selected shop
  useEffect(() => {
    if (!selectedShop) {
      setShopProducts([]);
      return;
    }

    setShopProductsLoading(true);
    const productsRef = collection(db, 'shops', selectedShop.id, 'products');
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const prods: ShopProduct[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            shopId: selectedShop.id,
            title: data.title,
            description: data.description || '',
            price: Number(data.price) || 0,
            image: data.image || DEFAULT_COVER,
            status: data.status || 'disponivel',
            createdAt: data.createdAt || new Date().toISOString(),
          };
        });
        prods.sort((a, b) => b.id.localeCompare(a.id));
        setShopProducts(prods);
        setShopProductsLoading(false);
      },
      (err) => {
        console.error('Error fetching shop products:', err);
        setShopProductsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedShop]);

  // Auth Handlers
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Login com Google realizado com sucesso!');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      showToast(error.message || 'Erro ao entrar com Google');
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showToast('Sessão iniciada!');
    } catch (error: any) {
      console.error('Email sign in error:', error);
      let msg = 'Erro ao entrar';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = 'E-mail ou senha inválidos.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Formato de e-mail inválido.';
      }
      showToast(msg);
      throw error;
    }
  };

  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    name: string, 
    username: string, 
    location: string,
    country?: string
  ) => {
    try {
      // 1. Validation: Unique username without spaces
      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        throw new Error(t.auth.errors.usernameInvalid);
      }

      // Check username uniqueness in Firestore
      const userQuery = query(collection(db, 'users'), where('username', '==', cleanUsername));
      const uSnap = await getDocs(userQuery);
      if (!uSnap.empty) {
        throw new Error(t.auth.errors.usernameTaken);
      }

      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });

      const adminStatus = email === 'isach8191@gmail.com';
      const userCountry = country || preferredCountry || 'MZ';
      const newUser: User = {
        id: res.user.uid,
        name,
        username: cleanUsername,
        email,
        avatar: DEFAULT_AVATAR,
        coverPhoto: DEFAULT_COVER,
        rating: 5.0,
        totalSales: 0,
        reviewCount: 0,
        verified: true,
        role: adminStatus ? 'admin' : 'user',
        isAdmin: adminStatus,
        isBlocked: false,
        blockedUserIds: [],
        bio: 'Vendedor no VENDA AQUI.',
        location: location || 'Moçambique',
        country: userCountry,
        preferredLanguage: language,
        preferredCurrency: preferredCurrency,
        phone: '',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', res.user.uid), newUser);
      setUser(newUser);
      showToast('Conta criada com sucesso!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      let msg = error.message || 'Erro ao registar conta';
      if (error.code === 'auth/email-already-in-use') {
        msg = t.auth.errors.emailInUse;
      } else if (error.code === 'auth/weak-password') {
        msg = t.auth.errors.weakPassword;
      }
      showToast(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setSelectedProfileUser(null);
    setSelectedShop(null);
    showToast('Sessão terminada.');
  };

  // Helper to upload image file or fallback to base64
  const uploadImageFile = async (file: File, folder: string): Promise<string> => {
    // 5 MB image size limit validation
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('A imagem ultrapassa o limite de 5 MB.');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('O ficheiro deve ser uma imagem válida (JPG, PNG, WebP).');
    }

    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      return url;
    } catch (err) {
      console.warn('Storage upload fallback to base64 data URL:', err);
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  // Open User Profile (Facebook style)
  const openUserProfile = async (userOrId: User | string) => {
    if (typeof userOrId === 'object') {
      setSelectedProfileUser(userOrId);
      setActiveTab('profile');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userOrId));
      if (userDoc.exists()) {
        setSelectedProfileUser(userDoc.data() as User);
        setActiveTab('profile');
      }
    } catch (err) {
      console.error('Error fetching profile user:', err);
    }
  };

  const closeUserProfile = () => {
    setSelectedProfileUser(null);
    setActiveTab('feed');
  };

  // Update user profile in Firestore
  const updateUserProfile = async (data: {
    name: string;
    bio: string;
    location: string;
    country?: string;
    phone?: string;
    preferredLanguage?: LanguageCode;
    preferredCurrency?: string;
    avatarFile?: File | null;
    coverFile?: File | null;
  }) => {
    if (!user) return;

    let newAvatar = user.avatar;
    let newCover = user.coverPhoto || DEFAULT_COVER;

    if (data.avatarFile) {
      newAvatar = await uploadImageFile(data.avatarFile, `users/${user.id}/avatars`);
    }

    if (data.coverFile) {
      newCover = await uploadImageFile(data.coverFile, `users/${user.id}/covers`);
    }

    const updatedData: Partial<User> & { updatedAt: string } = {
      name: data.name,
      bio: data.bio,
      location: data.location,
      country: data.country || user.country,
      phone: data.phone || '',
      preferredLanguage: data.preferredLanguage || user.preferredLanguage || language,
      preferredCurrency: data.preferredCurrency || user.preferredCurrency || preferredCurrency,
      avatar: newAvatar,
      coverPhoto: newCover,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'users', user.id), updatedData);
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      if (data.preferredLanguage) {
        setLanguageState(data.preferredLanguage);
      }
      if (data.country) {
        setPreferredCountryState(data.country);
      }
      if (data.preferredCurrency) {
        setPreferredCurrencyState(data.preferredCurrency as CurrencyCode);
      }
      if (selectedProfileUser && selectedProfileUser.id === user.id) {
        setSelectedProfileUser(updatedUser);
      }
      setIsEditProfileOpen(false);
      showToast('Perfil atualizado com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  // Create real post in Firestore with price, 5MB, anti-spam (max 10/hour), and block check
  const createPost = async (data: {
    title: string;
    price: number;
    currency?: string;
    condition: ProductCondition;
    category: ProductCategory;
    description: string;
    imageFile?: File | null;
    imagePreviewUrl?: string;
    location: string;
    country?: string;
  }) => {
    if (!user) return;

    if (user.isBlocked) {
      showToast('A sua conta está bloqueada e não pode publicar anúncios.');
      throw new Error('Conta suspensa.');
    }

    // Mandatory numeric price > 0
    if (typeof data.price !== 'number' || isNaN(data.price) || data.price <= 0) {
      showToast('Preço obrigatório e numérico.');
      throw new Error('Preço inválido.');
    }

    // Image size check
    if (data.imageFile && data.imageFile.size > 5 * 1024 * 1024) {
      showToast('A fotografia não pode ter mais de 5 MB.');
      throw new Error('Imagem superior a 5 MB.');
    }

    // Anti-spam rule: Limitar publicações a 10 por hora por utilizador
    const oneHourAgo = Date.now() - 3600000;
    const userPostsInLastHour = posts.filter(
      (p) => p.sellerId === user.id && p.createdAt && new Date(p.createdAt).getTime() > oneHourAgo
    );
    if (userPostsInLastHour.length >= 10) {
      showToast('Limite de segurança: máximo 10 publicações por hora contra spam.');
      throw new Error('Limite anti-spam atingido.');
    }

    let imageUrl = data.imagePreviewUrl || DEFAULT_COVER;

    if (data.imageFile) {
      imageUrl = await uploadImageFile(data.imageFile, `posts/${user.id}`);
    }

    const postCurrency = data.currency || preferredCurrency || 'MZN';
    const postCountry = data.country || user.country || preferredCountry || 'MZ';

    const newPostData = {
      sellerId: user.id,
      sellerName: user.name,
      sellerUsername: user.username,
      sellerAvatar: user.avatar,
      sellerLocation: data.location || user.location,
      sellerVerified: user.verified,
      title: data.title,
      price: data.price,
      currency: postCurrency,
      country: postCountry,
      condition: data.condition,
      category: data.category,
      description: data.description,
      images: [imageUrl],
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      location: data.location || user.location,
      status: 'disponivel',
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'posts'), newPostData);
      setIsCreatePostModalOpen(false);
      showToast('Publicação criada no VENDA AQUI!');
      setActiveTab('feed');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'posts');
    }
  };

  // Toggle like on a post in Firestore
  const toggleLikePost = async (postId: string) => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const hasLiked = post.likedBy.includes(user.id);
    const updatedLikedBy = hasLiked
      ? post.likedBy.filter((id) => id !== user.id)
      : [...post.likedBy, user.id];

    try {
      await updateDoc(doc(db, 'posts', postId), {
        likedBy: updatedLikedBy,
        likes: updatedLikedBy.length,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  // Add comment in subcollection
  const addComment = async (postId: string, text: string) => {
    if (!user || !text.trim()) return;

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        postId,
        authorId: user.id,
        authorName: user.name,
        authorUsername: user.username,
        authorAvatar: user.avatar,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });

      const post = posts.find((p) => p.id === postId);
      if (post) {
        await updateDoc(doc(db, 'posts', postId), {
          commentsCount: (post.commentsCount || 0) + 1,
        });
      }

      showToast('Comentário publicado!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `posts/${postId}/comments`);
    }
  };

  // Delete post from Firestore (seller or admin)
  const deletePost = async (postId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      showToast('Publicação removida com sucesso.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `posts/${postId}`);
    }
  };

  // Chat and messaging
  const sendMessage = async (conversationId: string, text: string, offerPrice?: number) => {
    if (!user || (!text.trim() && !offerPrice)) return;
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      text: text.trim() || `Proposta de ${offerPrice ? 'R$ ' + offerPrice.toLocaleString('pt-BR') : ''}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      offerPrice,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: newMsg.text,
              lastMessageTime: 'Agora',
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );
  };

  const startChatWithSeller = async (post: Post, initialGreeting?: string) => {
    if (!user) return;
    const existing = conversations.find((c) => c.participant.id === post.seller.id);
    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('messages');
      if (initialGreeting) {
        sendMessage(existing.id, initialGreeting);
      }
      return;
    }

    const newConv: Conversation = {
      id: `conv_${Date.now()}`,
      participantIds: [user.id, post.seller.id],
      participant: post.seller,
      product: {
        id: post.id,
        title: post.title,
        price: post.price,
        image: post.images[0],
        condition: post.condition,
      },
      lastMessage: initialGreeting || `Olá ${post.seller.name}! Tenho interesse no seu produto "${post.title}".`,
      lastMessageTime: 'Agora',
      unreadCount: 0,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: user.id,
          text: initialGreeting || `Olá ${post.seller.name}! Tenho interesse no anúncio de ${post.title} no VENDA AQUI.`,
          timestamp: 'Agora',
          isMine: true,
        },
      ],
    };

    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConv.id);
    setActiveTab('messages');
  };

  const fetchSellerReviews = async (sellerId: string): Promise<any[]> => {
    try {
      const q = query(collection(db, 'users', sellerId, 'reviews'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching seller reviews:', err);
      return [];
    }
  };

  const addReviewToSeller = async (
    sellerId: string, 
    rating: number, 
    comment: string, 
    productId?: string, 
    productTitle?: string
  ) => {
    if (!user) return;

    const reviewData = {
      sellerId,
      buyerId: user.id,
      buyerName: user.name,
      buyerUsername: user.username,
      buyerAvatar: user.avatar,
      rating,
      comment,
      productId: productId || '',
      productTitle: productTitle || '',
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'users', sellerId, 'reviews'), reviewData);

      // Recalculate seller rating
      const currentReviews = await fetchSellerReviews(sellerId);
      const allRatings = [...currentReviews.map((r: any) => r.rating || 5), rating];
      const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

      await updateDoc(doc(db, 'users', sellerId), {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allRatings.length,
      });

      if (selectedProfileUser && selectedProfileUser.id === sellerId) {
        setSelectedProfileUser((prev) =>
          prev
            ? {
                ...prev,
                rating: Math.round(avgRating * 10) / 10,
                reviewCount: allRatings.length,
              }
            : null
        );
      }

      showToast('Avaliação registada com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${sellerId}/reviews`);
    }
  };

  const markPostAsCompleted = async (postId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'posts', postId), {
        status: 'vendido',
      });

      await updateDoc(doc(db, 'users', user.id), {
        totalSales: (user.totalSales || 0) + 1,
      });

      setUser((prev) => (prev ? { ...prev, totalSales: (prev.totalSales || 0) + 1 } : null));
      showToast('Transação concluída / produto vendido!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas as notificações foram lidas.');
  };

  // Submit report to administrator
  const submitReport = async (data: {
    targetType: 'post' | 'user' | 'shop';
    targetId: string;
    targetTitle?: string;
    targetUserId?: string;
    reason: ReportReason;
    description: string;
  }) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.id,
        reporterName: user.name,
        reporterEmail: user.email,
        targetType: data.targetType,
        targetId: data.targetId,
        targetTitle: data.targetTitle || '',
        targetUserId: data.targetUserId || '',
        reason: data.reason,
        description: data.description,
        status: 'pendente',
        createdAt: new Date().toISOString(),
      });
      setActiveReportTarget(null);
      showToast('Denúncia enviada ao administrador.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'reports');
    }
  };

  // Block user: hides posts of this user in feed
  const blockUser = async (targetUserId: string) => {
    if (!user) return;
    const current = user.blockedUserIds || [];
    if (current.includes(targetUserId)) return;
    const updated = [...current, targetUserId];

    try {
      await updateDoc(doc(db, 'users', user.id), { blockedUserIds: updated });
      setUser((prev) => (prev ? { ...prev, blockedUserIds: updated } : null));
      showToast('Utilizador bloqueado. Não verá mais os anúncios dele.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  // Unblock user
  const unblockUser = async (targetUserId: string) => {
    if (!user) return;
    const updated = (user.blockedUserIds || []).filter((id) => id !== targetUserId);

    try {
      await updateDoc(doc(db, 'users', user.id), { blockedUserIds: updated });
      setUser((prev) => (prev ? { ...prev, blockedUserIds: updated } : null));
      showToast('Utilizador desbloqueado.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  // ----------------------------------------------------
  // LOJAS & NEGÓCIOS (SHOPS) IMPLEMENTATION
  // ----------------------------------------------------
  const openShopDetail = async (shopOrId: Shop | string) => {
    if (typeof shopOrId === 'object') {
      setSelectedShop(shopOrId);
      setActiveTab('shop_detail');
      return;
    }

    try {
      const snap = await getDoc(doc(db, 'shops', shopOrId));
      if (snap.exists()) {
        const d = snap.data();
        setSelectedShop({
          id: snap.id,
          ownerId: d.ownerId,
          ownerEmail: d.ownerEmail || '',
          name: d.name,
          shopType: d.shopType || 'Outros',
          city: d.city || '',
          address: d.address || '',
          phone: d.phone || '',
          whatsapp: d.whatsapp || d.phone || '',
          openingHours: d.openingHours || '08:00 às 18:00',
          hasDelivery: !!d.hasDelivery,
          logo: d.logo || DEFAULT_AVATAR,
          coverPhoto: d.coverPhoto || DEFAULT_COVER,
          description: d.description || '',
          verified: !!d.verified,
          rating: Number(d.rating) || 5.0,
          reviewCount: Number(d.reviewCount) || 0,
          createdAt: d.createdAt || new Date().toISOString(),
        });
        setActiveTab('shop_detail');
      }
    } catch (err) {
      console.error('Error opening shop detail:', err);
    }
  };

  const closeShopDetail = () => {
    setSelectedShop(null);
    setActiveTab('shops');
  };

  // Register Shop
  const registerShop = async (data: {
    name: string;
    shopType: ShopType;
    city: string;
    address: string;
    phone: string;
    whatsapp?: string;
    openingHours: string;
    hasDelivery: boolean;
    description: string;
    logoFile?: File | null;
    coverFile?: File | null;
  }) => {
    if (!user) return;

    if (user.isBlocked) {
      showToast('A sua conta está bloqueada.');
      throw new Error('Conta suspensa.');
    }

    let logoUrl = DEFAULT_AVATAR;
    let coverUrl = DEFAULT_COVER;

    if (data.logoFile) {
      logoUrl = await uploadImageFile(data.logoFile, `shops/${user.id}/logos`);
    }
    if (data.coverFile) {
      coverUrl = await uploadImageFile(data.coverFile, `shops/${user.id}/covers`);
    }

    const newShopData = {
      ownerId: user.id,
      ownerEmail: user.email,
      name: data.name.trim(),
      shopType: data.shopType,
      city: data.city.trim(),
      address: data.address.trim(),
      phone: data.phone.trim(),
      whatsapp: (data.whatsapp || data.phone).trim(),
      openingHours: data.openingHours.trim() || '08:00 às 18:00',
      hasDelivery: Boolean(data.hasDelivery),
      logo: logoUrl,
      coverPhoto: coverUrl,
      description: data.description.trim(),
      verified: false, // Selo de verificada gerido só pelo administrador
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, 'shops'), newShopData);
      setIsRegisterShopModalOpen(false);
      showToast('Loja / Negócio registado com sucesso no VENDA AQUI!');
      openShopDetail({ id: docRef.id, ...newShopData });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'shops');
    }
  };

  // Update Shop
  const updateShop = async (shopId: string, data: Partial<Shop> & { logoFile?: File | null; coverFile?: File | null }) => {
    if (!user) return;

    let updatePayload: any = { ...data };
    delete updatePayload.logoFile;
    delete updatePayload.coverFile;

    // Normal users cannot verify themselves
    if (!isAdmin) {
      delete updatePayload.verified;
      delete updatePayload.ownerId;
    }

    if (data.logoFile) {
      updatePayload.logo = await uploadImageFile(data.logoFile, `shops/${user.id}/logos`);
    }
    if (data.coverFile) {
      updatePayload.coverPhoto = await uploadImageFile(data.coverFile, `shops/${user.id}/covers`);
    }

    updatePayload.updatedAt = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'shops', shopId), updatePayload);
      setSelectedShop((prev) => (prev && prev.id === shopId ? { ...prev, ...updatePayload } : prev));
      setIsEditShopModalOpen(false);
      showToast('Dados da loja atualizados.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `shops/${shopId}`);
    }
  };

  // Delete Shop
  const deleteShop = async (shopId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'shops', shopId));
      if (selectedShop && selectedShop.id === shopId) {
        closeShopDetail();
      }
      showToast('Loja removida com sucesso.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `shops/${shopId}`);
    }
  };

  // Toggle Shop Verification (Admin only)
  const toggleShopVerification = async (shopId: string, currentStatus: boolean) => {
    if (!isAdmin) {
      showToast('Apenas o administrador (isach8191@gmail.com) pode atribuir o selo de verificada.');
      return;
    }

    try {
      await updateDoc(doc(db, 'shops', shopId), {
        verified: !currentStatus,
      });

      setSelectedShop((prev) => (prev && prev.id === shopId ? { ...prev, verified: !currentStatus } : prev));
      showToast(`Selo de verificada ${!currentStatus ? 'atribuído' : 'removido'} com sucesso!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `shops/${shopId}`);
    }
  };

  // Add Product to Shop Catalog
  const addShopProduct = async (shopId: string, data: {
    title: string;
    description?: string;
    price: number;
    status: 'disponivel' | 'esgotado';
    imageFile?: File | null;
    imageUrl?: string;
  }) => {
    if (!user) return;

    if (typeof data.price !== 'number' || isNaN(data.price) || data.price <= 0) {
      showToast('Preço numérico obrigatório.');
      throw new Error('Preço inválido.');
    }

    let imgUrl = data.imageUrl || DEFAULT_COVER;
    if (data.imageFile) {
      imgUrl = await uploadImageFile(data.imageFile, `shops/${shopId}/products`);
    }

    const prodData = {
      shopId,
      title: data.title.trim(),
      description: (data.description || '').trim(),
      price: data.price,
      image: imgUrl,
      status: data.status,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'shops', shopId, 'products'), prodData);
      setIsAddProductModalOpen(false);
      showToast('Produto adicionado ao catálogo da loja!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `shops/${shopId}/products`);
    }
  };

  // Toggle Shop Product Status (Disponível ou Esgotado)
  const toggleShopProductStatus = async (shopId: string, productId: string, currentStatus: 'disponivel' | 'esgotado') => {
    if (!user) return;
    const newStatus = currentStatus === 'disponivel' ? 'esgotado' : 'disponivel';

    try {
      await updateDoc(doc(db, 'shops', shopId, 'products', productId), {
        status: newStatus,
      });
      showToast(`Produto marcado como ${newStatus === 'disponivel' ? 'Disponível' : 'Esgotado'}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `shops/${shopId}/products/${productId}`);
    }
  };

  // Delete Shop Product
  const deleteShopProduct = async (shopId: string, productId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'shops', shopId, 'products', productId));
      showToast('Produto removido do catálogo.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `shops/${shopId}/products/${productId}`);
    }
  };

  // Fetch reviews for a shop
  const fetchShopReviews = async (shopId: string): Promise<ShopReview[]> => {
    try {
      const q = query(collection(db, 'shops', shopId, 'reviews'));
      const snap = await getDocs(q);
      const revs: ShopReview[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      revs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return revs;
    } catch (err) {
      console.error('Error fetching shop reviews:', err);
      return [];
    }
  };

  // Add review to a shop (1 to 5 stars)
  const addShopReview = async (shopId: string, rating: number, comment: string) => {
    if (!user) return;

    const reviewData = {
      shopId,
      userId: user.id,
      userName: user.name,
      userUsername: user.username,
      userAvatar: user.avatar,
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'shops', shopId, 'reviews'), reviewData);

      // Recalculate average rating
      const allReviews = await fetchShopReviews(shopId);
      const allRatings = [...allReviews.map((r) => r.rating || 5), rating];
      const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

      await updateDoc(doc(db, 'shops', shopId), {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allRatings.length,
      });

      setSelectedShop((prev) =>
        prev && prev.id === shopId
          ? {
              ...prev,
              rating: Math.round(avgRating * 10) / 10,
              reviewCount: allRatings.length,
            }
          : prev
      );

      setActiveShopReviewModal(null);
      showToast('Avaliação da loja submetida com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `shops/${shopId}/reviews`);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        t,
        isRTL,
        preferredCountry,
        setPreferredCountry,
        preferredCurrency,
        setPreferredCurrency,
        selectedCountryFilter,
        setSelectedCountryFilter,
        formatPrice,
        formatPostDate,
        formatRelativePostTime,
        translatePost,
        postTranslations,
        posts,
        postsLoading,
        activeFilter,
        setActiveFilter,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        conversations,
        activeConversationId,
        setActiveConversationId,
        notifications,
        unreadNotificationsCount,
        unreadMessagesCount,
        isCreatePostModalOpen,
        setIsCreatePostModalOpen,
        activeCommentsPost,
        setActiveCommentsPost,
        activeOfferPost,
        setActiveOfferPost,
        selectedProfileUser,
        openUserProfile,
        closeUserProfile,
        isEditProfileOpen,
        setIsEditProfileOpen,
        toastMessage,
        showToast,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        createPost,
        toggleLikePost,
        addComment,
        deletePost,
        sendMessage,
        startChatWithSeller,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateUserProfile,
        activeReviewTarget,
        setActiveReviewTarget,
        addReviewToSeller,
        markPostAsCompleted,
        fetchSellerReviews,
        isAdmin,
        isAdminPanelOpen,
        setIsAdminPanelOpen,
        activeReportTarget,
        setActiveReportTarget,
        submitReport,
        blockUser,
        unblockUser,
        isTermsModalOpen,
        setIsTermsModalOpen,
        termsModalMode,
        setTermsModalMode,
        shops,
        shopsLoading,
        selectedShop,
        openShopDetail,
        closeShopDetail,
        isRegisterShopModalOpen,
        setIsRegisterShopModalOpen,
        isEditShopModalOpen,
        setIsEditShopModalOpen,
        isAddProductModalOpen,
        setIsAddProductModalOpen,
        activeShopReviewModal,
        setActiveShopReviewModal,
        shopProducts,
        shopProductsLoading,
        registerShop,
        updateShop,
        deleteShop,
        toggleShopVerification,
        addShopProduct,
        toggleShopProductStatus,
        deleteShopProduct,
        addShopReview,
        fetchShopReviews,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
