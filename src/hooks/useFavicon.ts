import { useEffect } from 'react';

export function useFavicon(faviconUrl: string | undefined) {
  useEffect(() => {
    if (!faviconUrl) return;

    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    link.href = faviconUrl;
  }, [faviconUrl]);
}
