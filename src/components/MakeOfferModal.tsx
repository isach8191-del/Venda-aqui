import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, BadgePercent, Send } from 'lucide-react';

export const MakeOfferModal: React.FC = () => {
  const { activeOfferPost, setActiveOfferPost, startChatWithSeller, showToast } = useApp();
  const [offerValue, setOfferValue] = useState('');
  const [message, setMessage] = useState('');

  if (!activeOfferPost) return null;

  const originalPrice = activeOfferPost.price;

  const applyDiscount = (percentage: number) => {
    const discounted = Math.round(originalPrice * (1 - percentage / 100));
    setOfferValue(discounted.toString());
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const numericOffer = parseFloat(offerValue);
    if (!numericOffer || numericOffer <= 0) {
      showToast('Digite um valor válido para a proposta');
      return;
    }

    const offerGreeting = `Olá ${activeOfferPost.seller.name}! Fiz uma proposta de R$ ${numericOffer.toLocaleString('pt-BR')} no seu produto "${activeOfferPost.title}" (Preço anunciado: R$ ${originalPrice.toLocaleString('pt-BR')}). ${message ? 'Mensagem: ' + message : ''}`;
    
    startChatWithSeller(activeOfferPost, offerGreeting);
    setActiveOfferPost(null);
    showToast(`Proposta de R$ ${numericOffer.toLocaleString('pt-BR')} enviada para o vendedor!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-black dark:text-white" />
            <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-tight">
              Fazer Proposta de Compra
            </h3>
          </div>
          <button
            onClick={() => setActiveOfferPost(null)}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendOffer} className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
            <img
              src={activeOfferPost.images[0]}
              alt={activeOfferPost.title}
              className="w-12 h-12 rounded object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-black dark:text-white truncate">
                {activeOfferPost.title}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Vendedor: {activeOfferPost.seller.name}
              </p>
              <p className="text-xs font-mono font-bold text-black dark:text-white mt-0.5">
                Preço original: R$ {originalPrice.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Sugestões rápidas de desconto:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyDiscount(5)}
                className="py-1.5 px-2 border border-neutral-300 dark:border-neutral-800 text-xs font-semibold hover:border-black dark:hover:border-white text-black dark:text-white"
              >
                -5% (R$ {Math.round(originalPrice * 0.95)})
              </button>
              <button
                type="button"
                onClick={() => applyDiscount(10)}
                className="py-1.5 px-2 border border-neutral-300 dark:border-neutral-800 text-xs font-semibold hover:border-black dark:hover:border-white text-black dark:text-white"
              >
                -10% (R$ {Math.round(originalPrice * 0.90)})
              </button>
              <button
                type="button"
                onClick={() => applyDiscount(15)}
                className="py-1.5 px-2 border border-neutral-300 dark:border-neutral-800 text-xs font-semibold hover:border-black dark:hover:border-white text-black dark:text-white"
              >
                -15% (R$ {Math.round(originalPrice * 0.85)})
              </button>
            </div>
          </div>

          {/* Input do valor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Sua Proposta em R$ *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-neutral-500">
                R$
              </span>
              <input
                type="number"
                value={offerValue}
                onChange={(e) => setOfferValue(e.target.value)}
                placeholder={originalPrice.toString()}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-sm font-bold focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Mensagem opcional */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Mensagem para o Vendedor (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Ex: Posso retirar amanhã mesmo e pagar à vista no PIX..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Proposta ao Vendedor</span>
          </button>
        </form>
      </div>
    </div>
  );
};
