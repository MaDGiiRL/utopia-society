import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Music2, Disc } from "lucide-react";

// Playlist locale: modifica qui le tue tracce
const TRACKS = [
  {
    title: "Too Cool To Be Careless",
    artist: "Pawsa",
    src: "/audio/track_1.mp3",
  },
  {
    title: "Lost in Paradise",
    artist: "Chris Stussy",
    src: "/audio/track_2.mp3",
  },
  {
    title: "DOUBLE C (From F1® The Movie)",
    artist: "Pawsa",
    src: "/audio/track_3.mp3",
  },
];

export default function ClubAudioPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0); // 0–1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() =>
    Math.floor(Math.random() * TRACKS.length)
  );

  const currentTrack = TRACKS[currentTrackIndex];

  // collega l'elemento audio globale con id="club-audio"
  useEffect(() => {
    const el = document.getElementById("club-audio");
    if (!el) return;
    audioRef.current = el;

    // setta la traccia iniziale
    el.src = currentTrack.src;
    el.load();

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoaded = () => setDuration(el.duration || 0);
    const handleTimeUpdate = () => {
      if (!el.duration) return;
      setCurrentTime(el.currentTime);
      setProgress(el.currentTime / el.duration);
    };
    const handleEnded = () => {
      // quando finisce, passa automaticamente alla traccia successiva
      handleNext(true);
    };

    el.addEventListener("play", handlePlay);
    el.addEventListener("pause", handlePause);
    el.addEventListener("loadedmetadata", handleLoaded);
    el.addEventListener("timeupdate", handleTimeUpdate);
    el.addEventListener("ended", handleEnded);

    return () => {
      el.removeEventListener("play", handlePlay);
      el.removeEventListener("pause", handlePause);
      el.removeEventListener("loadedmetadata", handleLoaded);
      el.removeEventListener("timeupdate", handleTimeUpdate);
      el.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // quando cambia currentTrackIndex, aggiorna src dell'audio globale
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const wasPlaying = !el.paused;

    el.pause();
    el.src = currentTrack.src;
    el.load();

    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    if (wasPlaying) {
      el.play().catch(() => {});
    }
  }, [currentTrack]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
    } else {
      el.pause();
    }
  };

  const handleSeek = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const value = Number(e.target.value);
    const newTime = value * duration;
    el.currentTime = newTime;
    setProgress(value);
    setCurrentTime(newTime);
  };

  const formatTime = (sec) => {
    if (!sec || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleNext = (auto = false) => {
    setCurrentTrackIndex((prev) => {
      const nextIndex = (prev + 1) % TRACKS.length;
      return nextIndex;
    });
    // se arriva da auto-end, il play viene già gestito da useEffect
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => {
      const nextIndex = (prev - 1 + TRACKS.length) % TRACKS.length;
      return nextIndex;
    });
  };

  return (
    <div
      className="
        fixed bottom-3 left-3 sm:bottom-4 sm:left-4 
        z-30 pointer-events-auto
        flex justify-start
        max-w-full
      "
    >
      <div
        className={`
          relative flex items-center gap-3 rounded-2xl border border-cyan-400/40 
          bg-black/70 bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-sky-500/20
          px-3 py-2 shadow-[0_0_26px_rgba(56,189,248,0.55)] backdrop-blur-xl
          cursor-pointer transition-all duration-300
          w-auto
          ${isExpanded ? "min-w-[260px] sm:w-[360px] md:w-[460px]" : ""}
        `}
        onClick={() => setIsExpanded((v) => !v)}
      >
        {/* Icona / "cover" rotonda a sinistra (solo da aperto, su schermi >= sm) */}
        {isExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-fuchsia-500 via-cyan-400 to-blue-500 shadow-[0_0_16px_rgba(56,189,248,0.85)]"
          >
            {isPlaying ? (
              <Disc className="h-5 w-5 text-slate-950 animate-spin-slow" />
            ) : (
              <Music2 className="h-5 w-5 text-slate-950" />
            )}
          </div>
        )}

        {/* Pulsante play/pause centrale (sempre visibile) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="
            flex h-9 w-9 items-center justify-center rounded-full 
            bg-black/80 shadow-md hover:bg-black/95 transition
            border border-cyan-300/40
          "
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-cyan-200" />
          ) : (
            <Play className="h-4 w-4 text-cyan-200 translate-x-[1px]" />
          )}
        </button>

        {/* Info traccia + progress + controlli traccia */}
        {isExpanded && (
          <div
            className="flex flex-1 flex-col gap-1 min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Riga superiore: titolo, artista, tempo, controlli prev/next */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-col">
                <span className="text-[11px] uppercase tracking-[0.19em] text-cyan-100/90 line-clamp-1">
                  {currentTrack.title}
                </span>
                <span className="text-[12px] sm:text-xs text-slate-100/85">
                  {currentTrack.artist}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1">
                {/* tempo + posizione in playlist desktop */}
                <div className="hidden items-center gap-1 text-[9px] text-cyan-100/80 sm:flex">
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* controlli traccia */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-cyan-100/90 hover:bg-black/90 hover:text-cyan-200 transition border border-white/5"
                    title="Traccia precedente"
                  >
                    <SkipBack className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-cyan-100/90 hover:bg-black/90 hover:text-cyan-200 transition border border-white/5"
                    title="Traccia successiva"
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Slider progresso */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={handleSeek}
              className="
                w-full accent-cyan-300 cursor-pointer
                [&::-webkit-slider-runnable-track]:h-[3px]
                [&::-webkit-slider-runnable-track]:rounded-full
                [&::-webkit-slider-runnable-track]:bg-cyan-400/40
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white/90
                [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(56,189,248,0.8)]
              "
            />

            {/* Riga inferiore solo mobile: tempo + index */}
            <div className="flex items-center justify-between text-[10px] text-cyan-100/70 sm:hidden">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
              <span className="ml-2 rounded-full bg-black/40 px-2 py-[2px] text-[9px] uppercase tracking-[0.18em] text-cyan-100/65">
                {currentTrackIndex + 1}/{TRACKS.length}
              </span>
            </div>
          </div>
        )}

        {/* Indicatore stato anche quando collassato */}
        <div className="ml-1 flex items-center gap-1">
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-cyan-100/80 sm:block">
            {isPlaying ? "Playing" : "Paused"}
          </span>
          <span
            className={`
              block h-[9px] w-[9px] rounded-full border border-cyan-200/70 
              shadow-[0_0_8px_rgba(56,189,248,0.8)]
              ${isPlaying ? "bg-cyan-300" : "bg-transparent"}
            `}
          />
        </div>
      </div>
    </div>
  );
}
