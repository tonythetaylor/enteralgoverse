
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Disc3,
  Headphones,
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  AudioLines,
  ChevronDown,
  ListMusic,
} from "lucide-react";

import { asset } from "../lib/assets";
import { usePageTitle } from "../hooks/usePageTitle";
import LivingOrb from "../components/LivingOrb";
import "./SoundtrackPage.css";
import "./SoundtrackOrb.css";

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  episode?: string;
  artwork?: string;
};

const COVER = "assets/brand/the-algorithm-poster.webp";

// Add tracks here after uploading the corresponding MP3s.
const TRACKS: Track[] = [
  {
    id: "track-01",
    title: "The Algorithm",
    artist: "ZO",
    episode: "Original Pilot — The Resume",
    src: "/media/soundtracks/the-algorithm.mp3",
  },
  {
    id: "track-02",
    title: "Reconnected",
    artist: "ZO",
    episode: "S01E01 — Reconnected",
    src: "/media/soundtracks/reconnected.mp3",
  },
  {
    id: "track-03",
    title: "Off Script",
    artist: "ZO",
    episode: "Original Soundtrack",
    src: "/media/soundtracks/off-script.mp3",
  },
];



function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export default function SoundtrackPage() {
  usePageTitle(
    "Soundtrack",
    "The original music and sound behind The Algorithm."
  );

  // One HTMLAudioElement drives both the desktop and mobile interfaces.
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  // Mobile gets a dedicated media library on first entry, not a hidden tracklist.
  const [mobileExpanded, setMobileExpanded] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 600px)").matches
  );
  const [mobileView, setMobileView] = useState<"library" | "player">("library");
  const [reduceMotion, setReduceMotion] = useState(false);

  const activeTrack = TRACKS[activeIndex];
  const hasTracks = TRACKS.length > 0;

  // Set the initial audio source once. Subsequent changes happen directly
  // inside the user's click handler to preserve mobile playback gestures.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && TRACKS[0]) {
      audio.src = TRACKS[0].src;
      audio.load();
    }

    return () => {
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
        analyserRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!mobileExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.querySelector<HTMLButtonElement>(".av-modal-close")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileExpanded(false);
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), a[href]'
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [mobileExpanded]);

  function openMobilePlayer(view: "library" | "player" = "player") {
    if (!window.matchMedia("(max-width: 600px)").matches) return;
    setMobileView(view);
    if (!mobileExpanded) {
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setMobileExpanded(true);
    }
  }

  // Prevent a resized desktop from remaining scroll-locked by a hidden mobile modal.
  useEffect(() => {
    const media = window.matchMedia("(max-width: 600px)");
    const onChange = () => {
      if (!media.matches) setMobileExpanded(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Connect the existing audio element only once. This is deliberately called
  // during a click, rather than an effect, for mobile AudioContext policies.
  function prepareAudioAnalysis(): AudioContext | null {
    const audio = audioRef.current;
    if (!audio) return null;

    if (!audioContextRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.82;
      source.connect(analyser);
      analyser.connect(context.destination);
      audioContextRef.current = context;
      analyserRef.current = analyser;
    }
    return audioContextRef.current;
  }

  async function startPlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setError("");
      const context = prepareAudioAnalysis();
      // Invoke both during the same user gesture; do not await before play().
      const resume = context?.resume();
      const play = audio.play();
      await Promise.all([resume, play]);
    } catch {
      setError("Unable to play this track. Check the MP3 path and browser permissions.");
    }
  }

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
    } else {
      await startPlayback();
    }
  }

  // Changes audio.src synchronously so a tap on iOS can start the new track.
  function playTrack(index: number) {
    const audio = audioRef.current;
    const track = TRACKS[index];
    if (!audio || !track) return;

    if (index === activeIndex) {
      void togglePlay();
      return;
    }

    audio.pause();
    audio.src = track.src;
    audio.load();
    setActiveIndex(index);
    setCurrent(0);
    setDuration(0);
    void startPlayback();
  }

  function selectTrack(index: number) {
    if (!TRACKS[index]) return;
    openMobilePlayer("player");
    // Selecting the already-playing song opens its player without pausing it.
    if (index !== activeIndex || !playing) playTrack(index);
  }

  function nextTrack() {
    if (TRACKS.length < 2) return;
    playTrack((activeIndex + 1) % TRACKS.length);
  }

  function previousTrack() {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (TRACKS.length < 2) return;
    playTrack((activeIndex - 1 + TRACKS.length) % TRACKS.length);
  }

  function handleEnded() {
    if (activeIndex < TRACKS.length - 1) {
      playTrack(activeIndex + 1);
    } else {
      setPlaying(false);
    }
  }

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio || duration <= 0) return;
    audio.currentTime = value;
    setCurrent(value);
  }

  function changeVolume(value: number) {
    const audio = audioRef.current;
    setVolume(value);
    if (audio) {
      audio.volume = value;
      audio.muted = value === 0;
    }
    setMuted(value === 0);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
  }

  return (
    <main
      className={`site-container internal-page st-page ${
        hasTracks ? "st-has-player" : ""
      }`}
    >
      {/* HERO */}
      <section className="st-hero">
        <div className="st-hero-copy">
          <span className="st-eyebrow">
            <AudioLines size={16} />
            TAYLORTHEORY ORIGINALS
          </span>

          <div className="st-hero-heading">
            <span className="st-overline">
              THE MUSIC OF THE ALGORITHM
            </span>

            <h1>
              Every world
              <br />
              has <em>a sound.</em>
            </h1>
          </div>

          <p className="st-description">
            From late nights in Baltimore to the digital streets
            of the Algoverse, the music is part of the story.
            Discover the original songs and sounds that bring
            ZO and ALGO's worlds to life.
          </p>

          <div className="st-metadata">
            <span>
              <Music2 size={15} />
              Original Soundtrack
            </span>

            <span>
              <Disc3 size={15} />
              Music by ZO
            </span>

            {hasTracks && (
              <span>{TRACKS.length} Tracks</span>
            )}
          </div>

          {hasTracks ? (
            <button
              className="st-primary-button"
              onClick={() => selectTrack(0)}
              type="button"
            >
              <Play size={19} fill="currentColor" />
              Play Soundtrack
            </button>
          ) : (
            <div className="st-release-note">
              <span className="st-status-dot" />
              Soundtrack releases coming soon
            </div>
          )}
        </div>

        <div className="st-hero-art">
          <div className="st-art-glow" />

          <div className="st-cover">
            <img
              src={asset(COVER)}
              alt="The Algorithm official artwork"
            />

            <div className="st-cover-overlay">
              <span>ORIGINAL SOUNDTRACK</span>
              <strong>THE ALGORITHM</strong>
              <small>ZO × ALGO</small>
            </div>
          </div>

          <div className="st-art-caption">
            <Disc3 size={15} />
            A TaylorTheory Multimedia & Design Production
          </div>
        </div>
      </section>

      {/* MUSIC LIBRARY */}
      <section className="st-library">
        <div className="st-library-main">
          <div className="st-section-header">
            <div>
              <span className="st-overline">LISTEN</span>
              <h2>Original Soundtrack</h2>
              <p>
                Music from the series, released one track at a time.
              </p>
            </div>

            <span className="st-track-count">
              {hasTracks
                ? `${TRACKS.length} TRACKS`
                : "COMING SOON"}
            </span>
          </div>

          {hasTracks ? (
            <div className="st-track-list">
              {TRACKS.map((track, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => selectTrack(index)}
                    className={`st-track ${
                      isActive ? "st-track-active" : ""
                    }`}
                    aria-label={`${
                      isActive && playing ? "Pause" : "Play"
                    } ${track.title}`}
                  >
                    <span className="st-track-number">
                      {isActive && playing ? (
                        <AudioLines size={17} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>

                    <img
                      className="st-track-image"
                      src={asset(track.artwork || COVER)}
                      alt=""
                    />

                    <span className="st-track-info">
                      <strong>{track.title}</strong>
                      <small>{track.artist}</small>
                    </span>

                    <span className="st-track-episode">
                      {track.episode || "Original Soundtrack"}
                    </span>

                    <span className="st-track-action">
                      {isActive && playing ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="st-empty">
              <div className="st-empty-icon">
                <Headphones size={34} strokeWidth={1.5} />
              </div>

              <span className="st-overline">
                THE SOUNDTRACK IS COMING
              </span>

              <h3>The score is still unfolding.</h3>

              <p>
                Original songs, music from upcoming episodes,
                and more sounds from the Algoverse will appear
                here as they're released.
              </p>

              <div className="st-empty-divider" />

              <span className="st-empty-footer">
                Original music by ZO
              </span>
            </div>
          )}
        </div>

        {/* ABOUT THE MUSIC */}
        <aside className="st-sidebar">
          <div className="st-sidebar-card">
            <span className="st-overline">BEHIND THE SOUND</span>

            <h2>More than background music.</h2>

            <p>
              Every track helps tell a story. From moments of
              reflection to the energy of Baltimore nightlife,
              the soundtrack connects the human world with
              the Algoverse.
            </p>

            <div className="st-sidebar-rule" />

            <div className="st-sidebar-credit">
              <Music2 size={19} />
              <div>
                <strong>Original Music</strong>
                <span>ZO</span>
              </div>
            </div>

            <div className="st-sidebar-credit">
              <Disc3 size={19} />
              <div>
                <strong>Production</strong>
                <span>
                  TaylorTheory Multimedia & Design
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* NATIVE AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) =>
          setCurrent(event.currentTarget.currentTime)
        }
        onDurationChange={(event) =>
          setDuration(event.currentTarget.duration)
        }
        onEnded={handleEnded}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setMuted(event.currentTarget.muted);
        }}
        onError={() => {
          if (hasTracks) {
            setError("Track unavailable. Check the audio file.");
          }
        }}
      />

      {/* Mobile mini-player replaces the desktop toolbar below 600px. */}
      {hasTracks && activeTrack && !mobileExpanded && createPortal(
        <div className="av-mini-player" aria-label="Mini music player">
          <button
            className="av-mini-open"
            type="button"
            onClick={() => openMobilePlayer("player")}
            aria-label={`Open full player for ${activeTrack.title}`}
          >
            <span className="av-mini-art">
              <img src={asset(activeTrack.artwork || COVER)} alt="" />
            </span>
            <span className="av-mini-copy">
              <strong>{activeTrack.title}</strong>
              <small>{activeTrack.artist} · ALGOVERSE VIBES</small>
            </span>
          </button>
          <button
            className="av-mini-toggle"
            type="button"
            onClick={() => void togglePlay()}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <div
            className="av-mini-progress"
            style={{ width: `${duration > 0 ? (current / duration) * 100 : 0}%` }}
          />
        </div>,
        document.body
      )}

      {/* Dedicated mobile music experience: visible library + immersive now-playing.
          One audio element remains mounted outside this portal. */}
      {mobileExpanded && hasTracks && activeTrack && createPortal(
        <div
          className="av-mobile-player"
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="ALGOVERSE Vibes music player"
        >
          <div className="av-mobile-backdrop" aria-hidden="true" />
          <header className="av-mobile-header">
            <div className="av-mobile-brand">
              <span>ALGOVERSE</span>
              <strong>VIBES.</strong>
            </div>
            <button
              type="button"
              className="av-modal-close"
              onClick={() => setMobileExpanded(false)}
              aria-label="Minimize the music player"
            >
              <ChevronDown size={24} />
            </button>
          </header>

          <nav className="av-mobile-tabs" aria-label="Music views">
            <button
              type="button"
              className={mobileView === "library" ? "is-active" : ""}
              aria-current={mobileView === "library" ? "page" : undefined}
              onClick={() => setMobileView("library")}
            >
              <ListMusic size={17} /> Library <span>{TRACKS.length.toString().padStart(2, "0")}</span>
            </button>
            <button
              type="button"
              className={mobileView === "player" ? "is-active" : ""}
              aria-current={mobileView === "player" ? "page" : undefined}
              onClick={() => setMobileView("player")}
            >
              <Disc3 size={17} /> Now playing
            </button>
          </nav>

          {mobileView === "library" ? (
            <section className="av-mobile-library" aria-label="Soundtrack tracks">
              <div className="av-library-intro">
                <span>THE ALGORITHM · ORIGINAL SOUNDTRACK</span>
                <h2>Find your<br /><em>frequency.</em></h2>
                <p>Three original tracks. One universe. Tap a song to bring its world to life.</p>
              </div>
              <div className="av-library-list">
                {TRACKS.map((track, index) => {
                  const selected = activeIndex === index;
                  return (
                    <button
                      type="button"
                      className={`av-library-track ${selected ? "is-selected" : ""}`}
                      key={track.id}
                      onClick={() => selectTrack(index)}
                      aria-label={`Play ${track.title} by ${track.artist}`}
                    >
                      <span className="av-library-number">{String(index + 1).padStart(2, "0")}</span>
                      <img src={asset(track.artwork || COVER)} alt="" />
                      <span className="av-library-track-copy">
                        <strong>{track.title}</strong>
                        <small>{track.episode || "Original soundtrack"}</small>
                      </span>
                      <span className="av-library-action" aria-hidden="true">
                        {selected && playing ? <AudioLines size={19} /> : <Play size={19} fill="currentColor" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="av-library-current"
                onClick={() => setMobileView("player")}
                aria-label={`Open now playing: ${activeTrack.title}`}
              >
                <span className="av-library-current-icon"><Disc3 size={20} /></span>
                <span className="av-library-current-title"><small>NOW IN ROTATION</small><strong>{activeTrack.title}</strong></span>
                <span className="av-library-current-open">View player <span aria-hidden="true">↗</span></span>
              </button>
            </section>
          ) : (
            <section className="av-mobile-body" aria-label="Now playing">
              <div className="av-world-stage">
                <LivingOrb
                  analyserRef={analyserRef}
                  playing={playing}
                  mood={activeIndex}
                  reduceMotion={reduceMotion}
                  onToggle={() => void togglePlay()}
                />
              </div>
              <div className="av-now-playing">
                <span>NOW IN ROTATION · {String(activeIndex + 1).padStart(2, "0")}</span>
                <h2>{activeTrack.title}</h2>
                <p>{activeTrack.artist}</p>
                {activeTrack.episode && <small>{activeTrack.episode}</small>}
              </div>
              <div className="av-progress">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={Math.min(current, duration || 0)}
                  onChange={(event) => seek(Number(event.target.value))}
                  disabled={duration <= 0}
                  aria-label="Seek within track"
                  style={{
                    background: `linear-gradient(to right, #e9d7f0 ${duration > 0 ? (current / duration) * 100 : 0}%, rgba(255,255,255,.18) 0)`,
                  }}
                />
                <div><span>{formatTime(current)}</span><span>{formatTime(duration)}</span></div>
              </div>
              <nav className="av-track-navigation" aria-label="Track controls">
                <button type="button" onClick={previousTrack} aria-label="Previous track or restart">
                  <SkipBack size={25} fill="currentColor" />
                </button>
                <span className="av-track-count">{activeIndex + 1} <span>/</span> {TRACKS.length}</span>
                <button type="button" onClick={nextTrack} aria-label="Next track">
                  <SkipForward size={25} fill="currentColor" />
                </button>
              </nav>
              <div className="av-mobile-footer">
                <span><AudioLines size={15} /> THE ALGORITHM · ORIGINAL SOUNDTRACK</span>
                <button
                  type="button"
                  onClick={() => setMobileView("library")}
                  aria-label="Show all three tracks"
                >
                  <ListMusic size={18} /> All {TRACKS.length} tracks
                </button>
              </div>
            </section>
          )}
          {error && <p className="av-mobile-error" role="status">{error}</p>}
        </div>,
        document.body
      )}

      {/* PERSISTENT PLAYER */}
      {hasTracks && activeTrack && (
        <div className="st-player-shell">
          <div className="st-player">
            <div className="st-player-track">
              <img
                src={asset(activeTrack.artwork || COVER)}
                alt=""
              />

              <div>
                <strong>{activeTrack.title}</strong>
                <span>{activeTrack.artist}</span>
              </div>
            </div>

            <div className="st-player-controls">
              <button
                type="button"
                onClick={previousTrack}
                aria-label="Previous track"
                disabled={TRACKS.length < 2 && current <= 3}
              >
                <SkipBack size={20} fill="currentColor" />
              </button>

              <button
                type="button"
                className="st-play-button"
                onClick={() => void togglePlay()}
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? (
                  <Pause size={22} fill="currentColor" />
                ) : (
                  <Play size={22} fill="currentColor" />
                )}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                aria-label="Next track"
                disabled={TRACKS.length < 2}
              >
                <SkipForward size={20} fill="currentColor" />
              </button>
            </div>

            <div className="st-player-progress">
              <span>{formatTime(current)}</span>

              <input
                aria-label="Seek within track"
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={Math.min(current, duration || 0)}
                onChange={(event) =>
                  seek(Number(event.target.value))
                }
                disabled={duration <= 0}
                style={{
                  background: `linear-gradient(to right,
                    #ff945d ${
                      duration > 0
                        ? (current / duration) * 100
                        : 0
                    }%,
                    rgba(255,255,255,.16) 0)`,
                }}
              />

              <span>{formatTime(duration)}</span>
            </div>

            <div className="st-player-volume">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? (
                  <VolumeX size={19} />
                ) : (
                  <Volume2 size={19} />
                )}
              </button>

              <input
                type="range"
                aria-label="Volume"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(event) =>
                  changeVolume(Number(event.target.value))
                }
              />
            </div>
          </div>

          {error && (
            <div className="st-player-error" role="status">
              {error}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
