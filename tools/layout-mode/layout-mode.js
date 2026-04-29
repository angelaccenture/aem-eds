import { loadPage } from '../../scripts/scripts.js';
import initStylePicker, { openStylePicker } from './style-picker.js';
import injectToolbarButtons from '../toolbar-buttons/toolbar-buttons.js';
import initContentEditor from '../content-editor/content-editor.js';
import initSectionManager from './section-manager.js';

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

function applyLayoutModeUI() {
  const style = document.createElement('style');
  style.textContent = `
    .qe-selected {
      outline: 2px solid #0078d4 !important;
      outline-offset: 4px;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);

  // Inject Edit Styles button into toolbar once it renders
  function injectStylesButton() {
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    if (!toolbar || toolbar.querySelector('.toolbar-btn-styles')) return;

    const stylesBtn = document.createElement('span');
    stylesBtn.className = 'ProseMirror-menuitem';
    const stylesBtnInner = document.createElement('div');
    stylesBtnInner.title = 'Edit Styles';
    stylesBtnInner.className = 'edit-styles toolbar-btn-styles ProseMirror-menu-disabled';
    stylesBtnInner.textContent = 'Edit Styles';
    stylesBtnInner.setAttribute('contenteditable', 'false');
    stylesBtn.setAttribute('contenteditable', 'false');
    stylesBtn.appendChild(stylesBtnInner);
    stylesBtnInner.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const selected = document.querySelector('.qe-selected');
      if (selected) {
        openStylePicker(selected);
      }
    });
    toolbar.appendChild(stylesBtn);
  }

  const toolbarObserver = new MutationObserver(injectStylesButton);
  toolbarObserver.observe(document.body, { childList: true, subtree: true });

  // Detect element type from the raw click target
  function detectClick(rawTarget) {
    const img = rawTarget.closest('img, picture, svg, video, canvas, [class*="image"], [class*="img"]');
    if (img) return { target: img, type: 'image' };
    if (rawTarget.tagName === 'IMG' || rawTarget.tagName === 'PICTURE'
      || rawTarget.tagName === 'SVG' || rawTarget.tagName === 'VIDEO') {
      return { target: rawTarget, type: 'image' };
    }
    const parent = rawTarget.parentElement;
    if (parent && parent.querySelector('img') && !parent.textContent.trim()) {
      return { target: parent, type: 'image' };
    }
    const text = rawTarget.closest('p, h1, h2, h3, h4, h5, h6, li, a, span');
    if (text) return { target: text, type: 'text' };
    const block = rawTarget.closest('[data-block-name]');
    if (block) return { target: block, type: 'block' };
    const section = rawTarget.closest('.section');
    if (section) return { target: section, type: 'section' };
    return { target: rawTarget, type: 'text' };
  }

  // Section/block selection and style toolbar positioning
  document.addEventListener('click', (e) => {
    const toolbar = document.querySelector('.prosemirror-floating-toolbar');
    if (toolbar && toolbar.contains(e.target)) return;

    document.querySelectorAll('.qe-selected').forEach((el) => el.classList.remove('qe-selected'));

    const { target, type } = detectClick(e.target);
    if (type === 'image' || type === 'text') return;

    target.classList.add('qe-selected');

    if (!toolbar) return;
    toolbar.style.display = 'block';

    const stylesBtnInnerEl = toolbar.querySelector('.toolbar-btn-styles');
    const stylesBtnWrap = stylesBtnInnerEl?.closest('.ProseMirror-menuitem');

    [...toolbar.children].forEach((child) => { child.style.display = 'none'; });

    if (type === 'block' || type === 'section') {
      if (stylesBtnWrap) stylesBtnWrap.style.display = '';
      if (stylesBtnInnerEl) stylesBtnInnerEl.classList.remove('ProseMirror-menu-disabled');
    }

    const rect = target.getBoundingClientRect();
    const toolbarHeight = toolbar.offsetHeight || 40;
    let top = rect.top + window.scrollY - toolbarHeight - 8;
    if (top < window.scrollY) top = rect.bottom + window.scrollY + 8;
    const left = Math.max(8, Math.min(
      rect.left + (rect.width / 2) - (toolbar.offsetWidth / 2),
      window.innerWidth - toolbar.offsetWidth - 8,
    ));
    toolbar.style.position = 'absolute';
    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
  });
}


async function loadModule(origin, payload) {
  const { default: loadQuickEdit } = await import(`${origin}/nx/public/plugins/quick-edit/quick-edit.js`);
  initContentEditor();
  applyLayoutModeUI();
  initStylePicker();
  initSectionManager();

  const observer = new MutationObserver(injectToolbarButtons);
  observer.observe(document.body, { childList: true, subtree: true });

  loadQuickEdit(payload, loadPage);
}

// creates sidekick payload when loading QE from query param
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


