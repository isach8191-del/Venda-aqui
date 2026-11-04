import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VoicePlayer } from './VoicePlayer';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  CheckCheck,
  Check,
  Mic,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Paperclip,
  FileText,
  Download,
  X
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Message, isUserOnline } from '../types';
import { DEFAULT_AVATAR } from '../data/seedData';
import { compressImage } from '../utils/imageCompressor';

export const MessagesTab: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    setActiveTab,
    sendMessage,
    showToast,
    user,
    allUsers 
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // seconds
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [failedAudioDraft, setFailedAudioDraft] = useState<{ base64: string; duration: number } | null>(null);
  const [selectedImagePreviewModal, setSelectedImagePreviewModal] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // Gestão do botão "Voltar" do Android e do navegador para fechar o chat
  useEffect(() => {
    if (!activeConversationId) return;

    if (!window.history.state?.chat) {
      window.history.pushState({ chat: true }, '');
    }

    const handlePopState = () => {
      setActiveConversationId(null);
      setActiveTab('messages');
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeConversationId, setActiveConversationId, setActiveTab]);

  const handleCloseChat = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setActiveConversationId(null);
    setActiveTab('messages');
    if (window.history.state?.chat) {
      window.history.back();
    }
  };

  // Escuta de mensagens em tempo real da conversa ativa no Firestore
  useEffect(() => {
    if (!activeConversationId) {
      setRealtimeMessages([]);
      return;
    }

    const messagesRef = collection(db, 'conversations', activeConversationId, 'messages');
    const unsubscribe = onSnapshot(
      messagesRef,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((d) => {
          const data = d.data();
          let formattedTime = 'Agora';
          if (data.createdAt) {
            try {
              const dateObj = new Date(data.createdAt);
              formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } catch {
              formattedTime = 'Agora';
            }
          }

          return {
            id: d.id,
            conversationId: activeConversationId,
            senderId: data.senderId,
            text: data.text || '',
            audioUrl: data.audioUrl || undefined,
            audioDuration: data.audioDuration ? Number(data.audioDuration) : undefined,
            fileUrl: data.fileUrl || undefined,
            fileName: data.fileName || undefined,
            fileSize: data.fileSize || undefined,
            fileType: data.fileType || undefined,
            timestamp: formattedTime,
            createdAt: data.createdAt || undefined,
            seenAt: data.seenAt || null,
            isMine: data.senderId === user?.id,
            offerPrice: data.offerPrice ? Number(data.offerPrice) : undefined,
          };
        });

        // Ordenar no código por data ascendente (antigas em cima, novas embaixo)
        msgs.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (tA && tB && tA !== tB) return tA - tB;
          return a.id.localeCompare(b.id);
        });

        setRealtimeMessages(msgs);
      },
      (error) => {
        console.error('Erro na leitura de mensagens em tempo real:', error);
        showToast(error?.message || 'Erro ao carregar mensagens.');
      }
    );

    return () => unsubscribe();
  }, [activeConversationId, user?.id]);

  // Rolar automaticamente para a mensagem mais recente em baixo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, realtimeMessages.length]);

  // Marcar como vistas (seenAt) as mensagens recebidas pelo utilizador atual
  useEffect(() => {
    if (!activeConversationId || !user?.id || realtimeMessages.length === 0) return;

    const unreadReceived = realtimeMessages.filter(
      (m) => m.senderId !== user.id && !m.seenAt
    );

    if (unreadReceived.length === 0) return;

    unreadReceived.forEach(async (m) => {
      try {
        await updateDoc(doc(db, 'conversations', activeConversationId, 'messages', m.id), {
          seenAt: new Date().toISOString(),
        });
      } catch (err) {
        // Silencioso se permissões ou rede
      }
    });
  }, [activeConversationId, user?.id, realtimeMessages]);

  // Limpeza de gravação e streams de mídia
  const cleanupRecording = () => {
    setIsRecording(false);
    setIsSendingAudio(false);
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

  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, [activeConversationId]);

  // Iniciar gravação de voz (máximo 2 minutos, 16kbps)
  const startRecording = async () => {
    if (user?.isBlocked) {
      showToast('A sua conta está bloqueada e não pode enviar mensagens de voz.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

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
        audioBitsPerSecond: 16000,
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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/webm' 
        });

        const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        await processAndSendAudioBlob(audioBlob, elapsedSeconds);
      };

      startTimeRef.current = Date.now();
      setRecordingTime(0);
      setIsRecording(true);
      mediaRecorder.start(250);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next >= 120) {
            stopAndSendRecording();
            return 120;
          }
          return next;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Erro ao aceder ao microfone:', err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        showToast('Permissão de microfone recusada. Permita o acesso ao microfone no navegador.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        showToast('Nenhum microfone encontrado neste dispositivo.');
      } else {
        showToast('Não foi possível iniciar a gravação de áudio.');
      }
      cleanupRecording();
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Erro ao parar gravação:', e);
      }
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      if (mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
    }
    cleanupRecording();
    showToast('Gravação de voz cancelada.');
  };

  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processAndSendAudioBlob = async (blob: Blob, durationSeconds: number) => {
    if (!activeConversationId) {
      cleanupRecording();
      return;
    }

    setIsSendingAudio(true);
    let base64Audio = '';
    try {
      base64Audio = await blobToDataURL(blob);

      const estimatedBytes = (base64Audio.length * 3) / 4;
      if (estimatedBytes > 800 * 1024) {
        showToast('Mensagem de voz demasiado grande, grava uma mais curta.');
        setFailedAudioDraft({ base64: base64Audio, duration: durationSeconds });
        return;
      }

      await sendMessage(
        activeConversationId,
        'Mensagem de voz',
        undefined,
        base64Audio,
        durationSeconds
      );
      setFailedAudioDraft(null);
    } catch (err: any) {
      console.error('Erro ao enviar áudio:', err);
      showToast(err?.message || 'Falha ao enviar mensagem de voz. Tente de novo.');
      if (base64Audio) {
        setFailedAudioDraft({ base64: base64Audio, duration: durationSeconds });
      }
    } finally {
      setIsSendingAudio(false);
      cleanupRecording();
    }
  };

  const retryFailedDraft = async () => {
    if (!failedAudioDraft || !activeConversationId) return;
    setIsSendingAudio(true);
    try {
      await sendMessage(
        activeConversationId,
        'Mensagem de voz',
        undefined,
        failedAudioDraft.base64,
        failedAudioDraft.duration
      );
      setFailedAudioDraft(null);
      showToast('Mensagem de voz enviada!');
    } catch (err: any) {
      showToast(err?.message || 'Falha ao reenviar áudio.');
    } finally {
      setIsSendingAudio(false);
    }
  };

  // Enviar anexos (fotografias ou documentos)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;

    setIsAttaching(true);
    try {
      const isImage = file.type.startsWith('image/');

      if (isImage) {
        const compressedBase64 = await compressImage(file, {
          maxDimension: 800,
          initialQuality: 0.6,
          maxSizeBytes: 400 * 1024,
        });

        await sendMessage(
          activeConversationId,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            fileUrl: compressedBase64,
            fileName: file.name,
            fileSize: `${Math.round(file.size / 1024)} KB`,
            fileType: 'image',
          }
        );
        showToast('Fotografia enviada!');
      } else {
        if (file.size > 700 * 1024) {
          showToast('Ficheiro demasiado grande. O limite máximo é de 700 KB.');
          return;
        }

        const base64Doc = await blobToDataURL(file);
        await sendMessage(
          activeConversationId,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            fileUrl: base64Doc,
            fileName: file.name,
            fileSize: `${Math.round(file.size / 1024)} KB`,
            fileType: 'file',
          }
        );
        showToast('Ficheiro enviado!');
      }
    } catch (err: any) {
      console.error('Erro ao enviar anexo:', err);
      showToast(err?.message || 'Erro ao enviar anexo.');
    } finally {
      setIsAttaching(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Enviar mensagem de texto (ao tocar no botão Enviar ou Enter)
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      await sendMessage(activeConversationId, textToSend);
    } catch (err: any) {
      setInputText(textToSend); // Restaura texto se falhou
      console.error('Erro ao enviar mensagem:', err);
      showToast(err?.message || 'Erro ao enviar mensagem.');
    }
  };

  const handleQuickQuestion = (question: string) => {
    if (!activeConversationId) return;
    sendMessage(activeConversationId, question).catch((err) => {
      showToast(err?.message || 'Erro ao enviar pergunta.');
    });
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isWarning10s = recordingTime >= 110;

  // Renderiza mensagens em tempo real se disponíveis, ou mensagens do objeto da conversa
  const displayMessages = realtimeMessages.length > 0 
    ? realtimeMessages 
    : (activeConversation?.messages || []);

  // Presença do participante ativo
  const otherUserInAllUsers = activeConversation
    ? allUsers.find((u) => u.id === activeConversation.participant.id)
    : undefined;
  const participantLastSeen = activeConversation?.participant.lastSeen || otherUserInAllUsers?.lastSeen;
  const isParticipantOnline = isUserOnline(participantLastSeen);

  return (
    <>
      {/* Lightbox modal para imagem ampliada */}
      {selectedImagePreviewModal && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImagePreviewModal(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedImagePreviewModal(null)}
              className="absolute -top-10 right-0 p-1.5 text-white hover:text-neutral-300 rounded-full bg-white/10"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImagePreviewModal}
              alt="Ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* View 1: Active Chat em Ecrã Inteiro */}
      {activeConversation ? (
        <div className="fixed inset-0 z-50 bg-white dark:bg-black flex flex-col h-full w-full animate-in fade-in duration-150">
          
          {/* Header do Chat: Seta de voltar, Foto com ponto online e Nome da pessoa */}
          <div className="relative z-20 p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-black shadow-xs shrink-0 pt-safe pointer-events-auto">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={handleCloseChat}
                className="p-3 -ml-2 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full cursor-pointer transition-colors z-30 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center pointer-events-auto"
                aria-label="Voltar para lista de conversas"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={activeConversation.participant.avatar || DEFAULT_AVATAR}
                  alt={activeConversation.participant.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                />
                {isParticipantOnline && (
                  <span 
                    className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-black rounded-full" 
                    title="Online agora"
                  />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base text-black dark:text-white truncate">
                    {activeConversation.participant.name}
                  </span>
                  {activeConversation.participant.verified && (
                    <ShieldCheck className="w-4 h-4 text-black dark:text-white shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1.5">
                  <span className={isParticipantOnline ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>
                    {isParticipantOnline ? 'Online agora' : 'Offline'}
                  </span>
                  {activeConversation.participant.username && (
                    <>
                      <span>·</span>
                      <span>@{activeConversation.participant.username.replace('@', '')}</span>
                    </>
                  )}
                  {activeConversation.participant.location && (
                    <>
                      <span>·</span>
                      <span>{activeConversation.participant.location}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Referência do anúncio se existir */}
            {activeConversation.product && (
              <div className="flex items-center gap-2 max-w-[150px] sm:max-w-[180px] bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-sm border border-neutral-200 dark:border-neutral-800 shrink-0">
                {activeConversation.product.image && (
                  <img
                    src={activeConversation.product.image}
                    alt={activeConversation.product.title}
                    className="w-8 h-8 rounded-xs object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-black dark:text-white truncate">
                    {activeConversation.product.title}
                  </p>
                  <p className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-400">
                    R$ {activeConversation.product.price.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick reply chips */}
          <div className="px-3 py-1.5 bg-neutral-100/70 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-1.5 overflow-x-auto text-[10px] no-scrollbar shrink-0">
            <span className="text-neutral-400 shrink-0">Perguntas rápidas:</span>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Ainda está disponível para venda?')}
              className="py-0.5 px-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Ainda disponível?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Faz desconto para pagamento à vista?')}
              className="py-0.5 px-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Aceita pagamento à vista?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion('Pode enviar mais fotos do produto?')}
              className="py-0.5 px-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-sm hover:border-black dark:hover:border-white whitespace-nowrap text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              Mais fotos?
            </button>
          </div>

          {/* Banner de reenvio de áudio falhado */}
          {failedAudioDraft && (
            <div className="px-3 py-2 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/60 flex items-center justify-between text-xs text-red-700 dark:text-red-300 shrink-0">
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

          {/* Ao centro: Lista de mensagens (ordem crescente: antigas em cima, novas embaixo) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/50 dark:bg-neutral-950/50">
            {displayMessages.map((msg) => {
              const isMine = msg.isMine || msg.senderId === user?.id;
              const hasAudio = Boolean(msg.audioUrl);
              const isImage = msg.fileType === 'image' || (msg.fileUrl && (msg.fileUrl.startsWith('data:image/') || msg.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)/i)));
              const isFile = msg.fileUrl && !isImage;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-lg px-3.5 py-2 text-xs leading-relaxed break-words ${
                      isMine
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'bg-white text-black dark:bg-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 shadow-2xs'
                    }`}
                  >
                    {/* Áudio */}
                    {hasAudio && (
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
                    )}

                    {/* Imagem */}
                    {isImage && msg.fileUrl && (
                      <div className="space-y-1.5">
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName || 'Fotografia'}
                          onClick={() => setSelectedImagePreviewModal(msg.fileUrl!)}
                          className="max-h-60 rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity border border-neutral-200 dark:border-neutral-800"
                        />
                        {msg.text && msg.text !== 'Fotografia' && (
                          <p className="text-[11px] pt-1 opacity-90">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Ficheiro Documento */}
                    {isFile && msg.fileUrl && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-5 h-5 shrink-0 text-black dark:text-white" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate max-w-[170px] sm:max-w-[220px] text-black dark:text-white">
                                {msg.fileName || 'Ficheiro'}
                              </p>
                              {msg.fileSize && (
                                <p className="text-[10px] text-neutral-500">{msg.fileSize}</p>
                              )}
                            </div>
                          </div>
                          <a
                            href={msg.fileUrl}
                            download={msg.fileName || 'documento'}
                            className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 text-black dark:text-white transition-colors shrink-0"
                            title="Descarregar ficheiro"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                        {msg.text && msg.text !== 'Ficheiro em anexo' && msg.text !== msg.fileName && (
                          <p className="text-[11px] pt-1 opacity-90">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Texto simples */}
                    {!hasAudio && !isImage && !isFile && msg.text}
                  </div>

                  {/* Hora e Vistos (1 cinzento enviado, 2 azuis visualizado) */}
                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-neutral-400 font-mono">
                    <span>{msg.timestamp}</span>
                    {isMine && (
                      msg.seenAt ? (
                        <span title="Visualizada" className="inline-flex items-center">
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500 stroke-[2.2]" />
                        </span>
                      ) : (
                        <span title="Enviada" className="inline-flex items-center">
                          <Check className="w-3.5 h-3.5 text-neutral-400 stroke-[2]" />
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Aviso quando faltarem 10 segundos para o limite de 2 minutos */}
          {isRecording && isWarning10s && (
            <div className="px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold flex items-center justify-between animate-pulse shrink-0">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Aviso: Faltam {120 - recordingTime}s! O áudio pára automaticamente aos 2:00.
              </span>
              <span className="font-mono">{formatTimer(recordingTime)} / 2:00</span>
            </div>
          )}

          {/* Em baixo, fixa: Anexos, Microfone, Caixa de texto e Botão Enviar */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-3 shrink-0 pb-safe">
            {isRecording ? (
              /* Barra de Gravação de Voz */
              <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 p-2 rounded-sm">
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
                  <button
                    type="button"
                    onClick={cancelRecording}
                    disabled={isSendingAudio}
                    className="px-2.5 py-1.5 rounded text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Cancelar gravação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cancelar</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopAndSendRecording}
                    disabled={isSendingAudio}
                    className="py-1.5 px-3.5 bg-black dark:bg-white text-white dark:text-black rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
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
              /* Formulário com anexo, mic, texto e botão Enviar */
              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 w-full"
              >
                {/* Botão de Anexo (Fotos e Documentos) */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSendingAudio || isAttaching}
                  className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  title="Anexar fotografia ou ficheiro (máx. 700 KB)"
                  aria-label="Anexar ficheiro"
                >
                  {isAttaching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Escreve uma mensagem..."
                  className="flex-1 min-w-0 px-3.5 py-2 text-xs rounded-sm border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />

                <button
                  type="button"
                  onClick={startRecording}
                  disabled={isSendingAudio || isAttaching}
                  className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  title="Gravar mensagem de voz (máx. 2 minutos)"
                  aria-label="Gravar mensagem de voz"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSendingAudio || isAttaching}
                  className="py-2 px-3.5 bg-black dark:bg-white text-white dark:text-black rounded-sm hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
                  aria-label="Enviar mensagem"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            )}
          </div>

        </div>
      ) : (
        /* View 2: Lista de Conversas com título MENSAGENS E NEGOCIAÇÕES e ponto verde online */
        <div className="max-w-2xl mx-auto px-4 py-5 flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="w-5 h-5 text-black dark:text-white shrink-0" />
              <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-black dark:text-white whitespace-nowrap">
                MENSAGENS E NEGOCIAÇÕES
              </h1>
            </div>
            <span className="text-xs text-neutral-500 font-mono shrink-0">
              {conversations.length} {conversations.length === 1 ? 'conversa' : 'conversas'}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto flex-1">
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const otherUser = allUsers.find((u) => u.id === conv.participant.id);
                const convParticipantOnline = isUserOnline(conv.participant.lastSeen || otherUser?.lastSeen);

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className="w-full text-left p-3.5 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors rounded-xl flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.participant.avatar || DEFAULT_AVATAR}
                        alt={conv.participant.name}
                        className="w-12 h-12 rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                      />
                      {convParticipantOnline && (
                        <span 
                          className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-black rounded-full" 
                          title="Online agora"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-sm text-black dark:text-white truncate">
                            {conv.participant.name}
                          </span>
                          {convParticipantOnline && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                              · Online
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono shrink-0 ml-2">
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
                );
              })
            ) : (
              <div className="text-center py-16 text-neutral-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-bold text-black dark:text-white">Nenhuma conversa ativa</p>
                <p className="text-xs mt-1">Toque em "Mensagem" em qualquer anúncio, perfil ou loja para iniciar uma conversa.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
