import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, MessageSquare } from 'lucide-react';

export const CommentsModal: React.FC = () => {
  const { activeCommentsPost, setActiveCommentsPost, addComment, user } = useApp();
  const [commentText, setCommentText] = useState('');

  if (!activeCommentsPost) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(activeCommentsPost.id, commentText);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] h-[550px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-black dark:text-white" />
            <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-tight">
              Comentários ({activeCommentsPost.comments.length})
            </h3>
          </div>
          <button
            onClick={() => setActiveCommentsPost(null)}
            className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product mini header */}
        <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <img
            src={activeCommentsPost.images[0]}
            alt={activeCommentsPost.title}
            className="w-10 h-10 object-cover rounded-md border border-neutral-300 dark:border-neutral-700 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-black dark:text-white truncate">
              {activeCommentsPost.title}
            </p>
            <p className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
              R$ {activeCommentsPost.price.toLocaleString('pt-BR')} · {activeCommentsPost.condition === 'novo' ? 'NOVO' : 'USADO'}
            </p>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeCommentsPost.comments.length > 0 ? (
            activeCommentsPost.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="w-8 h-8 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0 mt-0.5"
                />
                <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-black dark:text-white">
                      {comment.author.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-xs">Nenhum comentário ainda.</p>
              <p className="text-[11px] mt-1">Seja o primeiro a tirar uma dúvida sobre este item!</p>
            </div>
          )}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-neutral-950">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escreva uma pergunta ou comentário..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="p-2.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity disabled:opacity-40"
            aria-label="Enviar comentário"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
