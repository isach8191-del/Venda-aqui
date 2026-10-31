import React from 'react';
import { useApp } from '../context/AppContext';
import { PlusCircle, Search, User as UserIcon, Moon, Sun, ShieldCheck } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { 
    user, 
    theme, 
    setTheme, 
    setIsCreatePostModalOpen, 
    setIsLoginModalOpen, 
    setActiveTab,
    searchQuery,
    setSearchQuery
  } = useApp();

  const toggleTheme = () => {
    if (theme === 'dark' || theme === 'pure_black') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/95 dark:bg-black/95 border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* 1. Encima do lado esquerdo: O nome do app VENDA AQUI */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('feed')}
            className="group text-left flex items-center gap-2.5 focus:outline-none"
            aria-label="Página inicial VENDA AQUI"
          >
            <div className="w-8 h-8 rounded-none border-2 border-black dark:border-white bg-black dark:bg-white flex items-center justify-center font-black text-white dark:text-black text-sm tracking-tighter">
              VA
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight uppercase text-black dark:text-white leading-none">
                VENDA AQUI
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
                Rede Social
              </span>
            </div>
          </button>
        </div>

        {/* 2. No meio de cima: Espaço para publicar */}
        <div className="flex-1 max-w-lg mx-auto">
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 sm:py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800/80 text-left transition-all duration-150 group shadow-2xs"
            aria-label="Publicar novo produto"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                <PlusCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-medium truncate">
                O que você quer vender hoje?
              </span>
            </div>
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 border border-black dark:border-white text-black dark:text-white rounded-none hidden sm:inline-block">
              Publicar
            </span>
          </button>
        </div>

        {/* 3. Lado direito: Ações rápidas (Tema, Perfil/Login) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors"
            title={`Alternar tema: atualmente ${theme === 'light' ? 'Branco' : 'Preto'}`}
            aria-label="Alternar tema preto e branco"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-black" />
            ) : (
              <Sun className="w-4 h-4 text-white" />
            )}
          </button>

          {user ? (
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors focus:outline-none"
              title="Abrir definições do perfil"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-neutral-400 dark:border-neutral-600"
              />
              <span className="text-xs font-semibold text-black dark:text-white hidden md:inline-block max-w-[90px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
            >
              Entrar
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
