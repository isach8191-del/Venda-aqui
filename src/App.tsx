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
import { LocationPromptModal } from './components/LocationPromptModal';
import { CountryChangeModal } from './components/CountryChangeModal';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';

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
    setActiveReviewTarget,
    isLocationPromptOpen,
    allowLocationPermission,
    denyLocationPermission,
    countryChangePrompt,
    confirmCountryChange,
    dismissCountryChange,
    isLocationDetecting
  } = useApp();

  const [minTimePassed, setMinTimePassed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  // Keep loading screen at least 2.2 seconds for handwriting animation to complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // When both minTimePassed (>= 2.2s) and authLoading is false, fade smoothly to login/feed
  useEffect(() => {
    if (minTimePassed && !authLoading) {
      setIsFadingOut(true);
      const initialEl = document.getElementById('initial-loading-screen');
      if (initialEl) {
        initialEl.classList.add('fade-out');
      }
      const fadeTimer = setTimeout(() => {
        setSplashFinished(true);
        if (initialEl && initialEl.parentNode) {
          initialEl.parentNode.removeChild(initialEl);
        }
      }, 420);
      return () => clearTimeout(fadeTimer);
    }
  }, [minTimePassed, authLoading]);

  // Loading Screen Overlay Component
  const loadingOverlay = !splashFinished ? (
    <div
      className={`fixed inset-0 z-[999999] bg-white flex flex-col items-center justify-center p-4 transition-opacity duration-400 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#ffffff' }}
      aria-live="polite"
      role="status"
    >
      <ShoppingCart className="w-8 h-8 text-black mb-3 stroke-[2]" />
      <span className="hic-venditur-animated-name text-black text-2xl sm:text-3xl">
        Hic Venditur
      </span>
    </div>
  ) : null;

  // 2. Strict Login Gate: Sem conta, não se acede ao app!
  if (!user) {
    return (
      <>
        {loadingOverlay}
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
    return (
      <>
        {loadingOverlay}
        <BlockedScreen />
      </>
    );
  }

  // 4. Authenticated App Shell with strictly fixed top and bottom bars
  return (
    <>
      {loadingOverlay}
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

      {/* Location Permission Prompt Modal */}
      <LocationPromptModal
        isOpen={isLocationPromptOpen}
        onAllow={allowLocationPermission}
        onDeny={denyLocationPermission}
        loading={isLocationDetecting}
      />

      {/* Country & Currency Change Confirmation Modal */}
      {countryChangePrompt && (
        <CountryChangeModal
          isOpen={Boolean(countryChangePrompt)}
          countryName={countryChangePrompt.countryName}
          currencyCode={countryChangePrompt.newCurrency}
          onConfirm={confirmCountryChange}
          onDismiss={dismissCountryChange}
          loading={isLocationDetecting}
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
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
