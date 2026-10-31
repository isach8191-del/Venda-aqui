import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ShopType } from '../types';
import { X, Store, MapPin, Phone, Clock, Truck } from 'lucide-react';

const SHOP_TYPES: ShopType[] = [
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

export const EditShopModal: React.FC = () => {
  const { isEditShopModalOpen, setIsEditShopModalOpen, selectedShop, updateShop, showToast } = useApp();

  const [name, setName] = useState('');
  const [shopType, setShopType] = useState<ShopType>('Roupa e calçados');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [hasDelivery, setHasDelivery] = useState(true);
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedShop) {
      setName(selectedShop.name);
      setShopType(selectedShop.shopType);
      setCity(selectedShop.city);
      setAddress(selectedShop.address || '');
      setPhone(selectedShop.phone);
      setWhatsapp(selectedShop.whatsapp || selectedShop.phone);
      setOpeningHours(selectedShop.openingHours || '08:00 - 18:00');
      setHasDelivery(selectedShop.hasDelivery);
      setDescription(selectedShop.description || '');
    }
  }, [selectedShop]);

  if (!isEditShopModalOpen || !selectedShop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !phone.trim()) {
      showToast('Preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await updateShop(selectedShop.id, {
        name: name.trim(),
        shopType,
        city: city.trim(),
        address: address.trim(),
        phone: phone.trim(),
        whatsapp: (whatsapp || phone).trim(),
        openingHours: openingHours.trim(),
        hasDelivery,
        description: description.trim(),
        logoFile,
        coverFile,
      });
    } catch (err: any) {
      showToast(err?.message || 'Erro ao atualizar dados da loja.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-black dark:text-white" />
            <h2 className="font-extrabold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              Editar Loja: {selectedShop.name}
            </h2>
          </div>
          <button
            onClick={() => setIsEditShopModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Nome da Loja *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Tipo de Negócio *
            </label>
            <select
              value={shopType}
              onChange={(e) => setShopType(e.target.value as ShopType)}
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            >
              {SHOP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Bairro / Endereço
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Horário
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Faz Entregas?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasDelivery(true)}
                  className={`flex-1 py-1.5 px-2 rounded-sm border text-xs font-semibold ${
                    hasDelivery
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'border-neutral-300 dark:border-neutral-800 text-neutral-500'
                  }`}
                >
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setHasDelivery(false)}
                  className={`flex-1 py-1.5 px-2 rounded-sm border text-xs font-semibold ${
                    !hasDelivery
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'border-neutral-300 dark:border-neutral-800 text-neutral-500'
                  }`}
                >
                  Não
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Substituir Logótipo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-[11px] file:py-1 file:px-2.5 file:rounded-sm file:border-0 file:bg-neutral-200 dark:file:bg-neutral-800 file:text-black dark:file:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Substituir Foto de Capa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-[11px] file:py-1 file:px-2.5 file:rounded-sm file:border-0 file:bg-neutral-200 dark:file:bg-neutral-800 file:text-black dark:file:text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditShopModalOpen(false)}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-3.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
            >
              <span>{loading ? 'A guardar...' : 'Guardar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
