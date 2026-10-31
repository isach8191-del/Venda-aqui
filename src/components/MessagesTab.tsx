import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  BadgePercent,
  CheckCheck
} from 'lucide-react';

export const MessagesTab: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    sendMessage,
    user 
  } = useApp();

  const [inputText, setInputText] = useState('');

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;
    sendMessage(activeConversationId, inputText);
    setInputText('');
  };

  const handleQuickQuestion = (text: string) => {
    if (!activeConversationId) return;
    sendMessage(activeConversationId, text);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 h-[calc(100vh-8.5rem)] flex flex-col">
      
      {/* View 1: Active Chat View */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-xl overflow-hidden shadow-xs">
          
          {/* Header do Chat */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveConversationId(null)}
                className="p-1 text-neutral-500 hover:text-black dark:hover:text-white"
                aria-label="Voltar para lista de conversas"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <img
                src={activeConversation.participant.avatar}
                alt={activeConversation.participant.name}
                className="w-9 h-9 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
              />

              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-black dark:text-white">
                    {activeConversation.participant.name}
                  </span>
                  {activeConversation.participant.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-black dark:text-white" />
                  )}
                </div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {activeConversation.participant.location} · Reputação {activeConversation.participant.rating}★
                </span>
              </div>
            </div>

            {/* Product card anchor */}
            {activeConversation.product && (
              <div className="flex items-center gap-2 max-w-[170px] bg-white dark:bg-neutral-950 p-1.5 rounded border border-neutral-200 dark:border-neutral-800">
                <img
                  src={activeConversation.product.image}
                  alt={activeConversation.product.title}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-black dark:text-white truncate">
                    {activeConversation.product.title}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-neutral-700 dark:text-neutral-300">
                    R$ {activeConversation.product.price.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick reply chips */}
          <div className="px-3 py-1.5 bg-neutral-100/70 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-neutral-400 shrink-0">Perguntas rápidas:</span>
            <button
              onClick={() => handleQuickQuestion('Ainda está disponível para venda?')}
              className="px-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-full hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300"
            >
              Ainda disponível?
            </button>
            <button
              onClick={() => handleQuickQuestion('Faz desconto para pagamento à vista no PIX?')}
              className="px-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-full hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300"
            >
              Aceita PIX à vista?
            </button>
            <button
              onClick={() => handleQuickQuestion('Pode enviar mais fotos do produto?')}
              className="px-2.5 py-1 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-full hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300"
            >
              Mais fotos?
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConversation.messages.map((msg) => {
              const isMine = msg.isMine || msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed ${
                      isMine
                        ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none'
                        : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-neutral-400">
                    <span>{msg.timestamp}</span>
                    {isMine && <CheckCheck className="w-3 h-3 text-neutral-400" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Send Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-neutral-950"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem sobre a compra ou venda..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity disabled:opacity-40"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      ) : (
        /* View 2: Conversations List */
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-black dark:text-white" />
              <h1 className="text-base font-extrabold uppercase tracking-tight text-black dark:text-white">
                Mensagens & Negociações
              </h1>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              {conversations.length} conversas
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className="w-full text-left p-3.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors rounded-xl flex items-center gap-3 group"
                >
                  <img
                    src={conv.participant.avatar}
                    alt={conv.participant.name}
                    className="w-12 h-12 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-black dark:text-white truncate">
                        {conv.participant.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    {conv.product && (
                      <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 truncate">
                        Ref: {conv.product.title} (R$ {conv.product.price.toLocaleString('pt-BR')})
                      </p>
                    )}

                    <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-black flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-16 text-neutral-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold text-black dark:text-white">Nenhuma conversa ativa</p>
                <p className="text-xs mt-1">Clique em "Conversar" em qualquer publicação do feed para negociar.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
