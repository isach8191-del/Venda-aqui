import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, PackagePlus, DollarSign, Image } from 'lucide-react';

export const AddProductModal: React.FC = () => {
  const { isAddProductModalOpen, setIsAddProductModalOpen, selectedShop, addShopProduct, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'disponivel' | 'esgotado'>('disponivel');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAddProductModalOpen || !selectedShop) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price.replace(',', '.'));
    if (!title.trim() || isNaN(numPrice) || numPrice <= 0) {
      showToast('Insira o título do produto e um preço numérico válido.');
      return;
    }

    setLoading(true);
    try {
      await addShopProduct(selectedShop.id, {
        title: title.trim(),
        description: description.trim(),
        price: numPrice,
        status,
        imageFile,
      });
      setTitle('');
      setDescription('');
      setPrice('');
      setImageFile(null);
    } catch (err: any) {
      showToast(err?.message || 'Erro ao adicionar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-black dark:text-white" />
            <h2 className="font-extrabold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              Adicionar Produto ao Catálogo
            </h2>
          </div>
          <button
            onClick={() => setIsAddProductModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Nome do Produto / Artigo *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Tênis Desportivo Nike, Telemóvel Samsung..."
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Preço (R$) *
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Estado do Stock *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'disponivel' | 'esgotado')}
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              >
                <option value="disponivel">Disponível</option>
                <option value="esgotado">Esgotado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Descrição (tamanhos, cores, garantia)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Ex: Tamanhos 38 ao 44. Disponível em preto e azul."
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Foto do Produto (máx 5 MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-[11px] file:py-1 file:px-2.5 file:rounded-sm file:border-0 file:bg-neutral-200 dark:file:bg-neutral-800 file:text-black dark:file:text-white"
            />
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(false)}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-3.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
            >
              <span>{loading ? 'A adicionar...' : 'Adicionar ao Catálogo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
