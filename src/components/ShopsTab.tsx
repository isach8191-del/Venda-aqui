import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ShopType, Shop, isUserOnline } from '../types';
import { 
  Store, 
  Search, 
  MapPin, 
  CheckCircle, 
  Star, 
  Truck, 
  Plus, 
  Filter, 
  MessageCircle, 
  Phone,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_COVER, DEFAULT_AVATAR } from '../data/seedData';

const ALL_SHOP_TYPES: ('Todos' | ShopType)[] = [
  'Todos',
  'Roupa e calçados',
  'Eletrónicos e telemóveis',
  'Supermercado e mercearia',
  'Material de construção',
  'Cosméticos e beleza',
  'Móveis e casa',
  'Peças e oficinas',
  'Alimentação e restaurantes',
  'Serviços (reparações, transporte, etc.)',
  'Outros',
];

export const ShopsTab: React.FC = () => {
  const { 
    shops, 
    shopsLoading, 
    openShopDetail, 
    setIsRegisterShopModalOpen, 
    user,
    allUsers 
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState<'Todos' | ShopType>('Todos');
  const [onlyDelivery, setOnlyDelivery] = useState(false);

  // Extract unique cities from shops
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    shops.forEach((s) => {
      if (s.city && s.city.trim()) {
        set.add(s.city.trim());
      }
    });
    return Array.from(set);
  }, [shops]);

  // Filter and sort shops (verified first)
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      // Type filter
      if (selectedType !== 'Todos' && shop.shopType !== selectedType) {
        return false;
      }

      // City filter
      if (selectedCity && !shop.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }

      // Delivery filter
      if (onlyDelivery && !shop.hasDelivery) {
        return false;
      }

      // Search text
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = shop.name.toLowerCase().includes(query);
        const matchesDesc = shop.description.toLowerCase().includes(query);
        const matchesAddress = shop.address.toLowerCase().includes(query);
        const matchesCity = shop.city.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesAddress && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  }, [shops, selectedType, selectedCity, onlyDelivery, search]);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 animate-in fade-in duration-150">
      
      {/* Top Banner & Register CTA */}
      <div className="p-3.5 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-black dark:text-white" />
            <h1 className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-black dark:text-white">
              Lojas & Negócios Locais
            </h1>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Shops, mercearias, barracas, oficinas e prestadores de serviços de confiança
          </p>
        </div>

        <button
          onClick={() => setIsRegisterShopModalOpen(true)}
          className="py-1.5 px-3 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registar Minha Loja</span>
        </button>
      </div>

      {/* Search Bar & City Input */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        {/* Main Search Input */}
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar loja, produtos, serviços ou endereço..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-black dark:hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            placeholder="Filtrar por cidade..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white shadow-2xs"
          />
          {selectedCity && (
            <button
              onClick={() => setSelectedCity('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 hover:text-black dark:hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Quick City suggestions if available */}
      {uniqueCities.length > 0 && !selectedCity && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none text-[10px]">
          <span className="text-neutral-400 shrink-0 font-medium">Cidades:</span>
          {uniqueCities.slice(0, 6).map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className="px-2 py-0.5 rounded-xs border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white shrink-0"
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Horizontal Filter Chips by Shop Type (10 requested categories) */}
      <div className="overflow-x-auto pb-2 mb-4 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {ALL_SHOP_TYPES.map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`py-1 px-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-black dark:bg-white text-white dark:text-black font-bold shadow-2xs'
                    : 'border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
                }`}
              >
                {type}
              </button>
            );
          })}

          <button
            onClick={() => setOnlyDelivery(!onlyDelivery)}
            className={`py-1 px-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0 ${
              onlyDelivery
                ? 'bg-black dark:bg-white text-white dark:text-black font-bold'
                : 'border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Faz Entregas</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          {filteredShops.length} {filteredShops.length === 1 ? 'Loja Encontrada' : 'Lojas Encontradas'}
        </span>
        <span className="text-[10px] text-neutral-400">
          Lojas verificadas aparecem primeiro
        </span>
      </div>

      {/* Shop Cards Grid */}
      {shopsLoading ? (
        <div className="py-16 text-center text-xs text-neutral-400">
          A carregar lojas e negócios...
        </div>
      ) : filteredShops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => openShopDetail(shop)}
              className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 rounded-sm overflow-hidden flex flex-col justify-between cursor-pointer hover:border-black dark:hover:border-white transition-colors group shadow-2xs"
            >
              {/* Cover Photo */}
              <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900">
                <img
                  src={shop.coverPhoto || DEFAULT_COVER}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-200"
                />

                {/* Delivery Badge on top */}
                <div className="absolute top-2 right-2">
                  {shop.hasDelivery ? (
                    <span className="px-1.5 py-0.5 rounded-xs bg-black/85 dark:bg-white/90 text-white dark:text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs">
                      <Truck className="w-2.5 h-2.5" />
                      <span>Entrega</span>
                    </span>
                  ) : null}
                </div>

                {/* Logo floating */}
                <div className="absolute -bottom-3 left-3 relative">
                  <img
                    src={shop.logo || DEFAULT_AVATAR}
                    alt={shop.name}
                    className="w-12 h-12 rounded-sm object-cover border-2 border-white dark:border-neutral-950 bg-white dark:bg-neutral-900 shadow-sm block"
                  />
                  {isUserOnline(allUsers.find((u) => u.id === shop.ownerId)?.lastSeen) && (
                    <span
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-neutral-950"
                      title="Vendedor online"
                    />
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="pt-4 p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-extrabold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight group-hover:underline">
                      {shop.name}
                    </h2>
                    {shop.verified && (
                      <span 
                        className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-xs bg-black dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-wider"
                        title="Verificada"
                      >
                        <CheckCircle className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Verificada</span>
                      </span>
                    )}
                  </div>

                  <span className="inline-block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">
                    {shop.shopType}
                  </span>

                  {shop.description && (
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1 leading-snug">
                      {shop.description}
                    </p>
                  )}
                </div>

                {/* Details Footer */}
                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-850 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between text-neutral-500">
                    <div className="flex items-center gap-1 truncate max-w-[170px]">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{shop.city}{shop.address ? ` · ${shop.address}` : ''}</span>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-black dark:text-white shrink-0">
                      <Star className="w-3 h-3 fill-black dark:fill-white text-black dark:text-white" />
                      <span>{shop.rating.toFixed(1)}</span>
                      <span className="text-[10px] text-neutral-400 font-normal">({shop.reviewCount})</span>
                    </div>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div className="pt-1.5 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openShopDetail(shop);
                      }}
                      className="flex-1 py-1 px-2 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-[10px] font-bold uppercase tracking-wider text-black dark:text-white text-center transition-colors"
                    >
                      Ver Catálogo
                    </button>

                    <a
                      href={`https://wa.me/${(shop.whatsapp || shop.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá ${shop.name}! Vi a vossa loja no VENDA AQUI.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 px-2 rounded-sm bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold uppercase tracking-wider hover:opacity-90 flex items-center gap-1"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-950 p-6">
          <Store className="w-9 h-9 mx-auto text-neutral-400 mb-2" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-black dark:text-white">
            Nenhuma loja encontrada
          </h3>
          <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto">
            Não encontramos lojas correspondentes aos filtros selecionados. Tente limpar a pesquisa ou selecionar "Todos".
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setSearch('');
                setSelectedCity('');
                setSelectedType('Todos');
                setOnlyDelivery(false);
              }}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => setIsRegisterShopModalOpen(true)}
              className="py-1.5 px-3 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider"
            >
              Registar Primeira Loja
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
