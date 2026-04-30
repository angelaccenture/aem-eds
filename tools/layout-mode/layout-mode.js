import { loadPage } from '../../scripts/scripts.js';
import injectToolbarButtons from '../toolbar-buttons/toolbar-buttons.js';
import { getBlockConfig, getSectionConfig } from './config-loader.js';

function applyLayoutModeUI() {
  const style = document.createElement('style');
  style.textContent = `
    .prosemirror-floating-toolbar {
      display: none !important;
    }
    .ProseMirror {
      cursor: default !important;
    }
    .ProseMirror * {
      user-select: none !important;
      -webkit-user-select: none !important;
    }
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
      gap: 4px;
    }
    .lm-action-btn {
      border: none;
      background: transparent;
      color: #555;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-family: inherit;
      text-transform: capitalize;
    }
    .lm-action-btn:hover {
      background: #f0f0f0;
      color: #111;
    }
  `;
  document.head.appendChild(style);

  let contextBar = null;

  function ensureBar() {
    if (!contextBar) {
      contextBar = document.createElement('div');
      contextBar.className = 'lm-context-bar';
      document.body.appendChild(contextBar);
    }
    return contextBar;
  }

  function positionBar(target) {
    const bar = ensureBar();
    bar.style.display = 'flex';
    const rect = target.getBoundingClientRect();
    const barHeight = 32;
    let top = rect.top + window.scrollY - barHeight - 8;
    if (top < window.scrollY) top = rect.bottom + window.scrollY + 8;
    const left = Math.max(8, Math.min(
      rect.left + (rect.width / 2) - (bar.offsetWidth / 2),
      window.innerWidth - bar.offsetWidth - 8,
    ));
    bar.style.top = `${top}px`;
    bar.style.left = `${left}px`;
  }

  function renderActions(config, label, target) {
    const bar = ensureBar();
    bar.innerHTML = '';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = label;
    nameSpan.style.cssText = 'font-weight:600;margin-right:12px;';
    bar.appendChild(nameSpan);

    const actions = config.actions || [];
    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.className = 'lm-action-btn';
      btn.textContent = action;
      btn.title = action;
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handleAction(action, target);
      });
      bar.appendChild(btn);
    });
  }

  function handleAction(action, target) {
    switch (action) {
      case 'move-up': {
        const prev = target.previousElementSibling;
        if (prev) prev.before(target);
        positionBar(target);
        break;
      }
      case 'move-down': {
        const next = target.nextElementSibling;
        if (next) next.after(target);
        positionBar(target);
        break;
      }
      case 'delete':
        if (confirm('Delete this element?')) {
          clearSelection();
          target.remove();
        }
        break;
      case 'duplicate': {
        const clone = target.cloneNode(true);
        target.after(clone);
        break;
      }
      default:
        break;
    }
  }

  async function showBlockBar(target) {
    const name = target.dataset.blockName || target.classList[0] || 'block';
    const config = await getBlockConfig(name);
    const label = config.label || name;
    renderActions(config, label, target);
    positionBar(target);
  }

  async function showSectionBar(target) {
    const config = await getSectionConfig();
    renderActions(config, 'Section', target);
    positionBar(target);
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
      showBlockBar(block);
      return;
    }

    const section = e.target.closest('.section');
    if (section) {
      section.classList.add('lm-selected-section');
      showSectionBar(section);
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
