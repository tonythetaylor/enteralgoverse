# ENTER ALGOVERSE

**The official website for ZO × ALGO: The Algorithm.**

Original painterly character and world artwork supplied by the creator. A mobile-first, responsive, modular React + TypeScript + Vite + Tailwind CSS 4 static application. No backend required.

## Quick start

Prerequisites: Node.js >=20.19, npm.

```bash
npm install
npm run dev
```

Visit the Vite URL printed in your terminal. The site includes working navigation, local search, character detail sheets, world exploration, episode detail pages, media controls, and responsive layouts.

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

**Package versions:** The project uses supported compatible major ranges, not unpublished prerelease dependencies. Tailwind uses its official Vite v4 plugin and `@import "tailwindcss"`. The dependency install requires access to the npm registry.

## Activate your two videos

Copy your actual MP4 exports to the following locations:

```text
public/media/episodes/pilot-the-resume.mp4
public/media/episodes/s01e01-reconnected.mp4
```

That's it. The site checks for the files and switches the watch pages from "Ready for your video" to the playable HTML5 video player. They are **not included** because the episode files were not provided in this chat. To preserve site performance, the website does not pre-download entire movies.

If you want to serve videos from a CDN rather than the static website, create `.env.local`:

```dotenv
VITE_MEDIA_ORIGIN=https://your-media-cdn.example
```

The filenames remain the same. The app will request `https://your-media-cdn.example/pilot-the-resume.mp4`, etc. CORS and byte-range support must be configured on the CDN. For longer-term content protection, read [Video Delivery](docs/VIDEO-DELIVERY.md).

**Do not commit full episodes to GitHub or rely on GitHub Pages as a video-hosting platform.** The `.gitignore` deliberately keeps episode files outside version control. This also avoids bloating repository clones.

## Pages and features

| URL (after `#`) | Function |
| --- | --- |
| `/` | Mobile-first landing page, watch CTAs, cast, features |
| `/episodes` | Pilot and Reconnected + four title-free Coming Soon placeholders |
| `/watch/the-resume` | Video player for the pilot |
| `/watch/reconnected` | Video player for Season 1 Episode 1 |
| `/characters` | Filterable human and digital character gallery |
| `/characters/:id` | Profiles with original design-sheet art |
| `/universe` | Baltimore and Algoverse districts/world bible |
| `/soundtrack` | Prebuilt soundtrack area awaiting actual track data |
| `/about` | Studio and series story |

Search is available in the header, and mobile navigation stays available at the bottom. The layout is built for 320px+ phones, tablets, laptops and wide desktops.

## Update episodes and assets

- **Episode metadata:** `src/data/episodes.ts`. Initial released episodes are pilot "The Resume" and S01E01 "Reconnected". `S01E02` onwards are honest placeholders, not invented titles/dates.
- **Characters:** `src/data/characters.ts` — ZO, ALGO, NIA, JAY, MOM, NOVA, CACHE.
- **Locations:** `src/data/worlds.ts` — the loft, the Algoverse, Compute Heights, Legacy District, Processing Center, Cold Storage.
- **Brand/copy/socials:** `src/data/site.ts`.
- **Web artwork:** `public/assets/` — WebP-optimized extracts of original sheets.
- **Master art:** `source-art/` — full original PNG art with production quality retained.
- **Rebuild WebP crops:** `python3 -m pip install pillow && npm run assets:build` (the npm script invokes Python).

To release a future episode, supply a filename and switch its `release` status from `coming-soon` to `released`. The player and home/episodes collections update automatically.

## Deploy to GitHub Pages

1. Create a GitHub repository, e.g. `enteralgoverse`, and push this folder. To initialize locally: `git init && git add . && git commit -m "Initial EnterAlgoverse website" && git branch -M main && git remote add origin https://github.com/YOUR-USERNAME/enteralgoverse.git && git push -u origin main`. The included `.github/workflows/deploy.yml` installs/builds and deploys on `main` pushes. It currently uses `npm install` because a registry-generated lockfile could not be produced offline. Once you run `npm install` and commit the resulting `package-lock.json`, switch the workflow to `npm ci` for reproducible deployments.
2. Under **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. With no custom domain, the workflow builds with `/<repo-name>/` as its Vite base. Its routes use `HashRouter`, so deep links don't 404.
4. With **EnterAlgoverse.com**, point your DNS at GitHub Pages, configure the custom domain and HTTPS in **Settings → Pages**, and set repository variable `SITE_BASE_PATH` to `/`. Optionally include a `CNAME` file with the domain when DNS is ready. The custom domain's registration/availability has not been verified here.
5. For videos, prefer an external media CDN. In **Settings → Secrets and variables → Actions → Variables**, configure `VITE_MEDIA_ORIGIN` to your public media origin; the workflow passes it into the build.

> If you want clean `/episodes` URLs without `#`, use a hosting provider with SPA fallback rewrites and replace `HashRouter` with `BrowserRouter`.

## Development architecture

```text
enteralgoverse/
├── .github/workflows/deploy.yml
├── docs/{ARCHITECTURE,VIDEO-DELIVERY}.md
├── public/
│   ├── assets/{brand,characters,episodes,worlds}/
│   └── media/episodes/              # MP4s dropped here; gitignored
├── source-art/                     # all 12 supplied original PNG assets
├── scripts/prepare_assets.py
├── src/
│   ├── app/App.tsx
│   ├── components/{layout,media,ui}/
│   ├── data/{characters,episodes,site,worlds}.ts
│   ├── hooks/
│   ├── lib/assets.ts
│   ├── pages/
│   ├── types/content.ts
│   ├── main.tsx
│   └── styles.css                   # Tailwind v4 + bespoke design system
├── tests/
├── index.html
├── vite.config.ts
└── package.json
```

## Realistic limitations

- The two episode videos were not attached; the website is complete but video playback requires the files to be supplied.
- ``controlsList="nodownload"`` hides the native download menu where implemented, but browser-delivered public MP4 files **can be downloaded**. Content protection requires a streaming/DRM architecture outside a pure frontend.
- AirPlay/Remote Playback requires actual supported browser/device hardware. The code exposes the available APIs with a browser-cast fallback message; it does not ship a custom Chromecast receiver.
- Song titles, release dates, trailer URLs and streaming-service links were not supplied. Rather than fabricate them, the site shows truthful placeholders.
- The character cards use optimized crops of **your source sheets**, not re-generated characters. They're replaceable with dedicated key art later.
- External Google Fonts are optional visual enhancement; the site uses system fallbacks when unavailable.

## License / ownership

**Artwork, characters, story, logos, website text, and soundtrack concepts:** © TaylorTheory Multimedia & Design / respective rights holder. All rights reserved. No open-source license is granted for production imagery or story assets. The private repository can be public-facing, but copyright remains with the creator. If you later publish the site code under an open-source license, separately exclude all production artwork and media from that license.
