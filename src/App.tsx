/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/LoginScreen';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { FeedTab } from './components/FeedTab';
import { MessagesTab } from './components/MessagesTab';
import { NotificationsTab } from './components/NotificationsTab';
import { SettingsTab } from './components/SettingsTab';
import { UserProfileView } from './components/UserProfileView';
import { EditProfileModal } from './components/EditProfileModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CommentsModal } from './components/CommentsModal';
import { MakeOfferModal } from './components/MakeOfferModal';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, authLoading, activeTab, selectedProfileUser, toastMessage } = useApp();

  // 1. Initial Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-xs border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black text-xs flex items-center justify-center animate-pulse mb-3">
          VA
        </div>
        <p className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
          A carregar VENDA AQUI...
        </p>
      </div>
    );
  }

  // 2. Strict Login Gate: Sem conta, não se acede ao app!
  if (!user) {
    return <LoginScreen />;
  }

  // 3. Authenticated App Shell
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200 flex flex-col font-sans pb-20 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Top Header (VENDA AQUI on left, publish space in center) */}
      <AppHeader />

      {/* Main Content View */}
      <main className="flex-1 w-full">
        {selectedProfileUser ? (
          /* Facebook-Style User Profile Page */
          <UserProfileView />
        ) : (
          <>
            {activeTab === 'feed' && <FeedTab />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </>
        )}
      </main>

      {/* Bottom Navigation Bar (1º Casa, 2º Mensagens, 3º Notificações, 4º Definições) */}
      <BottomNav />

      {/* Modals & Dialogs */}
      <CreatePostModal />
      <EditProfileModal />
      <CommentsModal />
      <MakeOfferModal />

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-sm shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
