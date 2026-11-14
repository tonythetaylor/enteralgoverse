# Video drop zone

Place the following files here to activate playback automatically:

- `pilot-the-resume.mp4` — The Resume (pilot)
- `s01e01-reconnected.mp4` — Reconnected (S01E01)

The website checks for these files using lightweight HTTP `HEAD` requests. Vite's local server can report a missing file as its HTML SPA fallback; the content-type check prevents false "ready" status.

Encode in MP4 (H.264 video + AAC audio, faststart) for broad browser and AirPlay compatibility. Example:

```bash
ffmpeg -i original.mov -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart pilot-the-resume.mp4
```

**Important:** these local media files are ignored by Git by default. GitHub Pages is not a suitable video-delivery service for large episode masters. For production, upload video files to a dedicated streaming provider/CDN and set `VITE_MEDIA_ORIGIN`. See `docs/VIDEO-DELIVERY.md`.
