import { useEffect } from 'react';

export type SeoConfig = {
  title?: string;
  description?: string;
  robots?: string; // e.g., "index,follow" or "noindex,nofollow"
  canonical?: string;
};

function upsertMetaByName(name: string, content: string | undefined): void {
  if (typeof document === 'undefined') return;
  if (!content) return;
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLinkRel(rel: string, href: string | undefined): void {
  if (typeof document === 'undefined') return;
  if (!href) return;
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function applySeo(config: SeoConfig): void {
  if (typeof document === 'undefined') return;
  const { title, description, robots, canonical } = config;

  if (title) {
    document.title = title;
  }

  if (description) {
    upsertMetaByName('description', description);
  }

  if (robots) {
    upsertMetaByName('robots', robots);
  }

  if (canonical) {
    upsertLinkRel('canonical', canonical);
  }
}

export function useSeo(config: SeoConfig): void {
  useEffect(() => {
    applySeo(config);
    // Using JSON string ensures effect runs when any field changes without deep compare lib
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config)]);
}


