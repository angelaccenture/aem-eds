import { loadPage } from '../../scripts/scripts.js';
import injectToolbarButtons from '../toolbar-buttons/toolbar-buttons.js';
import initContentEditor from '../content-editor/content-editor.js';

function applyLayoutModeUI() {
  const style = document.createElement('style');
  style.textContent = `
    .lm-selected-section {
      outline: 3px solid #0078d4 !important;
      outline-offset: 2px;
      border-radius: 4px;
    }
    .lm-selected-block {
      outline: 1.5px solid #0078d4 !important;
      outline-offset: 2px;
      border-radius: 4px;
    }
    .lm-context-bar {
      position: absolute;
      z-index: 100000;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 4px 12px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
      font-family: system-ui, sans-serif;
      font-size: 13px;
      color: #333;
      display: flex;
      align-items: center;
      height: 32px;
    }
  `;
  document.head.appendChild(style);

  let contextBar = null;

  function showContextBar(target) {
    if (!contextBar) {
      contextBar = document.createElement('div');
      contextBar.className = 'lm-context-bar';
      contextBar.textContent = 'Test';
      document.body.appendChild(contextBar);
    }
    contextBar.style.display = 'flex';
    const rect = target.getBoundingClientRect();
    const barHeight = 32;
    let top = rect.top + window.scrollY - barHeight - 8;
    if (top < window.scrollY) top = rect.bottom + window.scrollY + 8;
    const left = Math.max(8, Math.min(
      rect.left + (rect.width / 2) - 40,
      window.innerWidth - 100,
    ));
    contextBar.style.top = `${top}px`;
    contextBar.style.left = `${left}px`;
  }

  function clearSelection() {
    document.querySelectorAll('.lm-selected-section, .lm-selected-block').forEach((el) => {
      el.classList.remove('lm-selected-section', 'lm-selected-block');
    });
    if (contextBar) contextBar.style.display = 'none';
  }

  document.addEventListener('click', (e) => {
    if (contextBar && contextBar.contains(e.target)) return;
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    if (toolbar && toolbar.contains(e.target)) return;

    clearSelection();

    const block = e.target.closest('[data-block-name]');
    if (block) {
      block.classList.add('lm-selected-block');
      showContextBar(block);
      return;
    }

    const section = e.target.closest('.section');
    if (section && !e.target.closest('p, h1, h2, h3, h4, h5, h6, li, a, span, img, picture')) {
      section.classList.add('lm-selected-section');
      showContextBar(section);
    }
  });
}

const importMap = {
  imports: {
    'da-lit': 'https://da.live/deps/lit/dist/index.js',
    'da-y-wrapper': 'https://da.live/deps/da-y-wrapper/dist/index.js',
  },
};

function addImportmap() {
  const importmapEl = document.createElement('script');
  importmapEl.type = 'importmap';
  importmapEl.textContent = JSON.stringify(importMap);
  document.head.appendChild(importmapEl);
}

async function loadModule(origin, payload) {
  const { default: loadQuickEdit } = await import(`${origin}/nx/public/plugins/quick-edit/quick-edit.js`);
  initContentEditor();
  applyLayoutModeUI();

  const observer = new MutationObserver(injectToolbarButtons);
  observer.observe(document.body, { childList: true, subtree: true });

  loadQuickEdit(payload, loadPage);
}

function generateSidekickPayload() {
  let { hostname } = window.location;
  if (hostname === 'localhost') {
    hostname = document.querySelector('meta[property="hlx:proxyUrl"]').content;
  }
  const parts = hostname.split('.')[0].split('--');
  const [, repo, owner] = parts;

  return {
    detail: {
      config: { mountpoint: `https://content.da.live/${owner}/${repo}/` },
      location: { pathname: window.location.pathname },
    },
  };
}

export default function init(payload) {
  const { search } = window.location;
  const ref = new URLSearchParams(search).get('layout-mode');
  let origin;
  if (ref === 'on' || !ref) origin = 'https://da.live';
  if (ref === 'local') origin = 'http://localhost:6456';
  if (!origin) origin = `https://${ref}--da-nx--adobe.aem.live`;
  addImportmap();
  loadModule(origin, payload || generateSidekickPayload());
}
