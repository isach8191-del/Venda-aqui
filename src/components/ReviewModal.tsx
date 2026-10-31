import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DEFAULT_AVATAR } from '../data/seedData';

interface ReviewModalProps {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  productId?: string;
  productTitle?: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  sellerId,
  sellerName,
  sellerAvatar,
  productId,
  productTitle,
  onClose,
  onSubmitted,
}) => {
  const { addReviewToSeller, showToast } = useApp();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Por favor escreva um comentário sobre a experiência de compra.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await addReviewToSeller(sellerId, rating, comment.trim(), productId, productTitle);
      showToast('Avaliação enviada com sucesso ao vendedor!');
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar avaliação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
            Avaliar Vendedor
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white flex items-center gap-2 rounded-sm">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Seller Preview */}
          <div className="flex items-center gap-2.5 p-2.5 bg-neutral-50 dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800">
            <img
              src={sellerAvatar || DEFAULT_AVATAR}
              alt={sellerName}
              className="w-10 h-10 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-black dark:text-white truncate">
                {sellerName}
              </p>
              {productTitle && (
                <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                  Produto negociado: {productTitle}
                </p>
              )}
            </div>
          </div>

          {/* Star Rating Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5 text-center">
              Como foi sua experiência com este vendedor?
            </label>
            <div className="flex items-center justify-center gap-2 py-1">
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
                    className={`w-6 h-6 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-black dark:fill-white text-black dark:text-white'
                        : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] font-mono text-neutral-500 mt-0.5">
              {rating} de 5 estrelas
            </p>
          </div>

          {/* Review comment */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              O seu comentário sobre a venda *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ex: Produto exatamente como descrito no anúncio, entrega rápida e ótimo atendimento..."
              className="w-full px-2.5 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* Action buttons (Sober, classic & small) */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-3.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'A enviar...' : 'Enviar Avaliação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
