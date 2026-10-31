import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, MessageSquare } from 'lucide-react';
import { DEFAULT_AVATAR } from '../data/seedData';

export const CommentsModal: React.FC = () => {
  const { activeCommentsPost, setActiveCommentsPost, addComment, openUserProfile, user } = useApp();
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!activeCommentsPost) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      await addComment(activeCommentsPost.id, commentText);
      setCommentText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-t-sm sm:rounded-sm overflow-hidden shadow-2xl flex flex-col max-h-[82vh] h-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-black dark:text-white" />
            <h3 className="font-bold text-xs sm:text-sm text-black dark:text-white uppercase tracking-tight">
              Perguntas e Comentários
            </h3>
          </div>
          <button
            onClick={() => setActiveCommentsPost(null)}
            className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product mini bar */}
        <div className="px-3.5 py-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5">
          <img
            src={activeCommentsPost.images[0]}
            alt={activeCommentsPost.title}
            className="w-8 h-8 object-cover rounded-xs border border-neutral-300 dark:border-neutral-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-black dark:text-white truncate">
              {activeCommentsPost.title}
            </p>
            <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
              R$ {activeCommentsPost.price.toLocaleString('pt-BR')} · <span className="uppercase">{activeCommentsPost.condition}</span>
            </p>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {activeCommentsPost.comments && activeCommentsPost.comments.length > 0 ? (
            activeCommentsPost.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5">
                <button
                  onClick={() => {
                    openUserProfile(comment.author);
                    setActiveCommentsPost(null);
                  }}
                  className="shrink-0"
                >
                  <img
                    src={comment.author.avatar || DEFAULT_AVATAR}
                    alt={comment.author.name}
                    className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 mt-0.5"
                  />
                </button>
                <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-sm border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      onClick={() => {
                        openUserProfile(comment.author);
                        setActiveCommentsPost(null);
                      }}
                      className="font-bold text-xs text-black dark:text-white cursor-pointer hover:underline"
                    >
                      {comment.author.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-14 text-neutral-400">
              <p className="text-xs font-medium">Nenhuma pergunta feita ainda.</p>
              <p className="text-[11px] mt-0.5 text-neutral-500">Deixe uma dúvida sobre o produto ou forma de entrega.</p>
            </div>
          )}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="p-2.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-neutral-950">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escreva a sua pergunta para o vendedor..."
            className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || loading}
            className="py-1.5 px-3 rounded-sm bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1 shrink-0"
          >
            <Send className="w-3 h-3" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
