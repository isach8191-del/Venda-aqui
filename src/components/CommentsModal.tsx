import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, MessageSquare, Trash2, Reply, AlertTriangle } from 'lucide-react';
import { DEFAULT_AVATAR } from '../data/seedData';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorUsername?: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export const CommentsModal: React.FC = () => {
  const { 
    activeCommentsPost, 
    setActiveCommentsPost, 
    openUserProfile, 
    user, 
    isAdmin,
    showToast,
    formatPrice 
  } = useApp();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Real-time listener for comments on posts/{postId}/comments
  useEffect(() => {
    if (!activeCommentsPost) return;

    setLoadingComments(true);
    setLoadError(null);

    const commentsRef = collection(db, 'posts', activeCommentsPost.id, 'comments');
    const unsubscribe = onSnapshot(
      commentsRef,
      (snapshot) => {
        const loaded: CommentItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            postId: activeCommentsPost.id,
            authorId: data.authorId || '',
            authorName: data.authorName || 'Utilizador',
            authorUsername: data.authorUsername || '@utilizador',
            authorAvatar: data.authorAvatar || DEFAULT_AVATAR,
            text: data.text || '',
            createdAt: data.createdAt || new Date().toISOString(),
          };
        });

        // Sort in client code by date ascending (oldest first, newest at bottom) to avoid Firestore index requirement
        loaded.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        setComments(loaded);
        setLoadingComments(false);
        setLoadError(null);
      },
      (err) => {
        console.error('Erro ao ler comentários:', err);
        setLoadingComments(false);
        const msg = err?.message || 'Erro ao carregar comentários do anúncio.';
        setLoadError(msg);
      }
    );

    return () => unsubscribe();
  }, [activeCommentsPost?.id]);

  // Scroll to bottom when new comment arrives
  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  if (!activeCommentsPost) return null;

  const isPostOwner = Boolean(user && (user.id === activeCommentsPost.sellerId || user.id === activeCommentsPost.seller.id));

  // Add new comment
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    if (!user) {
      showToast('Inicie sessão para deixar uma pergunta.');
      return;
    }

    if (user.isBlocked) {
      showToast('A sua conta está bloqueada e não pode publicar comentários.');
      return;
    }

    const textToSend = commentText.trim();
    setIsSubmitting(true);

    try {
      // 1. Gravar diretamente na subcoleção posts/{postId}/comments
      await addDoc(collection(db, 'posts', activeCommentsPost.id, 'comments'), {
        postId: activeCommentsPost.id,
        authorId: user.id,
        authorName: user.name,
        authorUsername: user.username,
        authorAvatar: user.avatar || DEFAULT_AVATAR,
        text: textToSend,
        createdAt: new Date().toISOString(),
      });

      // 2. Incrementar contador de comentários no documento do anúncio
      try {
        await updateDoc(doc(db, 'posts', activeCommentsPost.id), {
          commentsCount: increment(1),
        });
      } catch (countErr) {
        console.warn('Erro ao atualizar contador:', countErr);
      }

      // 3. Notificar o vendedor do anúncio (se for outro utilizador)
      const sellerId = activeCommentsPost.sellerId || activeCommentsPost.seller?.id;
      if (sellerId && sellerId !== user.id) {
        try {
          await addDoc(collection(db, 'users', sellerId, 'notifications'), {
            type: 'comment',
            senderId: user.id,
            senderName: user.name,
            senderAvatar: user.avatar || DEFAULT_AVATAR,
            postId: activeCommentsPost.id,
            postTitle: activeCommentsPost.title,
            commentText: textToSend,
            description: `${user.name} perguntou no teu anúncio "${activeCommentsPost.title}": "${textToSend.substring(0, 80)}"`,
            read: false,
            createdAt: new Date().toISOString(),
          });
        } catch (notifErr) {
          console.warn('Erro ao criar notificação de comentário:', notifErr);
        }
      }

      setCommentText('');
      showToast('Comentário publicado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao publicar comentário:', err);
      const errMsg = err?.message || 'Não foi possível publicar o comentário.';
      showToast(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment (Author, Post Owner, or Admin)
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Tem a certeza que deseja apagar este comentário?')) return;

    setDeletingId(commentId);
    try {
      await deleteDoc(doc(db, 'posts', activeCommentsPost.id, 'comments', commentId));

      try {
        await updateDoc(doc(db, 'posts', activeCommentsPost.id), {
          commentsCount: increment(-1),
        });
      } catch (cntErr) {
        console.warn('Erro ao decrementar contador:', cntErr);
      }

      showToast('Comentário removido.');
    } catch (err: any) {
      console.error('Erro ao apagar comentário:', err);
      showToast(err?.message || 'Erro ao apagar comentário.');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle reply button (for post owner or admin)
  const handleReplyTo = (authorName: string) => {
    setCommentText((prev) => {
      const mention = `@${authorName} `;
      if (prev.startsWith(mention)) return prev;
      return `${mention}${prev}`;
    });
    inputRef.current?.focus();
  };

  const formatCommentDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Hoje';
      const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${date} às ${time}`;
    } catch {
      return 'Hoje';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-t-sm sm:rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[85vh] h-[540px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com título exato corrigido */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-black dark:text-white shrink-0" />
            <h3 className="font-extrabold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight truncate">
              PERGUNTAS E COMENTÁRIOS
            </h3>
          </div>
          <button
            onClick={() => setActiveCommentsPost(null)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar comentários"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product mini bar */}
        <div className="px-3.5 py-2 bg-neutral-100/70 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5">
          {activeCommentsPost.images?.[0] && (
            <img
              src={activeCommentsPost.images[0]}
              alt={activeCommentsPost.title}
              className="w-9 h-9 object-cover rounded-xs border border-neutral-300 dark:border-neutral-700 shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-black dark:text-white truncate">
              {activeCommentsPost.title}
            </p>
            <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
              {formatPrice(activeCommentsPost.price, activeCommentsPost.currency)} · <span className="uppercase font-sans font-semibold">{activeCommentsPost.condition}</span>
            </p>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {loadingComments ? (
            <div className="text-center py-14 text-neutral-400 text-xs">
              <span className="inline-block animate-spin mr-2">⟳</span>
              A carregar comentários...
            </div>
          ) : loadError ? (
            <div className="text-center py-12 px-4 text-red-600 dark:text-red-400 space-y-2">
              <AlertTriangle className="w-6 h-6 mx-auto" />
              <p className="text-xs font-bold">Erro ao ler comentários</p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">{loadError}</p>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => {
              const canDelete = Boolean(
                user && (isAdmin || user.id === comment.authorId || isPostOwner)
              );
              const isCommentAuthorPostOwner = comment.authorId === activeCommentsPost.sellerId;

              return (
                <div key={comment.id} className="flex items-start gap-2.5 group">
                  <button
                    onClick={() => {
                      openUserProfile(comment.authorId);
                      setActiveCommentsPost(null);
                    }}
                    className="shrink-0 cursor-pointer"
                    title={`Ver perfil de ${comment.authorName}`}
                  >
                    <img
                      src={comment.authorAvatar || DEFAULT_AVATAR}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 mt-0.5"
                    />
                  </button>

                  <div className="flex-1 min-w-0 bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-sm border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          onClick={() => {
                            openUserProfile(comment.authorId);
                            setActiveCommentsPost(null);
                          }}
                          className="font-bold text-xs text-black dark:text-white cursor-pointer hover:underline"
                        >
                          {comment.authorName}
                        </span>

                        {isCommentAuthorPostOwner && (
                          <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded-xs bg-black text-white dark:bg-white dark:text-black">
                            Vendedor
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-neutral-400 font-mono">
                        {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-800 dark:text-neutral-200 mt-1 leading-relaxed break-words whitespace-pre-wrap">
                      {comment.text}
                    </p>

                    {/* Actions: Responder e Apagar */}
                    <div className="flex items-center gap-3 mt-2 pt-1 border-t border-neutral-200/60 dark:border-neutral-800 text-[10px]">
                      {(isPostOwner || isAdmin) && (
                        <button
                          type="button"
                          onClick={() => handleReplyTo(comment.authorName)}
                          className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Reply className="w-3 h-3" />
                          <span>Responder</span>
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingId === comment.id}
                          className="text-neutral-400 hover:text-red-600 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                          title="Apagar este comentário"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{deletingId === comment.id ? 'A apagar...' : 'Apagar'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-14 text-neutral-400">
              <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Nenhuma pergunta feita ainda.</p>
              <p className="text-[11px] mt-0.5 text-neutral-500">Deixe uma dúvida sobre o produto ou forma de entrega.</p>
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input bar */}
        <form 
          onSubmit={handleSubmit} 
          className="p-2.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-neutral-950"
        >
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Escreve a tua pergunta ou comentário..."
            className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="py-1.5 px-3.5 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'A ENVIAR...' : 'ENVIAR'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
