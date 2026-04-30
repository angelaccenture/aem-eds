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
      caret-color: transparent !important;
    }
    .ProseMirror * {
      user-select: none !important;
      -webkit-user-select: none !important;
    }
    .ProseMirror:focus,
    .ProseMirror *:focus {
      outline: none !important;
    }
    .ProseMirror ::selection {
      background: transparent !important;
    }
    .ProseMirror p.is-selected,
    .ProseMirror .ProseMirror-selectednode,
    .ProseMirror [data-active],
    .ProseMirror .selectedCell {
      outline: none !important;
      border: none !important;
      background: transparent !important;
    }
    .lm-hover-block {
      outline: 1.5px dashed #0078d4 !important;
      outline-offset: 2px;
      border-radius: 4px;
    }
    .lm-hover-section {
      outline: 3px dashed #0078d4 !important;
      outline-offset: 2px;
      border-radius: 4px;
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
    .lm-classes-dropdown {
      position: relative;
      display: inline-flex;
    }
    .lm-classes-trigger {
      border: 1px solid #e0e0e0;
      background: #fff;
      color: #333;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-family: inherit;
    }
    .lm-classes-trigger:hover { border-color: #ccc; }
    .lm-classes-trigger::after { content: ' ▾'; font-size: 9px; }
    .lm-classes-menu {
      display: none;
      position: fixed;
      z-index: 200000;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
      padding: 8px 0;
      min-width: 160px;
      max-height: 240px;
      overflow-y: auto;
      font-family: system-ui, sans-serif;
    }
    .lm-classes-menu.open { display: block; }
    .lm-classes-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      font-size: 13px;
      color: #333;
      cursor: pointer;
    }
    .lm-classes-option:hover { background: #f5f5f5; }
    .lm-classes-option input { margin: 0; accent-color: #0078d4; }
    .lm-classes-option.active { font-weight: 600; }
    .lm-block-picker-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 300000;
      background: rgb(0 0 0 / 40%);
      align-items: center;
      justify-content: center;
    }
    .lm-block-picker-overlay.open { display: flex; }
    .lm-block-picker {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgb(0 0 0 / 20%);
      padding: 24px;
      min-width: 340px;
      max-width: 400px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      font-family: system-ui, sans-serif;
    }
    .lm-block-picker-title {
      font-size: 18px;
      font-weight: 700;
      color: #111;
      margin: 0 0 16px;
    }
    .lm-block-picker-search {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: inherit;
      margin-bottom: 12px;
    }
    .lm-block-picker-search:focus {
      outline: none;
      border-color: #0078d4;
    }
    .lm-block-picker-list {
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      max-height: 300px;
    }
    .lm-block-picker-item {
      padding: 10px 12px;
      font-size: 15px;
      color: #333;
      cursor: pointer;
      border-radius: 4px;
    }
    .lm-block-picker-item:hover { background: #f5f5f5; }
    .lm-block-picker-item.selected {
      background: #e8f0fe;
      color: #0078d4;
    }
    .lm-block-picker-item.hidden { display: none; }
    .lm-block-picker-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
    .lm-block-picker-cancel {
      padding: 8px 20px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      color: #333;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .lm-block-picker-cancel:hover { background: #f5f5f5; }
    .lm-block-picker-insert {
      padding: 8px 20px;
      border: none;
      border-radius: 6px;
      background: #ccc;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: not-allowed;
    }
    .lm-block-picker-insert.ready {
      background: #0078d4;
      cursor: pointer;
    }
    .lm-block-picker-insert.ready:hover { background: #0067b8; }
  `;
  document.head.appendChild(style);

  let contextBar = null;
  let hoverTarget = null;

  document.addEventListener('mouseover', (e) => {
    if (contextBar && contextBar.contains(e.target)) return;
    if (hoverTarget) {
      hoverTarget.classList.remove('lm-hover-block', 'lm-hover-section');
      hoverTarget = null;
    }
    const block = e.target.closest('[data-block-name]');
    if (block && !block.classList.contains('lm-selected-block')) {
      block.classList.add('lm-hover-block');
      hoverTarget = block;
      return;
    }
    const section = e.target.closest('.section');
    if (section && !section.classList.contains('lm-selected-section')) {
      section.classList.add('lm-hover-section');
      hoverTarget = section;
    }
  });

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

  async function getDAToken() {
    // Try to get token from DA's iframe via postMessage
    const iframe = document.querySelector('#quick-edit-iframe, iframe[src*="da.live"]');
    if (iframe) {
      return new Promise((resolve) => {
        const handler = (e) => {
          if (e.data?.type === 'token') {
            window.removeEventListener('message', handler);
            resolve(e.data.token);
          }
        };
        window.addEventListener('message', handler);
        iframe.contentWindow.postMessage({ type: 'get-token' }, '*');
        setTimeout(() => {
          window.removeEventListener('message', handler);
          resolve(null);
        }, 2000);
      });
    }
    // Fallback: try fetching from DA auth endpoint (requires same-origin cookies)
    try {
      const resp = await fetch('https://admin.da.live/auth/me', { credentials: 'include' });
      if (resp.ok) {
        const data = await resp.json();
        return data.token || data.tokenValue || null;
      }
    } catch { /* ignore */ }
    return null;
  }

  function getDAInfo() {
    let { hostname } = window.location;
    if (hostname === 'localhost') {
      const meta = document.querySelector('meta[property="hlx:proxyUrl"]');
      if (meta) hostname = meta.content;
    }
    const parts = hostname.split('.')[0].split('--');
    const [, repo, owner] = parts;
    const pagePath = window.location.pathname === '/' ? '/index' : window.location.pathname;
    return { owner, repo, pagePath };
  }

  async function updateBlockHeader(target, blockName, availableOptions) {
    const activeClasses = availableOptions.filter((cls) => target.classList.contains(cls));

    // Update the visual (decorated) element immediately
    const decorated = target.closest('[data-block-name]') || target;
    availableOptions.forEach((cls) => {
      decorated.classList.toggle(cls, activeClasses.includes(cls));
    });

    // Persist to DA: fetch source, modify block class, PUT back
    // Auth: get token from DA's iframe via postMessage
    try {
      const { owner, repo, pagePath } = getDAInfo();
      const token = await getDAToken();
      if (!token) throw new Error('No DA token available');

      const sourceUrl = `https://admin.da.live/source/${owner}/${repo}${pagePath}.html`;

      const getResp = await fetch(sourceUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!getResp.ok) throw new Error(`Failed to fetch source: ${getResp.status}`);
      const html = await getResp.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const blockDivs = doc.querySelectorAll(`div.${blockName}`);

      if (!blockDivs.length) throw new Error(`Block div .${blockName} not found in source`);

      blockDivs.forEach((div) => {
        div.className = [blockName, ...activeClasses].join(' ');
      });

      const updatedHTML = doc.body.innerHTML;
      const putResp = await fetch(sourceUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'text/html',
        },
        body: updatedHTML,
      });

      if (!putResp.ok) throw new Error(`Failed to save: ${putResp.status}`);
    } catch (err) {
      console.error('Layout Mode: Failed to persist style change to DA:', err);
    }
  }

  function renderActions(config, label, target) {
    const bar = ensureBar();
    bar.innerHTML = '';
    const blockName = (target.dataset.blockName || target.classList[0] || '').toLowerCase();

    const nameSpan = document.createElement('span');
    nameSpan.textContent = label;
    nameSpan.style.cssText = 'font-weight:600;margin-right:12px;';
    bar.appendChild(nameSpan);

    const properties = config.properties || [];
    properties.forEach((prop) => {
      if (prop.name === 'classes') {
        const wrapper = document.createElement('div');
        wrapper.className = 'lm-classes-dropdown';

        const trigger = document.createElement('button');
        trigger.className = 'lm-classes-trigger';
        trigger.textContent = 'Styles';

        const menu = document.createElement('div');
        menu.className = 'lm-classes-menu';

        const options = prop.options || [];
        if (options.length === 0) {
          const empty = document.createElement('div');
          empty.style.cssText = 'padding:8px 12px;font-size:12px;color:#999;';
          empty.textContent = 'No styles available';
          menu.appendChild(empty);
        }
        options.forEach((cls) => {
          const option = document.createElement('label');
          option.className = 'lm-classes-option';
          const isActive = target.classList.contains(cls);
          if (isActive) option.classList.add('active');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = isActive;
          checkbox.addEventListener('change', () => {
            target.classList.toggle(cls, checkbox.checked);
            option.classList.toggle('active', checkbox.checked);
            updateBlockHeader(target, blockName, options);
          });
          const text = document.createElement('span');
          text.textContent = cls;
          option.append(checkbox, text);
          menu.appendChild(option);
        });

        trigger.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const rect = trigger.getBoundingClientRect();
          menu.style.top = `${rect.bottom + 4}px`;
          menu.style.left = `${rect.left}px`;
          menu.classList.toggle('open');
        });

        document.addEventListener('click', (ev) => {
          if (!wrapper.contains(ev.target)) menu.classList.remove('open');
        });

        wrapper.append(trigger);
        document.body.appendChild(menu);
        bar.appendChild(wrapper);
      }
    });

    const sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:16px;background:#e0e0e0;margin:0 6px;';
    if (config.actions && config.actions.length && properties.length) bar.appendChild(sep);

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

  const BLOCK_LIST = [
    { name: 'Hero', value: 'hero' },
    { name: 'Hero (Center)', value: 'hero center' },
    { name: 'Card', value: 'card' },
    { name: 'Teaser', value: 'teaser' },
    { name: 'Section-Metadata', value: 'section-metadata' },
    { name: 'Columns', value: 'columns' },
    { name: 'Metadata', value: 'metadata' },
    { name: 'Table', value: 'table' },
    { name: 'Advanced Accordion', value: 'advanced-accordion' },
    { name: 'Advanced Carousel', value: 'advanced-carousel' },
    { name: 'Advanced Tabs', value: 'advanced-tabs' },
    { name: 'YouTube', value: 'youtube' },
    { name: 'Fragment', value: 'fragment' },
  ];

  let pickerOverlay = null;
  let pickerTarget = null;
  let pickerSelected = null;

  function createBlockPicker() {
    pickerOverlay = document.createElement('div');
    pickerOverlay.className = 'lm-block-picker-overlay';
    const listHTML = BLOCK_LIST.map((b) => `<li class="lm-block-picker-item" data-value="${b.value}">${b.name}</li>`).join('');
    pickerOverlay.innerHTML = `
      <div class="lm-block-picker">
        <span class="lm-block-picker-title">Insert block</span>
        <input class="lm-block-picker-search" placeholder="Search blocks...">
        <ul class="lm-block-picker-list">${listHTML}</ul>
        <div class="lm-block-picker-actions">
          <button class="lm-block-picker-cancel">Cancel</button>
          <button class="lm-block-picker-insert">Insert</button>
        </div>
      </div>
    `;

    const search = pickerOverlay.querySelector('.lm-block-picker-search');
    const list = pickerOverlay.querySelector('.lm-block-picker-list');
    const insertBtn = pickerOverlay.querySelector('.lm-block-picker-insert');
    const cancelBtn = pickerOverlay.querySelector('.lm-block-picker-cancel');

    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      list.querySelectorAll('.lm-block-picker-item').forEach((item) => {
        item.classList.toggle('hidden', !item.textContent.toLowerCase().includes(q));
      });
    });

    list.addEventListener('click', (ev) => {
      const item = ev.target.closest('.lm-block-picker-item');
      if (!item) return;
      list.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('selected'));
      item.classList.add('selected');
      pickerSelected = item.dataset.value;
      insertBtn.classList.add('ready');
    });

    cancelBtn.addEventListener('click', () => closePicker());
    pickerOverlay.addEventListener('click', (ev) => { if (ev.target === pickerOverlay) closePicker(); });

    insertBtn.addEventListener('click', () => {
      if (!pickerSelected || !pickerTarget) return;
      const blockDiv = document.createElement('div');
      blockDiv.className = pickerSelected;
      const inner = document.createElement('div');
      inner.innerHTML = '<p><br></p>';
      blockDiv.appendChild(inner);
      pickerTarget.appendChild(blockDiv);
      closePicker();
    });

    document.body.appendChild(pickerOverlay);
  }

  function closePicker() {
    if (!pickerOverlay) return;
    pickerOverlay.classList.remove('open');
    pickerSelected = null;
    pickerTarget = null;
    const insertBtn = pickerOverlay.querySelector('.lm-block-picker-insert');
    insertBtn.classList.remove('ready');
    pickerOverlay.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('selected'));
    pickerOverlay.querySelector('.lm-block-picker-search').value = '';
    pickerOverlay.querySelectorAll('.lm-block-picker-item').forEach((i) => i.classList.remove('hidden'));
  }

  function openBlockPicker(section) {
    if (!pickerOverlay) createBlockPicker();
    pickerTarget = section;
    pickerOverlay.classList.add('open');
    setTimeout(() => pickerOverlay.querySelector('.lm-block-picker-search').focus(), 50);
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
      case 'add-block':
        openBlockPicker(target);
        break;
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
    document.querySelectorAll('.lm-selected-section, .lm-selected-block, .lm-hover-block, .lm-hover-section').forEach((el) => {
      el.classList.remove('lm-selected-section', 'lm-selected-block', 'lm-hover-block', 'lm-hover-section');
    });
    hoverTarget = null;
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
