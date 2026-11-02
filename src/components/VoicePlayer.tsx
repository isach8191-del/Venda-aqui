import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoicePlayerProps {
  audioUrl: string;
  duration?: number;
  isMine: boolean;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ audioUrl, duration = 0, isMine }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackSpeed;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Audio playback error:', err);
      });
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
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Main playback control bar */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
            isMine
              ? 'bg-white text-black dark:bg-black dark:text-white shadow-xs'
              : 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
          }`}
          aria-label={isPlaying ? 'Pausar mensagem de voz' : 'Reproduzir mensagem de voz'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Progress scrub bar */}
        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-neutral-300 dark:bg-neutral-700/60">
            <div
              className={`h-full transition-all duration-75 rounded-full ${
                isMine ? 'bg-white dark:bg-black' : 'bg-black dark:bg-white'
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
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Posição do áudio"
          />

          {/* Time & Speed row */}
          <div className="flex items-center justify-between text-[10px] font-mono opacity-80">
            <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
            <button
              type="button"
              onClick={cycleSpeed}
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
