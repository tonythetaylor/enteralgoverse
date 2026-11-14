# Video delivery and content protection

## Initial implementation

- `src/data/episodes.ts` is the content source of truth.
- The pilot references `pilot-the-resume.mp4`.
- Episode 1 references `s01e01-reconnected.mp4`.
- Player automatically detects whether media is present. No code changes required when files are added locally.
- Native HTML5 playback supports scrubbing, volume, subtitles (when configured), fullscreen, and browser-supported AirPlay/casting.
- The "Cast" control invokes Safari's AirPlay picker or the Remote Playback API when the browser supports it. **Google Cast support depends on browser/device** and is not guaranteed by a custom player. A dedicated Cast SDK/receiver integration can be added later.
- `controlsList="nodownload"` removes native download controls in browsers implementing that optional behavior. It is not copy protection.

## Why `nodownload` is not DRM

Any video playable without DRM in an ordinary browser can typically be retrieved from network traffic or its source URL. Obfuscating URLs, disabling right-click, adding CSS overlays, or blocking shortcut keys does not change this. Even DRM cannot prevent all screen recording.

For actual licensed/paid video protection, move to a streaming service that supports authenticated signed playback, encrypted HLS/DASH and (when justified) Widevine/FairPlay/PlayReady DRM. That requires server-side authorization, platform integrations, and often a commercial license. This starter deliberately does **not** pretend DRM is active.

## Delivery options

**Local development:** Copy MP4 files to `public/media/episodes/`. Local Vite serves them immediately. They are excluded from Git history to avoid accidentally publishing huge files.

**Production without a backend:** Serve public MP4 files from a media CDN such as an object-storage origin behind a CDN, and define `VITE_MEDIA_ORIGIN` at build time, e.g. `https://media.example.com`. Place the files directly under that prefix. Configure CORS appropriately when domains differ, `Content-Type: video/mp4`, and byte-range request support (HTTP 206) for seeking. **Public CDN files remain downloadable.**

**Future secure distribution:** Abstract the `videoSource()` function to request short-lived playback manifests/tokens from an authenticated backend, use HLS/DASH with adaptive bitrate and signed segments, and integrate DRM if needed. Consider watermarking for additional deterrence.

## Hardware casting

- Safari on Apple devices can display the AirPlay picker where supported.
- Chrome/Android supports browser or tab casting, and some versions expose a Remote Playback API; dedicated Chromecast receiver behavior requires additional Google Cast setup.
- AirPlay and Cast are not the same as IP multicast streaming. The implementation is consumer device casting.
- Testing is necessary on actual TVs, network setups, and browsers.

## Adding future episodes

1. Add a row in `src/data/episodes.ts` (or edit a "Coming Soon" placeholder).
2. Set `release: 'released'`, `videoFile: 'your-file.mp4'` and an image path.
3. Upload the media file to the configured media origin.
4. Add optional `.vtt` captions and set `captionsFile`.
5. Deploy.

## Quality and captions

For a public website, include captions and a transcript when available. MP4 H.264/AAC is the widest baseline; consider HLS/CDN adaptive renditions as viewership grows. Never add personal credentials or signing secrets to Vite `VITE_` environment variables: Vite includes those in frontend builds.
