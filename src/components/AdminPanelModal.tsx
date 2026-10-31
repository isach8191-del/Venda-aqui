import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Report, User, Post } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  X, 
  ShieldAlert, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Users, 
  Package, 
  AlertTriangle,
  RefreshCw,
  Store
} from 'lucide-react';
import { DEFAULT_AVATAR, DEFAULT_COVER } from '../data/seedData';

interface AdminPanelModalProps {
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ onClose }) => {
  const { user, deletePost, posts, showToast, shops, toggleShopVerification, deleteShop } = useApp();
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'posts' | 'shops'>('reports');

  // Reports state
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Users state
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Load reports
  const loadReports = async () => {
    setReportsLoading(true);
    try {
      const q = query(collection(db, 'reports'));
      const snap = await getDocs(q);
      const data: Report[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      data.sort((a, b) => b.id.localeCompare(a.id));
      setReports(data);
    } catch (err) {
      console.error('Error loading reports:', err);
      showToast('Erro ao carregar denúncias.');
    } finally {
      setReportsLoading(false);
    }
  };

  // Load all users
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data: User[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setAllUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    loadUsers();
  }, []);

  // Admin action: Block / Unblock user
  const handleToggleBlockUser = async (targetUserId: string, currentBlocked: boolean) => {
    try {
      await updateDoc(doc(db, 'users', targetUserId), {
        isBlocked: !currentBlocked,
      });

      setAllUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, isBlocked: !currentBlocked } : u))
      );

      showToast(`Utilizador ${!currentBlocked ? 'bloqueado' : 'desbloqueado'} com sucesso.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUserId}`);
    }
  };

  // Admin action: Delete user profile
  const handleDeleteUserProfile = async (targetUserId: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar permanentemente este perfil de utilizador?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', targetUserId));
      setAllUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      showToast('Perfil de utilizador eliminado.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${targetUserId}`);
    }
  };

  // Admin action: Resolve / Dismiss report
  const handleUpdateReportStatus = async (reportId: string, status: 'resolvido' | 'descartado') => {
    try {
      await updateDoc(doc(db, 'reports', reportId), { status });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      showToast(`Denúncia marcada como ${status}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  // Admin action: Delete post from report
  const handleDeleteReportedPost = async (postId: string, reportId?: string) => {
    if (!window.confirm('Tem a certeza que deseja apagar este anúncio denunciado?')) {
      return;
    }
    await deletePost(postId);
    if (reportId) {
      await handleUpdateReportStatus(reportId, 'resolvido');
    }
    showToast('Anúncio denunciado removido com sucesso.');
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-sm shadow-2xl flex flex-col max-h-[90vh] h-[650px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black font-black text-[10px] flex items-center justify-center rounded-xs">
              AD
            </div>
            <div>
              <h2 className="font-extrabold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
                Painel do Administrador (isach8191@gmail.com)
              </h2>
              <p className="text-[10px] text-neutral-500">
                Gestão central de denúncias, anúncios e utilizadores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'reports'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Denúncias ({reports.filter((r) => r.status === 'pendente').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'users'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Utilizadores ({allUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`py-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'posts'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Anúncios ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shops')}
            className={`py-2 px-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'shops'
                ? 'border-black dark:border-white text-black dark:text-white bg-white dark:bg-neutral-950'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Lojas ({shops.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* TAB 1: DENÚNCIAS */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Denúncias de Anúncios e Utilizadores
                </span>
                <button
                  onClick={loadReports}
                  className="p-1 text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Recarregar</span>
                </button>
              </div>

              {reportsLoading ? (
                <div className="text-center py-10 text-xs text-neutral-400">
                  A carregar denúncias...
                </div>
              ) : reports.length > 0 ? (
                reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-900/60 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-black uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black">
                          {rep.targetType === 'post' ? 'Anúncio' : 'Utilizador'}
                        </span>
                        <span className="text-xs font-bold text-black dark:text-white">
                          Motivo: {rep.reason.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs ${
                        rep.status === 'pendente' 
                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200' 
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}>
                        {rep.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-700 dark:text-neutral-300">
                      {rep.targetTitle && (
                        <p className="font-semibold text-black dark:text-white">
                          Alvo: {rep.targetTitle}
                        </p>
                      )}
                      {rep.description && (
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400 italic">
                          "{rep.description}"
                        </p>
                      )}
                    </div>

                    {/* Admin Actions for this report */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px]">
                      <span className="text-[10px] text-neutral-400">
                        Denunciado por: {rep.reporterName}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {rep.targetType === 'post' && (
                          <button
                            onClick={() => handleDeleteReportedPost(rep.targetId, rep.id)}
                            className="py-1 px-2 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-red-500 hover:text-red-500 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Apagar Anúncio</span>
                          </button>
                        )}

                        {rep.targetUserId && (
                          <button
                            onClick={() => handleToggleBlockUser(rep.targetUserId!, false)}
                            className="py-1 px-2 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Bloquear Utilizador</span>
                          </button>
                        )}

                        {rep.status === 'pendente' && (
                          <button
                            onClick={() => handleUpdateReportStatus(rep.id, 'resolvido')}
                            className="py-1 px-2 rounded-sm bg-black dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-wider"
                          >
                            Resolver
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  Nenhuma denúncia registada no momento.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UTILIZADORES */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Pesquisar por nome, @utilizador ou e-mail..."
                className="w-full px-3 py-1.5 rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-black dark:text-white"
              />

              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-900/60 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={u.avatar || DEFAULT_AVATAR}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-black dark:text-white truncate">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            @{u.username}
                          </span>
                          {u.isBlocked && (
                            <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-bold uppercase bg-red-600 text-white">
                              Bloqueado
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {u.email} · {u.location || 'Sem cidade'}
                        </p>
                      </div>
                    </div>

                    {/* Admin actions for user */}
                    {u.email !== 'isach8191@gmail.com' ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleBlockUser(u.id, !!u.isBlocked)}
                          className={`py-1 px-2.5 rounded-sm text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
                            u.isBlocked
                              ? 'border-neutral-300 text-black dark:text-white hover:border-black'
                              : 'border-neutral-300 hover:border-red-500 text-neutral-700 dark:text-neutral-300 hover:text-red-500'
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          <span>{u.isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUserProfile(u.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Eliminar perfil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        Criador / Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TODOS OS ANÚNCIOS */}
          {activeTab === 'posts' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                Eliminar anúncios inadequados como Administrador
              </span>

              {posts.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-900/60 flex items-center justify-between gap-3"
                >
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-10 h-10 object-cover rounded-xs border border-neutral-300 dark:border-neutral-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-black dark:text-white truncate">
                      {p.title}
                    </p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      Vendedor: {p.seller.name} (@{p.seller.username}) · R$ {p.price.toLocaleString('pt-BR')}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteReportedPost(p.id)}
                    className="py-1 px-2.5 rounded-sm border border-neutral-300 dark:border-neutral-700 hover:border-red-500 hover:text-red-500 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Apagar Anúncio</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: TODAS AS LOJAS E NEGÓCIOS */}
          {activeTab === 'shops' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                Gerir Lojas: Atribuir ou remover selo de verificada e eliminar lojas
              </span>

              {shops.length > 0 ? (
                shops.map((shop) => (
                  <div
                    key={shop.id}
                    className="p-3 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-white dark:bg-neutral-900/60 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={shop.logo || DEFAULT_AVATAR}
                        alt={shop.name}
                        className="w-10 h-10 object-cover rounded-xs border border-neutral-300 dark:border-neutral-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-black dark:text-white truncate">
                            {shop.name}
                          </span>
                          {shop.verified && (
                            <span className="px-1 py-0.2 rounded-xs text-[9px] font-black uppercase bg-black dark:bg-white text-white dark:text-black">
                              Verificada
                            </span>
                          )}
                          <span className="text-[10px] text-neutral-500">
                            · {shop.shopType}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {shop.city} · {shop.phone} · Dono: {shop.ownerEmail || shop.ownerId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleShopVerification(shop.id, shop.verified)}
                        className={`py-1 px-2.5 rounded-sm text-[11px] font-bold uppercase tracking-wider border transition-colors ${
                          shop.verified
                            ? 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
                            : 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        }`}
                      >
                        {shop.verified ? 'Remover Selo' : 'Dar Selo Verificada'}
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Eliminar a loja "${shop.name}" como Administrador?`)) {
                            deleteShop(shop.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Eliminar loja"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-neutral-400 text-xs">
                  Nenhuma loja registada ainda.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
