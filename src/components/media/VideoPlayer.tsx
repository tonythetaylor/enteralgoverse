import { useEffect, useRef, useState } from "react";
import {
  Cast,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { Episode } from "../../types/content";
import { asset, videoSource } from "../../lib/assets";
import { useMediaReady } from "../../hooks/useMediaReady";

type CastCapableVideo = HTMLVideoElement & {
  webkitShowPlaybackTargetPicker?: () => void;
  remote?: { prompt: () => Promise<void> };
};

const GOOGLE_DRIVE_VIDEOS: Record<string, string> = {
  "pilot-the-resume.mp4": "1tWSx4SdNzkTRxVngu2yY_g0x7ddLr1oV",
  "s01e01-reconnected.mp4": "1zqlkxocBWTzQjGpkjoCPqA7tlAM-CwMT",
};

const timeFormat = (seconds: number) =>
  Number.isFinite(seconds)
    ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`
    : "0:00";

export function VideoPlayer({ episode }: { episode: Episode }) {
  const videoRef = useRef<CastCapableVideo>(null);

  const filename = episode.videoFile?.split("/").pop();

  const driveFileId = filename ? GOOGLE_DRIVE_VIDEOS[filename] : undefined;

  // Only use native video playback for non-Drive files.
  const src =
    episode.videoFile && !driveFileId ? videoSource(episode.videoFile) : null;

  const status = useMediaReady(src);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  const [castNote, setCastNote] = useState("");
  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
    setError("");
  }, [episode.id]);
  const canShowPlayer =
    episode.release === "released" &&
    (status === "ready" || status === "unknown");
  async function togglePlay() {
    const player = videoRef.current;
    if (!player) return;
    try {
      if (player.paused) await player.play();
      else player.pause();
    } catch {
      setError(
        "This video could not be played. Confirm the uploaded file is a browser-compatible MP4.",
      );
    }
  }
  async function cast() {
    const el = videoRef.current;
    if (!el) return;
    try {
      if (el.webkitShowPlaybackTargetPicker) {
        el.webkitShowPlaybackTargetPicker();
        return;
      }
      if (el.remote?.prompt) {
        await el.remote.prompt();
        return;
      }
      setCastNote(
        "Use your browser’s Cast / Share screen option. On Apple devices, open Safari and select an available AirPlay device.",
      );
    } catch {
      setCastNote(
        "No compatible remote playback device is currently available. Try your browser’s Cast menu.",
      );
    }
  }
  function fullscreen() {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) void el.requestFullscreen();
    else if ("webkitEnterFullscreen" in el)
      (
        el as HTMLVideoElement & { webkitEnterFullscreen: () => void }
      ).webkitEnterFullscreen();
  }
  if (episode.release === "coming-soon")
    return (
      <div className="video-empty">
        <span className="eyebrow">COMING SOON</span>
        <h2>This story is still being written.</h2>
        <p>Check back for the next episode.</p>
      </div>
    );


if (driveFileId) {
  const driveUrl =
    `https://drive.google.com/file/d/${driveFileId}/preview`;

  return (
    <div className="player-frame">
      <div className="drive-player">
        <iframe
          key={driveFileId}
          src={driveUrl}
          title={`Watch ${episode.title}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}

  if (status === "checking")
    return (
      <div className="video-empty">
        <span className="spinner" />
        <p>Checking episode availability…</p>
      </div>
    );
  if (!canShowPlayer)
    return (
      <div
        className="video-empty"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(11,15,28,.93),rgba(11,15,28,.79)),url(${asset(episode.image)})`,
        }}
      >
        <span className="eyebrow">READY FOR YOUR VIDEO</span>
        <h2>{episode.title}</h2>
        <p>
          The page is ready. Add <code>{episode.videoFile}</code> to{" "}
          <code>public/media/episodes/</code> and reload. The episode will
          become playable automatically.
        </p>
        <p className="muted text-xs">
          Alternatively configure VITE_MEDIA_ORIGIN to serve the file from your
          video CDN.
        </p>
      </div>
    );
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
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        onError={() =>
          setError(
            "Video unavailable or invalid. Check the media URL and MP4 encoding.",
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
            {playing ? <Pause size={19} /> : <Play size={19} />}
          </button>
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime = 0;
            }}
            className="player-tool"
            aria-label="Restart"
            title="Restart"
          >
            <RotateCcw size={17} />
          </button>
          <button
            onClick={() => {
              if (videoRef.current)
                videoRef.current.muted = !videoRef.current.muted;
            }}
            className="player-tool"
            aria-label={muted ? "Unmute" : "Mute"}
            title="Toggle mute"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
            <Cast size={18} /> <span>Cast</span>
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
