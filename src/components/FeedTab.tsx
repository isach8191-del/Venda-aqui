import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ProductCategory } from '../types';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  MapPin,
  ArrowUpDown,
  Compass,
  PackageOpen
} from 'lucide-react';
import { POPULAR_COUNTRIES, getCountryName } from '../i18n';

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
    preferredCountry,
    user,
    language,
    t
  } = useApp();

  // Advanced search filters state
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const categoriesList: { id: ProductCategory; label: string }[] = [
    { id: 'Todos', label: t.categories.all },
    { id: 'Eletrônicos & Tech', label: t.categories.electronics },
    { id: 'Moda & Calçados', label: t.categories.fashion },
    { id: 'Música & Áudio', label: t.categories.music },
    { id: 'Casa & Design', label: t.categories.home },
    { id: 'Fotografia', label: t.categories.photography },
    { id: 'Outros', label: t.categories.other },
  ];

  // Quick "Near me" click handler
  const handleNearMeClick = () => {
    const userCountry = user?.country || preferredCountry;
    if (userCountry) {
      setSelectedCountry(userCountry);
    }
    if (user?.location) {
      setCityFilter(user.location.split(',')[0].trim());
    }
  };

  // Filter & sort logic
  const filteredPosts = posts.filter((post) => {
    // 1. Condition filter: Todos | Novo | Usado
    if (activeFilter === 'novo' && post.condition !== 'novo') return false;
    if (activeFilter === 'usado' && post.condition !== 'usado') return false;

    // 2. Category filter
    if (activeCategory !== 'Todos' && post.category !== activeCategory) return false;

    // 3. Country filter
    if (selectedCountry) {
      const pCountry = (post.country || '').toUpperCase();
      if (pCountry && pCountry !== selectedCountry.toUpperCase()) {
        return false;
      }
    }

    // 4. City filter
    if (cityFilter.trim()) {
      const qCity = cityFilter.toLowerCase().trim();
      const pLoc = (post.location || '').toLowerCase();
      if (!pLoc.includes(qCity)) {
        return false;
      }
    }

    // 5. Keyword Search in title, description, or seller
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

    // 6. Min Price filter
    const min = parseFloat(minPrice);
    if (!isNaN(min) && min > 0) {
      if (post.price < min) return false;
    }

    // 7. Max Price filter
    const max = parseFloat(maxPrice);
    if (!isNaN(max) && max > 0) {
      if (post.price > max) return false;
    }

    return true;
  });

  // Sort logic: if user has a preferred country and no specific country filter, prioritize local country first
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price_desc') {
      return b.price - a.price;
    }

    // Regional priority if not manually sorted
    const myCountry = (preferredCountry || user?.country || '').toUpperCase();
    if (myCountry) {
      const aIsLocal = (a.country || '').toUpperCase() === myCountry ? 1 : 0;
      const bIsLocal = (b.country || '').toUpperCase() === myCountry ? 1 : 0;
      if (aIsLocal !== bIsLocal) {
        return bIsLocal - aIsLocal; // Local listings first!
      }
    }

    return 0;
  });

  const hasActiveAdvancedFilters = minPrice !== '' || maxPrice !== '' || selectedCountry !== '' || cityFilter !== '' || sortBy !== 'recent';

  const clearAllFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedCountry('');
    setCityFilter('');
    setSortBy('recent');
    setActiveFilter('todos');
    setActiveCategory('Todos');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

      {/* Search & Filter Section */}
      <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm p-3 space-y-3 shadow-2xs">
        
        {/* Search Bar with Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.feed.searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`py-2 px-3 rounded-sm border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showAdvancedFilters || hasActiveAdvancedFilters
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
            }`}
            title="Filtros avançados e localização"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.common.filter}</span>
            {hasActiveAdvancedFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Condition Pills: Todos | Novos | Usados + Perto de mim */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveFilter('todos')}
              className={`py-1 px-2.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'todos'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {t.feed.filterAll}
            </button>
            <button
              onClick={() => setActiveFilter('novo')}
              className={`py-1 px-2.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'novo'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {t.feed.filterNew}
            </button>
            <button
              onClick={() => setActiveFilter('usado')}
              className={`py-1 px-2.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                activeFilter === 'usado'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {t.feed.filterUsed}
            </button>
          </div>

          {/* Quick "Near me" location focus */}
          <button
            onClick={handleNearMeClick}
            className={`py-1 px-2 rounded-sm text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 border ${
              selectedCountry && selectedCountry === (user?.country || preferredCountry)
                ? 'bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white border-neutral-400 dark:border-neutral-600'
                : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
            }`}
            title="Mostrar anúncios perto da minha região"
          >
            <Compass className="w-3 h-3" />
            <span>{t.feed.nearMe}</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-t border-neutral-100 dark:border-neutral-900">
          {categoriesList.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-1 px-2.5 text-[11px] whitespace-nowrap rounded-sm font-medium transition-colors shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black font-bold'
                    : 'bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3 animate-in fade-in duration-150">
            
            {/* Country and City Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.common.country}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="">{t.feed.allCountries}</option>
                  {POPULAR_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name[language] || c.name['en'] || c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.common.city}
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    placeholder="ex: Maputo, Lisboa, São Paulo..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Price Range & Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.feed.priceMin}
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full py-1.5 px-2.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.feed.priceMax}
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full py-1.5 px-2.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.feed.sortBy}
                </label>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="w-full py-1.5 px-2.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="recent">{t.feed.recent}</option>
                  <option value="price_asc">{t.feed.priceLowHigh}</option>
                  <option value="price_desc">{t.feed.priceHighLow}</option>
                </select>
              </div>
            </div>

            {hasActiveAdvancedFilters && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer"
                >
                  {t.feed.clearFilters}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Feed Stream */}
      {postsLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-neutral-500">
          <div className="w-5 h-5 border-2 border-black dark:border-white border-t-transparent animate-spin rounded-full" />
          <p className="text-xs uppercase tracking-wider">{t.common.loading}</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm p-8 text-center space-y-3">
          <PackageOpen className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-sm text-black dark:text-white">
            {t.feed.emptyTitle}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            {t.feed.emptySubtitle}
          </p>
          {hasActiveAdvancedFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 py-1.5 px-4 text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              {t.feed.clearFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

    </div>
  );
};
