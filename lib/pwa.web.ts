/**
 * Web PWA bootstrap. In Expo's SPA (`output: "single"`) build the custom
 * `+html.tsx` head is not applied, so we inject the PWA metadata at runtime and
 * register the service worker. Safe to call repeatedly (guards on existing tags).
 */
function ensureTag(selector: string, create: () => HTMLElement): void {
  if (document.head.querySelector(selector)) return;
  document.head.appendChild(create());
}

export function setupPwa(): void {
  if (typeof document === 'undefined') return;

  ensureTag('link[rel="manifest"]', () => {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/manifest.json';
    return link;
  });

  ensureTag('link[rel="apple-touch-icon"]', () => {
    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.href = '/apple-touch-icon.png';
    return link;
  });

  ensureTag('link[rel="icon"]', () => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = '/icon-192.png';
    return link;
  });

  const appleMeta: Array<[string, string]> = [
    ['apple-mobile-web-app-capable', 'yes'],
    ['mobile-web-app-capable', 'yes'],
    ['apple-mobile-web-app-status-bar-style', 'black-translucent'],
    ['apple-mobile-web-app-title', 'Loo Look'],
  ];
  for (const [name, content] of appleMeta) {
    ensureTag(`meta[name="${name}"]`, () => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      return meta;
    });
  }

  if ('serviceWorker' in navigator) {
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    };
    // In the SPA build the app boots after `load` has fired, so register now;
    // otherwise wait for load to avoid competing with the initial page fetch.
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
}
