import { useEffect, useState } from 'react';

type MediaReady = 'checking' | 'ready' | 'missing' | 'unknown';
/** HEAD avoids downloading the video and lets drop-in files show automatically. */
export function useMediaReady(src: string | null): MediaReady {
  const [status, setStatus] = useState<MediaReady>(src ? 'checking' : 'missing');
  useEffect(() => {
    if (!src) return void setStatus('missing');
    const controller = new AbortController();
    setStatus('checking');
    fetch(src, { method: 'HEAD', signal: controller.signal })
      .then(response => {
        if (response.status === 405 || response.status === 403) return setStatus('unknown');
        const type = response.headers.get('content-type') || '';
        if (response.ok && (type.startsWith('video/') || type.includes('octet-stream') || src.endsWith('.m3u8'))) setStatus('ready');
        else setStatus('missing');
      })
      .catch(error => {
        if ((error as Error).name !== 'AbortError') setStatus('unknown');
      });
    return () => controller.abort();
  }, [src]);
  return status;
}
