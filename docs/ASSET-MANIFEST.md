# Original art and web assets

All creative illustrations are derived from the user's submitted concept/design sheets. No third-party stock imagery is bundled. The website's `/public/assets` WebP crops are separate from production originals in `/source-art`.

| Content | Source master | Website versions |
|---|---|---|
| ZO | `zo-character-sheet.png` | `characters/zo.webp`, `characters/zo-sheet.webp` |
| ALGO | `algo-character-sheet.png`, alternate sheet | `characters/algo.webp`, `characters/algo-sheet.webp` |
| NIA | `nia-character-sheet.png` | `characters/nia.webp`, `characters/nia-sheet.webp` |
| JAY | `jay-character-sheet.png` | `characters/jay.webp`, `characters/jay-sheet.webp` |
| MOM | `mom-character-sheet.png` | `characters/mom.webp`, `characters/mom-sheet.webp` |
| NOVA | `nova-character-sheet.png`, alternate sheet | `characters/nova.webp`, `characters/nova-sheet.webp` |
| CACHE | `cache-character-sheet.png` | `characters/cache.webp`, `characters/cache-sheet.webp` |
| Digital world locations | `world-environments-sheet.png` | Six `worlds/*.webp` scene crops |
| World bible | `world-bible-sheet.png` | `worlds/world-bible.webp` |
| Poster | `the-algorithm-poster.png` | `brand/the-algorithm-poster.webp` |
| Episode placeholder images | ZO, ALGO, NIA character sheets | `episodes/*.webp` |

All the editable text and UI are **real HTML/React elements**, not baked into a website mockup screenshot. The poster and full character sheets are intentionally retained as illustrated images.

For dedicated episode stills or character portraits, place a new optimized WebP/AVIF image in `public/assets` and update the corresponding `image` path in `src/data/episodes.ts` or `src/data/characters.ts`.
