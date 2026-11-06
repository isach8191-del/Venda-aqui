import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  User, 
  Post, 
  Comment,
  Message,
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
  updateProfile,
  sendPasswordResetEmail
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
import { compressImage, withTimeout } from '../utils/imageCompressor';
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
import {
  isAutoLocationEnabled,
  setAutoLocationEnabled as setAutoLocationService,
  shouldShowPermissionPrompt,
  recordPermissionAccepted,
  recordPermissionDeclined,
  isCheckDue,
  getLastDetectedLocationText,
  setLastDetectedLocationText,
  detectCurrentLocation,
  deduceCountryFromTimezoneAndLocale,
  getCurrencyForCountry,
  DetectedLocationResult
} from '../services/locationService';

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Location & Regional Detection
  isLocationPromptOpen: boolean;
  setIsLocationPromptOpen: (open: boolean) => void;
  allowLocationPermission: () => Promise<void>;
  denyLocationPermission: () => void;
  countryChangePrompt: { countryCode: string; countryName: string; newCurrency: string; newLocation: string } | null;
  confirmCountryChange: () => Promise<void>;
  dismissCountryChange: () => void;
  autoLocationEnabled: boolean;
  setAutoLocationEnabledState: (val: boolean) => void;
  lastDetectedLocationText: string;
  detectLocationManually: () => Promise<void>;
  isLocationDetecting: boolean;
  
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
  allUsers: User[];
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
  sendPasswordReset: (email: string) => Promise<void>;
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
    imageFiles?: File[];
    images?: string[];
    location: string;
    country?: string;
  }) => Promise<void>;
  isEditPostModalOpen: boolean;
  setIsEditPostModalOpen: (open: boolean) => void;
  selectedEditPost: Post | null;
  openEditPostModal: (post: Post) => void;
  closeEditPostModal: () => void;
  updatePost: (
    postId: string,
    data: {
      title: string;
      price: number;
      currency?: string;
      condition: ProductCondition;
      category: ProductCategory;
      description: string;
      imageFile?: File | null;
      imageUrl?: string;
      imageFiles?: File[];
      images?: string[];
      location: string;
      country?: string;
    }
  ) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    text?: string,
    offerPrice?: number,
    audioUrl?: string,
    audioDuration?: number,
    file?: { fileUrl: string; fileName?: string; fileSize?: string; fileType?: string }
  ) => Promise<void>;
  startChatWithSeller: (post: Post, initialGreeting?: string) => Promise<void>;
  startChatWithUser: (
    targetUser: { id: string; name: string; avatar?: string; username?: string; location?: string },
    product?: any
  ) => Promise<void>;
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
  const isRegisteringRef = useRef(false);

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
      };

      setPostTranslations((prev) => ({
        ...prev,
        [cacheKey]: { ...result, lang: language },
      }));

      return result;
    } catch (err) {
      console.error('Translation error:', err);
      return {
        title: post.title,
        description: post.description,
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
  const [allUsers, setAllUsers] = useState<User[]>([]);
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
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [selectedEditPost, setSelectedEditPost] = useState<Post | null>(null);
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

  // Location & Regional Detection State
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
  const [countryChangePrompt, setCountryChangePrompt] = useState<{
    countryCode: string;
    countryName: string;
    newCurrency: string;
    newLocation: string;
  } | null>(null);
  const [autoLocationEnabled, setAutoLocationEnabledStateInternal] = useState<boolean>(() => isAutoLocationEnabled());
  const [lastDetectedLocationText, setLastDetectedLocationTextState] = useState<string>(() => getLastDetectedLocationText());
  const [isLocationDetecting, setIsLocationDetecting] = useState(false);

  const setAutoLocationEnabledState = (enabled: boolean) => {
    setAutoLocationEnabledStateInternal(enabled);
    setAutoLocationService(enabled);
    if (enabled) {
      void runLocationDetection(true);
    }
  };

  const runLocationDetection = async (force: boolean = false): Promise<void> => {
    if (!user) return;
    if (!force && !isCheckDue()) return;

    setIsLocationDetecting(true);
    try {
      const result: DetectedLocationResult = await detectCurrentLocation(language.split('-')[0]);
      const locationText = `${result.location}, ${getCountryName(result.country, language)}`;
      setLastDetectedLocationTextState(locationText);
      setLastDetectedLocationText(locationText);

      const userCountry = (user.country || '').trim().toUpperCase();
      const detectedCountry = result.country.trim().toUpperCase();

      // If COUNTRY changed and user already had a country set previously
      if (userCountry && detectedCountry && userCountry !== detectedCountry) {
        setCountryChangePrompt({
          countryCode: detectedCountry,
          countryName: getCountryName(detectedCountry, language),
          newCurrency: result.currency,
          newLocation: result.location,
        });
      } else {
        // Country is unchanged or was missing: silently update location / city
        const cityChanged = Boolean(result.location && result.location !== user.location);
        const countryNeedsSet = Boolean(!userCountry && detectedCountry);

        if (cityChanged || countryNeedsSet) {
          const nowIso = new Date().toISOString();
          const updatePayload: any = {
            location: result.location || user.location,
            country: detectedCountry || userCountry || 'MZ',
            locationUpdatedAt: nowIso,
          };
          if (!user.preferredCurrency && result.currency) {
            updatePayload.preferredCurrency = result.currency;
            setPreferredCurrencyState(result.currency as CurrencyCode);
          }

          try {
            await updateDoc(doc(db, 'users', user.id), updatePayload);
            setUser((prev) => prev ? {
              ...prev,
              location: result.location || prev.location,
              country: detectedCountry || prev.country,
              locationUpdatedAt: nowIso,
              preferredCurrency: updatePayload.preferredCurrency || prev.preferredCurrency,
            } : null);
          } catch (err) {
            console.warn('Could not auto-update city in Firestore:', err);
          }
        }
      }
    } catch (err) {
      console.warn('Location detection failed:', err);
    } finally {
      setIsLocationDetecting(false);
    }
  };

  const allowLocationPermission = async () => {
    recordPermissionAccepted();
    setAutoLocationEnabledStateInternal(true);
    setIsLocationPromptOpen(false);
    showToast('Localização ativada.');
    await runLocationDetection(true);
  };

  const denyLocationPermission = () => {
    recordPermissionDeclined();
    setAutoLocationEnabledStateInternal(false);
    setIsLocationPromptOpen(false);
    // Fallback: deduce country from timezone and locale if user has no country or default 'MZ'
    if (user && (!user.country || user.country === 'MZ')) {
      const fallback = deduceCountryFromTimezoneAndLocale();
      const fallbackCurr = getCurrencyForCountry(fallback.country);
      if (fallback.country !== user.country) {
        const nowIso = new Date().toISOString();
        void updateDoc(doc(db, 'users', user.id), {
          location: fallback.location,
          country: fallback.country,
          preferredCurrency: fallbackCurr,
          locationUpdatedAt: nowIso,
        }).then(() => {
          setUser((prev) => prev ? {
            ...prev,
            location: fallback.location,
            country: fallback.country,
            preferredCurrency: fallbackCurr as CurrencyCode,
            locationUpdatedAt: nowIso,
          } : null);
          setPreferredCurrencyState(fallbackCurr as CurrencyCode);
          setPreferredCountryState(fallback.country);
        }).catch(() => {});
      }
    }
  };

  const confirmCountryChange = async () => {
    if (!countryChangePrompt || !user) {
      setCountryChangePrompt(null);
      return;
    }
    const { countryCode, newCurrency, newLocation, countryName } = countryChangePrompt;
    setIsLocationDetecting(true);
    try {
      const nowIso = new Date().toISOString();
      await updateDoc(doc(db, 'users', user.id), {
        location: newLocation,
        country: countryCode,
        preferredCurrency: newCurrency,
        locationUpdatedAt: nowIso,
      });
      setUser((prev) => prev ? {
        ...prev,
        location: newLocation,
        country: countryCode,
        preferredCurrency: newCurrency as CurrencyCode,
        locationUpdatedAt: nowIso,
      } : null);
      setPreferredCountryState(countryCode);
      setPreferredCurrencyState(newCurrency as CurrencyCode);
      showToast(`Perfil atualizado para ${countryName} (${newCurrency}).`);
    } catch (err: any) {
      console.error('Error confirming country change:', err);
      showToast('Erro ao atualizar país no perfil.');
    } finally {
      setIsLocationDetecting(false);
      setCountryChangePrompt(null);
    }
  };

  const dismissCountryChange = () => {
    setCountryChangePrompt(null);
  };

  const detectLocationManually = async () => {
    setIsLocationDetecting(true);
    try {
      await runLocationDetection(true);
      showToast('Localização atualizada com sucesso!');
    } catch (err: any) {
      showToast('Não foi possível detetar a localização.');
    } finally {
      setIsLocationDetecting(false);
    }
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
              bio: data.bio ?? 'Vendedor no Hic Venditur.',
              location: data.location ?? 'Portugal / Brasil',
              country: data.country ?? preferredCountry ?? 'MZ',
              phone: data.phone ?? '',
              preferredLanguage: (data.preferredLanguage as LanguageCode) || language,
              preferredCurrency: (data.preferredCurrency as CurrencyCode) || preferredCurrency,
              createdAt: data.createdAt ?? new Date().toISOString(),
              lastSeen: data.lastSeen ?? new Date().toISOString(),
            });
          } else {
            // If actively in signUpWithEmail, let that finish creating the user document with custom details
            if (isRegisteringRef.current) {
              setAuthLoading(false);
              return;
            }

            // First time login - create user document
            const adminStatus = firebaseUser.email === 'isach8191@gmail.com';
            const cleanUser = (firebaseUser.email?.split('@')[0] || 'vendedor').replace(/[^a-zA-Z0-9_]/g, '');
            const nowIso = new Date().toISOString();
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
              bio: 'Vendedor no Hic Venditur.',
              location: 'Moçambique / Portugal',
              country: preferredCountry || 'MZ',
              phone: '',
              preferredLanguage: language,
              preferredCurrency: preferredCurrency,
              createdAt: nowIso,
              lastSeen: nowIso,
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

  // Presença online: atualizar lastSeen a cada 30 segundos e em eventos de foco/visibilidade
  useEffect(() => {
    if (!user?.id) return;

    const updatePresence = async () => {
      try {
        await updateDoc(doc(db, 'users', user.id), {
          lastSeen: new Date().toISOString(),
        });
      } catch (err) {
        // Ignora silenciosamente erros passageiros de rede
      }
    };

    updatePresence();
    const intervalId = window.setInterval(updatePresence, 30000);

    const handleActivity = () => {
      updatePresence();
    };

    window.addEventListener('focus', handleActivity);
    window.addEventListener('blur', handleActivity);
    window.addEventListener('beforeunload', handleActivity);
    document.addEventListener('visibilitychange', handleActivity);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleActivity);
      window.removeEventListener('blur', handleActivity);
      window.removeEventListener('beforeunload', handleActivity);
      document.removeEventListener('visibilitychange', handleActivity);
    };
  }, [user?.id]);

  // Deteção de localização: após login e ao voltar ao primeiro plano (máximo 1x por hora)
  useEffect(() => {
    if (!user?.id) return;

    if (shouldShowPermissionPrompt()) {
      const timer = setTimeout(() => {
        setIsLocationPromptOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isAutoLocationEnabled()) {
      if (isCheckDue()) {
        const timer = setTimeout(() => {
          void runLocationDetection(false);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const handleForegroundCheck = () => {
      if (document.visibilityState === 'visible' && isAutoLocationEnabled() && isCheckDue()) {
        void runLocationDetection(false);
      }
    };

    window.addEventListener('focus', handleForegroundCheck);
    document.addEventListener('visibilitychange', handleForegroundCheck);

    return () => {
      window.removeEventListener('focus', handleForegroundCheck);
      document.removeEventListener('visibilitychange', handleForegroundCheck);
    };
  }, [user?.id, language]);

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
            images: Array.isArray(data.images) ? data.images : (data.imageUrl ? [data.imageUrl] : []),
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

  // Listen to All Users for universal search
  useEffect(() => {
    if (!user) {
      setAllUsers([]);
      return;
    }

    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const loadedUsers: User[] = snapshot.docs
          .map((docSnap) => {
            const d = docSnap.data();
            return {
              id: docSnap.id,
              name: d.name || 'Utilizador',
              username: d.username || 'utilizador',
              email: '', // Never expose private email
              phone: '', // Never expose private phone
              avatar: d.avatar || DEFAULT_AVATAR,
              coverPhoto: d.coverPhoto || DEFAULT_COVER,
              rating: Number(d.rating) || 5.0,
              totalSales: Number(d.totalSales) || 0,
              reviewCount: Number(d.reviewCount) || 0,
              verified: Boolean(d.verified),
              role: d.role || 'user',
              isAdmin: Boolean(d.isAdmin),
              isBlocked: Boolean(d.isBlocked),
              blockedUserIds: Array.isArray(d.blockedUserIds) ? d.blockedUserIds : [],
              bio: d.bio || '',
              location: d.location || '',
              country: d.country || '',
              createdAt: d.createdAt || '',
              lastSeen: d.lastSeen || '',
            };
          })
          .filter((u) => {
            // Exclude blocked users and users blocked by current user
            if (u.isBlocked) return false;
            if (user.blockedUserIds && user.blockedUserIds.includes(u.id)) return false;
            return true;
          });

        setAllUsers(loadedUsers);
      },
      (error) => {
        console.warn('Users listener for search:', error);
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

  // Listen to User Conversations from Firestore in Real Time
  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const convQuery = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', user.id)
    );

    const unsubscribe = onSnapshot(
      convQuery,
      (snapshot) => {
        const loaded: Conversation[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const pIds: string[] = Array.isArray(d.participantIds) ? d.participantIds : [];
          const otherUserId = pIds.find((id) => id !== user.id) || '';
          const participantsMap = d.participants || {};
          const otherInfo = participantsMap[otherUserId] || {};

          return {
            id: docSnap.id,
            participantIds: pIds,
            participant: {
              id: otherUserId,
              name: otherInfo.name || d.participantName || 'Utilizador',
              username: otherInfo.username || '@utilizador',
              avatar: otherInfo.avatar || DEFAULT_AVATAR,
              email: otherInfo.email || '',
              location: otherInfo.location || '',
              rating: Number(otherInfo.rating) || 5.0,
              totalSales: Number(otherInfo.totalSales) || 0,
              verified: Boolean(otherInfo.verified),
              lastSeen: otherInfo.lastSeen || '',
            },
            product: d.product || undefined,
            lastMessage: d.lastMessage || 'Conversa iniciada',
            lastMessageTime: d.lastMessageTime || 'Agora',
            unreadCount: Number(d.unreadCount) || 0,
            messages: [],
          };
        });

        // Ordenar no código por data/id decrescente sem requerer índice
        loaded.sort((a, b) => b.id.localeCompare(a.id));
        setConversations(loaded);
      },
      (error) => {
        console.warn('Erro ao ler conversas:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to User Notifications from Firestore in Real Time
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const notifsRef = collection(db, 'users', user.id, 'notifications');
    const unsubscribe = onSnapshot(
      notifsRef,
      (snapshot) => {
        const items: NotificationItem[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          let formattedTime = 'Agora';
          if (d.createdAt) {
            try {
              formattedTime = formatRelativePostTime(d.createdAt);
            } catch {
              formattedTime = 'Agora';
            }
          }
          return {
            id: docSnap.id,
            userId: user.id,
            type: d.type || 'system',
            title: d.title || (d.type === 'like' ? 'Gosto no anúncio' : d.type === 'comment' ? 'Pergunta no anúncio' : 'Aviso'),
            description: d.description || d.commentText || '',
            time: formattedTime,
            createdAt: d.createdAt,
            read: Boolean(d.read),
            postId: d.postId,
            postTitle: d.postTitle,
            commentText: d.commentText,
            senderId: d.senderId,
            senderName: d.senderName,
            senderAvatar: d.senderAvatar,
            userAvatar: d.senderAvatar || DEFAULT_AVATAR,
          };
        });

        items.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });

        setNotifications(items);
      },
      (error) => {
        console.warn('Erro ao ler notificações em tempo real:', error);
      }
    );

    return () => unsubscribe();
  }, [user]);

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
      isRegisteringRef.current = true;
      // 1. Validation: Unique username without spaces
      const cleanUsername = username.trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
        throw new Error(t.auth.errors.usernameInvalid);
      }

      // 2. Create the auth user first so the user has an active, authenticated session
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(res.user, { displayName: name.trim() });

      // 3. Check username uniqueness in Firestore (now authenticated, satisfying security rules)
      const userQuery = query(collection(db, 'users'), where('username', '==', cleanUsername));
      const uSnap = await getDocs(userQuery);
      const isTaken = uSnap.docs.some((docSnap) => docSnap.id !== res.user.uid);
      if (isTaken) {
        await res.user.delete();
        throw new Error(t.auth.errors.usernameTaken);
      }

      const adminStatus = email.trim().toLowerCase() === 'isach8191@gmail.com';
      const userCountry = country || preferredCountry || 'MZ';
      const userCurrency = getCurrencyForCountry(userCountry) || preferredCurrency;
      const nowIso = new Date().toISOString();
      const newUser: User = {
        id: res.user.uid,
        name: name.trim(),
        username: cleanUsername,
        email: email.trim().toLowerCase(),
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
        bio: 'Vendedor no Hic Venditur.',
        location: location.trim() || 'Moçambique',
        country: userCountry,
        locationUpdatedAt: nowIso,
        preferredLanguage: language,
        preferredCurrency: userCurrency,
        phone: '',
        createdAt: nowIso,
        lastSeen: nowIso,
      };

      await setDoc(doc(db, 'users', res.user.uid), newUser);
      setUser(newUser);
      setPreferredCountryState(userCountry);
      setPreferredCurrencyState(userCurrency as CurrencyCode);
      showToast('Conta criada com sucesso!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      let msg = error.message || 'Erro ao registar conta';
      if (error.code === 'auth/email-already-in-use') {
        msg = t.auth.errors.emailInUse;
      } else if (error.code === 'auth/weak-password') {
        msg = t.auth.errors.weakPassword;
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Formato de e-mail inválido.';
      }
      showToast(msg);
      throw new Error(msg);
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setSelectedProfileUser(null);
    setSelectedShop(null);
    showToast('Sessão terminada.');
  };

  // Send Password Reset Email
  const sendPasswordReset = async (email: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      showToast('Por favor, introduza o seu e-mail.');
      throw new Error('E-mail obrigatório.');
    }

    try {
      await withTimeout(
        sendPasswordResetEmail(auth, cleanEmail),
        20000,
        'O envio do e-mail de recuperação demorou demasiado tempo. Verifique a ligação.'
      );
      showToast('Enviámos um link para o teu e-mail. Verifica também o spam.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      let msg = 'Erro ao enviar e-mail de recuperação.';
      if (error.code === 'auth/invalid-email') {
        msg = 'Formato de e-mail inválido.';
      } else if (error.code === 'auth/user-not-found') {
        msg = 'E-mail não encontrado.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Demasiados pedidos. Aguarda alguns minutos e tenta novamente.';
      } else if (error.message) {
        msg = error.message;
      }
      showToast(msg);
      throw new Error(msg);
    }
  };

  // Helper to compress image client-side to base64 Data URL (NO Firebase Storage used!)
  const processImageToDataUrl = async (
    file: File | Blob | string,
    maxDimension: number = 800
  ): Promise<string> => {
    try {
      if (typeof file === 'string') {
        if (file.startsWith('data:image/')) {
          return await compressImage(file, { maxDimension, initialQuality: 0.6, maxSizeBytes: 700 * 1024 });
        }
        return file;
      }
      return await compressImage(file, { maxDimension, initialQuality: 0.6, maxSizeBytes: 700 * 1024 });
    } catch (err: any) {
      console.error('Image compression error:', err);
      throw new Error(err?.message || 'Falha ao processar a fotografia.');
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

  // Update user profile in Firestore (Images 400px, 0.6 quality, <700KB, max 20s timeout)
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
      newAvatar = await processImageToDataUrl(data.avatarFile, 400);
    }

    if (data.coverFile) {
      newCover = await processImageToDataUrl(data.coverFile, 400);
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
      await withTimeout(
        updateDoc(doc(db, 'users', user.id), updatedData),
        20000,
        'A gravação demorou mais de 20 segundos. Por favor, tente novamente.'
      );
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
    } catch (err: any) {
      console.error('Update profile error:', err);
      const msg = err?.message || 'Erro ao atualizar perfil.';
      showToast(msg);
      throw new Error(msg);
    }
  };

  // Create real post in Firestore with price, 800px compressed base64 (0, 1, or multiple photos), anti-spam (max 10/hour), and 20s timeout
  const createPost = async (data: {
    title: string;
    price: number;
    currency?: string;
    condition: ProductCondition;
    category: ProductCategory;
    description: string;
    imageFile?: File | null;
    imagePreviewUrl?: string;
    imageFiles?: File[];
    images?: string[];
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

    // Anti-spam rule: Limitar publicações a 10 por hora por utilizador
    const oneHourAgo = Date.now() - 3600000;
    const userPostsInLastHour = posts.filter(
      (p) => p.sellerId === user.id && p.createdAt && new Date(p.createdAt).getTime() > oneHourAgo
    );
    if (userPostsInLastHour.length >= 10) {
      showToast('Limite de segurança: máximo 10 publicações por hora contra spam.');
      throw new Error('Limite anti-spam atingido.');
    }

    const processedImages: string[] = [];
    if (data.imageFiles && data.imageFiles.length > 0) {
      for (const f of data.imageFiles) {
        const compressed = await processImageToDataUrl(f, 800);
        processedImages.push(compressed);
      }
    } else if (data.images && data.images.length > 0) {
      for (const img of data.images) {
        if (img.startsWith('data:image/')) {
          const compressed = await processImageToDataUrl(img, 800);
          processedImages.push(compressed);
        } else {
          processedImages.push(img);
        }
      }
    } else if (data.imageFile) {
      const compressed = await processImageToDataUrl(data.imageFile, 800);
      processedImages.push(compressed);
    } else if (data.imagePreviewUrl && data.imagePreviewUrl.startsWith('data:image/')) {
      const compressed = await processImageToDataUrl(data.imagePreviewUrl, 800);
      processedImages.push(compressed);
    }

    // Check total images payload size (< 850 KB)
    const totalChars = processedImages.reduce((sum, img) => sum + img.length, 0);
    const estimatedTotalBytes = (totalChars * 3) / 4;
    if (estimatedTotalBytes > 850 * 1024) {
      showToast('As fotografias excedem o limite de tamanho. Remova algumas fotografias ou escolha imagens menores.');
      throw new Error('Tamanho total das fotografias excedido.');
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
      images: processedImages,
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      location: data.location || user.location,
      status: 'disponivel',
      createdAt: new Date().toISOString(),
    };

    try {
      await withTimeout(
        addDoc(collection(db, 'posts'), newPostData),
        20000,
        'A gravação demorou mais de 20 segundos. Por favor, tente novamente.'
      );
      setIsCreatePostModalOpen(false);
      showToast('Publicação criada no Hic Venditur!');
      setActiveTab('feed');
    } catch (err: any) {
      console.error('Create post error:', err);
      const msg = err?.message || 'Erro ao publicar anúncio.';
      showToast(msg);
      throw new Error(msg);
    }
  };

  // Edit / Update Post Modal actions
  const openEditPostModal = (post: Post) => {
    setSelectedEditPost(post);
    setIsEditPostModalOpen(true);
  };

  const closeEditPostModal = () => {
    setSelectedEditPost(null);
    setIsEditPostModalOpen(false);
  };

  const updatePost = async (
    postId: string,
    data: {
      title: string;
      price: number;
      currency?: string;
      condition: ProductCondition;
      category: ProductCategory;
      description: string;
      imageFile?: File | null;
      imageUrl?: string;
      imageFiles?: File[];
      images?: string[];
      location: string;
      country?: string;
    }
  ) => {
    if (!user) return;

    if (typeof data.price !== 'number' || isNaN(data.price) || data.price <= 0) {
      showToast('Preço obrigatório e numérico.');
      throw new Error('Preço inválido.');
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) {
      showToast('Anúncio não encontrado.');
      throw new Error('Anúncio não encontrado.');
    }

    if (post.sellerId !== user.id && !isAdmin) {
      showToast('Apenas o vendedor ou administrador podem editar este anúncio.');
      throw new Error('Sem permissão.');
    }

    let finalImages: string[] = [];
    if (data.imageFiles && data.imageFiles.length > 0) {
      for (const f of data.imageFiles) {
        finalImages.push(await processImageToDataUrl(f, 800));
      }
    } else if (data.images !== undefined) {
      for (const img of data.images) {
        if (img.startsWith('data:image/')) {
          finalImages.push(await processImageToDataUrl(img, 800));
        } else {
          finalImages.push(img);
        }
      }
    } else if (data.imageFile) {
      finalImages = [await processImageToDataUrl(data.imageFile, 800)];
    } else if (data.imageUrl !== undefined) {
      finalImages = data.imageUrl ? [data.imageUrl] : [];
    } else {
      finalImages = post.images || [];
    }

    const totalChars = finalImages.reduce((sum, img) => sum + img.length, 0);
    const estimatedTotalBytes = (totalChars * 3) / 4;
    if (estimatedTotalBytes > 850 * 1024) {
      showToast('As fotografias excedem o limite de tamanho. Remova algumas fotografias.');
      throw new Error('Tamanho total das fotografias excedido.');
    }

    const updatedPayload = {
      title: data.title.trim(),
      price: data.price,
      currency: data.currency || post.currency || preferredCurrency || 'MZN',
      country: data.country || post.country || user.country || 'MZ',
      condition: data.condition,
      category: data.category,
      description: data.description.trim(),
      images: finalImages,
      location: data.location.trim() || user.location,
      updatedAt: new Date().toISOString(),
    };

    try {
      await withTimeout(
        updateDoc(doc(db, 'posts', postId), updatedPayload),
        20000,
        'A gravação demorou mais de 20 segundos. Por favor, tente novamente.'
      );
      setIsEditPostModalOpen(false);
      setSelectedEditPost(null);
      showToast('Anúncio atualizado com sucesso!');
    } catch (err: any) {
      console.error('Update post error:', err);
      const msg = err?.message || 'Erro ao atualizar anúncio.';
      showToast(msg);
      throw new Error(msg);
    }
  };

  // Toggle like on a post in Firestore and manage notifications
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

      // Notificação: criar ao curtir, remover ao descurtir (sem notificar a si próprio)
      const targetSellerId = post.sellerId || post.seller?.id;
      if (targetSellerId && targetSellerId !== user.id) {
        const notifDocId = `like_${user.id}_${postId}`;
        if (!hasLiked) {
          await setDoc(doc(db, 'users', targetSellerId, 'notifications', notifDocId), {
            type: 'like',
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.avatar || DEFAULT_AVATAR,
            postId: post.id,
            postTitle: post.title,
            description: `${user.name} gostou do teu anúncio "${post.title}".`,
            read: false,
            createdAt: new Date().toISOString(),
          });
        } else {
          try {
            await deleteDoc(doc(db, 'users', targetSellerId, 'notifications', notifDocId));
          } catch {}
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  // Add comment in subcollection and notify post owner
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

        // Notificar o proprietário do anúncio se for outro utilizador
        const targetSellerId = post.sellerId || post.seller?.id;
        if (targetSellerId && targetSellerId !== user.id) {
          await addDoc(collection(db, 'users', targetSellerId, 'notifications'), {
            type: 'comment',
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.avatar || DEFAULT_AVATAR,
            postId: post.id,
            postTitle: post.title,
            commentText: text.trim(),
            description: `${user.name} perguntou no teu anúncio "${post.title}": "${text.trim().substring(0, 80)}"`,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
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

  const sendMessage = async (
    conversationId: string,
    text?: string,
    offerPrice?: number,
    audioUrl?: string,
    audioDuration?: number,
    file?: { fileUrl: string; fileName?: string; fileSize?: string; fileType?: string }
  ) => {
    if (!user) return;
    if (user.isBlocked) {
      showToast('A sua conta está bloqueada e não pode enviar mensagens.');
      throw new Error('Conta suspensa.');
    }
    const hasText = Boolean(text && text.trim());
    const hasOffer = typeof offerPrice === 'number' && offerPrice > 0;
    const hasAudio = Boolean(audioUrl && audioUrl.length > 0);
    const hasFile = Boolean(file && file.fileUrl);
    if (!hasText && !hasOffer && !hasAudio && !hasFile) return;

    if (hasAudio && audioUrl) {
      const estimatedBytes = (audioUrl.length * 3) / 4;
      if (estimatedBytes > 800 * 1024) {
        showToast('Mensagem de voz demasiado grande, grava uma mais curta.');
        throw new Error('Mensagem de voz demasiado grande, grava uma mais curta.');
      }
    }
    if (hasFile && file) {
      const estimatedBytes = (file.fileUrl.length * 3) / 4;
      if (estimatedBytes > 900 * 1024) {
        showToast('Ficheiro demasiado grande para enviar.');
        throw new Error('Ficheiro demasiado grande para enviar.');
      }
    }

    let messageText = text?.trim() || '';
    if (!messageText) {
      if (hasAudio) messageText = 'Mensagem de voz';
      else if (hasOffer) messageText = `Proposta de ${formatPrice(offerPrice!)}`;
      else if (hasFile) messageText = file?.fileType === 'image' ? 'Fotografia' : 'Ficheiro em anexo';
    }
    let summary = messageText;
    if (hasAudio) summary = '🎤 Mensagem de voz';
    else if (hasFile) summary = file?.fileType === 'image' ? '📷 Fotografia' : `📎 ${file?.fileName || 'Ficheiro'}`;

    try {
      await withTimeout(
        addDoc(collection(db, 'conversations', conversationId, 'messages'), {
          conversationId,
          senderId: user.id,
          text: messageText,
          audioUrl: audioUrl || null,
          audioDuration: audioDuration || null,
          fileUrl: file?.fileUrl || null,
          fileName: file?.fileName || null,
          fileSize: file?.fileSize || null,
          fileType: file?.fileType || null,
          offerPrice: hasOffer ? offerPrice : null,
          seenAt: null,
          createdAt: new Date().toISOString(),
        }),
        20000,
        'O envio demorou mais de 20 segundos. Por favor, tente novamente.'
      );
      try {
        await updateDoc(doc(db, 'conversations', conversationId), {
          lastMessage: summary,
          lastMessageTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          updatedAt: new Date().toISOString(),
        });
      } catch (updErr) {
        console.warn('Erro ao atualizar resumo da conversa:', updErr);
      }
    } catch (err: any) {
      console.error('Erro ao enviar mensagem:', err);
      showToast(err?.message || 'Erro ao enviar mensagem. Tente novamente.');
      throw err;
    }
  };

  const startChatWithUser = async (
    targetUser: { id: string; name: string; avatar?: string; username?: string; location?: string },
    product?: any
  ) => {
    if (!user) {
      showToast('Inicie sessão para enviar mensagens.');
      return;
    }

    if (targetUser.id === user.id) {
      showToast('Esta é a sua própria conta.');
      return;
    }

    if (user.isBlocked) {
      showToast('A sua conta está suspensa.');
      return;
    }

        // Limpa perfil e loja abertos sem passar por outras abas, e vai direto às mensagens
    setSelectedProfileUser(null);
    setSelectedShop(null);
    setActiveTab('messages');

    // ID determinístico para conversa direta entre os dois utilizadores
    const convId = `conv_${[user.id, targetUser.id].sort().join('_')}`;

    try {
      // 1. Verificar ou criar a conversa no Firestore se ainda não existir
      const convRef = doc(db, 'conversations', convId);
      const convSnap = await getDoc(convRef);

      const initialGreeting = product 
        ? `Olá ${targetUser.name}! Tenho interesse no anúncio "${product.title}".`
        : `Olá ${targetUser.name}!`;

      if (!convSnap.exists()) {
        const newConvPayload = {
          id: convId,
          participantIds: [user.id, targetUser.id],
          participants: {
            [user.id]: {
              id: user.id,
              name: user.name,
              avatar: user.avatar || DEFAULT_AVATAR,
              username: user.username || '@utilizador',
              location: user.location || '',
            },
            [targetUser.id]: {
              id: targetUser.id,
              name: targetUser.name,
              avatar: targetUser.avatar || DEFAULT_AVATAR,
              username: targetUser.username || '@utilizador',
              location: targetUser.location || '',
            },
          },
          lastMessage: initialGreeting,
          lastMessageTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          product: product ? {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            image: product.images?.[0] || product.image || DEFAULT_COVER,
            condition: product.condition || 'usado',
          } : null,
        };

        await withTimeout(
          setDoc(convRef, newConvPayload),
          20000,
          'A criação da conversa demorou demasiado tempo. Tente novamente.'
        );

        // Adicionar mensagem inicial
        await addDoc(collection(db, 'conversations', convId, 'messages'), {
          conversationId: convId,
          senderId: user.id,
          text: initialGreeting,
          createdAt: new Date().toISOString(),
        });
      }

      // Adicionar à lista local se ainda não estiver
      setConversations((prev) => {
        if (prev.some((c) => c.id === convId)) return prev;
        const newConv: Conversation = {
          id: convId,
          participantIds: [user.id, targetUser.id],
          participant: {
            id: targetUser.id,
            name: targetUser.name,
            avatar: targetUser.avatar || DEFAULT_AVATAR,
            username: targetUser.username || '@utilizador',
            email: '',
            location: targetUser.location || '',
            rating: 5.0,
            totalSales: 0,
            verified: false,
          },
          product: product ? {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            image: product.images?.[0] || product.image || DEFAULT_COVER,
            condition: product.condition || 'usado',
          } : undefined,
          lastMessage: initialGreeting,
          lastMessageTime: 'Agora',
          unreadCount: 0,
          messages: [],
        };
        return [newConv, ...prev];
      });

      // 2. Definir conversa ativa e abrir o separador de mensagens imediatamente
      setActiveConversationId(convId);
      setActiveTab('messages');
    } catch (err: any) {
      console.error('Erro ao iniciar conversa:', err);
      const msg = err?.message || 'Erro ao abrir conversa. Tente novamente.';
      showToast(msg);
    }
  };

  const startChatWithSeller = async (post: Post, initialGreeting?: string) => {
    return startChatWithUser(
      {
        id: post.sellerId || post.seller.id,
        name: post.seller.name,
        avatar: post.seller.avatar,
        username: post.seller.username,
        location: post.seller.location,
      },
      post
    );
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
    if (user?.id) {
      try {
        await updateDoc(doc(db, 'users', user.id, 'notifications', id), { read: true });
      } catch (err) {
        console.warn('Erro ao atualizar estado da notificação:', err);
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user?.id) {
      const unread = notifications.filter((n) => !n.read);
      for (const notif of unread) {
        try {
          await updateDoc(doc(db, 'users', user.id, 'notifications', notif.id), { read: true });
        } catch {}
      }
    }
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
      logoUrl = await processImageToDataUrl(data.logoFile, 400);
    }
    if (data.coverFile) {
      coverUrl = await processImageToDataUrl(data.coverFile, 400);
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
      const docRef = await withTimeout(
        addDoc(collection(db, 'shops'), newShopData),
        20000,
        'A gravação demorou mais de 20 segundos. Por favor, tente novamente.'
      );
      setIsRegisterShopModalOpen(false);
      showToast('Loja / Negócio registado com sucesso no Hic Venditur!');
      openShopDetail({ id: docRef.id, ...newShopData });
    } catch (err: any) {
      console.error('Register shop error:', err);
      const msg = err?.message || 'Erro ao registar loja.';
      showToast(msg);
      throw new Error(msg);
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
      updatePayload.logo = await processImageToDataUrl(data.logoFile, 400);
    }
    if (data.coverFile) {
      updatePayload.coverPhoto = await processImageToDataUrl(data.coverFile, 400);
    }

    updatePayload.updatedAt = new Date().toISOString();

    try {
      await withTimeout(
        updateDoc(doc(db, 'shops', shopId), updatePayload),
        20000,
        'A gravação demorou mais de 20 segundos. Por favor, tente novamente.'
      );
      setSelectedShop((prev) => (prev && prev.id === shopId ? { ...prev, ...updatePayload } : prev));
      setIsEditShopModalOpen(false);
      showToast('Dados da loja atualizados.');
    } catch (err: any) {
      console.error('Update shop error:', err);
      const msg = err?.message || 'Erro ao atualizar dados da loja.';
      showToast(msg);
      throw new Error(msg);
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
      imgUrl = await processImageToDataUrl(data.imageFile, 800);
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
      await withTimeout(
        addDoc(collection(db, 'shops', shopId, 'products'), prodData),
        20000,
        'A gravação demorou mais de 20 segundos. Por favor, tente novamente.'
      );
      setIsAddProductModalOpen(false);
      showToast('Produto adicionado ao catálogo da loja!');
    } catch (err: any) {
      console.error('Add shop product error:', err);
      const msg = err?.message || 'Erro ao adicionar produto.';
      showToast(msg);
      throw new Error(msg);
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
        allUsers,
        openUserProfile,
        closeUserProfile,
        isEditProfileOpen,
        setIsEditProfileOpen,
        toastMessage,
        showToast,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        logout,
        createPost,
        isEditPostModalOpen,
        setIsEditPostModalOpen,
        selectedEditPost,
        openEditPostModal,
        closeEditPostModal,
        updatePost,
        toggleLikePost,
        addComment,
        deletePost,
        sendMessage,
        startChatWithSeller,
        startChatWithUser,
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

        // Location & Regional detection
        isLocationPromptOpen,
        setIsLocationPromptOpen,
        allowLocationPermission,
        denyLocationPermission,
        countryChangePrompt,
        confirmCountryChange,
        dismissCountryChange,
        autoLocationEnabled,
        setAutoLocationEnabledState,
        lastDetectedLocationText,
        detectLocationManually,
        isLocationDetecting,
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
