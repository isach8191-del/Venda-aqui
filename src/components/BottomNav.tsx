import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, MessageSquare, Bell, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

export const BottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    unreadNotificationsCount, 
    unreadMessagesCount 
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: 'feed',
      label: 'Casa',
      icon: Home,
    },
    {
      id: 'messages',
      label: 'Mensagens',
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    {
      id: 'notifications',
      label: 'Notificações',
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2 transition-all duration-150 ${
                isActive
                  ? 'text-black dark:text-white font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 font-medium'
              }`}
              aria-label={`${index + 1}º ${item.label}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'}`} />
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-black flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>

              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>

              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-black dark:bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
