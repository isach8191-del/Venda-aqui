import React, { useState } from 'react';
import { Post } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Send, 
  BadgePercent, 
  MapPin, 
  CheckCircle2, 
  MoreHorizontal,
  Eye,
  Trash2
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { 
    user, 
    toggleLikePost, 
    setActiveCommentsPost, 
    setActiveOfferPost, 
    startChatWithSeller, 
    deletePost,
    showToast 
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?.id === post.seller.id;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#produto-${post.id}`);
      showToast('Link do anúncio copiado!');
    } else {
      showToast('Link copiado!');
    }
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(post.price);

  return (
    <article className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-xl overflow-hidden transition-colors duration-200">
      
      {/* 1. Header: Vendedor & Condição (Novo / Usado) */}
      <div className="p-4 flex items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-900">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={post.seller.avatar}
            alt={post.seller.name}
            className="w-10 h-10 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-black dark:text-white truncate">
                {post.seller.name}
              </span>
              {post.seller.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
              )}
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                @{post.seller.username}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {post.location}
              </span>
              <span>·</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Condition Badge (NOVO ou USADO) & Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {post.condition === 'novo' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black">
              Novo
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900">
              Usado
            </span>
          )}

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Opções do anúncio"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg py-1 z-20">
                  <button
                    onClick={() => {
                      deletePost(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir anúncio
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Foto do Produto */}
      <div className="relative bg-neutral-100 dark:bg-neutral-950 aspect-[4/3] w-full overflow-hidden flex items-center justify-center">
        {!imageError && post.images?.[0] ? (
          <img
            src={post.images[0]}
            alt={post.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400">
            <span className="text-sm font-semibold">{post.title}</span>
            <span className="text-xs mt-1">Imagem indisponível</span>
          </div>
        )}

        {/* Floating Price Tag */}
        <div className="absolute bottom-3 left-3 bg-black/90 dark:bg-white/95 text-white dark:text-black px-3 py-1.5 backdrop-blur-xs font-black text-lg tracking-tight tabular-nums shadow-md">
          {formattedPrice}
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3 bg-black/75 dark:bg-black/85 text-white text-[11px] font-semibold px-2.5 py-1 tracking-wide backdrop-blur-xs uppercase">
          {post.category}
        </div>
      </div>

      {/* 3. Informações & Descrição */}
      <div className="p-4">
        <h2 className="font-bold text-base sm:text-lg text-black dark:text-white leading-snug">
          {post.title}
        </h2>

        <p className={`text-sm text-neutral-600 dark:text-neutral-300 mt-2 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {post.description}
        </p>

        {post.description.length > 90 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-black dark:text-white mt-1 underline hover:opacity-75"
          >
            {isExpanded ? 'Ver menos' : 'Ver mais'}
          </button>
        )}

        {/* Quick Social Interactions Row */}
        <div className="flex items-center justify-between pt-4 mt-3 border-t border-neutral-100 dark:border-neutral-900">
          
          {/* Left social actions: Curtir, Comentários, Compartilhar */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => toggleLikePost(post.id)}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                post.isLiked 
                  ? 'text-black dark:text-white' 
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
              title={post.isLiked ? 'Descurtir' : 'Curtir publicação'}
            >
              <Heart 
                className={`w-5 h-5 ${post.isLiked ? 'fill-black dark:fill-white stroke-black dark:stroke-white' : 'stroke-[1.75]'}`} 
              />
              <span className="tabular-nums">{post.likes}</span>
            </button>

            <button
              onClick={() => setActiveCommentsPost(post)}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              title="Ver comentários"
            >
              <MessageSquare className="w-5 h-5 stroke-[1.75]" />
              <span className="tabular-nums">{post.comments.length}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              title="Compartilhar produto"
            >
              <Share2 className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>

          {/* Right buyer actions: Fazer Proposta & Conversar */}
          <div className="flex items-center gap-2">
            {!isOwner && (
              <>
                <button
                  onClick={() => setActiveOfferPost(post)}
                  className="px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1"
                  title="Fazer uma proposta de valor menor"
                >
                  <BadgePercent className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Proposta</span>
                </button>

                <button
                  onClick={() => startChatWithSeller(post)}
                  className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity flex items-center gap-1.5"
                  title="Iniciar conversa com o vendedor"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Conversar</span>
                </button>
              </>
            )}

            {isOwner && (
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Seu anúncio
              </span>
            )}
          </div>

        </div>

      </div>

    </article>
  );
};
