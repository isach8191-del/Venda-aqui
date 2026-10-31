import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, Upload, AlertCircle, Check } from 'lucide-react';
import { DEFAULT_AVATAR, DEFAULT_COVER } from '../data/seedData';

export const EditProfileModal: React.FC = () => {
  const { user, isEditProfileOpen, setIsEditProfileOpen, updateUserProfile } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Image files & previews
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || DEFAULT_AVATAR);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(user?.coverPhoto || DEFAULT_COVER);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isEditProfileOpen || !user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem do perfil deve ter menos de 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 6 * 1024 * 1024) {
        setError('A imagem de capa deve ter menos de 6MB');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome não pode estar vazio');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateUserProfile({
        name: name.trim(),
        bio: bio.trim(),
        location: location.trim(),
        phone: phone.trim(),
        avatarFile,
        coverFile,
      });
    } catch (err: any) {
      setError(err?.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-black dark:text-white uppercase tracking-tight">
            Editar Perfil
          </h2>
          <button
            onClick={() => setIsEditProfileOpen(false)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-black dark:text-white flex items-center gap-2 rounded-sm">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Cover & Avatar Photo Editing */}
          <div className="space-y-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Fotos do Perfil
            </span>

            {/* Cover photo preview with change trigger */}
            <div className="relative h-28 w-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm overflow-hidden">
              <img
                src={coverPreview}
                alt="Pré-visualização da capa"
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center gap-1.5 text-white text-[11px] font-semibold cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <span>Mudar Foto de Capa</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Avatar photo preview with change trigger */}
            <div className="flex items-center gap-3 pt-1">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-300 dark:border-neutral-700 shrink-0">
                <img
                  src={avatarPreview}
                  alt="Pré-visualização do avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <label className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-xs font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors bg-white dark:bg-neutral-900">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Escolher Foto de Perfil (Galeria ou Câmara)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Formatos aceites: JPG, PNG ou WebP até 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="O seu nome"
              className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Bio input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Biografia / Sobre você
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Conte aos compradores e vendedores quem é você, seus produtos favoritos ou forma de negociar..."
              className="w-full px-3 py-2 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* Location and Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Cidade / Localização
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lisboa, São Paulo..."
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Contacto / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+351 912 345 678"
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white text-xs focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Actions: Classic small sober buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(false)}
              className="py-1.5 px-3 rounded-sm border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="py-1.5 px-4 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
