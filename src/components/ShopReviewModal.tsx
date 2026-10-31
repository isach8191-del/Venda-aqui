import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, Send } from 'lucide-react';

export const ShopReviewModal: React.FC = () => {
  const { activeShopReviewModal, setActiveShopReviewModal, addShopReview, showToast } = useApp();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!activeShopReviewModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Por favor escreva um comentário sobre a sua experiência com a loja.');
      return;
    }

    setLoading(true);
    try {
      await addShopReview(activeShopReviewModal.id, rating, comment.trim());
      setComment('');
      setRating(5);
    } catch (err: any) {
      showToast(err?.message || 'Erro ao enviar avaliação da loja.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-black dark:fill-white text-black dark:text-white" />
            <h3 className="font-extrabold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              Avaliar Loja: {activeShopReviewModal.name}
            </h3>
          </div>
          <button
            onClick={() => setActiveShopReviewModal(null)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Star selector (1 to 5) */}
          <div className="text-center py-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Classificação (1 a 5 estrelas)
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-black dark:fill-white text-black dark:text-white'
                        : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] font-bold text-black dark:text-white mt-1 block">
              {rating === 5 ? 'Excelente' : rating === 4 ? 'Muito Bom' : rating === 3 ? 'Bom' : rating === 2 ? 'Razoável' : 'Fraco'}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              O seu comentário sobre a loja *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={3}
              placeholder="Como foi o atendimento, a rapidez de resposta, os preços e as entregas?..."
              className="w-full px-2.5 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveShopReviewModal(null)}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-3.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{loading ? 'A enviar...' : 'Publicar Avaliação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
