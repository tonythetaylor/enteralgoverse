
import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";

import { asset } from "../lib/assets";
import { usePageTitle } from "../hooks/usePageTitle";
import "./SoundtrackPage.css";

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

  const audioRef = useRef<HTMLAudioElement>(null);
  const autoplayOnChange = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");

  const activeTrack = TRACKS[activeIndex];
  const hasTracks = TRACKS.length > 0;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;

    setCurrent(0);
    setDuration(0);
    setError("");

    audio.load();

    if (autoplayOnChange.current) {
      autoplayOnChange.current = false;

      void audio.play().catch(() => {
        setError("Unable to play this track.");
      });
    }
  }, [activeIndex, activeTrack?.src]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setError("");

      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch {
      setError("Unable to play this audio file.");
    }
  }

  function selectTrack(index: number) {
    if (!TRACKS[index]) return;

    if (index === activeIndex) {
      void togglePlay();
      return;
    }

    autoplayOnChange.current = true;
    setActiveIndex(index);
  }

  function nextTrack() {
    if (TRACKS.length < 2) return;

    autoplayOnChange.current = true;
    setActiveIndex((index) => (index + 1) % TRACKS.length);
  }

  function previousTrack() {
    const audio = audioRef.current;

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (TRACKS.length < 2) return;

    autoplayOnChange.current = true;
    setActiveIndex(
      (index) => (index - 1 + TRACKS.length) % TRACKS.length
    );
  }

  function handleEnded() {
    if (activeIndex < TRACKS.length - 1) {
      autoplayOnChange.current = true;
      setActiveIndex((index) => index + 1);
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
        src={activeTrack?.src}
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
        onError={() => {
          if (hasTracks) {
            setError("Track unavailable. Check the audio file.");
          }
        }}
      />

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
