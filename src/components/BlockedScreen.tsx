import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, LogOut, Mail } from 'lucide-react';

export const BlockedScreen: React.FC = () => {
  const { logout, user } = useApp();

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm p-6 shadow-xl text-center space-y-4">
        
        <div className="w-12 h-12 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-red-500">
          <ShieldAlert className="w-6 h-6 stroke-[2]" />
        </div>

        <div>
          <h1 className="text-base font-extrabold uppercase tracking-tight text-black dark:text-white">
            Conta Suspensa
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Olá <span className="font-bold text-black dark:text-white">{user?.name}</span>, a sua conta foi bloqueada pela administração do <strong>VENDA AQUI</strong> devido a violação das diretrizes de segurança ou denúncias.
          </p>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-left text-[11px] space-y-1">
          <p className="font-bold text-black dark:text-white">Precisa de esclarecimentos?</p>
          <p className="text-neutral-500">
            Entre em contacto com o administrador único da plataforma:
          </p>
          <p className="font-mono font-bold text-black dark:text-white flex items-center gap-1.5 pt-1">
            <Mail className="w-3.5 h-3.5" />
            <span>isach8191@gmail.com</span>
          </p>
        </div>

        <button
          onClick={logout}
          className="w-full py-2 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da Conta</span>
        </button>

      </div>
    </div>
  );
};
