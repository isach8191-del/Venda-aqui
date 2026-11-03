import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Store, MessageSquare, Bell, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    unreadNotificationsCount, 
    unreadMessagesCount,
    closeUserProfile,
    closeShopDetail 
  } = useApp();

  const handleTabClick = (tabId: ActiveTab) => {
    closeUserProfile();
    if (tabId !== 'shop_detail') {
      closeShopDetail();
    }
    setActiveTab(tabId);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: 'feed',
      label: 'Casa',
      icon: Home,
    },
    {
      id: 'shops',
      label: 'Lojas',
      icon: Store,
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    {
      id: 'notifications',
      label: 'Avisos',
      icon: Bell,
      badge: unreadNotificationsCount,
    },
    {
      id: 'settings',
      label: 'Definições',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 bg-white dark:bg-black border-t border-neutral-300 dark:border-neutral-800 shadow-none rounded-none transition-colors duration-150">
      <div className="w-full max-w-lg mx-auto h-13 flex items-stretch justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'shops' && activeTab === 'shop_detail');

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex-1 flex flex-col items-center justify-center pt-1.5 pb-1 px-1 transition-colors rounded-none focus:outline-none ${
                isActive
                  ? 'text-black dark:text-white font-bold'
                  : 'text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white font-normal'
              }`}
            >
              {/* Barra fina em cima no separador ativo */}
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
              )}

              <div className="relative mb-0.5">
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`} />
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 min-w-[13px] h-3 px-0.5 rounded-none bg-black dark:bg-white text-white dark:text-black text-[8px] font-black flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>

              <span className="text-[10px] tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
