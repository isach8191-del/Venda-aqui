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
import { ShopsTab } from './components/ShopsTab';
import { ShopDetailView } from './components/ShopDetailView';
import { MessagesTab } from './components/MessagesTab';
import { NotificationsTab } from './components/NotificationsTab';
import { SettingsTab } from './components/SettingsTab';
import { UserProfileView } from './components/UserProfileView';
import { EditProfileModal } from './components/EditProfileModal';
import { CreatePostModal } from './components/CreatePostModal';
import { EditPostModal } from './components/EditPostModal';
import { CommentsModal } from './components/CommentsModal';
import { MakeOfferModal } from './components/MakeOfferModal';
import { RegisterShopModal } from './components/RegisterShopModal';
import { EditShopModal } from './components/EditShopModal';
import { AddProductModal } from './components/AddProductModal';
import { ShopReviewModal } from './components/ShopReviewModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ReportModal } from './components/ReportModal';
import { TermsModal } from './components/TermsModal';
import { BlockedScreen } from './components/BlockedScreen';
import { ReviewModal } from './components/ReviewModal';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { 
    user, 
    authLoading, 
    activeTab, 
    selectedProfileUser, 
    toastMessage,
    isAdminPanelOpen,
    setIsAdminPanelOpen,
    activeReportTarget,
    setActiveReportTarget,
    isTermsModalOpen,
    setIsTermsModalOpen,
    termsModalMode,
    activeReviewTarget,
    setActiveReviewTarget
  } = useApp();

  // 1. Initial Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 rounded-none border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black text-xs flex items-center justify-center animate-pulse mb-3">
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
    return (
      <>
        <LoginScreen />
        {isTermsModalOpen && (
          <TermsModal
            mode={termsModalMode}
            onClose={() => setIsTermsModalOpen(false)}
          />
        )}
      </>
    );
  }

  // 3. Blocked User Screen (utilizador bloqueado não consegue entrar nem publicar)
  if (user.isBlocked) {
    return <BlockedScreen />;
  }

  // 4. Authenticated App Shell with strictly fixed top and bottom bars
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-150 flex flex-col font-sans pt-14 pb-20 sm:pb-24 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Top Fixed Header (pequena e clássica, botão único "Publicar" no topo) */}
      <AppHeader />

      {/* Main Content View */}
      <main className="flex-1 w-full">
        {selectedProfileUser ? (
          /* Facebook-Style User Profile Page */
          <UserProfileView />
        ) : (
          <>
            {activeTab === 'feed' && <FeedTab />}
            {activeTab === 'shops' && <ShopsTab />}
            {activeTab === 'shop_detail' && <ShopDetailView />}
            {activeTab === 'messages' && <MessagesTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </>
        )}
      </main>

      {/* Bottom Fixed Navigation Bar (Casa, Lojas, Mensagens, Notificações, Definições) */}
      <BottomNav />

      {/* Modals & Dialogs */}
      <CreatePostModal />
      <EditPostModal />
      <EditProfileModal />
      <CommentsModal />
      <MakeOfferModal />
      <RegisterShopModal />
      <EditShopModal />
      <AddProductModal />
      <ShopReviewModal />

      {/* Admin Panel Modal (exclusivo para isach8191@gmail.com) */}
      {isAdminPanelOpen && (
        <AdminPanelModal onClose={() => setIsAdminPanelOpen(false)} />
      )}

      {/* Report Modal */}
      {activeReportTarget && (
        <ReportModal
          targetType={activeReportTarget.targetType}
          targetId={activeReportTarget.targetId}
          targetTitle={activeReportTarget.targetTitle}
          targetUserId={activeReportTarget.targetUserId}
          onClose={() => setActiveReportTarget(null)}
        />
      )}

      {/* Terms & About Modal */}
      {isTermsModalOpen && (
        <TermsModal
          mode={termsModalMode}
          onClose={() => setIsTermsModalOpen(false)}
        />
      )}

      {/* Seller Review Modal */}
      {activeReviewTarget && (
        <ReviewModal
          sellerId={activeReviewTarget.seller.id}
          sellerName={activeReviewTarget.seller.name}
          sellerAvatar={activeReviewTarget.seller.avatar}
          productId={activeReviewTarget.post?.id}
          productTitle={activeReviewTarget.post?.title}
          onClose={() => setActiveReviewTarget(null)}
        />
      )}

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-none shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
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
