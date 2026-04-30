import { loadArea, setConfig } from './ak.js';

const hostnames = ['authorkit.dev'];

const locales = {
  '': { lang: 'en' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
};

export async function loadPage() {
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  await loadArea();
}
await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
  const hasLM = searchParams.has('layout-mode');
  if (hasLM) {
    document.body.innerHTML = '<div id="lm-loader" style="position:fixed;inset:0;z-index:500000;background:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;font-family:system-ui,sans-serif;"><style>@keyframes lm-spin{to{transform:rotate(360deg)}}</style><div style="width:32px;height:32px;border:3px solid #e0e0e0;border-top-color:#0078d4;border-radius:50%;animation:lm-spin .8s linear infinite;"></div><span style="font-size:14px;color:#555;">Loading Layout Mode...</span></div>';
    import('../tools/layout-mode/layout-mode.js').then((mod) => mod.default());
  }
}());
