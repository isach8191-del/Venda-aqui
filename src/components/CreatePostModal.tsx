import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCondition, ProductCategory } from '../types';
import { 
  X, 
  Upload, 
  Camera, 
  AlertCircle 
} from 'lucide-react';
import { SUPPORTED_CURRENCIES, POPULAR_COUNTRIES } from '../i18n';

export const CreatePostModal: React.FC = () => {
  const { 
    isCreatePostModalOpen, 
    setIsCreatePostModalOpen, 
    createPost, 
    user,
    preferredCurrency,
    preferredCountry,
    language,
    t 
  } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<string>(preferredCurrency || 'MZN');
  const [country, setCountry] = useState<string>(user?.country || preferredCountry || 'MZ');
  const [condition, setCondition] = useState<ProductCondition>('novo');
  const [category, setCategory] = useState<ProductCategory>('Eletrônicos & Tech');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user?.location || 'Maputo');
  
  // Real image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCreatePostModalOpen) return null;

  const categoriesOptions: { id: ProductCategory; label: string }[] = [
    { id: 'Eletrônicos & Tech', label: t.categories.electronics },
    { id: 'Moda & Calçados', label: t.categories.fashion },
    { id: 'Música & Áudio', label: t.categories.music },
    { id: 'Casa & Design', label: t.categories.home },
    { id: 'Fotografia', label: t.categories.photography },
    { id: 'Outros', label: t.categories.other },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A fotografia do anúncio deve ter menos de 5MB');
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
      setError(t.createPost.postTitleLabel);
      return;
    }
    const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    if (!numPrice || numPrice <= 0) {
      setError(t.createPost.priceLabel);
      return;
    }
    if (!description.trim()) {
      setError(t.createPost.descriptionLabel);
      return;
    }
    if (!imageFile && !imagePreview) {
      setError(t.createPost.photosLabel);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPost({
        title: title.trim(),
        price: numPrice,
        currency,
        country,
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
      setIsCreatePostModalOpen(false);
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
            {t.createPost.title}
          </h2>
          <button
            onClick={() => setIsCreatePostModalOpen(false)}
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

          {/* Photo Upload Area */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
              {t.createPost.photosLabel}
            </label>
            <div className="border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white rounded-sm p-4 text-center bg-neutral-50 dark:bg-neutral-900/50 transition-colors">
              {imagePreview ? (
                <div className="relative aspect-video max-h-48 mx-auto overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/80 text-white rounded-full hover:bg-black transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                  <Camera className="w-6 h-6 text-neutral-400 mb-1.5" />
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Carregar fotografia do telemóvel ou câmara
                  </span>
                  <span className="text-[10px] text-neutral-400 mt-1">
                    {t.createPost.photosHint}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              {t.createPost.postTitleLabel}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={t.createPost.postTitlePlaceholder}
              className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Price & Currency Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                {t.createPost.priceLabel}
              </label>
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="0.00"
                className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                {t.createPost.currencyLabel}
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
                {t.createPost.conditionLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('novo')}
                  className={`py-1.5 text-xs font-semibold rounded-sm border text-center transition-colors cursor-pointer ${
                    condition === 'novo'
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {t.post.conditionNew}
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('usado')}
                  className={`py-1.5 text-xs font-semibold rounded-sm border text-center transition-colors cursor-pointer ${
                    condition === 'usado'
                      ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-bold'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {t.post.conditionUsed}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                {t.createPost.categoryLabel}
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

          {/* Country & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                {t.createPost.countryLabel}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
              >
                {POPULAR_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name[language] || c.name['en'] || c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                {t.createPost.locationLabel}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder={t.createPost.locationPlaceholder}
                className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              {t.createPost.descriptionLabel}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              placeholder={t.createPost.descriptionPlaceholder}
              className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white leading-relaxed resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatePostModalOpen(false)}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-4 bg-black dark:bg-white text-white dark:text-black rounded-sm text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? t.createPost.posting : t.createPost.submitButton}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
