import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCondition, ProductCategory } from '../types';
import { 
  X, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    label: 'Câmera Vintage',
    url: '/src/assets/images/camera_vintage_product_1793448335020.jpg',
  },
  {
    label: 'Tênis Streetwear',
    url: '/src/assets/images/sneakers_streetwear_product_1793448335525.jpg',
  },
  {
    label: 'Smartwatch Black',
    url: '/src/assets/images/smartwatch_tech_product_1793448336537.jpg',
  },
  {
    label: 'Headphone Studio',
    url: '/src/assets/images/headphones_audio_product_1793448337279.jpg',
  },
  {
    label: 'Guitarra Fender',
    url: '/src/assets/images/guitar_electric_product_1793448336729.jpg',
  },
];

const CATEGORIES: ProductCategory[] = [
  'Eletrônicos & Tech',
  'Moda & Calçados',
  'Música & Áudio',
  'Casa & Design',
  'Fotografia',
  'Outros',
];

export const CreatePostModal: React.FC = () => {
  const { isCreatePostModalOpen, setIsCreatePostModalOpen, createPost, user } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('novo');
  const [category, setCategory] = useState<ProductCategory>('Eletrônicos & Tech');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user?.location || 'São Paulo, SP');
  const [selectedImage, setSelectedImage] = useState<string>(PRESET_IMAGES[0].url);
  const [customImageLoading, setCustomImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCreatePostModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter menos de 5MB');
        return;
      }
      setCustomImageLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
          setCustomImageLoading(false);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Informe o título do produto');
      return;
    }
    const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!numPrice || numPrice <= 0) {
      setError('Informe um preço válido');
      return;
    }
    if (!description.trim()) {
      setError('Descreva as condições e detalhes do produto');
      return;
    }
    if (!selectedImage) {
      setError('Selecione ou carregue uma foto do produto');
      return;
    }

    createPost({
      title: title.trim(),
      price: numPrice,
      condition,
      category,
      description: description.trim(),
      image: selectedImage,
      location: location.trim(),
    });

    // Reset fields
    setTitle('');
    setPrice('');
    setDescription('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xs">
              VA
            </div>
            <h2 className="font-extrabold text-base text-black dark:text-white uppercase tracking-tight">
              Publicar no VENDA AQUI
            </h2>
          </div>
          <button
            onClick={() => setIsCreatePostModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-400 dark:border-neutral-700 text-xs text-black dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Condição: NOVO ou USADO */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Condição do Produto *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCondition('novo')}
                className={`py-3 px-3 text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  condition === 'novo'
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Produto Novo</span>
              </button>

              <button
                type="button"
                onClick={() => setCondition('usado')}
                className={`py-3 px-3 text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  condition === 'usado'
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Produto Usado</span>
              </button>
            </div>
          </div>

          {/* 2. Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Título do Anúncio *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Câmera Analógica 35mm com lente original"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* 3. Preço & Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Preço (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-500">
                  R$
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  step="any"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white font-mono text-sm focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Foto do Produto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Foto do Produto *
            </label>

            {/* Preview da foto selecionada */}
            <div className="relative aspect-[16/9] w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg overflow-hidden mb-2.5 flex items-center justify-center">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Pré-visualização"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-neutral-400 text-xs">
                  Nenhuma imagem selecionada
                </div>
              )}
            </div>

            {/* Presets rápidos ou Upload */}
            <div className="space-y-2">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                Escolha uma foto de exemplo ou faça upload do seu aparelho:
              </span>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setSelectedImage(preset.url)}
                    className={`relative shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === preset.url
                        ? 'border-black dark:border-white scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    {selectedImage === preset.url && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Botão de Upload Personalizado */}
              <label className="flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Carregar Foto do Computador / Celular</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 5. Descrição */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Descrição Detalhada *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descreva detalhes, estado de conservação, tempo de uso, o que acompanha, forma de entrega..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* 6. Localização */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Cidade / Estado
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: São Paulo, SP"
              className="w-full px-3.5 py-2 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Botão de Envio */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={customImageLoading}
              className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
            >
              Publicar Agora no VENDA AQUI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
