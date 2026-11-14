import { useEffect } from 'react';
export function usePageTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = `${title} | EnterAlgoverse`;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta && description) meta.content = description;
  }, [title, description]);
}
