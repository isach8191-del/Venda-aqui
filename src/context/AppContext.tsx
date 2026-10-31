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
  ProductCategory 
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

interface AppContextType {
  user: User | null;
  authLoading: boolean;
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
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
  signUpWithEmail: (email: string, pass: string, name: string, username: string, location: string) => Promise<void>;
  logout: () => Promise<void>;

  // Marketplace Actions
  createPost: (data: {
    title: string;
    price: number;
    condition: ProductCondition;
    category: ProductCategory;
    description: string;
    imageFile?: File | null;
    imagePreviewUrl?: string;
    location: string;
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
    phone?: string;
    avatarFile?: File | null;
    coverFile?: File | null;
  }) => Promise<void>;
  activeReviewTarget: { seller: User; post?: Post } | null;
  setActiveReviewTarget: (target: { seller: User; post?: Post } | null) => void;
  addReviewToSeller: (sellerId: string, rating: number, comment: string, productId?: string, productTitle?: string) => Promise<void>;
  markPostAsCompleted: (postId: string) => Promise<void>;
  fetchSellerReviews: (sellerId: string) => Promise<any[]>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const saved = localStorage.getItem('venda_aqui_theme');
    return (saved as ThemeChoice) || 'dark';
  });

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

  // Conversations & Notifications
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & Panels
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [activeOfferPost, setActiveOfferPost] = useState<Post | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
            setUser({
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Utilizador',
              username: data.username || firebaseUser.email?.split('@')[0] || 'vendedor',
              email: firebaseUser.email || '',
              avatar: data.avatar || firebaseUser.photoURL || DEFAULT_AVATAR,
              coverPhoto: data.coverPhoto || DEFAULT_COVER,
              rating: data.rating ?? 5.0,
              totalSales: data.totalSales ?? 0,
              verified: data.verified ?? true,
              bio: data.bio ?? 'Vendedor no VENDA AQUI.',
              location: data.location ?? 'Portugal / Brasil',
              phone: data.phone ?? '',
              createdAt: data.createdAt ?? new Date().toISOString(),
            });
          } else {
            // First time login - create user document
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Utilizador',
              username: (firebaseUser.email?.split('@')[0] || 'vendedor').replace(/[^a-zA-Z0-9_]/g, ''),
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || DEFAULT_AVATAR,
              coverPhoto: DEFAULT_COVER,
              rating: 5.0,
              totalSales: 0,
              verified: true,
              bio: 'Vendedor no VENDA AQUI.',
              location: 'Portugal / Brasil',
              phone: '',
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

        // Sort descending by id or timestamp
        loadedPosts.sort((a, b) => b.id.localeCompare(a.id));
        setPosts(loadedPosts);
        setPostsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'posts');
        setPostsLoading(false);
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
    location: string
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });

      const newUser: User = {
        id: res.user.uid,
        name,
        username: username.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''),
        email,
        avatar: DEFAULT_AVATAR,
        coverPhoto: DEFAULT_COVER,
        rating: 5.0,
        totalSales: 0,
        verified: true,
        bio: 'Vendedor no VENDA AQUI.',
        location: location || 'Portugal / Brasil',
        phone: '',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', res.user.uid), newUser);
      setUser(newUser);
      showToast('Conta criada com sucesso no VENDA AQUI!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      let msg = 'Erro ao registar conta';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está em uso.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'A senha deve conter pelo menos 6 caracteres.';
      }
      showToast(msg);
      throw error;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setSelectedProfileUser(null);
    showToast('Sessão terminada.');
  };

  // Helper to upload image file or convert to base64 safely
  const uploadImageFile = async (file: File, folder: string): Promise<string> => {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      return url;
    } catch (err) {
      console.warn('Storage upload failed, falling back to base64 data URL:', err);
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
    phone?: string;
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

    const updatedData = {
      name: data.name,
      bio: data.bio,
      location: data.location,
      phone: data.phone || '',
      avatar: newAvatar,
      coverPhoto: newCover,
      updatedAt: new Date().toISOString(),
    };

    try {
      await updateDoc(doc(db, 'users', user.id), updatedData);
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      if (selectedProfileUser && selectedProfileUser.id === user.id) {
        setSelectedProfileUser(updatedUser);
      }
      setIsEditProfileOpen(false);
      showToast('Perfil atualizado com sucesso!');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
    }
  };

  // Create real post in Firestore
  const createPost = async (data: {
    title: string;
    price: number;
    condition: ProductCondition;
    category: ProductCategory;
    description: string;
    imageFile?: File | null;
    imagePreviewUrl?: string;
    location: string;
  }) => {
    if (!user) return;

    let imageUrl = data.imagePreviewUrl || DEFAULT_COVER;

    if (data.imageFile) {
      imageUrl = await uploadImageFile(data.imageFile, `posts/${user.id}`);
    }

    const newPostData = {
      sellerId: user.id,
      sellerName: user.name,
      sellerUsername: user.username,
      sellerAvatar: user.avatar,
      sellerLocation: data.location || user.location,
      sellerVerified: user.verified,
      title: data.title,
      price: data.price,
      currency: 'R$',
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

  // Delete post from Firestore
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

  const [activeReviewTarget, setActiveReviewTarget] = useState<{ seller: User; post?: Post } | null>(null);

  const fetchSellerReviews = async (sellerId: string): Promise<any[]> => {
    try {
      const q = query(collection(db, 'users', sellerId, 'reviews'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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

      // Update selectedProfileUser if currently viewing this seller
      if (selectedProfileUser && selectedProfileUser.id === sellerId) {
        setSelectedProfileUser(prev => prev ? {
          ...prev,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allRatings.length,
        } : null);
      }

      // Notify seller
      await addDoc(collection(db, 'notifications'), {
        userId: sellerId,
        type: 'review',
        title: `Nova avaliação de ${user.name}!`,
        description: `Recebeu ${rating} estrelas: "${comment.slice(0, 80)}"`,
        createdAt: new Date().toISOString(),
        read: false,
        userAvatar: user.avatar,
      });

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

      // Increment seller total sales
      await updateDoc(doc(db, 'users', user.id), {
        totalSales: (user.totalSales || 0) + 1,
      });

      setUser(prev => prev ? { ...prev, totalSales: (prev.totalSales || 0) + 1 } : null);
      showToast('Transação marcada como concluída / vendido!');
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
