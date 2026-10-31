import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ReportReason } from '../types';
import { X, ShieldAlert, AlertTriangle, Send } from 'lucide-react';

interface ReportModalProps {
  targetType: 'post' | 'user' | 'shop';
  targetId: string;
  targetTitle?: string;
  targetUserId?: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetType,
  targetId,
  targetTitle,
  targetUserId,
  onClose,
}) => {
  const { submitReport, showToast } = useApp();
  const [reason, setReason] = useState<ReportReason>('golpe');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const reasonsList: { id: ReportReason; label: string; desc: string }[] = [
    {
      id: 'golpe',
      label: 'Golpe ou Fraude',
      desc: 'Tentativa de extorsão, pagamento falso ou anúncio enganoso.',
    },
    {
      id: 'conteudo_ofensivo',
      label: 'Conteúdo Ofensivo',
      desc: 'Linguagem imprópria, assédio, ódio ou discriminação.',
    },
    {
      id: 'produto_proibido',
      label: 'Produto Proibido',
      desc: 'Itens ilícitos, falsificações ou produtos ilegais.',
    },
    {
      id: 'outro',
      label: 'Outro Motivo',
      desc: 'Outra violação das regras do VENDA AQUI.',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitReport({
        targetType,
        targetId,
        targetTitle,
        targetUserId,
        reason,
        description: description.trim(),
      });
      showToast('Denúncia enviada à administração para análise.');
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Erro ao enviar denúncia.');
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
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-black dark:text-white" />
            <h3 className="font-bold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              Denunciar {targetType === 'post' ? 'Anúncio' : targetType === 'shop' ? 'Loja ou Negócio' : 'Utilizador'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {targetTitle && (
            <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 truncate">
              Denunciando: <span className="font-bold text-black dark:text-white">{targetTitle}</span>
            </div>
          )}

          {/* Reason options */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Motivo da Denúncia *
            </label>
            <div className="space-y-1.5">
              {reasonsList.map((r) => (
                <label
                  key={r.id}
                  onClick={() => setReason(r.id)}
                  className={`flex items-start gap-2 p-2 rounded-sm border cursor-pointer transition-colors ${
                    reason === r.id
                      ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-900'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-xs text-black dark:text-white block">
                      {r.label}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {r.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Detalhes adicionais (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Explique o que aconteceu para ajudar a equipa a tomar uma decisão..."
              className="w-full px-2.5 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* Action buttons */}
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
              <Send className="w-3 h-3" />
              <span>{loading ? 'A enviar...' : 'Confirmar Denúncia'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
