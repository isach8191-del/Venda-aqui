import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShopReview } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock, 
  Truck, 
  CheckCircle, 
  Star, 
  MessageCircle, 
  MessageSquare,
  Plus, 
  Edit3, 
  Trash2, 
  ShieldAlert, 
  Share2, 
  Package, 
  AlertCircle 
} from 'lucide-react';
import { DEFAULT_COVER, DEFAULT_AVATAR } from '../data/seedData';

export const ShopDetailView: React.FC = () => {
  const { 
    selectedShop, 
    closeShopDetail, 
    user, 
    isAdmin, 
    setIsEditShopModalOpen, 
    setIsAddProductModalOpen, 
    setActiveShopReviewModal,
    setActiveReportTarget,
    deleteShop,
    toggleShopVerification,
    shopProducts,
    shopProductsLoading,
    toggleShopProductStatus,
    deleteShopProduct,
    fetchShopReviews,
    startChatWithUser,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catalog' | 'reviews'>('catalog');
  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (selectedShop) {
      setReviewsLoading(true);
      fetchShopReviews(selectedShop.id).then((res) => {
        setReviews(res);
        setReviewsLoading(false);
      });
    }
  }, [selectedShop]);

  if (!selectedShop) return null;

  const isOwner = user && user.id === selectedShop.ownerId;
  const cleanPhone = selectedShop.phone.replace(/[^0-9+]/g, '');
  const cleanWhatsApp = (selectedShop.whatsapp || selectedShop.phone).replace(/[^0-9]/g, '');

  const handleOpenWhatsApp = (customMessage?: string) => {
    const text = customMessage || `Olá ${selectedShop.name}! Vi a vossa loja no VENDA AQUI e gostaria de mais informações.`;
    const url = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${selectedShop.name} no VENDA AQUI`,
        text: `Confira a loja ${selectedShop.name} no VENDA AQUI!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link da loja copiado para a área de transferência!');
    }
  };

  const handleDeleteShopConfirm = async () => {
    if (window.confirm(`Tem a certeza que deseja eliminar permanentemente a loja "${selectedShop.name}"?`)) {
      await deleteShop(selectedShop.id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* Top Bar with Back Button */}
      <div className="p-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <button
          onClick={closeShopDetail}
          className="py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-semibold text-black dark:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar às Lojas</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-black dark:hover:border-white transition-colors"
            title="Partilhar loja"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveReportTarget({
              targetType: 'shop',
              targetId: selectedShop.id,
              targetTitle: selectedShop.name,
              targetUserId: selectedShop.ownerId,
            })}
            className="p-1.5 rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-red-600 hover:border-red-600 transition-colors"
            title="Denunciar loja"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Hero: Cover Photo & Logo */}
      <div className="relative bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="h-44 sm:h-56 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900">
          <img
            src={selectedShop.coverPhoto || DEFAULT_COVER}
            alt={selectedShop.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info Bar */}
        <div className="px-4 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-14 mb-3 gap-3">
            <div className="flex items-end gap-3.5">
              <img
                src={selectedShop.logo || DEFAULT_AVATAR}
                alt={selectedShop.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm object-cover border-3 border-white dark:border-neutral-950 bg-white dark:bg-neutral-900 shadow-md shrink-0"
              />
              <div className="pb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base sm:text-xl font-extrabold text-black dark:text-white uppercase tracking-tight">
                    {selectedShop.name}
                  </h1>
                  {selectedShop.verified && (
                    <span 
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-xs bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-wider"
                      title="Loja Verificada pelo Administrador"
                    >
                      <CheckCircle className="w-3 h-3 stroke-[2.5]" />
                      <span>Verificada</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                  <span className="font-semibold text-black dark:text-white">
                    {selectedShop.shopType}
                  </span>
                  <span>·</span>
                  <div className="flex items-center gap-1 text-black dark:text-white font-bold">
                    <Star className="w-3.5 h-3.5 fill-black dark:fill-white" />
                    <span>{selectedShop.rating.toFixed(1)}</span>
                    <span className="text-neutral-500 font-normal">({selectedShop.reviewCount} avaliações)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons (Mensagem, WhatsApp and Call) */}
            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 flex-wrap">
              {!isOwner && (
                <button
                  onClick={() => startChatWithUser({
                    id: selectedShop.ownerId,
                    name: selectedShop.name,
                    avatar: selectedShop.logo || DEFAULT_AVATAR,
                    username: selectedShop.name,
                    location: selectedShop.city,
                  })}
                  className="flex-1 sm:flex-initial py-1.5 px-3 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Enviar mensagem para esta loja"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Mensagem</span>
                </button>
              )}

              <button
                onClick={() => handleOpenWhatsApp()}
                className="flex-1 sm:flex-initial py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs font-bold uppercase tracking-wider hover:border-black dark:hover:border-white flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleCall}
                className="flex-1 sm:flex-initial py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Ligar</span>
              </button>
            </div>
          </div>

          {/* Owner / Admin Management Bar */}
          {(isOwner || isAdmin) && (
            <div className="mb-3 p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                {isOwner ? 'Painel do Dono da Loja' : 'Gestão de Administrador'}
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {isOwner && (
                  <>
                    <button
                      onClick={() => setIsAddProductModalOpen(true)}
                      className="py-1 px-2.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Adicionar Produto</span>
                    </button>

                    <button
                      onClick={() => setIsEditShopModalOpen(true)}
                      className="py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Editar Loja</span>
                    </button>
                  </>
                )}

                {isAdmin && (
                  <button
                    onClick={() => toggleShopVerification(selectedShop.id, selectedShop.verified)}
                    className="py-1 px-2.5 rounded-sm border border-black dark:border-white text-[11px] font-bold uppercase tracking-wider text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    {selectedShop.verified ? 'Remover Selo Verificada' : 'Atribuir Selo Verificada'}
                  </button>
                )}

                <button
                  onClick={handleDeleteShopConfirm}
                  className="py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-red-600 hover:text-red-600 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Eliminar Loja</span>
                </button>
              </div>
            </div>
          )}

          {/* Business Details Grid: Location, Hours, Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-3 border-t border-neutral-100 dark:border-neutral-850 text-xs">
            {/* Location */}
            <div className="flex items-start gap-2 p-2 rounded-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <MapPin className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black dark:text-white block text-[11px] uppercase tracking-wider">
                  Localização
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 text-xs">
                  {selectedShop.city}
                  {selectedShop.address ? ` · ${selectedShop.address}` : ''}
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-2 p-2 rounded-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <Clock className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black dark:text-white block text-[11px] uppercase tracking-wider">
                  Horário
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 text-xs">
                  {selectedShop.openingHours || '08:00 às 18:00'}
                </p>
              </div>
            </div>

            {/* Delivery badge */}
            <div className="flex items-start gap-2 p-2 rounded-sm bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <Truck className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-black dark:text-white block text-[11px] uppercase tracking-wider">
                  Entregas
                </span>
                <p className="text-xs font-semibold">
                  {selectedShop.hasDelivery ? (
                    <span className="text-black dark:text-white font-bold">
                      Faz entregas ao domicílio
                    </span>
                  ) : (
                    <span className="text-neutral-500">
                      Apenas levantamento no local
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedShop.description && (
            <div className="pt-2 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <p>{selectedShop.description}</p>
            </div>
          )}

        </div>

        {/* View Switcher: Catálogo vs Avaliações */}
        <div className="flex border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'catalog'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo de Produtos ({shopProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'reviews'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Avaliações ({reviews.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 mt-4">
        
        {/* TAB 1: CATÁLOGO DE PRODUTOS */}
        {activeTab === 'catalog' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-black dark:text-white">
                Produtos & Artigos Disponíveis
              </h2>

              {isOwner && (
                <button
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="py-1 px-2.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Novo Artigo</span>
                </button>
              )}
            </div>

            {shopProductsLoading ? (
              <div className="text-center py-12 text-xs text-neutral-400">
                A carregar catálogo da loja...
              </div>
            ) : shopProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {shopProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-sm overflow-hidden flex flex-col group shadow-2xs hover:border-black dark:hover:border-white transition-colors"
                  >
                    {/* Image & Status Badge */}
                    <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                      <img
                        src={prod.image || DEFAULT_COVER}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute top-2 left-2">
                        <span
                          className={`px-1.5 py-0.5 rounded-xs text-[9px] font-black uppercase tracking-wider ${
                            prod.status === 'disponivel'
                              ? 'bg-black dark:bg-white text-white dark:text-black'
                              : 'bg-neutral-800 text-neutral-300 line-through'
                          }`}
                        >
                          {prod.status === 'disponivel' ? 'Disponível' : 'Esgotado'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs text-black dark:text-white line-clamp-1">
                          {prod.title}
                        </h3>
                        {prod.description && (
                          <p className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">
                            {prod.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-850">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-black dark:text-white">
                            R$ {prod.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Customer order button */}
                        {prod.status === 'disponivel' ? (
                          <button
                            onClick={() => handleOpenWhatsApp(`Olá ${selectedShop.name}! Vi no VENDA AQUI o artigo "${prod.title}" por R$ ${prod.price.toLocaleString('pt-BR')}. Ainda está disponível?`)}
                            className="w-full py-1 px-2 rounded-sm bg-neutral-900 hover:bg-black dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Pedir no WhatsApp</span>
                          </button>
                        ) : (
                          <div className="w-full py-1 text-center text-[10px] text-neutral-400 font-semibold bg-neutral-100 dark:bg-neutral-900 rounded-sm">
                            Artigo Esgotado
                          </div>
                        )}

                        {/* Owner product controls */}
                        {(isOwner || isAdmin) && (
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 text-[10px]">
                            <button
                              onClick={() => toggleShopProductStatus(selectedShop.id, prod.id, prod.status)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-semibold"
                            >
                              {prod.status === 'disponivel' ? 'Marcar Esgotado' : 'Marcar Disponível'}
                            </button>
                            <button
                              onClick={() => deleteShopProduct(selectedShop.id, prod.id)}
                              className="text-neutral-400 hover:text-red-600"
                              title="Remover produto"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-950 p-6">
                <Package className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                <p className="text-xs font-bold text-black dark:text-white">
                  O catálogo desta loja ainda está vazio.
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  {isOwner ? 'Adicione os primeiros artigos da sua loja tocando no botão acima.' : 'O dono da loja adicionará produtos em breve.'}
                </p>
                {isOwner && (
                  <button
                    onClick={() => setIsAddProductModalOpen(true)}
                    className="mt-3 py-1.5 px-3 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider"
                  >
                    Adicionar Primeiro Produto
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AVALIAÇÕES */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-black dark:text-white">
                  Opiniões dos Clientes
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Média de {selectedShop.rating.toFixed(1)} estrelas com base em {reviews.length} avaliações
                </p>
              </div>

              {!isOwner && (
                <button
                  onClick={() => setActiveShopReviewModal(selectedShop)}
                  className="py-1.5 px-3 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Avaliar Loja</span>
                </button>
              )}
            </div>

            {reviewsLoading ? (
              <div className="text-center py-10 text-xs text-neutral-400">
                A carregar avaliações...
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-2.5">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-950 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.userAvatar || DEFAULT_AVATAR}
                          alt={rev.userName}
                          className="w-6 h-6 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                        />
                        <div>
                          <span className="font-bold text-xs text-black dark:text-white">
                            {rev.userName}
                          </span>
                          {rev.userUsername && (
                            <span className="text-[10px] text-neutral-500 ml-1">
                              @{rev.userUsername}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= rev.rating
                                ? 'fill-black dark:fill-white text-black dark:text-white'
                                : 'text-neutral-300 dark:text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {rev.comment}
                    </p>

                    <span className="text-[10px] text-neutral-400 mt-1.5 block">
                      {new Date(rev.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-950 p-6">
                <Star className="w-7 h-7 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                <p className="text-xs font-bold text-black dark:text-white">
                  Ainda sem avaliações
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Seja o primeiro a avaliar esta loja e partilhe a sua experiência com a comunidade.
                </p>
                {!isOwner && (
                  <button
                    onClick={() => setActiveShopReviewModal(selectedShop)}
                    className="mt-3 py-1.5 px-3 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider"
                  >
                    Deixar Avaliação
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
