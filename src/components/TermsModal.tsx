import React from 'react';
import { X, ShieldCheck, Mail, Info, FileText } from 'lucide-react';

interface TermsModalProps {
  mode?: 'terms' | 'about';
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ mode = 'terms', onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'about' ? (
              <Info className="w-4 h-4 text-black dark:text-white" />
            ) : (
              <FileText className="w-4 h-4 text-black dark:text-white" />
            )}
            <h3 className="font-bold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              {mode === 'about' ? 'Sobre o Hic Venditur & Contacto' : 'Termos de Utilização & Privacidade'}
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
        <div className="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
          
          <section className="space-y-1.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
              <span>1. Sobre a Plataforma e Administração</span>
            </h4>
            <p>
              O <strong>Hic Venditur</strong> é uma rede social dedicada à compra e venda de produtos novos e usados. A plataforma foi criada e é administrada com o compromisso de oferecer um ambiente seguro, transparente e livre de golpes e spam.
            </p>
            <p>
              <strong>Administrador Único:</strong> isach8191@gmail.com
            </p>
          </section>

          <section className="space-y-1.5 border-t border-neutral-200 dark:border-neutral-800 pt-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">
              2. Regras de Publicação & Anti-Spam
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-600 dark:text-neutral-400">
              <li>Cada utilizador pode publicar até <strong>10 anúncios por hora</strong> para prevenir spam e garantir visibilidade justa.</li>
              <li>O preço deve ser sempre numérico, real e maior que zero.</li>
              <li>O nome de utilizador deve ser único e sem espaços (apenas letras, números e underscore).</li>
              <li>É proibida a publicação de produtos ilícitos, falsificados, medicamentos, armas ou material ofensivo.</li>
            </ul>
          </section>

          <section className="space-y-1.5 border-t border-neutral-200 dark:border-neutral-800 pt-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white">
              3. Segurança, Denúncias e Bloqueios
            </h4>
            <p>
              Qualquer utilizador pode <strong>denunciar</strong> anúncios suspeitos ou utilizadores abusivos através do botão "Denunciar". As denúncias são analisadas diretamente pela administração.
            </p>
            <p>
              Também pode <strong>bloquear</strong> qualquer utilizador para não ver os anúncios dele no seu feed.
            </p>
            <p>
              O administrador reserva-se o direito de apagar anúncios enganosos e <strong>bloquear permanentemente</strong> utilizadores que violem estas diretrizes.
            </p>
          </section>

          <section className="space-y-1.5 border-t border-neutral-200 dark:border-neutral-800 pt-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>4. Contacto Oficial</span>
            </h4>
            <p>
              Para dúvidas, suporte, denúncias urgentes ou pedidos de desbloqueio, entre em contacto direto com o administrador:
            </p>
            <p className="font-mono font-bold text-black dark:text-white">
              isach8191@gmail.com
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
