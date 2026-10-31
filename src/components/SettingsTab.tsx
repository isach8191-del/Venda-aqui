import React from 'react';
import { useApp } from '../context/AppContext';
import { ThemeChoice } from '../types';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  User as UserIcon, 
  Check, 
  LogOut, 
  MapPin, 
  ShieldCheck,
  Star,
  Trash2,
  PackageCheck,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { DEFAULT_AVATAR } from '../data/seedData';

export const SettingsTab: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    user, 
    setIsEditProfileOpen,
    openUserProfile,
    logout, 
    posts, 
    deletePost 
  } = useApp();

  if (!user) return null;

  // Real user's listings
  const myPosts = posts.filter((p) => p.sellerId === user.id || p.seller.id === user.id);

  const themeOptions: { id: ThemeChoice; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'dark',
      title: 'Tema Preto Clássico',
      subtitle: 'Contraste escuro suave e elegante',
      icon: Moon,
    },
    {
      id: 'pure_black',
      title: 'Tema Preto Puro (OLED)',
      subtitle: 'Fundo preto absoluto #000000',
      icon: Monitor,
    },
    {
      id: 'light',
      title: 'Tema Branco Minimalista',
      subtitle: 'Fundo papel branco com tipografia preta',
      icon: Sun,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-black dark:text-white" />
          <h1 className="text-sm font-extrabold uppercase tracking-tight text-black dark:text-white">
            Definições do App
          </h1>
        </div>
        <span className="text-[11px] text-neutral-500 font-mono">
          Firebase Auth & Firestore
        </span>
      </div>

      {/* 1. Escolha de Cores Preto e Branco */}
      <section className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm p-3.5 shadow-2xs">
        <div className="mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Cores do App (Preto e Branco)
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            Escolha como prefere visualizar o VENDA AQUI:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`p-2.5 rounded-sm border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xs flex items-center justify-center ${
                    isSelected ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black dark:text-white">
                      {opt.title}
                    </h3>
                    <p className="text-[10px] text-neutral-500">
                      {opt.subtitle}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Conta Real do Utilizador */}
      <section className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm p-3.5 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || DEFAULT_AVATAR}
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-black dark:text-white">
                  {user.name}
                </h3>
                {user.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                )}
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">@{user.username}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openUserProfile(user)}
              className="py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1 transition-colors"
              title="Abrir o meu perfil estilo Facebook"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Ver Perfil</span>
            </button>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="py-1 px-2.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          </div>
        </div>

        {/* Bio preview */}
        {user.bio && (
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-900 leading-relaxed">
            {user.bio}
          </p>
        )}
      </section>

      {/* 3. Meus Anúncios Publicados */}
      <section className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm p-3.5 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2.5">
          Meus Anúncios no Firestore ({myPosts.length})
        </h2>

        {myPosts.length > 0 ? (
          <div className="space-y-2">
            {myPosts.map((post) => (
              <div
                key={post.id}
                className="p-2.5 rounded-sm border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2.5 bg-neutral-50 dark:bg-neutral-900/60"
              >
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="w-10 h-10 object-cover rounded-xs border border-neutral-300 dark:border-neutral-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-black dark:text-white truncate">
                    {post.title}
                  </p>
                  <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                    R$ {post.price.toLocaleString('pt-BR')} · <span className="uppercase">{post.condition}</span>
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {post.likes} curtidas · {post.category}
                  </p>
                </div>

                <button
                  onClick={() => deletePost(post.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                  title="Excluir anúncio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-sm">
            <p className="text-xs">Ainda não publicou nenhum anúncio.</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">Use o botão Publicar no topo para anunciar.</p>
          </div>
        )}
      </section>

      {/* Logout button */}
      <div className="pt-1 flex justify-end">
        <button
          onClick={logout}
          className="py-1 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-red-500 hover:text-red-500 text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Encerrar Sessão</span>
        </button>
      </div>

    </div>
  );
};
