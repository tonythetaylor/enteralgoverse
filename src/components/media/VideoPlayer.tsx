
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Cast,
  Maximize,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

import type { Episode } from "../../types/content";
import { asset, videoSource } from "../../lib/assets";
import { useMediaReady } from "../../hooks/useMediaReady";
import "./VideoPlayer.mobile.css";

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

type CastCapableVideo = HTMLVideoElement & {
  webkitShowPlaybackTargetPicker?: () => void;
  webkitEnterFullscreen?: () => void;
  remote?: { prompt: () => Promise<void> };
};

const GOOGLE_DRIVE_VIDEOS: Record<string, string> = {
  "pilot-the-resume.mp4":
    "1tWSx4SdNzkTRxVngu2yY_g0x7ddLr1oV",
  "s01e01-reconnected.mp4":
    "1zqlkxocBWTzQjGpkjoCPqA7tlAM-CwMT",
};

const timeFormat = (seconds: number) =>
  Number.isFinite(seconds)
    ? `${Math.floor(seconds / 60)}:${String(
        Math.floor(seconds % 60)
      ).padStart(2, "0")}`
    : "0:00";

export function VideoPlayer({
  episode,
}: {
  episode: Episode;
}) {
  const videoRef = useRef<CastCapableVideo>(null);
  const drivePlayerRef = useRef<HTMLDivElement>(null);
  const orientationLockedRef = useRef(false);
  const fullscreenWasActiveRef = useRef(false);

  const filename = episode.videoFile?.split("/").pop();

  const driveFileId = filename
    ? GOOGLE_DRIVE_VIDEOS[filename]
    : undefined;

  const src =
    episode.videoFile && !driveFileId
      ? videoSource(episode.videoFile)
      : null;

  const status = useMediaReady(src);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [castNote, setCastNote] = useState("");

  // Google Drive mobile cinema: the site controls the presentation,
  // not playback inside Google's cross-origin iframe.
  const [driveStarted, setDriveStarted] = useState(false);
  const [driveEpoch, setDriveEpoch] = useState(0);
  const [cinemaFullscreen, setCinemaFullscreen] = useState(false);
  const [cinemaFallback, setCinemaFallback] = useState(false);
  const [cinemaNote, setCinemaNote] = useState("");

  const resetCinema = useCallback(() => {
    if (orientationLockedRef.current) {
      try {
        screen.orientation.unlock();
      } catch {
        // The orientation API is not available on every browser.
      }
      orientationLockedRef.current = false;
    }

    fullscreenWasActiveRef.current = false;
    setCinemaFullscreen(false);
    setCinemaFallback(false);
    setCinemaNote("");
    setDriveStarted(false);

    // Remount the iframe so a Drive video cannot keep playing
    // invisibly after the visitor exits cinema mode.
    setDriveEpoch((value) => value + 1);
  }, []);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setError("");
    setCastNote("");
    resetCinema();
  }, [episode.id, resetCinema]);

  useEffect(() => {
    function handleFullscreenChange() {
      const isOurFullscreen =
        document.fullscreenElement === drivePlayerRef.current;

      if (isOurFullscreen) {
        fullscreenWasActiveRef.current = true;
        setCinemaFullscreen(true);
      } else if (fullscreenWasActiveRef.current) {
        // Handles Esc and browser/UI-driven fullscreen exits.
        resetCinema();
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [resetCinema]);

  useEffect(() => {
    if (!cinemaFallback) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") resetCinema();
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [cinemaFallback, resetCinema]);

  const canShowPlayer =
    episode.release === "released" &&
    (status === "ready" || status === "unknown");

  async function enterCinemaMode() {
    const container = drivePlayerRef.current;
    if (!container) return;

    // Called directly from our mobile Play button; fullscreen
    // must be requested during the user's gesture.
    setDriveStarted(true);
    setCinemaNote("");

    if (container.requestFullscreen) {
      try {
        await container.requestFullscreen();

        const orientation = screen.orientation as
          | LockableScreenOrientation
          | undefined;

        if (typeof orientation?.lock === "function") {
          try {
            await orientation.lock("landscape");
            orientationLockedRef.current = true;
          } catch {
            setCinemaNote("Rotate your phone to watch in landscape.");
          }
        } else {
          setCinemaNote("Rotate your phone to watch in landscape.");
        }
        return;
      } catch {
        // iOS Safari, some in-app browsers, and blocked fullscreen
        // requests use the fullscreen-style fallback below.
      }
    }

    setCinemaFallback(true);
    setCinemaNote("Rotate your phone to watch in landscape.");
  }

  async function exitCinemaMode() {
    if (document.fullscreenElement === drivePlayerRef.current) {
      try {
        await document.exitFullscreen();
        // fullscreenchange calls resetCinema().
        return;
      } catch {
        // Still reset the interface if the browser denies exit.
      }
    }
    resetCinema();
  }

  async function togglePlay() {
    const player = videoRef.current;
    if (!player) return;

    try {
      if (player.paused) {
        await player.play();
      } else {
        player.pause();
      }
    } catch {
      setError(
        "This video could not be played. Confirm the uploaded file is a browser-compatible MP4."
      );
    }
  }

  async function cast() {
    const player = videoRef.current;
    if (!player) return;

    try {
      if (player.webkitShowPlaybackTargetPicker) {
        player.webkitShowPlaybackTargetPicker();
        return;
      }

      if (player.remote?.prompt) {
        await player.remote.prompt();
        return;
      }

      setCastNote(
        "Use your browser's Cast option, or Safari's AirPlay controls."
      );
    } catch {
      setCastNote(
        "No compatible playback device is currently available."
      );
    }
  }

  function fullscreen() {
    const player = videoRef.current;
    if (!player) return;

    if (player.requestFullscreen) {
      void player.requestFullscreen();
    } else if (player.webkitEnterFullscreen) {
      player.webkitEnterFullscreen();
    }
  }

  // Coming soon
  if (episode.release === "coming-soon") {
    return (
      <div className="video-empty">
        <span className="eyebrow">COMING SOON</span>
        <h2>This story is still being written.</h2>
        <p>Check back for the next episode.</p>
      </div>
    );
  }

  // Google Drive streaming. On mobile the poster is the playback entry
  // point: one tap opens cinema mode, then the viewer uses Drive's Play.
  if (driveFileId && episode.release === "released") {
    const driveUrl =
      `https://drive.google.com/file/d/${driveFileId}/preview`;
    const cinemaActive = cinemaFullscreen || cinemaFallback;

    const drivePlayer = (
      <div
        ref={drivePlayerRef}
        className={[
          "drive-player",
          driveStarted ? "is-started" : "",
          cinemaFallback ? "drive-player--fallback" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <iframe
          key={`${driveFileId}-${driveEpoch}`}
          src={driveUrl}
          title={`Watch ${episode.title}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
        />

        {!driveStarted && (
          <button
            type="button"
            className="drive-mobile-start"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(7,9,22,.12), rgba(7,9,22,.82)), url("${asset(episode.image)}")`,
            }}
            onClick={() => void enterCinemaMode()}
            aria-label={`Watch ${episode.title} in fullscreen`}
          >
            <span className="drive-mobile-play-icon" aria-hidden="true">
              <Play size={30} fill="currentColor" />
            </span>
            <span className="drive-mobile-play-label">WATCH EPISODE</span>
          </button>
        )}

        {cinemaActive && (
          <button
            type="button"
            className="drive-cinema-exit"
            onClick={() => void exitCinemaMode()}
            aria-label="Exit cinema mode"
          >
            <Minimize2 size={17} />
            <span>Exit</span>
          </button>
        )}

        {cinemaNote && cinemaActive && (
          <div className="drive-cinema-note" role="status">
            {cinemaNote}
          </div>
        )}
      </div>
    );

    return (
      <div className="player-frame">
        {/* A body-level portal prevents the iOS fallback from being
            clipped by the episode card or covered by bottom navigation. */}
        {cinemaFallback
          ? createPortal(drivePlayer, document.body)
          : drivePlayer}
      </div>
    );
  }

  // Native MP4 / CDN playback
  if (status === "checking") {
    return (
      <div className="video-empty">
        <span className="spinner" />
        <p>Checking episode availability…</p>
      </div>
    );
  }

  if (!canShowPlayer) {
    return (
      <div
        className="video-empty"
        style={{
          backgroundImage: `linear-gradient(
            90deg,
            rgba(11,15,28,.93),
            rgba(11,15,28,.79)
          ),url(${asset(episode.image)})`,
        }}
      >
        <span className="eyebrow">
          READY FOR YOUR VIDEO
        </span>

        <h2>{episode.title}</h2>

        <p>
          Add <code>{episode.videoFile}</code> to{" "}
          <code>public/media/episodes/</code> and reload.
        </p>

        <p className="muted text-xs">
          Alternatively configure VITE_MEDIA_ORIGIN
          to serve the file from your video CDN.
        </p>
      </div>
    );
  }

  return (
    <div className="player-frame">
      <video
        ref={videoRef}
        src={src ?? undefined}
        poster={asset(episode.image)}
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
        x-webkit-airplay="allow"
        aria-label={`Video player: ${episode.title}`}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) =>
          setCurrent(event.currentTarget.currentTime)
        }
        onDurationChange={(event) =>
          setDuration(event.currentTarget.duration)
        }
        onVolumeChange={(event) =>
          setMuted(event.currentTarget.muted)
        }
        onError={() =>
          setError(
            "Video unavailable or invalid. Check the media URL and MP4 encoding."
          )
        }
      >
        {episode.captionsFile && (
          <track
            kind="captions"
            src={videoSource(episode.captionsFile)}
            srcLang="en"
            label="English"
            default
          />
        )}

        Your browser does not support HTML5 video.
      </video>

      <div className="player-toolbar">
        <div className="player-toolbar-left">
          <button
            onClick={() => void togglePlay()}
            aria-label={playing ? "Pause" : "Play"}
            title={playing ? "Pause" : "Play"}
            className="player-tool"
          >
            {playing ? (
              <Pause size={19} />
            ) : (
              <Play size={19} />
            )}
          </button>

          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
              }
            }}
            className="player-tool"
            aria-label="Restart"
            title="Restart"
          >
            <RotateCcw size={17} />
          </button>

          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.muted =
                  !videoRef.current.muted;
              }
            }}
            className="player-tool"
            aria-label={muted ? "Unmute" : "Mute"}
            title="Toggle mute"
          >
            {muted ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <span className="player-time">
            {timeFormat(current)} / {timeFormat(duration)}
          </span>
        </div>

        <div className="player-toolbar-right">
          <button
            className="player-tool player-cast"
            title="AirPlay or Cast"
            onClick={() => void cast()}
            aria-label="Connect to TV"
          >
            <Cast size={18} />
            <span>Cast</span>
          </button>

          <button
            className="player-tool"
            title="Fullscreen"
            onClick={fullscreen}
            aria-label="Fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      {(error || castNote) && (
        <p className="player-alert" role="status">
          {error || castNote}{" "}
          <button
            onClick={() => {
              setError("");
              setCastNote("");
            }}
          >
            Dismiss
          </button>
        </p>
      )}
    </div>
  );
}
