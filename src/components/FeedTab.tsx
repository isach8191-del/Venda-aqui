import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from './PostCard';
import { ProductCategory, User, Shop, Post } from '../types';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  MapPin, 
  Compass, 
  PackageOpen, 
  Clock, 
  Trash2, 
  Store, 
  User as UserIcon, 
  CheckCircle2, 
  ChevronRight, 
  ShoppingBag,
  Star
} from 'lucide-react';
import { POPULAR_COUNTRIES } from '../i18n';

const RECENT_SEARCHES_KEY = 'venda_aqui_recent_searches';

// Normalization helper: case-insensitive & accent-insensitive (e.g. "Antonio" matches "António")
const normalizeText = (text: string | number | undefined | null): string => {
  if (text === undefined || text === null) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export const FeedTab: React.FC = () => {
  const { 
    posts, 
    postsLoading,
    shops,
    allUsers,
    openUserProfile,
    openShopDetail,
    formatPrice,
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

  // Search input & debounce
  const [inputValue, setInputValue] = useState(searchQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery || '');
  const [searchTab, setSearchTab] = useState<'todos' | 'posts' | 'shops' | 'users'>('todos');
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Advanced search filters state
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Recent searches list (stored in localStorage, max 5)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 300 ms debounce for real-time search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
      setSearchQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, setSearchQuery]);

  // Dismiss recent searches popup on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowRecentSearches(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  const handleSelectRecentSearch = (term: string) => {
    setInputValue(term);
    setDebouncedQuery(term);
    setSearchQuery(term);
    saveRecentSearch(term);
    setShowRecentSearches(false);
  };

  const handleClearSearch = () => {
    setInputValue('');
    setDebouncedQuery('');
    setSearchQuery('');
    setSearchTab('todos');
    setShowRecentSearches(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      saveRecentSearch(inputValue);
      setShowRecentSearches(false);
    }
  };

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

  // Determine search state
  const isAtQuery = debouncedQuery.trim().startsWith('@');
  const cleanQuery = isAtQuery ? debouncedQuery.trim().slice(1).trim() : debouncedQuery.trim();
  const normalizedQuery = normalizeText(cleanQuery);
  const isSearching = normalizedQuery.length > 0;

  // 1. Matched Posts (Anúncios)
  const matchedPosts = (!isSearching || isAtQuery) ? [] : posts.filter((post) => {
    if (activeFilter === 'novo' && post.condition !== 'novo') return false;
    if (activeFilter === 'usado' && post.condition !== 'usado') return false;
    if (activeCategory !== 'Todos' && post.category !== activeCategory) return false;
    if (selectedCountry) {
      const pCountry = (post.country || '').toUpperCase();
      if (pCountry && pCountry !== selectedCountry.toUpperCase()) return false;
    }
    if (cityFilter.trim()) {
      const qCity = normalizeText(cityFilter);
      const pLoc = normalizeText(post.location);
      if (!pLoc.includes(qCity)) return false;
    }
    const min = parseFloat(minPrice);
    if (!isNaN(min) && min > 0 && post.price < min) return false;
    const max = parseFloat(maxPrice);
    if (!isNaN(max) && max > 0 && post.price > max) return false;

    // Search in title, description, category, city/location, price, and seller name/@username
    const matchTitle = normalizeText(post.title).includes(normalizedQuery);
    const matchDesc = normalizeText(post.description).includes(normalizedQuery);
    const matchCat = normalizeText(post.category).includes(normalizedQuery);
    const matchLoc = normalizeText(post.location).includes(normalizedQuery);
    const matchPrice = normalizeText(post.price).includes(normalizedQuery);
    const matchSellerName = normalizeText(post.seller?.name).includes(normalizedQuery);
    const matchSellerUser = normalizeText(post.seller?.username).includes(normalizedQuery);

    return matchTitle || matchDesc || matchCat || matchLoc || matchPrice || matchSellerName || matchSellerUser;
  });

  // 2. Matched Shops (Lojas)
  const matchedShops = (!isSearching || isAtQuery) ? [] : shops.filter((shop) => {
    // Exclude blocked owner
    if (user?.blockedUserIds && user.blockedUserIds.includes(shop.ownerId)) return false;

    const matchName = normalizeText(shop.name).includes(normalizedQuery);
    const matchType = normalizeText(shop.shopType).includes(normalizedQuery);
    const matchCity = normalizeText(shop.city).includes(normalizedQuery);
    const matchAddress = normalizeText(shop.address).includes(normalizedQuery);
    const matchDesc = normalizeText(shop.description).includes(normalizedQuery);

    return matchName || matchType || matchCity || matchAddress || matchDesc;
  });

  // 3. Matched Users (Pessoas)
  const matchedUsers = !isSearching ? [] : (allUsers || []).filter((u) => {
    // Exclude blocked users and user's blocked list
    if (u.isBlocked) return false;
    if (user?.blockedUserIds && user.blockedUserIds.includes(u.id)) return false;

    const matchName = normalizeText(u.name).includes(normalizedQuery);
    const matchUser = normalizeText(u.username).includes(normalizedQuery);
    const matchLoc = normalizeText(u.location || u.country).includes(normalizedQuery);
    const matchBio = normalizeText(u.bio).includes(normalizedQuery);

    return matchName || matchUser || matchLoc || matchBio;
  });

  const totalResultsCount = isAtQuery
    ? matchedUsers.length
    : (matchedPosts.length + matchedShops.length + matchedUsers.length);

  // Fallback feed list when not in active search mode
  const regularFilteredPosts = posts.filter((post) => {
    if (activeFilter === 'novo' && post.condition !== 'novo') return false;
    if (activeFilter === 'usado' && post.condition !== 'usado') return false;
    if (activeCategory !== 'Todos' && post.category !== activeCategory) return false;
    if (selectedCountry) {
      const pCountry = (post.country || '').toUpperCase();
      if (pCountry && pCountry !== selectedCountry.toUpperCase()) return false;
    }
    if (cityFilter.trim()) {
      const qCity = normalizeText(cityFilter);
      const pLoc = normalizeText(post.location);
      if (!pLoc.includes(qCity)) return false;
    }
    const min = parseFloat(minPrice);
    if (!isNaN(min) && min > 0 && post.price < min) return false;
    const max = parseFloat(maxPrice);
    if (!isNaN(max) && max > 0 && post.price > max) return false;
    return true;
  });

  const sortedPosts = [...regularFilteredPosts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;

    const myCountry = (preferredCountry || user?.country || '').toUpperCase();
    if (myCountry) {
      const aIsLocal = (a.country || '').toUpperCase() === myCountry ? 1 : 0;
      const bIsLocal = (b.country || '').toUpperCase() === myCountry ? 1 : 0;
      if (aIsLocal !== bIsLocal) return bIsLocal - aIsLocal;
    }
    return 0;
  });

  const hasActiveAdvancedFilters = minPrice !== '' || maxPrice !== '' || selectedCountry !== '' || cityFilter !== '' || sortBy !== 'recent';

  const clearAllFilters = () => {
    handleClearSearch();
    setMinPrice('');
    setMaxPrice('');
    setSelectedCountry('');
    setCityFilter('');
    setSortBy('recent');
    setActiveFilter('todos');
    setActiveCategory('Todos');
  };

  // Handlers for result item clicks
  const handleUserClick = (targetUser: User) => {
    saveRecentSearch(inputValue);
    openUserProfile(targetUser);
  };

  const handleShopClick = (targetShop: Shop) => {
    saveRecentSearch(inputValue);
    openShopDetail(targetShop);
  };

  const handlePostClick = (targetPost: Post) => {
    saveRecentSearch(inputValue);
    // Switch to posts tab to view post card directly
    setSearchTab('posts');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

      {/* Unified Search Section */}
      <div 
        ref={searchContainerRef}
        className="relative border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm p-3 space-y-3 shadow-2xs"
      >
        
        {/* Search Bar with Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowRecentSearches(false);
              }}
              onFocus={() => {
                if (recentSearches.length > 0 && !inputValue.trim()) {
                  setShowRecentSearches(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.feed.searchPlaceholder || "Pesquisar anúncios, lojas e pessoas"}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`py-2 px-3 rounded-sm border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
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

        {/* Recent Searches Dropdown (when input is focused and has history) */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div className="absolute left-3 right-3 top-14 z-30 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-lg p-2.5 space-y-2 animate-in fade-in duration-100">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Pesquisas recentes
              </span>
              <button
                type="button"
                onClick={handleClearRecentSearches}
                className="text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Limpar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectRecentSearch(term)}
                  className="px-2.5 py-1 text-xs rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* When active search is on: Show Result Tabs (Todos, Anúncios, Lojas, Pessoas) */}
        {isSearching ? (
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 space-y-2">
            {isAtQuery && (
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-black dark:text-white" />
                <span>A pesquisar apenas perfis com <strong>@{cleanQuery}</strong></span>
              </div>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {!isAtQuery && (
                <button
                  type="button"
                  onClick={() => setSearchTab('todos')}
                  className={`py-1 px-3 text-xs rounded-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                    searchTab === 'todos'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  Todos ({totalResultsCount})
                </button>
              )}

              {!isAtQuery && (
                <button
                  type="button"
                  onClick={() => setSearchTab('posts')}
                  className={`py-1 px-3 text-xs rounded-sm font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    searchTab === 'posts'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Anúncios ({matchedPosts.length})</span>
                </button>
              )}

              {!isAtQuery && (
                <button
                  type="button"
                  onClick={() => setSearchTab('shops')}
                  className={`py-1 px-3 text-xs rounded-sm font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    searchTab === 'shops'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Store className="w-3 h-3" />
                  <span>Lojas ({matchedShops.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSearchTab('users')}
                className={`py-1 px-3 text-xs rounded-sm font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  searchTab === 'users' || isAtQuery
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <UserIcon className="w-3 h-3" />
                <span>Pessoas ({matchedUsers.length})</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Condition & Near Me Pills */
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
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
                type="button"
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
                type="button"
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
              type="button"
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
        )}

        {/* Categories Bar (shown when not searching, or user wants category filtering) */}
        {!isSearching && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-t border-neutral-100 dark:border-neutral-900">
            {categoriesList.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
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
        )}

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3 animate-in fade-in duration-150">
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
                  type="button"
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

      {/* Main Content Area: Search Results OR Feed Stream */}
      {isSearching ? (
        <div className="space-y-4 animate-in fade-in duration-150">

          {/* Empty Results State */}
          {((isAtQuery && matchedUsers.length === 0) ||
            (searchTab === 'todos' && totalResultsCount === 0) ||
            (searchTab === 'posts' && matchedPosts.length === 0) ||
            (searchTab === 'shops' && matchedShops.length === 0) ||
            (searchTab === 'users' && matchedUsers.length === 0)) ? (
            <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-sm p-8 text-center space-y-3">
              <PackageOpen className="w-10 h-10 mx-auto text-neutral-400" />
              <h3 className="font-bold text-sm text-black dark:text-white">
                Nenhum resultado
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Não encontramos nenhum resultado para "{cleanQuery}". Tente verificar a ortografia ou pesquisar por outro anúncio, loja ou pessoa.
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="mt-2 py-1.5 px-4 text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black rounded-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            <>
              {/* TAB: TODOS (Grouped overview) */}
              {(searchTab === 'todos' && !isAtQuery) && (
                <div className="space-y-5">

                  {/* 1. Group: Pessoas (Users) */}
                  {matchedUsers.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5" />
                          Pessoas ({matchedUsers.length})
                        </h4>
                        {matchedUsers.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setSearchTab('users')}
                            className="text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer"
                          >
                            Ver todas
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchedUsers.slice(0, 4).map((person) => (
                          <div
                            key={person.id}
                            onClick={() => handleUserClick(person)}
                            className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-sm p-3 flex items-center justify-between hover:border-black dark:hover:border-white transition-colors cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={person.avatar}
                                alt={person.name}
                                className="w-11 h-11 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <h5 className="font-bold text-xs text-black dark:text-white truncate group-hover:underline">
                                    {person.name}
                                  </h5>
                                  {person.verified && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                                  @{person.username}
                                </p>
                                {person.location && (
                                  <p className="text-[10px] text-neutral-400 flex items-center gap-0.5 truncate mt-0.5">
                                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                                    <span>{person.location}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white shrink-0 ml-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Group: Lojas (Shops) */}
                  {matchedShops.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5" />
                          Lojas e Negócios ({matchedShops.length})
                        </h4>
                        {matchedShops.length > 3 && (
                          <button
                            type="button"
                            onClick={() => setSearchTab('shops')}
                            className="text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer"
                          >
                            Ver todas
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchedShops.slice(0, 4).map((shop) => (
                          <div
                            key={shop.id}
                            onClick={() => handleShopClick(shop)}
                            className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-sm p-3 flex items-center justify-between hover:border-black dark:hover:border-white transition-colors cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={shop.logo}
                                alt={shop.name}
                                className="w-11 h-11 rounded-sm object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <h5 className="font-bold text-xs text-black dark:text-white truncate group-hover:underline">
                                    {shop.name}
                                  </h5>
                                  {shop.verified && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                                  {shop.shopType} • {shop.city}
                                </p>
                                <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                                  {shop.address || shop.openingHours}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white shrink-0 ml-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Group: Anúncios (Posts) */}
                  {matchedPosts.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Anúncios ({matchedPosts.length})
                        </h4>
                        {matchedPosts.length > 4 && (
                          <button
                            type="button"
                            onClick={() => setSearchTab('posts')}
                            className="text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer"
                          >
                            Ver todos
                          </button>
                        )}
                      </div>

                      {/* Display Post Cards directly for rich interaction */}
                      <div className="space-y-3">
                        {matchedPosts.map((post) => (
                          <PostCard key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB: ANÚNCIOS ONLY */}
              {(searchTab === 'posts' && !isAtQuery) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1 text-xs text-neutral-500">
                    <span>{matchedPosts.length} anúncio(s) encontrado(s)</span>
                  </div>
                  <div className="space-y-3">
                    {matchedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: LOJAS ONLY */}
              {(searchTab === 'shops' && !isAtQuery) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 text-xs text-neutral-500">
                    <span>{matchedShops.length} loja(s) encontrada(s)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchedShops.map((shop) => (
                      <div
                        key={shop.id}
                        onClick={() => handleShopClick(shop)}
                        className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-sm p-3.5 flex items-start gap-3 hover:border-black dark:hover:border-white transition-colors cursor-pointer group shadow-2xs"
                      >
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          className="w-12 h-12 rounded-sm object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="font-bold text-xs text-black dark:text-white truncate group-hover:underline">
                              {shop.name}
                            </h4>
                            {shop.verified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                          </div>
                          <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-neutral-100 dark:bg-neutral-800 rounded-xs text-neutral-600 dark:text-neutral-300">
                            {shop.shopType}
                          </span>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{shop.city}{shop.address ? ` • ${shop.address}` : ''}</span>
                          </p>
                          {shop.openingHours && (
                            <p className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1 truncate">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{shop.openingHours}</span>
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white shrink-0 self-center" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PESSOAS ONLY */}
              {(searchTab === 'users' || isAtQuery) && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1 text-xs text-neutral-500">
                    <span>{matchedUsers.length} pessoa(s) encontrada(s)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {matchedUsers.map((person) => (
                      <div
                        key={person.id}
                        onClick={() => handleUserClick(person)}
                        className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-sm p-3.5 flex items-center justify-between hover:border-black dark:hover:border-white transition-colors cursor-pointer group shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={person.avatar}
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="font-bold text-xs text-black dark:text-white truncate group-hover:underline">
                                {person.name}
                              </h4>
                              {person.verified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              @{person.username}
                            </p>
                            {person.location && (
                              <p className="text-[11px] text-neutral-400 flex items-center gap-1 truncate mt-0.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{person.location}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      ) : (
        /* Regular Feed Stream (when not searching) */
        postsLoading ? (
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
                type="button"
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
        )
      )}

    </div>
  );
};
