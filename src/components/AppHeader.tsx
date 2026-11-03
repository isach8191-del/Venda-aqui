import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Moon, Sun, ShoppingCart } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white dark:bg-black border-b border-neutral-300 dark:border-neutral-800 shadow-none rounded-none h-13 transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-full flex items-center justify-between gap-3">
        
        {/* 1. Encima do lado esquerdo: O nome do app Hic Venditur */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('feed')}
            className="flex items-center gap-2 text-left focus:outline-none group rounded-none cursor-pointer"
            aria-label="Página inicial Hic Venditur"
          >
            <div className="w-7 h-7 rounded-none border border-black dark:border-white bg-black dark:bg-white flex items-center justify-center text-white dark:text-black">
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <span className="font-signature text-xl sm:text-2xl text-black dark:text-white leading-none">
              Hic Venditur
            </span>
          </button>
        </div>

        {/* 2. No topo: Botão único clássico "Publicar" */}
        <div className="flex-1 flex justify-center max-w-xs">
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="py-1 px-3.5 bg-black dark:bg-white text-white dark:text-black rounded-none text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-none"
            aria-label="Publicar novo anúncio"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Publicar</span>
          </button>
        </div>

        {/* 3. Lado direito: Tema e Perfil */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-none text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
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
              className="flex items-center gap-1.5 py-0.5 px-1 rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              title="Abrir o meu perfil estilo Facebook"
            >
              <img
                src={user.avatar || DEFAULT_AVATAR}
                alt={user.name}
                className="w-6 h-6 rounded-none object-cover border border-neutral-400 dark:border-neutral-600"
              />
              <span className="text-xs font-semibold text-black dark:text-white hidden sm:inline-block max-w-[70px] truncate">
                {user.name.split(' ')[0]}
              </span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
