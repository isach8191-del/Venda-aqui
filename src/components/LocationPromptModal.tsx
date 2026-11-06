import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationPromptModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDeny: () => void;
  loading?: boolean;
}

export const LocationPromptModal: React.FC<LocationPromptModalProps> = ({
  isOpen,
  onAllow,
  onDeny,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl p-5 flex flex-col space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-black dark:text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-tight text-black dark:text-white">
              Localização
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Personalização regional
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
          Usamos a tua localização para sugerir a moeda e mostrar anúncios perto de ti.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onDeny}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-neutral-300 dark:border-neutral-700 rounded-sm transition-colors"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={onAllow}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 rounded-sm transition-colors flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>A detetar...</span>
              </>
            ) : (
              'Permitir'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
