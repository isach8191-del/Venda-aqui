import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeChoice } from '../types';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  User as UserIcon, 
  ShoppingBag, 
  Check, 
  LogOut, 
  LogIn, 
  MapPin, 
  Phone, 
  ShieldCheck,
  Star,
  Trash2,
  PackageCheck
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    user, 
    updateUserProfile, 
    logoutUser, 
    setIsLoginModalOpen, 
    posts, 
    deletePost,
    showToast 
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // My posts
  const myPosts = posts.filter((p) => p.seller.id === user?.id || p.seller.username === user?.username);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      phone: phone.trim(),
    });
    setIsEditingProfile(false);
  };

  const themeOptions: { id: ThemeChoice; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'dark',
      title: 'Tema Preto Clássico',
      subtitle: 'Fundo escuro balanceado com tipografia nítida em branco',
      icon: Moon,
    },
    {
      id: 'pure_black',
      title: 'Tema Preto Puro (OLED)',
      subtitle: 'Preto profundo #000000 para contraste absoluto e economia de tela',
      icon: Monitor,
    },
    {
      id: 'light',
      title: 'Tema Branco Minimalista',
      subtitle: 'Fundo papel branco puro com elementos em preto editorial',
      icon: Sun,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
      
      {/* 1. Header Definições */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-black dark:text-white" />
          <h1 className="text-base font-extrabold uppercase tracking-tight text-black dark:text-white">
            Definições do App
          </h1>
        </div>
        <span className="text-xs text-neutral-500 font-mono">
          VENDA AQUI v1.0
        </span>
      </div>

      {/* 2. Seletor de Cores Preto e Branco (Requisito Central) */}
      <section className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="mb-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-black dark:text-white">
            Cores do App (Preto e Branco)
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Personalize a visualização monocromática da sua rede social:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isSelected ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-black dark:text-white">
                      {opt.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {opt.subtitle}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Perfil do Vendedor / Comprador */}
      <section className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-xl p-4 sm:p-5 shadow-2xs">
        {user ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-neutral-300 dark:border-neutral-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base text-black dark:text-white">
                      {user.name}
                    </h3>
                    {user.verified && (
                      <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500">@{user.username}</p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {user.location}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3 py-1.5 border border-black dark:border-white text-black dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              >
                {isEditingProfile ? 'Cancelar' : 'Editar Perfil'}
              </button>
            </div>

            {/* Reputação e Vendas */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-900 text-center">
              <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <span className="block text-sm font-black text-black dark:text-white font-mono">
                  {user.totalSales}
                </span>
                <span className="text-[10px] uppercase font-bold text-neutral-500">
                  Vendas Realizadas
                </span>
              </div>

              <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <span className="block text-sm font-black text-black dark:text-white font-mono flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-black dark:fill-white" />
                  {user.rating}
                </span>
                <span className="text-[10px] uppercase font-bold text-neutral-500">
                  Avaliação
                </span>
              </div>

              <div className="p-2 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                <span className="block text-sm font-black text-black dark:text-white font-mono">
                  {myPosts.length}
                </span>
                <span className="text-[10px] uppercase font-bold text-neutral-500">
                  Anúncios Ativos
                </span>
              </div>
            </div>

            {/* Form de Edição */}
            {isEditingProfile && (
              <form onSubmit={handleSaveProfile} className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-900 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Biografia / Sobre você
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      Cidade / Estado
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      WhatsApp / Telefone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs"
                >
                  Salvar Alterações
                </button>
              </form>
            )}

            {/* Logout / Switch Account */}
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Trocar de Conta</span>
              </button>

              <button
                onClick={logoutUser}
                className="text-xs font-bold text-neutral-500 hover:text-red-500 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <UserIcon className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
            <p className="font-bold text-sm text-black dark:text-white">Você está como visitante</p>
            <p className="text-xs text-neutral-500 mt-1">Entre na sua conta para gerenciar anúncios e vendas.</p>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="mt-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider"
            >
              Fazer Login ou Cadastrar
            </button>
          </div>
        )}
      </section>

      {/* 4. Meus Anúncios Publicados */}
      {user && (
        <section className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-black dark:text-white">
              Meus Anúncios Publicados ({myPosts.length})
            </h2>
          </div>

          {myPosts.length > 0 ? (
            <div className="space-y-2.5">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/60"
                >
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-12 h-12 object-cover rounded-md border border-neutral-300 dark:border-neutral-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-black dark:text-white truncate">
                      {post.title}
                    </p>
                    <p className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
                      R$ {post.price.toLocaleString('pt-BR')} · <span className="uppercase">{post.condition}</span>
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {post.likes} curtidas · {post.comments.length} comentários
                    </p>
                  </div>

                  <button
                    onClick={() => deletePost(post.id)}
                    className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Excluir anúncio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg">
              <ShoppingBag className="w-6 h-6 mx-auto mb-1 opacity-50" />
              <p className="text-xs">Você ainda não publicou nenhum produto.</p>
            </div>
          )}
        </section>
      )}

      {/* 5. Informações da Plataforma */}
      <footer className="text-center pt-2 pb-8 text-neutral-400 text-xs space-y-1">
        <p className="font-bold text-black dark:text-white tracking-widest uppercase">
          VENDA AQUI
        </p>
        <p className="text-[11px]">
          Rede social de compra e venda de produtos novos e usados.
        </p>
        <p className="text-[10px] text-neutral-500">
          Design Monocromático de Alto Contraste · 100% Preto & Branco
        </p>
      </footer>

    </div>
  );
};
