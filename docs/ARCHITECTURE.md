# Application architecture

```text
Browser (React SPA / HashRouter)
    ├── content data (src/data/*.ts)
    ├── pages (home, episodes, watch, characters, universe, soundtrack, about)
    ├── presentational UI (src/components/*)
    ├── media hooks (availability HEAD check)
    └── Vite static build
           ├── web-optimized public/assets/*.webp
           └── optional public/media/episodes/*.mp4 OR a separate public CDN
```

There is no backend, database, login or analytics service. Changes to content are code-reviewed and deployed as static assets. `HashRouter` is intentionally selected so GitHub Pages direct links work without server-side SPA rewrites. URLs look like `https://enteralgoverse.com/#/characters/algo` until migrating to a host with history routing.

## Separation of concerns

- `src/types/` – domain contracts
- `src/data/` – editable catalog, profiles, world locations and site metadata
- `src/lib/` – asset URL resolution, future service/adaptor layer
- `src/hooks/` – stateful media and document concerns
- `src/components/layout/` – navigation, footer, search, shell
- `src/components/media/` – episode media components and playback
- `src/components/ui/` – generic cards, labels and headings
- `src/pages/` – route-level composition
- `public/assets/` – optimized originals with predictable paths
- `source-art/` – the full user-supplied production design sheets and poster
- `scripts/` – deterministic asset image pipeline

## Scaling recommendations

At ~30+ episodes or for editorial nondeveloper access, swap the hard-coded episode/character modules for data coming from a headless CMS. Keep `Episode` and `Character` contracts stable. Add a server endpoint only when you need user-specific actions (accounts, analytics aggregation, paid access, playback authorization or signed media). Avoid introducing a backend solely to list public episodes.

## Accessibility

Landmark roles, skip-to-content action, keyboard-focus styles, reduced-motion support, explicit interactive labels, subtitle track support, responsive navigation, visible active states and color contrast were considered. Perform a real browser axe/Lighthouse pass after installing dependencies, and add manually verified captions.
