import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  BadgePercent, 
  Check, 
  CheckCheck,
  ShoppingBag 
} from 'lucide-react';

export const NotificationsTab: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    setActiveTab, 
    setActiveConversationId 
  } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 fill-black dark:fill-white text-black dark:text-white" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-black dark:text-white" />;
      case 'offer':
        return <BadgePercent className="w-4 h-4 text-black dark:text-white" />;
      default:
        return <ShoppingBag className="w-4 h-4 text-black dark:text-white" />;
    }
  };

  const handleClick = (notifId: string, type: string) => {
    markNotificationAsRead(notifId);
    if (type === 'message' || type === 'offer') {
      setActiveTab('messages');
    } else {
      setActiveTab('feed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-black dark:text-white" />
          <h1 className="text-sm font-extrabold uppercase tracking-tight text-black dark:text-white">
            Notificações
          </h1>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Marcar todas como lidas</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif.id, notif.type)}
              className={`p-3 rounded-sm border transition-all cursor-pointer flex items-start gap-3 ${
                notif.read
                  ? 'bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 opacity-80 hover:opacity-100'
                  : 'bg-neutral-50 dark:bg-neutral-900 border-black/40 dark:border-white/40 shadow-2xs'
              }`}
            >
              {/* Avatar or Icon */}
              <div className="relative shrink-0">
                {notif.userAvatar ? (
                  <img
                    src={notif.userAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border-2 border-white dark:border-black">
                  {getIcon(notif.type)}
                </div>
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white truncate">
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-neutral-400 font-mono ml-2 shrink-0">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                  {notif.description}
                </p>
              </div>

              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0 mt-1.5" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-neutral-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold text-black dark:text-white">Nenhuma notificação</p>
            <p className="text-xs mt-1">Interações com seus anúncios e propostas aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
};
