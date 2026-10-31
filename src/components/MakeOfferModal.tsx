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
    showToast(`Proposta de R$ ${numericOffer.toLocaleString('pt-BR')} enviada!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-4 h-4 text-black dark:text-white" />
            <h3 className="font-bold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              Fazer Proposta
            </h3>
          </div>
          <button
            onClick={() => setActiveOfferPost(null)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSendOffer} className="p-4 space-y-3 text-xs">
          <div className="flex items-center gap-2.5 p-2 bg-neutral-100 dark:bg-neutral-900 rounded-sm">
            <img
              src={activeOfferPost.images[0]}
              alt={activeOfferPost.title}
              className="w-10 h-10 rounded-xs object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-black dark:text-white truncate">
                {activeOfferPost.title}
              </p>
              <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                Preço: R$ {originalPrice.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              Descontos Rápidos
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => applyDiscount(5)}
                className="py-1 px-1.5 border border-neutral-300 dark:border-neutral-800 rounded-sm text-[11px] font-semibold hover:border-black dark:hover:border-white text-neutral-800 dark:text-neutral-200"
              >
                -5%
              </button>
              <button
                type="button"
                onClick={() => applyDiscount(10)}
                className="py-1 px-1.5 border border-neutral-300 dark:border-neutral-800 rounded-sm text-[11px] font-semibold hover:border-black dark:hover:border-white text-neutral-800 dark:text-neutral-200"
              >
                -10%
              </button>
              <button
                type="button"
                onClick={() => applyDiscount(15)}
                className="py-1 px-1.5 border border-neutral-300 dark:border-neutral-800 rounded-sm text-[11px] font-semibold hover:border-black dark:hover:border-white text-neutral-800 dark:text-neutral-200"
              >
                -15%
              </button>
            </div>
          </div>

          {/* Input do valor */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Valor da sua proposta (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs text-neutral-500 font-mono">
                R$
              </span>
              <input
                type="number"
                value={offerValue}
                onChange={(e) => setOfferValue(e.target.value)}
                placeholder={originalPrice.toString()}
                className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white font-mono text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Mensagem opcional */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Mensagem para o Vendedor (opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Ex: Posso pagar hoje por PIX e retirar pessoalmente..."
              className="w-full px-2.5 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveOfferPost(null)}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="py-1.5 px-3.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar Proposta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
