import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VoicePlayer } from './VoicePlayer';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  CheckCheck,
  Mic,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';

export const MessagesTab: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    sendMessage,
    showToast,
    user 
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // seconds
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [failedAudioDraft, setFailedAudioDraft] = useState<{ base64: string; duration: number } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Clean up media streams on unmount or conversation change
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [activeConversationId]);

  const cleanupRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  // Start voice recording with 16kbps compressed voice and 2 min max
  const startRecording = async () => {
    if (user?.isBlocked) {
      showToast('A sua conta está bloqueada e não pode enviar mensagens de voz.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Detect supported mime type
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
            mimeType = 'audio/ogg;codecs=opus';
          } else {
            mimeType = '';
          }
        }
      } else {
        mimeType = '';
      }

      const recorderOptions: MediaRecorderOptions = {
        audioBitsPerSecond: 16000, // 16kbps: Voice clarity with ultra-compact size (<250KB for 2 mins)
      };
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingTime(0);
      startTimeRef.current = Date.now();

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      timerIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingTime(elapsed);
        if (elapsed >= 120) {
          // Exactly 2 minutes: Auto stop and send
          stopAndSendRecording();
        }
      }, 500);

    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        showToast('Permissão do microfone negada. Por favor, autorize o microfone nas definições do navegador para gravar áudio.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        showToast('Nenhum microfone encontrado no seu telemóvel ou computador.');
      } else {
        showToast('Não foi possível aceder ao microfone. Verifique as permissões.');
      }
      cleanupRecording();
    }
  };

  // Stop recording and send audio
  const stopAndSendRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      cleanupRecording();
      return;
    }

    const duration = Math.min(120, Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000)));
    setIsSendingAudio(true);

    recorder.onstop = async () => {
      try {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        if (audioBlob.size === 0) {
          showToast('Áudio vazio. Tente gravar novamente.');
          setIsSendingAudio(false);
          cleanupRecording();
          return;
        }

        // Convert audio Blob to Base64 Data URL
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result as string;

          // Check if exceeds 800 KB
          if (audioBlob.size > 800 * 1024) {
            showToast('Mensagem de voz demasiado grande, grava uma mais curta.');
            setIsSendingAudio(false);
            cleanupRecording();
            return;
          }

          try {
            if (activeConversationId) {
              await sendMessage(activeConversationId, '', undefined, base64Data, duration);
              setFailedAudioDraft(null);
              showToast('Mensagem de voz enviada com sucesso!');
            }
          } catch (sendErr: any) {
            console.error('Voice send error:', sendErr);
            showToast(sendErr?.message || 'Erro ao enviar mensagem de voz. Tente outra vez.');
            setFailedAudioDraft({ base64: base64Data, duration });
          } finally {
            setIsSendingAudio(false);
            cleanupRecording();
          }
        };

        reader.onerror = () => {
          showToast('Erro ao ler áudio gravado.');
          setIsSendingAudio(false);
          cleanupRecording();
        };

        reader.readAsDataURL(audioBlob);

      } catch (err: any) {
        console.error('Error finalizing recording:', err);
        showToast('Erro ao gravar mensagem de voz. Tente novamente.');
        setIsSendingAudio(false);
        cleanupRecording();
      }
    };

    try {
      recorder.stop();
    } catch {
      cleanupRecording();
      setIsSendingAudio(false);
    }
  };

  // Cancel recording and discard audio
  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    cleanupRecording();
    showToast('Gravação cancelada.');
  };

  // Retry sending failed draft
  const retryFailedDraft = async () => {
    if (!failedAudioDraft || !activeConversationId) return;
    setIsSendingAudio(true);
    try {
      await sendMessage(activeConversationId, '', undefined, failedAudioDraft.base64, failedAudioDraft.duration);
      setFailedAudioDraft(null);
      showToast('Mensagem de voz enviada!');
    } catch (err: any) {
      showToast(err?.message || 'Erro ao reenviar áudio.');
    } finally {
      setIsSendingAudio(false);
    }
  };

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

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isWarning10s = recordingTime >= 110;

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
                className="p-1 text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer"
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
          <div className="px-3 py-1.5 bg-neutral-100/70 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar">
            <span className="text-neutral-400 shrink-0">Perguntas rápidas:</span>
            <button
              onClick={() => handleQuickQuestion('Ainda está disponível para venda?')}
              className="py-0.5 px-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Ainda disponível?
            </button>
            <button
              onClick={() => handleQuickQuestion('Faz desconto para pagamento à vista no PIX?')}
              className="py-0.5 px-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Aceita PIX à vista?
            </button>
            <button
              onClick={() => handleQuickQuestion('Pode enviar mais fotos do produto?')}
              className="py-0.5 px-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Mais fotos?
            </button>
          </div>

          {/* Retry draft banner if previous voice note send failed */}
          {failedAudioDraft && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 flex items-center justify-between text-xs text-red-700 dark:text-red-300">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                Mensagem de voz não enviada. Tentar de novo?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={retryFailedDraft}
                  disabled={isSendingAudio}
                  className="px-2 py-0.5 bg-red-600 text-white rounded font-bold text-[11px] hover:bg-red-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isSendingAudio ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>Reenviar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFailedAudioDraft(null)}
                  className="text-neutral-500 hover:text-black dark:hover:text-white text-[11px] underline cursor-pointer"
                >
                  Descartar
                </button>
              </div>
            </div>
          )}

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {activeConversation.messages.map((msg) => {
              const isMine = msg.isMine || msg.senderId === user?.id;
              const hasAudio = Boolean(msg.audioUrl);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      isMine
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-2xs'
                        : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {hasAudio ? (
                      <div className="space-y-1">
                        <VoicePlayer 
                          audioUrl={msg.audioUrl!} 
                          duration={msg.audioDuration} 
                          isMine={isMine} 
                        />
                        {msg.text && msg.text !== 'Mensagem de voz' && (
                          <p className="text-[11px] pt-1 opacity-90 border-t border-white/20 dark:border-black/20">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1 text-[9px] text-neutral-400">
                    <span>{msg.timestamp}</span>
                    {isMine && <CheckCheck className="w-2.5 h-2.5 text-neutral-400" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Warning banner when remaining time <= 10 seconds */}
          {isRecording && isWarning10s && (
            <div className="px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Aviso: Faltam {120 - recordingTime}s! O áudio pára automaticamente aos 2:00.
              </span>
              <span className="font-mono">{formatTimer(recordingTime)} / 2:00</span>
            </div>
          )}

          {/* Message Input or Recording Bar */}
          {isRecording ? (
            /* Live Recording Bar */
            <div className="p-2.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 animate-in fade-in duration-100">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">A gravar voz...</span>
                  <span className={`text-xs font-mono font-bold ${isWarning10s ? 'text-red-600 animate-pulse' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {formatTimer(recordingTime)} <span className="text-[10px] text-neutral-400 font-normal">/ 2:00</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={cancelRecording}
                  disabled={isSendingAudio}
                  className="px-2.5 py-1.5 rounded text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Cancelar gravação"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cancelar</span>
                </button>

                {/* Send Audio Button */}
                <button
                  type="button"
                  onClick={stopAndSendRecording}
                  disabled={isSendingAudio}
                  className="py-1.5 px-3 bg-black dark:bg-white text-white dark:text-black rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  title="Enviar mensagem de voz"
                >
                  {isSendingAudio ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>A enviar...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Standard Text & Voice Message Bar */
            <form
              onSubmit={handleSend}
              className="p-2.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 bg-white dark:bg-neutral-950"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Digite sua mensagem sobre a compra ou venda..."
                className="flex-1 px-3 py-1.5 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
              />

              {/* Microphone Voice Recording Button */}
              <button
                type="button"
                onClick={startRecording}
                disabled={isSendingAudio}
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
                title="Gravar mensagem de voz (máx. 2 minutos)"
                aria-label="Gravar mensagem de voz"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || isSendingAudio}
                className="py-1.5 px-3 bg-black dark:bg-white text-white dark:text-black rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1 text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
                aria-label="Enviar mensagem"
              >
                <Send className="w-3 h-3" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          )}

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
                  className="w-full text-left p-3.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors rounded-xl flex items-center gap-3 group cursor-pointer"
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
                <p className="text-xs mt-1">Clique em "Mensagem" em qualquer publicação do feed para negociar.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
