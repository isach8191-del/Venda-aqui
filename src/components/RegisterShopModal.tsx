import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShopType } from '../types';
import { X, Store, MapPin, Phone, Clock, Truck, Image, FileText, Check } from 'lucide-react';

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

export const RegisterShopModal: React.FC = () => {
  const { isRegisterShopModalOpen, setIsRegisterShopModalOpen, registerShop, showToast } = useApp();

  const [name, setName] = useState('');
  const [shopType, setShopType] = useState<ShopType>('Roupa e calçados');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 - 18:00');
  const [hasDelivery, setHasDelivery] = useState(true);
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isRegisterShopModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !phone.trim()) {
      showToast('Preencha os campos obrigatórios (Nome, Cidade, Telefone).');
      return;
    }

    setLoading(true);
    try {
      await registerShop({
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
      showToast(err?.message || 'Erro ao registar loja.');
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
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-black dark:text-white" />
            <h2 className="font-extrabold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              Registar Loja ou Negócio
            </h2>
          </div>
          <button
            onClick={() => setIsRegisterShopModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          
          {/* Nome da Loja */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Nome da Loja / Negócio *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Boutique Central, Mercearia Silva, Oficina Auto..."
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Tipo de Negócio */}
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

          {/* Cidade & Bairro / Endereço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Cidade *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  placeholder="Ex: Lisboa, Porto, Luanda..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Bairro / Endereço
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Baixa, Rua Principal nº 12"
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Telefone & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Telefone / Chamadas *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+351 912 345 678"
                  className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                WhatsApp (opcional)
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Se diferente do telefone"
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Horário & Faz Entregas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Horário de Funcionamento
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="Seg - Sáb: 08h às 19h"
                  className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Faz Entregas?
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasDelivery(true)}
                  className={`flex-1 py-1.5 px-3 rounded-sm border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    hasDelivery
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Sim, entrega</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHasDelivery(false)}
                  className={`flex-1 py-1.5 px-3 rounded-sm border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    !hasDelivery
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <span>Não</span>
                </button>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Descrição da Loja / Apresentação
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Descreva os produtos e serviços que a sua loja oferece..."
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* Logótipo & Capa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Logótipo da Loja
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-[11px] file:py-1 file:px-2.5 file:rounded-sm file:border-0 file:text-[11px] file:font-semibold file:bg-neutral-200 dark:file:bg-neutral-800 file:text-black dark:file:text-white hover:file:opacity-80"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Foto de Capa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="w-full text-[11px] file:py-1 file:px-2.5 file:rounded-sm file:border-0 file:text-[11px] file:font-semibold file:bg-neutral-200 dark:file:bg-neutral-800 file:text-black dark:file:text-white hover:file:opacity-80"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRegisterShopModalOpen(false)}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-3.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{loading ? 'A registar...' : 'Criar Loja'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
