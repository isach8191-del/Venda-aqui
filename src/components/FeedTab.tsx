import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ProductCategory } from '../types';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  RefreshCw, 
  X, 
  Plus, 
  ArrowUpDown,
  Tag,
  PackageOpen
} from 'lucide-react';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
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
    postsLoading,
    activeFilter, 
    setActiveFilter, 
    activeCategory, 
    setActiveCategory, 
    searchQuery, 
    setSearchQuery,
    setIsCreatePostModalOpen,
    openUserProfile,
    user
  } = useApp();

  // Advanced search filters state
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter & sort logic
  const filteredPosts = posts.filter((post) => {
    // 1. Condition filter: Todos | Novo | Usado
    if (activeFilter === 'novo' && post.condition !== 'novo') return false;
    if (activeFilter === 'usado' && post.condition !== 'usado') return false;

    // 2. Category filter
    if (activeCategory !== 'Todos' && post.category !== activeCategory) return false;

    // 3. Keyword Search in title, description, or seller
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchDesc = post.description.toLowerCase().includes(q);
      const matchCategory = post.category.toLowerCase().includes(q);
      const matchSeller = post.seller.name.toLowerCase().includes(q) || post.seller.username.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchCategory && !matchSeller) {
        return false;
      }
    }

    // 4. Min Price filter
    const min = parseFloat(minPrice);
    if (!isNaN(min) && min > 0) {
      if (post.price < min) return false;
    }

    // 5. Max Price filter
    const max = parseFloat(maxPrice);
    if (!isNaN(max) && max > 0) {
      if (post.price > max) return false;
    }

    return true;
  });

  // Sort logic
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price_desc') {
      return b.price - a.price;
    }
    return 0; // default recent
  });

  const hasActiveAdvancedFilters = minPrice !== '' || maxPrice !== '' || sortBy !== 'recent';

  const clearAllFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
    setActiveFilter('todos');
    setActiveCategory('Todos');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

      {/* Search & Filter Section */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm p-3 space-y-3 shadow-2xs">
        
        {/* Keyword Search Bar (Title & Description) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por palavras-chave no título ou descrição..."
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`py-1.5 px-2.5 rounded-sm border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              showAdvancedFilters || hasActiveAdvancedFilters
                ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
            }`}
            title="Filtros avançados de preço e ordenação"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preço & Filtros</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters (Min & Max Price, Sort) */}
        {showAdvancedFilters && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-sm space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-black dark:text-white">
                Filtros de Preço e Ordenação
              </span>
              {hasActiveAdvancedFilters && (
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setSortBy('recent');
                  }}
                  className="text-[10px] text-neutral-500 hover:text-black dark:hover:text-white underline font-semibold"
                >
                  Repor valores
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Min Price */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Preço Mínimo (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Ex: 50"
                  className="w-full px-2.5 py-1 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Preço Máximo (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Ex: 1500"
                  className="w-full px-2.5 py-1 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-2.5 py-1 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Condition Filter (Todos | Novos | Usados) */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter('todos')}
              className={`py-1 px-2.5 text-[11px] font-bold rounded-sm border transition-colors ${
                activeFilter === 'todos'
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
              }`}
            >
              Todos ({posts.length})
            </button>

            <button
              onClick={() => setActiveFilter('novo')}
              className={`py-1 px-2.5 text-[11px] font-bold rounded-sm border transition-colors flex items-center gap-1 ${
                activeFilter === 'novo'
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Novos</span>
            </button>

            <button
              onClick={() => setActiveFilter('usado')}
              className={`py-1 px-2.5 text-[11px] font-bold rounded-sm border transition-colors flex items-center gap-1 ${
                activeFilter === 'usado'
                  ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>Usados</span>
            </button>
          </div>

          <span className="text-[11px] text-neutral-500 font-mono">
            {sortedPosts.length} {sortedPosts.length === 1 ? 'anúncio' : 'anúncios'}
          </span>
        </div>

        {/* Categories Horizontal Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
          {PRODUCT_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-1 px-2.5 whitespace-nowrap rounded-sm text-[11px] font-semibold transition-colors border ${
                  isSelected
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Feed List of Recent Posts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <h1 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
            Publicações Recentes
          </h1>
          <span className="text-[11px] text-neutral-500 font-mono">
            {activeCategory !== 'Todos' ? activeCategory : 'Todas as Categorias'}
          </span>
        </div>

        {postsLoading ? (
          <div className="text-center py-12 text-neutral-400 text-xs">
            A carregar publicações em tempo real do Firebase...
          </div>
        ) : sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          /* Real Clean Empty State - No fake accounts or mock posts! */
          <div className="text-center py-14 px-4 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-950">
            <PackageOpen className="w-10 h-10 mx-auto text-neutral-400 mb-2.5 stroke-[1.5]" />
            <p className="font-bold text-sm text-black dark:text-white">
              {searchQuery || hasActiveAdvancedFilters
                ? 'Nenhum anúncio corresponde aos seus filtros de busca'
                : 'Nenhum anúncio publicado ainda'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchQuery || hasActiveAdvancedFilters
                ? 'Tente remover as palavras-chave ou ajustar a faixa de preço mínimo e máximo.'
                : 'O VENDA AQUI é 100% real. Seja o primeiro utilizador a publicar um anúncio novo ou usado!'}
            </p>
            
            <div className="mt-4 flex items-center justify-center gap-2">
              {searchQuery || hasActiveAdvancedFilters ? (
                <button
                  onClick={clearAllFilters}
                  className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-black dark:hover:border-white transition-colors"
                >
                  Limpar Todos os Filtros
                </button>
              ) : null}

              <button
                onClick={() => setIsCreatePostModalOpen(true)}
                className="py-1.5 px-3.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publicar Primeiro Anúncio</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
