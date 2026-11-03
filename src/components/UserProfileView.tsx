import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ReviewModal } from './ReviewModal';
import { Review } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Edit3, 
  MessageCircle, 
  Package, 
  Calendar,
  Share2,
  CheckCircle,
  MessageSquare,
  ShieldAlert,
  Ban
} from 'lucide-react';
import { DEFAULT_COVER, DEFAULT_AVATAR } from '../data/seedData';

export const UserProfileView: React.FC = () => {
  const { 
    selectedProfileUser, 
    closeUserProfile, 
    user, 
    posts, 
    setIsEditProfileOpen,
    setActiveTab,
    fetchSellerReviews,
    setActiveReportTarget,
    blockUser,
    startChatWithUser,
    showToast 
  } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'ativos' | 'todos' | 'avaliacoes'>('ativos');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (!selectedProfileUser) return null;

  const isMyProfile = user?.id === selectedProfileUser.id;

  // Load reviews for this seller
  useEffect(() => {
    let isMounted = true;
    const loadReviews = async () => {
      setReviewsLoading(true);
      const res = await fetchSellerReviews(selectedProfileUser.id);
      if (isMounted) {
        setReviews(res as Review[]);
        setReviewsLoading(false);
      }
    };
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [selectedProfileUser.id]);

  // Filter listings by this user
  const userPosts = posts.filter(
    (p) => p.sellerId === selectedProfileUser.id || p.seller.id === selectedProfileUser.id
  );

  const activePosts = userPosts.filter((p) => p.status === 'disponivel');

  const displayedPosts = activeTabFilter === 'ativos' ? activePosts : userPosts;

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#perfil-${selectedProfileUser.username}`);
      showToast('Link do perfil copiado!');
    } else {
      showToast('Link copiado!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={closeUserProfile}
          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-black dark:hover:border-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Feed</span>
        </button>

        <button
          onClick={handleShareProfile}
          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-black dark:hover:border-white transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Partilhar Perfil</span>
        </button>
      </div>

      {/* Facebook-style Profile Header Card */}
      <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden shadow-xs">
        
        {/* Cover Photo (Foto de Capa) */}
        <div className="relative h-44 sm:h-56 w-full bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
          <img
            src={selectedProfileUser.coverPhoto || DEFAULT_COVER}
            alt="Foto de capa"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {isMyProfile && (
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute top-3 right-3 py-1 px-2 rounded-sm bg-black/75 hover:bg-black text-white text-[11px] font-semibold border border-white/30 backdrop-blur-xs flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar Capa</span>
            </button>
          )}
        </div>

        {/* Profile Info Row: Avatar + Name + Action Buttons */}
        <div className="px-4 sm:px-6 pb-5 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
            
            {/* Overlapping Avatar */}
            <div className="relative inline-block shrink-0">
              <img
                src={selectedProfileUser.avatar || DEFAULT_AVATAR}
                alt={selectedProfileUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-black bg-neutral-100 dark:bg-neutral-900 shadow-md"
              />
              {selectedProfileUser.verified && (
                <div 
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border-2 border-white dark:border-black shadow-xs" 
                  title="Utilizador Verificado"
                >
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Profile Action Buttons (Classic, small & sober) */}
            <div className="flex items-center gap-2 self-start sm:self-end flex-wrap">
              {isMyProfile ? (
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="py-1.5 px-3 bg-black dark:bg-white text-white dark:text-black rounded-sm text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:border-black dark:hover:border-white transition-colors flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-black dark:fill-white text-black dark:text-white" />
                    <span>Avaliar Vendedor</span>
                  </button>

                  <button
                    onClick={() => startChatWithUser(selectedProfileUser)}
                    className="py-1.5 px-3 bg-black dark:bg-white text-white dark:text-black rounded-sm text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title={`Conversar com ${selectedProfileUser.name}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Mensagem</span>
                  </button>

                  <button
                    onClick={() => setActiveReportTarget({
                      targetType: 'user',
                      targetId: selectedProfileUser.id,
                      targetTitle: selectedProfileUser.name,
                      targetUserId: selectedProfileUser.id,
                    })}
                    className="py-1.5 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-red-600 hover:text-red-600 text-xs font-semibold text-neutral-600 dark:text-neutral-400 transition-colors flex items-center gap-1"
                    title="Denunciar este utilizador"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Denunciar</span>
                  </button>

                  <button
                    onClick={() => blockUser(selectedProfileUser.id)}
                    className="py-1.5 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-semibold text-neutral-600 dark:text-neutral-400 transition-colors flex items-center gap-1"
                    title="Bloquear utilizador"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Bloquear</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Names, Location & Rating Stats */}
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-black dark:text-white">
                  {selectedProfileUser.name}
                </h1>
                <span className="text-xs text-neutral-500 font-medium">
                  @{selectedProfileUser.username}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedProfileUser.location || 'Localização não informada'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-bold text-black dark:text-white">
                  <Star className="w-3.5 h-3.5 fill-black dark:fill-white text-black dark:text-white" />
                  {selectedProfileUser.rating ? Number(selectedProfileUser.rating).toFixed(1) : '5.0'} ★ ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {selectedProfileUser.totalSales || 0} {selectedProfileUser.totalSales === 1 ? 'venda concluída' : 'vendas concluídas'}
                </span>
              </div>
            </div>

            {/* Bio text */}
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 max-w-xl leading-relaxed whitespace-pre-line pt-1">
              {selectedProfileUser.bio || 'Este utilizador ainda não adicionou uma biografia.'}
            </p>
          </div>
        </div>

        {/* Section Tabs: Anúncios Disponíveis | Histórico Completo | Avaliações */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 flex items-center gap-4 bg-neutral-50/70 dark:bg-neutral-900/50 overflow-x-auto">
          <button
            onClick={() => setActiveTabFilter('ativos')}
            className={`py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeTabFilter === 'ativos'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Anúncios Disponíveis ({activePosts.length})
          </button>

          <button
            onClick={() => setActiveTabFilter('todos')}
            className={`py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${
              activeTabFilter === 'todos'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Todos os Anúncios ({userPosts.length})
          </button>

          <button
            onClick={() => setActiveTabFilter('avaliacoes')}
            className={`py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTabFilter === 'avaliacoes'
                ? 'border-black dark:border-white text-black dark:text-white'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Avaliações dos Compradores ({reviews.length})</span>
          </button>
        </div>
      </div>

      {/* Content for Tabs */}
      {activeTabFilter === 'avaliacoes' ? (
        /* Seller Reviews List */
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Avaliações de Compradores ({reviews.length})
            </h2>
            {!isMyProfile && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="py-1 px-2.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Escrever Avaliação
              </button>
            )}
          </div>

          {reviewsLoading ? (
            <div className="text-center py-8 text-neutral-400 text-xs">
              A carregar avaliações do vendedor...
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-2.5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.buyerAvatar || DEFAULT_AVATAR}
                        alt={rev.buyerName}
                        className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                      />
                      <div>
                        <span className="font-bold text-xs text-black dark:text-white">
                          {rev.buyerName}
                        </span>
                        <span className="text-[10px] text-neutral-500 ml-1.5">
                          @{rev.buyerUsername}
                        </span>
                      </div>
                    </div>

                    {/* Star display */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            rev.rating >= star
                              ? 'fill-black dark:fill-white text-black dark:text-white'
                              : 'text-neutral-300 dark:text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pl-9">
                    {rev.comment}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 pl-9 pt-1">
                    {rev.productTitle && (
                      <span className="italic truncate max-w-[200px]">
                        Item: {rev.productTitle}
                      </span>
                    )}
                    <span>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('pt-BR') : 'Data recente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-950">
              <Star className="w-8 h-8 mx-auto text-neutral-400 mb-2 opacity-50" />
              <p className="text-xs font-bold text-black dark:text-white">
                Ainda não existem avaliações para este vendedor
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Após concluir uma compra, o comprador pode deixar estrelas e comentário aqui.
              </p>
              {!isMyProfile && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="mt-3 py-1 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-semibold"
                >
                  Deixar Primeira Avaliação
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* User's Listings Feed */
        <div className="space-y-4 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Anúncios de {selectedProfileUser.name} ({displayedPosts.length})
          </h2>

          {displayedPosts.length > 0 ? (
            <div className="space-y-4">
              {displayedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-950">
              <Package className="w-8 h-8 mx-auto text-neutral-400 mb-2 opacity-50" />
              <p className="text-xs font-bold text-black dark:text-white">
                Nenhum anúncio publicado nesta secção
              </p>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          sellerId={selectedProfileUser.id}
          sellerName={selectedProfileUser.name}
          sellerAvatar={selectedProfileUser.avatar}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmitted={async () => {
            const updatedReviews = await fetchSellerReviews(selectedProfileUser.id);
            setReviews(updatedReviews as Review[]);
          }}
        />
      )}

    </div>
  );
};
