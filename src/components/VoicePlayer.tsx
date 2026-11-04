import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface VoicePlayerProps {
  audioUrl: string;
  duration?: number;
  isMine: boolean;
}

// Converte data URL em Blob para compatibilidade em browsers móveis (iOS/Android)
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'audio/webm';
  const bstr = atob(parts[1] || parts[0]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ audioUrl, duration = 0, isMine }) => {
  const { showToast } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState<number>(duration && isFinite(duration) ? duration : 0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Converte data URL em Blob e gera Object URL
  useEffect(() => {
    if (!audioUrl) return;

    let objectUrl = '';
    try {
      if (audioUrl.startsWith('data:')) {
        const blob = dataUrlToBlob(audioUrl);
        objectUrl = URL.createObjectURL(blob);
      } else {
        objectUrl = audioUrl;
      }
      setBlobUrl(objectUrl);
      setHasError(false);
    } catch (err) {
      console.error('Erro ao converter áudio base64:', err);
      setBlobUrl(audioUrl);
    }

    return () => {
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [audioUrl]);

  // Quando o src muda, carrega o áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !blobUrl) return;
    try {
      audio.load();
    } catch (err) {
      console.warn('Erro ao chamar audio.load():', err);
    }
    setCurrentTime(0);
    setIsPlaying(false);
  }, [blobUrl]);

  // Se a prop duration mudar, sincroniza caso totalDuration seja 0
  useEffect(() => {
    if (duration && isFinite(duration) && duration > 0) {
      setTotalDuration(duration);
    }
  }, [duration]);

  // Listeners de áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      // MediaRecorder em webm frequentemente tem duration = Infinity
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setTotalDuration(Math.round(audio.duration));
      } else if (duration > 0) {
        setTotalDuration(duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0 && (!totalDuration || totalDuration === 0)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      console.error('Audio element playback error');
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [duration, totalDuration]);

  // Não permitir dois áudios a tocar em simultâneo
  useEffect(() => {
    const handleOtherPlay = (e: any) => {
      if (e.detail?.audioEl && e.detail.audioEl !== audioRef.current && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener('vendaaqui:audio-play', handleOtherPlay);
    return () => {
      window.removeEventListener('vendaaqui:audio-play', handleOtherPlay);
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (hasError) {
      setHasError(false);
      audio.load();
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        // Notifica outros players para pausarem
        window.dispatchEvent(new CustomEvent('vendaaqui:audio-play', { detail: { audioEl: audio } }));
        audio.playbackRate = playbackSpeed;
        await audio.play();
        setIsPlaying(true);
      } catch (err: any) {
        console.error('Erro ao reproduzir áudio:', err);
        setIsPlaying(false);
        setHasError(true);
        showToast('Não foi possível reproduzir o áudio. Tente novamente.');
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cycleSpeed = () => {
    const nextSpeed: 1 | 1.5 | 2 = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;

  return (
    <div className={`flex flex-col gap-1.5 min-w-[200px] max-w-[260px] sm:min-w-[240px] select-none ${
      isMine ? 'text-white dark:text-black' : 'text-neutral-900 dark:text-neutral-100'
    }`}>
      {blobUrl && (
        <audio 
          ref={audioRef} 
          src={blobUrl} 
          preload="metadata" 
          playsInline
        />
      )}

      {/* Main playback control bar */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
            hasError 
              ? 'bg-red-500 text-white' 
              : isMine
                ? 'bg-white text-black dark:bg-black dark:text-white shadow-xs'
                : 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
          }`}
          aria-label={isPlaying ? 'Pausar mensagem de voz' : 'Reproduzir mensagem de voz'}
          title={hasError ? 'Erro no áudio. Tocar para tentar de novo.' : isPlaying ? 'Pausar' : 'Ouvir'}
        >
          {hasError ? (
            <AlertCircle className="w-4 h-4 text-white" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Progress scrub bar */}
        <div className="flex-1 flex flex-col justify-center gap-1 relative">
          <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-neutral-300 dark:bg-neutral-700/60">
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                hasError ? 'bg-red-500' : isMine ? 'bg-white dark:bg-black' : 'bg-black dark:bg-white'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={hasError}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Posição do áudio"
          />

          {/* Time & Speed row */}
          <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
            <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
            <button
              type="button"
              onClick={cycleSpeed}
              disabled={hasError}
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold tracking-wider cursor-pointer border transition-colors ${
                isMine
                  ? 'border-white/40 hover:bg-white/20 text-white dark:text-black dark:border-black/40 dark:hover:bg-black/10'
                  : 'border-neutral-400 hover:bg-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800'
              }`}
              title="Velocidade de reprodução"
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
