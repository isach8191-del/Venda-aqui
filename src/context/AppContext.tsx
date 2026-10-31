import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Post, 
  Conversation, 
  NotificationItem, 
  ThemeChoice, 
  ActiveTab, 
  ProductCondition, 
  ProductCategory 
} from '../types';
import { 
  CURRENT_USER, 
  INITIAL_POSTS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_NOTIFICATIONS 
} from '../data/seedData';

interface AppContextType {
  user: User | null;
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  posts: Post[];
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
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  activeCommentsPost: Post | null;
  setActiveCommentsPost: (post: Post | null) => void;
  activeOfferPost: Post | null;
  setActiveOfferPost: (post: Post | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Actions
  createPost: (data: {
    title: string;
    price: number;
    condition: ProductCondition;
    category: ProductCategory;
    description: string;
    image: string;
    location: string;
  }) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  deletePost: (postId: string) => void;
  sendMessage: (conversationId: string, text: string, offerPrice?: number) => void;
  startChatWithSeller: (post: Post, initialGreeting?: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  loginUser: (user: User) => void;
  logoutUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const saved = localStorage.getItem('venda_aqui_theme');
    return (saved as ThemeChoice) || 'dark';
  });

  // Current User
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('venda_aqui_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  // Active Tab: Casa, Mensagens, Notificações, Definições
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');

  // Posts Feed State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('venda_aqui_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [activeFilter, setActiveFilter] = useState<'todos' | 'novo' | 'usado'>('todos');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Messages & Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('venda_aqui_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('venda_aqui_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Modals & Panels
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [activeOfferPost, setActiveOfferPost] = useState<Post | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Sync theme with DOM
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

  // Sync posts with localStorage
  useEffect(() => {
    localStorage.setItem('venda_aqui_posts', JSON.stringify(posts));
  }, [posts]);

  // Sync conversations with localStorage
  useEffect(() => {
    localStorage.setItem('venda_aqui_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Sync notifications with localStorage
  useEffect(() => {
    localStorage.setItem('venda_aqui_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync user with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('venda_aqui_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('venda_aqui_user');
    }
  }, [user]);

  const setTheme = (newTheme: ThemeChoice) => {
    setThemeState(newTheme);
    showToast(`Tema alterado para: ${newTheme === 'dark' ? 'Preto Clássico' : newTheme === 'pure_black' ? 'Preto Puro (OLED)' : 'Branco Minimalista'}`);
  };

  const loginUser = (newUser: User) => {
    setUser(newUser);
    setIsLoginModalOpen(false);
    showToast(`Bem-vindo, ${newUser.name}!`);
  };

  const logoutUser = () => {
    setUser(null);
    showToast('Sessão encerrada com sucesso.');
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    showToast('Perfil atualizado com sucesso!');
  };

  const createPost = (data: {
    title: string;
    price: number;
    condition: ProductCondition;
    category: ProductCategory;
    description: string;
    image: string;
    location: string;
  }) => {
    const author: User = user || CURRENT_USER;
    const newPost: Post = {
      id: `post_${Date.now()}`,
      seller: author,
      title: data.title,
      price: data.price,
      currency: 'R$',
      condition: data.condition,
      category: data.category,
      description: data.description,
      images: [data.image],
      likes: 1,
      isLiked: true,
      comments: [],
      location: data.location || author.location,
      createdAt: 'Agora mesmo',
      status: 'disponivel',
      viewsCount: 1,
    };

    setPosts([newPost, ...posts]);
    setIsCreatePostModalOpen(false);
    showToast('Publicação criada com sucesso no VENDA AQUI!');
    setActiveTab('feed');
  };

  const toggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          const likes = isLiked ? p.likes + 1 : Math.max(0, p.likes - 1);
          return { ...p, isLiked, likes };
        }
        return p;
      })
    );
  };

  const addComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    const author: User = user || CURRENT_USER;
    const newComment = {
      id: `comment_${Date.now()}`,
      author,
      text: text.trim(),
      createdAt: 'Agora mesmo',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    // Update activeCommentsPost if open
    setActiveCommentsPost((prev) =>
      prev && prev.id === postId
        ? { ...prev, comments: [...prev.comments, newComment] }
        : prev
    );

    showToast('Comentário publicado!');
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('Publicação removida.');
  };

  const sendMessage = (conversationId: string, text: string, offerPrice?: number) => {
    if (!text.trim() && !offerPrice) return;
    const sender = user || CURRENT_USER;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: sender.id,
      text: text.trim() || `Proposta de ${offerPrice ? 'R$ ' + offerPrice.toLocaleString('pt-BR') : ''}`,
      timestamp: timeStr,
      isMine: true,
      offerPrice,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: newMsg.text,
            lastMessageTime: 'Agora',
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );

    // If it was an offer, send notification
    if (offerPrice) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        const notif: NotificationItem = {
          id: `notif_${Date.now()}`,
          type: 'offer',
          title: `Proposta de R$ ${offerPrice.toLocaleString('pt-BR')}`,
          description: `Você enviou uma proposta para ${conv.participant.name}.`,
          time: 'Agora',
          read: true,
          userAvatar: conv.participant.avatar,
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }
  };

  const startChatWithSeller = (post: Post, initialGreeting?: string) => {
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
          senderId: user?.id || 'usr_me',
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

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas as notificações foram marcadas como lidas.');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <AppContext.Provider
      value={{
        user,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        posts,
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
        isLoginModalOpen,
        setIsLoginModalOpen,
        activeCommentsPost,
        setActiveCommentsPost,
        activeOfferPost,
        setActiveOfferPost,
        toastMessage,
        showToast,
        createPost,
        toggleLikePost,
        addComment,
        deletePost,
        sendMessage,
        startChatWithSeller,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateUserProfile,
        loginUser,
        logoutUser,
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
