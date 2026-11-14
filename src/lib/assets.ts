/** Work with root hosting or Vite's GitHub Pages base path. */
const base = import.meta.env.BASE_URL;
export function asset(path: string): string {
  return `${base}${path.replace(/^\//, '')}`;
}

/** You can switch the video delivery host later without modifying components. */
export function videoSource(filename: string): string {
  const origin = import.meta.env.VITE_MEDIA_ORIGIN?.trim();
  if (origin) return `${origin.replace(/\/$/, '')}/${filename.replace(/^\//, '')}`;
  return asset(`media/episodes/${filename}`);
}
