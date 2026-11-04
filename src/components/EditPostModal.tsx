import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCondition, ProductCategory } from '../types';
import { X, Camera, AlertCircle } from 'lucide-react';
import { SUPPORTED_CURRENCIES } from '../i18n';

export const EditPostModal: React.FC = () => {
  const { 
    isEditPostModalOpen, 
    closeEditPostModal, 
    selectedEditPost, 
    updatePost, 
    t 
  } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('MZN');
  const [condition, setCondition] = useState<ProductCondition>('novo');
  const [category, setCategory] = useState<ProductCategory>('Eletrônicos & Tech');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEditPost) {
      setTitle(selectedEditPost.title);
      setPrice(String(selectedEditPost.price));
      setCurrency(selectedEditPost.currency || 'MZN');
      setCondition(selectedEditPost.condition);
      setCategory(selectedEditPost.category);
      setDescription(selectedEditPost.description);
      setLocation(selectedEditPost.location || '');
      setImages(selectedEditPost.images || []);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setError(null);
    }
  }, [selectedEditPost]);

  if (!isEditPostModalOpen || !selectedEditPost) return null;

  const categoriesOptions: { id: ProductCategory; label: string }[] = [
    { id: 'Eletrônicos & Tech', label: t.categories.electronics },
    { id: 'Moda & Calçados', label: t.categories.fashion },
    { id: 'Música & Áudio', label: t.categories.music },
    { id: 'Casa & Design', label: t.categories.home },
    { id: 'Fotografia', label: t.categories.photography },
    { id: 'Outros', label: t.categories.other },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada fotografia deve ter menos de 5MB');
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setNewImageFiles((prev) => [...prev, ...validFiles].slice(0, 8));
    setNewImagePreviews((prev) => [...prev, ...validPreviews].slice(0, 8));
    setError(null);
  };

  const removeExistingImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título do anúncio é obrigatório.');
      return;
    }
    const numPrice = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    if (!numPrice || numPrice <= 0) {
      setError('Insira um preço numérico válido maior que zero.');
      return;
    }
    if (!description.trim()) {
      setError('A descrição do anúncio é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updatePost(selectedEditPost.id, {
        title: title.trim(),
        price: numPrice,
        currency,
        condition,
        category,
        description: description.trim(),
        images,
        imageFiles: newImageFiles,
        location: location.trim(),
      });
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar o anúncio.');
    } finally {
      setLoading(false);
    }
  };

  const totalPhotosCount = images.length + newImagePreviews.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
            Editar Anúncio
          </h2>
          <button
            onClick={closeEditPostModal}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-400 dark:border-neutral-700 text-xs text-black dark:text-white flex items-start gap-2 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Edit / Replace Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                Fotografias do Anúncio (Opcional — até 8 fotos)
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {totalPhotosCount} {totalPhotosCount === 1 ? 'foto' : 'fotos'}
              </span>
            </div>

            <div className="space-y-2">
              {totalPhotosCount > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {images.map((imgUrl, idx) => (
                    <div key={`exist_${idx}`} className="relative aspect-square rounded-sm overflow-hidden border border-neutral-200 dark:border-neutral-800 group">
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full hover:bg-black transition-colors"
                        title="Remover foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {newImagePreviews.map((preview, idx) => (
                    <div key={`new_${idx}`} className="relative aspect-square rounded-sm overflow-hidden border border-neutral-200 dark:border-neutral-800 group">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/80 text-white rounded-full hover:bg-black transition-colors"
                        title="Remover foto nova"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1 bg-emerald-600 text-white text-[9px] font-mono rounded">
                        Nova
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {totalPhotosCount < 8 && (
                <div className="border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-sm p-3 text-center bg-neutral-50 dark:bg-neutral-900/50 transition-colors">
                  <label className="flex flex-col items-center justify-center cursor-pointer py-1.5">
                    <Camera className="w-5 h-5 text-neutral-400 mb-1" />
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      + Adicionar ou atualizar fotografias
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Título do Anúncio *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Preço *
              </label>
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Moeda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Estado
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('novo')}
                  className={`py-1.5 text-xs font-semibold rounded-sm border text-center transition-colors cursor-pointer ${
                    condition === 'novo'
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Novo
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('usado')}
                  className={`py-1.5 text-xs font-semibold rounded-sm border text-center transition-colors cursor-pointer ${
                    condition === 'usado'
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  Usado
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
              >
                {categoriesOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Localização
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Descrição *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white leading-relaxed resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeEditPostModal}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-4 bg-black dark:bg-white text-white dark:text-black rounded-sm text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'A guardar...' : 'Guardar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
