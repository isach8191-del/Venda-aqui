/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { FeedTab } from './components/FeedTab';
import { MessagesTab } from './components/MessagesTab';
import { NotificationsTab } from './components/NotificationsTab';
import { SettingsTab } from './components/SettingsTab';
import { CreatePostModal } from './components/CreatePostModal';
import { CommentsModal } from './components/CommentsModal';
import { MakeOfferModal } from './components/MakeOfferModal';
import { LoginModal } from './components/LoginModal';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200 flex flex-col font-sans pb-20 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Top Header:
          - Encima do lado esquerdo: VENDA AQUI
          - No meio de cima: Espaço para publicar
      */}
      <AppHeader />

      {/* Main Content View Container */}
      <main className="flex-1 w-full">
        {activeTab === 'feed' && <FeedTab />}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Bottom Navigation Bar:
          - 1º Casa
          - 2º Mensagens
          - 3º Notificações
          - 4º Definições
      */}
      <BottomNav />

      {/* Modals & Dialogs */}
      <CreatePostModal />
      <CommentsModal />
      <MakeOfferModal />
      <LoginModal />

      {/* Quick Action Toast */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-md shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
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
