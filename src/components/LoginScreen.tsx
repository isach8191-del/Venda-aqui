import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  Globe, 
  Check 
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, POPULAR_COUNTRIES, LanguageCode } from '../i18n';

export const LoginScreen: React.FC = () => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset,
    setIsTermsModalOpen, 
    setTermsModalMode,
    language,
    setLanguage,
    preferredCountry,
    setPreferredCountry,
    t
  } = useApp();

  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('Maputo');
  const [country, setCountry] = useState(preferredCountry || 'MZ');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccess(null);
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setResetSuccess('Enviámos um link para o teu e-mail. Verifica também o spam.');
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || t.auth.errors.general);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim() || !username.trim()) {
          setError(t.auth.errors.requiredFields);
          setLoading(false);
          return;
        }

        if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
          setError(t.auth.errors.usernameInvalid);
          setLoading(false);
          return;
        }

        if (!acceptedTerms) {
          setError(t.auth.errors.termsRequired);
          setLoading(false);
          return;
        }

        await signUpWithEmail(email, password, name.trim(), username.trim(), location.trim(), country);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err?.message || t.auth.errors.general);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-black text-neutral-900 dark:text-neutral-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-md overflow-hidden p-6 sm:p-7">
        
        {/* Language Selector Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <Globe className="w-3.5 h-3.5" />
            <span>{t.auth.languageSelectorLabel}:</span>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="text-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm py-1 px-2 text-black dark:text-white font-medium focus:outline-none cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.nativeName}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="w-9 h-9 mx-auto border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-black text-sm flex items-center justify-center rounded-sm mb-2.5">
            VA
          </div>
          <h1 className="text-lg font-extrabold uppercase tracking-tight text-black dark:text-white">
            {t.common.appName}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t.auth.subtitle}
          </p>
        </div>

        {/* Notice: Account required */}
        <div className="mb-5 p-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm text-[11px] text-neutral-600 dark:text-neutral-400 text-center leading-relaxed">
          {t.auth.subtitle}
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-400 dark:border-neutral-700 text-xs text-black dark:text-white flex items-start gap-2 rounded-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-4 py-2 px-3 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 rounded-sm text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t.auth.googleButton}</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-white dark:bg-neutral-950 px-2 text-neutral-400">
              {t.common.or}
            </span>
          </div>
        </div>

        {/* View Switch: Esqueci a Palavra-passe vs Normal Login/Register */}
        {isForgotPassword ? (
          <div>
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-1">
                Recuperar Palavra-passe
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Introduz o teu e-mail associado à conta para receberes o link de recuperação.
              </p>
            </div>

            {resetSuccess && (
              <div className="mb-4 p-2.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-400 dark:border-neutral-600 text-xs text-black dark:text-white flex items-start gap-2 rounded-sm">
                <Check className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                <span className="leading-tight font-medium">{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordResetSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.auth.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t.auth.emailPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2 px-3 bg-black dark:bg-white text-white dark:text-black rounded-sm text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'A enviar...' : 'Enviar Link de Recuperação'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError(null);
                  setResetSuccess(null);
                }}
                className="w-full py-1.5 text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer text-center"
              >
                Voltar ao Início de Sessão
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Tab Toggle: Entrar vs Registar */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <button
                type="button"
                onClick={() => { setIsRegister(false); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold text-center transition-colors ${
                  !isRegister
                    ? 'border-b-2 border-black dark:border-white text-black dark:text-white font-bold'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {t.auth.loginTab}
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); setError(null); }}
                className={`flex-1 py-1.5 text-xs font-semibold text-center transition-colors ${
                  isRegister
                    ? 'border-b-2 border-black dark:border-white text-black dark:text-white font-bold'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {t.auth.registerTab}
              </button>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      {t.auth.nameLabel}
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder={t.auth.namePlaceholder}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      {t.auth.usernameLabel}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder={t.auth.usernamePlaceholder}
                      className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      {t.auth.countryLabel}
                    </label>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setPreferredCountry(e.target.value);
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
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
                      {t.auth.locationLabel}
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t.auth.locationPlaceholder}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.auth.emailLabel}
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t.auth.emailPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  {t.auth.passwordLabel}
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t.auth.passwordPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              {/* Esqueci a palavra-passe link on login tab */}
              {!isRegister && (
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                      setResetSuccess(null);
                    }}
                    className="text-[11px] text-neutral-500 hover:text-black dark:hover:text-white underline font-medium cursor-pointer"
                  >
                    Esqueci a palavra-passe
                  </button>
                </div>
              )}

              {isRegister && (
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-neutral-600 dark:text-neutral-400">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      required
                      className="mt-0.5 rounded-xs"
                    />
                    <span className="leading-tight">
                      {t.auth.termsAgreement}{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setTermsModalMode('terms');
                          setIsTermsModalOpen(true);
                        }}
                        className="text-black dark:text-white font-bold underline hover:opacity-80"
                      >
                        {t.auth.termsLink}
                      </button>{' '}
                      {t.common.or}{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setTermsModalMode('about');
                          setIsTermsModalOpen(true);
                        }}
                        className="text-black dark:text-white font-bold underline hover:opacity-80"
                      >
                        {t.auth.privacyLink}
                      </button>
                      .
                    </span>
                  </label>
                </div>
              )}

              {/* Classic Sober Small Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2 px-3 bg-black dark:bg-white text-white dark:text-black rounded-sm text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <span>{isRegister ? t.auth.createAccountButton : t.auth.enterButton}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-[11px] text-neutral-500 font-medium tracking-wide uppercase">
          {t.auth.footerSlogan}
        </p>
      </div>
    </div>
  );
};
