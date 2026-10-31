import React from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ProductCategory } from '../types';
import { 
  PlusCircle, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  RefreshCw, 
  X,
  Camera,
  Tag
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Todos',
  'Eletrônicos & Tech',
  'Moda & Calçados',
  'Música & Áudio',
  'Casa & Design',
  'Fotografia',
  'Outros',
];

export const FeedTab: React.FC = () => {
  const { 
    posts, 
    user, 
    activeFilter, 
    setActiveFilter, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    setIsCreatePostModalOpen 
  } = useApp();

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    // Condition filter
    if (activeFilter === 'novo' && post.condition !== 'novo') return false;
    if (activeFilter === 'usado' && post.condition !== 'usado') return false;

    // Category filter
    if (activeCategory !== 'Todos' && post.category !== activeCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchDesc = post.description.toLowerCase().includes(q);
      const matchCategory = post.category.toLowerCase().includes(q);
      const matchSeller = post.seller.name.toLowerCase().includes(q);
      const matchLocation = post.location.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCategory || matchSeller || matchLocation;
    }

    return true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

      {/* 1. Espaço Central para Publicar (Social Composer Card) */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Seu avatar"
            className="w-10 h-10 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
          />
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 text-sm font-medium transition-colors"
          >
            Anunciar produto novo ou usado no VENDA AQUI...
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-900 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
          >
            <Camera className="w-4 h-4 text-black dark:text-white" />
            <span>Adicionar Foto</span>
          </button>

          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
          >
            <Tag className="w-4 h-4 text-black dark:text-white" />
            <span>Definir Preço</span>
          </button>

          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider text-[11px] rounded-none hover:opacity-90 transition-opacity"
          >
            Publicar
          </button>
        </div>
      </div>

      {/* 2. Filtros e Pesquisa */}
      <div className="space-y-3">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por título, marca, cidade ou vendedor..."
            className="w-full pl-9 pr-9 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-black dark:text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Condição: Todos | Novos | Usados */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md ${
                activeFilter === 'todos'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              Todos ({posts.length})
            </button>

            <button
              onClick={() => setActiveFilter('novo')}
              className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md flex items-center gap-1 ${
                activeFilter === 'novo'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Novos
            </button>

            <button
              onClick={() => setActiveFilter('usado')}
              className={`px-3 py-1.5 text-xs font-bold transition-all rounded-md flex items-center gap-1 ${
                activeFilter === 'usado'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              Usados
            </button>
          </div>

          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'anúncio' : 'anúncios'}
          </span>
        </div>

        {/* Categorias (Scroll horizontal) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 whitespace-nowrap font-medium transition-colors border ${
                  isSelected
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Feed de Publicações Recentes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <h1 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
            Publicações Recentes
          </h1>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            {activeFilter === 'todos' ? 'Feed Global' : activeFilter === 'novo' ? 'Produtos Novos' : 'Produtos Usados'}
          </span>
        </div>

        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-12 px-4 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-900/30">
            <p className="font-bold text-base text-black dark:text-white">
              Nenhuma publicação encontrada
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Tente alterar os filtros ou seja o primeiro a publicar nesta categoria.
            </p>
            <button
              onClick={() => {
                setActiveFilter('todos');
                setActiveCategory('Todos');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 border border-black dark:border-white text-black dark:text-white text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
