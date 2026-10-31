import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Moon, Sun, User as UserIcon } from 'lucide-react';
import { DEFAULT_AVATAR } from '../data/seedData';

export const AppHeader: React.FC = () => {
  const { 
    user, 
    theme, 
    setTheme, 
    setIsCreatePostModalOpen, 
    setActiveTab,
    openUserProfile 
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
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* 1. Encima do lado esquerdo: O nome do app VENDA AQUI */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2 text-left focus:outline-none group"
            aria-label="Página inicial VENDA AQUI"
          >
            <div className="w-7 h-7 rounded-xs border border-black dark:border-white bg-black dark:bg-white flex items-center justify-center font-black text-white dark:text-black text-xs tracking-tighter">
              VA
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight uppercase text-black dark:text-white leading-none">
                VENDA AQUI
              </span>
              <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold">
                Rede Social
              </span>
            </div>
          </button>
        </div>

        {/* 2. No meio de cima: Espaço para publicar */}
        <div className="flex-1 max-w-sm mx-auto">
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-850 text-left transition-colors"
            aria-label="Publicar novo produto"
          >
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium truncate">
              O que você quer vender?
            </span>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded-xs ml-2">
              Publicar
            </span>
          </button>
        </div>

        {/* 3. Lado direito: Tema e Perfil Estilo Facebook */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors"
            title={`Alternar tema: atualmente ${theme === 'light' ? 'Branco' : 'Preto'}`}
            aria-label="Alternar tema preto e branco"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-black" />
            ) : (
              <Sun className="w-4 h-4 text-white" />
            )}
          </button>

          {user && (
            <button
              onClick={() => openUserProfile(user)}
              className="flex items-center gap-1.5 py-0.5 px-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              title="Abrir o meu perfil estilo Facebook"
            >
              <img
                src={user.avatar || DEFAULT_AVATAR}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-neutral-400 dark:border-neutral-600"
              />
              <span className="text-xs font-semibold text-black dark:text-white hidden sm:inline-block max-w-[80px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
