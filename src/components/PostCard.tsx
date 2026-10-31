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
  ShieldCheck, 
  Trash2,
  Star,
  CheckCircle2,
  ShieldAlert,
  Languages,
  Loader2,
  Sparkles
} from 'lucide-react';
import { DEFAULT_AVATAR } from '../data/seedData';
import { ReviewModal } from './ReviewModal';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { 
    user, 
    isAdmin,
    toggleLikePost, 
    setActiveCommentsPost, 
    setActiveOfferPost, 
    startChatWithSeller, 
    deletePost,
    openUserProfile,
    markPostAsCompleted,
    setActiveReportTarget,
    showToast,
    formatPrice,
    formatRelativePostTime,
    translatePost,
    postTranslations,
    language,
    t
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [translating, setTranslating] = useState(false);

  const isOwner = user?.id === post.sellerId || user?.id === post.seller.id;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#produto-${post.id}`);
      showToast(t.common.success);
    } else {
      showToast(t.common.success);
    }
  };

  const handleToggleTranslate = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    const cacheKey = `${post.id}_${language}`;
    if (postTranslations[cacheKey]) {
      setIsTranslated(true);
      return;
    }

    setTranslating(true);
    try {
      await translatePost(post);
      setIsTranslated(true);
    } catch (e) {
      console.error(e);
      showToast(t.common.error);
    } finally {
      setTranslating(false);
    }
  };

  const cachedTranslation = postTranslations[`${post.id}_${language}`];
  const displayTitle = isTranslated && cachedTranslation ? cachedTranslation.title : post.title;
  const displayDescription = isTranslated && cachedTranslation ? cachedTranslation.description : post.description;

  const formattedPrice = formatPrice(post.price, post.currency);
  const formattedTime = formatRelativePostTime(post.createdAt);

  return (
    <article className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm overflow-hidden transition-colors duration-200 shadow-2xs">
      
      {/* 1. Header: Seller info (Tap to open Facebook-style profile) & Condition */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-900">
        <div 
          onClick={() => openUserProfile(post.seller)}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
          title={`${t.post.seller}: ${post.seller.name}`}
        >
          <img
            src={post.seller.avatar || DEFAULT_AVATAR}
            alt={post.seller.name}
            className="w-9 h-9 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0 group-hover:opacity-80 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs sm:text-sm text-black dark:text-white truncate group-hover:underline">
                {post.seller.name}
              </span>
              {post.seller.verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />
              )}
              <span className="text-[11px] text-neutral-500">
                @{post.seller.username}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1 truncate max-w-[150px]">
                <MapPin className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{post.location}</span>
              </span>
              <span>·</span>
              <span className="shrink-0">{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Condition & Category Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 hidden sm:inline-block">
            {post.category}
          </span>

          {post.condition === 'novo' ? (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-sm bg-black dark:bg-white text-white dark:text-black">
              {t.post.conditionNew}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900">
              {t.post.conditionUsed}
            </span>
          )}

          {isOwner && (
            <button
              onClick={() => deletePost(post.id)}
              className="p-1 text-neutral-400 hover:text-red-500 transition-colors ml-1 cursor-pointer"
              title={t.common.delete}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Product Photo */}
      <div className="relative bg-neutral-100 dark:bg-neutral-950 aspect-[4/3] w-full overflow-hidden flex items-center justify-center">
        {!imageError && post.images?.[0] ? (
          <img
            src={post.images[0]}
            alt={post.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover select-none"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-neutral-400">
            <span className="text-xs font-semibold">{post.title}</span>
            <span className="text-[10px] mt-1">{t.common.error}</span>
          </div>
        )}

        {/* Sober Price Tag */}
        <div className="absolute bottom-2.5 left-2.5 rtl:left-auto rtl:right-2.5 bg-black/90 dark:bg-white/95 text-white dark:text-black px-2.5 py-1 rounded-sm backdrop-blur-xs font-black text-sm sm:text-base tracking-tight tabular-nums shadow-sm">
          {formattedPrice}
        </div>

        {/* Mobile category badge */}
        <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 sm:hidden bg-black/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase">
          {post.category}
        </div>
      </div>

      {/* 3. Description & Details */}
      <div className="p-3 sm:p-3.5">
        
        {/* Title & AI Translation Bar */}
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-bold text-sm sm:text-base text-black dark:text-white leading-snug flex-1">
            {displayTitle}
          </h2>

          {/* Traduzir Button */}
          <button
            onClick={handleToggleTranslate}
            disabled={translating}
            className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-xs text-[10px] font-semibold transition-colors cursor-pointer border ${
              isTranslated
                ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border-neutral-400 dark:border-neutral-600'
                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white'
            }`}
            title="Traduzir anúncio com Inteligência Artificial"
          >
            {translating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t.post.translating}</span>
              </>
            ) : isTranslated ? (
              <>
                <Languages className="w-3 h-3" />
                <span>{t.post.viewOriginal}</span>
              </>
            ) : (
              <>
                <Languages className="w-3 h-3" />
                <span>{t.post.translate}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Translation Indicator */}
        {isTranslated && (
          <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500 font-medium">
            <Sparkles className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
            <span>{t.post.translatedWithAI}</span>
          </div>
        )}

        <p className={`text-xs text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
          {displayDescription}
        </p>

        {displayDescription.length > 90 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-bold text-black dark:text-white mt-1 underline hover:opacity-75 cursor-pointer"
          >
            {isExpanded ? '−' : '+'} {isExpanded ? 'Ver menos' : 'Ver mais'}
          </button>
        )}

        {/* Social & Buyer Interactions */}
        <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-neutral-100 dark:border-neutral-900">
          
          {/* Social icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleLikePost(post.id)}
              className={`flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
                post.isLiked 
                  ? 'text-black dark:text-white' 
                  : 'text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
              title={post.isLiked ? 'Descurtir' : t.post.likes}
            >
              <Heart 
                className={`w-4 h-4 ${post.isLiked ? 'fill-black dark:fill-white stroke-black dark:stroke-white' : 'stroke-[1.75]'}`} 
              />
              <span className="tabular-nums text-xs">{post.likes}</span>
            </button>

            <button
              onClick={() => setActiveCommentsPost(post)}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title={t.post.comments}
            >
              <MessageSquare className="w-4 h-4 stroke-[1.75]" />
              <span className="tabular-nums text-xs">{post.commentsCount ?? post.comments?.length ?? 0}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-1 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title={t.post.share}
            >
              <Share2 className="w-4 h-4 stroke-[1.75]" />
            </button>

            {!isOwner && (
              <button
                onClick={() => setActiveReportTarget({
                  targetType: 'post',
                  targetId: post.id,
                  targetTitle: post.title,
                  targetUserId: post.sellerId || post.seller.id,
                })}
                className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                title={t.common.report}
              >
                <ShieldAlert className="w-4 h-4 stroke-[1.75]" />
              </button>
            )}
          </div>

          {/* Action buttons: Classic, small, sober */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isAdmin && (
              <button
                onClick={() => {
                  if (window.confirm(t.admin.deleteListing + '?')) {
                    deletePost(post.id);
                  }
                }}
                className="py-1 px-2 rounded-xs border border-neutral-300 dark:border-neutral-700 hover:border-red-600 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center gap-1 cursor-pointer"
                title={t.admin.deleteListing}
              >
                <Trash2 className="w-3 h-3" />
                <span>{t.common.delete}</span>
              </button>
            )}

            {post.status === 'vendido' && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                {t.common.sold}
              </span>
            )}

            {!isOwner && post.status === 'vendido' && (
              <button
                onClick={() => setIsReviewOpen(true)}
                className="py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-black dark:hover:border-white text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                title={t.post.leaveReview}
              >
                <Star className="w-3 h-3 fill-black dark:fill-white text-black dark:text-white" />
                <span>{t.post.leaveReview}</span>
              </button>
            )}

            {!isOwner && post.status !== 'vendido' && (
              <>
                <button
                  onClick={() => setActiveOfferPost(post)}
                  className="py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-[11px] font-semibold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title={t.post.makeOffer}
                >
                  <BadgePercent className="w-3 h-3" />
                  <span className="hidden sm:inline">{t.post.makeOffer}</span>
                </button>

                <button
                  onClick={() => startChatWithSeller(post)}
                  className="py-1 px-2.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                  title={t.post.chatWithSeller}
                >
                  <Send className="w-3 h-3 rtl:rotate-180" />
                  <span>{t.post.chatWithSeller}</span>
                </button>
              </>
            )}

            {isOwner && post.status !== 'vendido' && (
              <button
                onClick={() => markPostAsCompleted(post.id)}
                className="py-1 px-2.5 rounded-sm border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                title={t.post.markCompleted}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{t.post.markCompleted}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Review Modal on Post if triggered */}
      {isReviewOpen && (
        <ReviewModal
          sellerId={post.sellerId || post.seller.id}
          sellerName={post.seller.name}
          sellerAvatar={post.seller.avatar}
          productId={post.id}
          productTitle={post.title}
          onClose={() => setIsReviewOpen(false)}
        />
      )}

    </article>
  );
};
