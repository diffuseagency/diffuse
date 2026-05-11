import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';

export function useFavicon() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    const faviconUrl = settings.site_favicon || settings.agency_logo || '/favicon.ico';
    
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    
    if (link) {
      link.href = faviconUrl;
    } else {
      link = document.createElement('link');
      link.rel = 'icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings.site_favicon, settings.agency_logo]);
}
