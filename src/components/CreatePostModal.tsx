import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCondition, ProductCategory } from '../types';
import { PRODUCT_CATEGORIES } from './FeedTab';
import { 
  X, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Camera, 
  AlertCircle 
} from 'lucide-react';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostModalOpen, setIsCreatePostModalOpen, createPost, user } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('novo');
  const [category, setCategory] = useState<ProductCategory>('Eletrônicos & Tech');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user?.location || 'Lisboa, Portugal');
  
  // Real image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCreatePostModalOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('A fotografia do anúncio deve ter menos de 8MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Por favor informe o título do produto');
      return;
    }
    const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!numPrice || numPrice <= 0) {
      setError('Por favor informe um preço válido');
      return;
    }
    if (!description.trim()) {
      setError('Descreva o estado e características do produto');
      return;
    }
    if (!imageFile && !imagePreview) {
      setError('Por favor carregue pelo menos uma fotografia do produto');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPost({
        title: title.trim(),
        price: numPrice,
        condition,
        category,
        description: description.trim(),
        imageFile,
        imagePreviewUrl: imagePreview || undefined,
        location: location.trim(),
      });

      // Reset
      setTitle('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      setError(err?.message || 'Erro ao publicar anúncio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-[10px] rounded-xs">
              VA
            </div>
            <h2 className="font-bold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              Novo Anúncio no VENDA AQUI
            </h2>
          </div>
          <button
            onClick={() => setIsCreatePostModalOpen(false)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {error && (
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white flex items-center gap-2 rounded-sm">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Condição: NOVO ou USADO */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Condição do Produto *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCondition('novo')}
                className={`py-2 px-3 text-xs font-semibold rounded-sm border transition-all flex items-center justify-center gap-1.5 ${
                  condition === 'novo'
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Produto Novo</span>
              </button>

              <button
                type="button"
                onClick={() => setCondition('usado')}
                className={`py-2 px-3 text-xs font-semibold rounded-sm border transition-all flex items-center justify-center gap-1.5 ${
                  condition === 'usado'
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Produto Usado</span>
              </button>
            </div>
          </div>

          {/* 2. Categoria do Produto */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Categoria *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white"
            >
              {PRODUCT_CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Título */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Título do Anúncio *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: iPhone 13 Pro 128GB Grafite com caixa"
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* 4. Preço e Localização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Preço (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">
                  R$
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  step="any"
                  className="w-full pl-8 pr-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white font-mono text-xs focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Cidade / Estado
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: São Paulo, SP ou Lisboa"
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* 5. Fotografia Real do Produto */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Fotografia do Produto *
            </label>

            <div className="space-y-2">
              {imagePreview ? (
                <div className="relative aspect-[16/9] w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm overflow-hidden flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Pré-visualização do produto"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/80 hover:bg-black text-white rounded-sm text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}

              <label className="flex items-center justify-center gap-2 py-3 px-3 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-sm text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-900/50">
                <Camera className="w-4 h-4 text-neutral-500" />
                <span>Tirar Foto ou Escolher da Galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 6. Descrição */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Descrição Detalhada *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva detalhes, acessórios incluídos, tempo de uso e como prefere fazer a entrega..."
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* Bottom Actions: Classic, small sober buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsCreatePostModalOpen(false)}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-4 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'A publicar...' : 'Publicar Anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
