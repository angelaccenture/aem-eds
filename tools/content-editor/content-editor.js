/**
 * Content Editor — shared text formatting toolbar and image alt editor.
 * Used by both quick-edit and layout-mode tools.
 */

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .prosemirror-floating-toolbar .toolbar-btn-underline {
      display: none !important;
    }
    .prosemirror-floating-toolbar {
      background: #f5f5f5 !important;
      border: 1px solid #ddd !important;
      border-radius: 6px !important;
      padding: 4px 8px !important;
      box-shadow: 0 2px 8px rgb(0 0 0 / 8%) !important;
      display: flex !important;
      align-items: center !important;
      gap: 2px !important;
    }
    .prosemirror-floating-toolbar .ProseMirror-menuitem {
      display: flex !important;
      align-items: center;
    }
    .prosemirror-floating-toolbar .ProseMirror-menuitem > div,
    .prosemirror-floating-toolbar .ProseMirror-menuitem > span {
      display: flex !important;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      color: #666;
      transition: background 0.1s, color 0.1s;
    }
    .prosemirror-floating-toolbar .ProseMirror-menuitem > div:hover,
    .prosemirror-floating-toolbar .ProseMirror-menuitem > span:hover {
      background: #e0e0e0;
      color: #333;
    }
    .prosemirror-floating-toolbar .ProseMirror-menuitem > div.ProseMirror-menu-active,
    .prosemirror-floating-toolbar .ProseMirror-menuitem > span.ProseMirror-menu-active {
      background: #ddd;
      color: #000;
    }
    .prosemirror-floating-toolbar .ProseMirror-menu-disabled {
      opacity: 0.3;
      pointer-events: none;
    }
    .prosemirror-floating-toolbar .ProseMirror-menuseparator {
      width: 1px !important;
      height: 20px !important;
      background: #ddd !important;
      margin: 0 4px !important;
      border: none !important;
    }
    .da-image-palettes {
      display: none;
      position: absolute;
      z-index: 100001;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 10px 0 rgb(0 0 0 / 10%);
      width: 280px;
      font-family: system-ui, sans-serif;
    }
    .da-image-palettes.open { display: flex; flex-direction: column; }
    .da-image-palettes .palette-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0 0 16px;
      color: #000;
    }
    .da-image-palettes .palette-field {
      margin-bottom: 12px;
    }
    .da-image-palettes .palette-label {
      font-size: 13px;
      font-weight: 600;
      color: #000;
      display: block;
      margin-bottom: 4px;
    }
    .da-image-palettes .palette-input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      font-size: 14px;
      font-family: inherit;
    }
    .da-image-palettes .palette-input:focus {
      outline: none;
      border-color: #0078d4;
    }
    .da-image-palettes textarea.palette-input {
      resize: vertical;
      min-height: 60px;
    }
    .da-image-palettes .palette-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
    .da-image-palettes .palette-actions button {
      padding: 8px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .da-image-palettes .palette-btn-cancel {
      border: 1px solid #ccc;
      background: #fff;
      color: #000;
    }
    .da-image-palettes .palette-btn-ok {
      border: 1px solid #0078d4;
      background: #0078d4;
      color: #fff;
    }
  `;
  document.head.appendChild(style);
}

function createAltEditor() {
  const altEditor = document.createElement('div');
  altEditor.className = 'da-image-palettes';
  altEditor.setAttribute('contenteditable', 'false');
  altEditor.innerHTML = `
    <span class="palette-title">Edit Image</span>
    <div class="palette-field">
      <span class="palette-label">Alt text</span>
      <textarea id="qe-alt-input" class="palette-input" placeholder="Describe this image..."></textarea>
    </div>
    <div class="palette-actions">
      <button class="palette-btn-cancel">Cancel</button>
      <button class="palette-btn-ok">OK</button>
    </div>
  `;

  let altTarget = null;

  function ensureInDOM() {
    if (!document.body.contains(altEditor)) {
      document.body.appendChild(altEditor);
    }
  }

  altEditor.querySelector('.palette-btn-cancel').addEventListener('click', () => {
    altEditor.classList.remove('open');
    altTarget = null;
  });

  altEditor.querySelector('.palette-btn-ok').addEventListener('click', () => {
    if (altTarget) {
      const newAlt = altEditor.querySelector('#qe-alt-input').value;
      const picture = altTarget.closest('picture');
      const wrapper = picture || altTarget;
      const pmParent = wrapper.closest('p') || wrapper.parentNode;
      const newParent = pmParent.cloneNode(true);
      const newImg = newParent.querySelector('img');
      if (newImg) newImg.alt = newAlt;
      pmParent.parentNode.replaceChild(newParent, pmParent);
      altTarget = newImg;
    }
    altEditor.classList.remove('open');
    altTarget = null;
  });

  function open(img) {
    altTarget = img;
    ensureInDOM();
    altEditor.querySelector('#qe-alt-input').value = img.alt || '';
    const rect = img.getBoundingClientRect();
    altEditor.style.position = 'absolute';
    altEditor.style.top = `${rect.bottom + window.scrollY + 8}px`;
    altEditor.style.left = `${Math.max(8, rect.left)}px`;
    altEditor.classList.add('open');
    setTimeout(() => altEditor.querySelector('#qe-alt-input').focus(), 50);
  }

  return { altEditor, open };
}

function detectImage(rawTarget) {
  const img = rawTarget.closest('img, picture, svg, video, canvas, [class*="image"], [class*="img"]');
  if (img) return img;
  if (rawTarget.tagName === 'IMG' || rawTarget.tagName === 'PICTURE') return rawTarget;
  const parent = rawTarget.parentElement;
  if (parent && parent.querySelector('img') && !parent.textContent.trim()) return parent;
  return null;
}

function injectFormattingToolbar() {
  const toolbar = document.querySelector('.prosemirror-floating-toolbar');
  if (!toolbar || toolbar.querySelector('.qe-custom-toolbar')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'qe-custom-toolbar';
  wrapper.style.cssText = 'display:flex;align-items:center;gap:2px;';

  const sep = () => {
    const s = document.createElement('span');
    s.className = 'ProseMirror-menuseparator';
    return s;
  };

  const btn = (label, title, cmd) => {
    const b = document.createElement('span');
    b.className = 'ProseMirror-menuitem';
    const inner = document.createElement('div');
    inner.title = title;
    inner.textContent = label;
    inner.style.cssText = 'font-size:14px;font-weight:600;';
    inner.addEventListener('click', () => {
      document.execCommand(cmd, false, null);
    });
    b.appendChild(inner);
    return b;
  };

  const iconBtn = (svg, title, action) => {
    const b = document.createElement('span');
    b.className = 'ProseMirror-menuitem';
    const inner = document.createElement('div');
    inner.title = title;
    inner.innerHTML = svg;
    inner.style.cssText = 'display:flex;align-items:center;justify-content:center;';
    inner.addEventListener('click', action);
    b.appendChild(inner);
    return b;
  };

  const linkSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  const unlinkSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="4" y1="20" x2="20" y2="4" stroke-width="1.5"/></svg>';
  const imgSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
  const undoSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h13a4 4 0 0 1 0 8H7"/><polyline points="7 6 3 10 7 14"/></svg>';
  const redoSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10H8a4 4 0 0 0 0 8h10"/><polyline points="17 6 21 10 17 14"/></svg>';

  wrapper.append(
    btn('B', 'Bold', 'bold'),
    btn('I', 'Italic', 'italic'),
    btn('U', 'Underline', 'underline'),
    btn('S', 'Strikethrough', 'strikeThrough'),
    btn('T', 'Superscript', 'superscript'),
    btn('T', 'Subscript', 'subscript'),
    sep(),
    iconBtn(linkSvg, 'Add Link', () => {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    }),
    iconBtn(unlinkSvg, 'Remove Link', () => {
      document.execCommand('unlink', false, null);
    }),
    sep(),
    iconBtn(imgSvg, 'Insert Image', () => {
      const url = prompt('Enter image URL:');
      if (url) document.execCommand('insertImage', false, url);
    }),
    sep(),
    iconBtn(undoSvg, 'Undo', () => { document.execCommand('undo'); }),
    iconBtn(redoSvg, 'Redo', () => { document.execCommand('redo'); }),
  );

  toolbar.appendChild(wrapper);
}

export default function initContentEditor() {
  addStyles();

  const { altEditor, open: openAltEditor } = createAltEditor();

  const formatObserver = new MutationObserver(injectFormattingToolbar);
  formatObserver.observe(document.body, { childList: true, subtree: true });

  document.addEventListener('click', (e) => {
    if (altEditor.contains(e.target)) return;
    altEditor.classList.remove('open');

    const imgTarget = detectImage(e.target);
    if (imgTarget) {
      const img = imgTarget.tagName === 'IMG' ? imgTarget : imgTarget.querySelector('img');
      if (img) {
        const toolbar = document.querySelector('.prosemirror-floating-toolbar');
        if (toolbar) toolbar.style.display = 'none';
        openAltEditor(img);
      }
    }
  });
}
