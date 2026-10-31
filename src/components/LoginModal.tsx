import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_USERS } from '../data/seedData';
import { User } from '../types';
import { X, Lock, Mail, User as UserIcon, MapPin, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginUser, user } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('lucas@vendaaqui.com');
  const [password, setPassword] = useState('123456');

  // Register form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [location, setLocation] = useState('São Paulo, SP');

  if (!isLoginModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Match with existing demo user or create dummy session
    const matched = DEMO_USERS.find(
      (u) => u.username.toLowerCase() === email.split('@')[0].toLowerCase()
    );
    if (matched) {
      loginUser(matched);
    } else {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        username: email.split('@')[0],
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        rating: 5.0,
        totalSales: 0,
        verified: true,
        location: 'São Paulo, SP',
      };
      loginUser(newUser);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      username: username.trim().replace('@', '').toLowerCase(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      totalSales: 0,
      verified: true,
      location: location || 'Brasil',
      bio: 'Novo vendedor no VENDA AQUI.',
    };
    loginUser(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm">
              VA
            </div>
            <div>
              <h2 className="font-extrabold text-base text-black dark:text-white uppercase tracking-tight">
                VENDA AQUI
              </h2>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Rede Social de Compra e Venda
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
              tab === 'login'
                ? 'border-b-2 border-black dark:border-white text-black dark:text-white bg-neutral-50 dark:bg-neutral-900'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Entrar na Conta
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
              tab === 'register'
                ? 'border-b-2 border-black dark:border-white text-black dark:text-white bg-neutral-50 dark:bg-neutral-900'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  E-mail ou Usuário
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <span>Acessar VENDA AQUI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* 1-Click Demo Logins */}
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                  Ou entrar com perfil de teste (1 clique):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_USERS.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => loginUser(u)}
                      className="p-2 border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-left flex items-center gap-2 transition-colors rounded-lg"
                    >
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-black dark:text-white truncate">
                          {u.name.split(' ')[0]}
                        </p>
                        <p className="text-[10px] text-neutral-500 truncate">
                          @{u.username}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ex: Carlos Mendes"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Nome de Usuário (@handle) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="carlos_mendes"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="carlos@exemplo.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Cidade / Estado *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Criar Senha *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black font-extrabold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
              >
                Cadastrar e Começar a Vender
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline"
            >
              Continuar navegando no feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
