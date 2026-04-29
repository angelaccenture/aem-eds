/**
 * Content Editor — shared text formatting toolbar and image alt editor.
 * Used by both quick-edit and layout-mode tools.
 */

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .prosemirror-floating-toolbar > *:not(.qe-custom-toolbar) {
      display: none !important;
    }
    .da-floating-toolbar,
    .da-toolbar,
    [class*="da-"] button[class*="bold"],
    [class*="da-"] button[class*="italic"],
    [class*="da-"] button[class*="underline"],
    .ProseMirror-gapcursor + div,
    div[class*="toolbar"]:not(.prosemirror-floating-toolbar):not(.qe-custom-toolbar) {
      display: none !important;
    }
    .prosemirror-floating-toolbar {
      background: #fff !important;
      border: 1px solid #e0e0e0 !important;
      border-radius: 4px !important;
      padding: 2px 6px !important;
      box-shadow: 0 1px 4px rgb(0 0 0 / 6%) !important;
      display: flex !important;
      align-items: center !important;
      gap: 0 !important;
      height: 32px !important;
    }
    .qe-custom-toolbar {
      display: flex;
      align-items: center;
      gap: 0;
      height: 100%;
    }
    .qe-custom-toolbar .qe-separator {
      width: 1px;
      height: 18px;
      background: #e0e0e0;
      margin: 0 6px;
    }
    .qe-custom-toolbar .qe-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border: none;
      background: transparent;
      border-radius: 3px;
      cursor: pointer;
      color: #111;
      padding: 0;
      font-family: Georgia, serif;
    }
    .qe-custom-toolbar .qe-btn:hover {
      background: #f0f0f0;
      color: #333;
    }
    .qe-custom-toolbar .qe-btn.active {
      color: #111;
    }
    .qe-custom-toolbar .qe-btn svg {
      width: 15px;
      height: 15px;
    }
    .qe-custom-toolbar .qe-dropdown {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      background: #fff;
      font-size: 12px;
      color: #666;
      cursor: pointer;
      height: 24px;
      margin-right: 6px;
      font-family: system-ui, sans-serif;
    }
    .qe-custom-toolbar .qe-dropdown:hover {
      border-color: #ccc;
      color: #333;
    }
    .qe-custom-toolbar .qe-dropdown::after {
      content: '▾';
      font-size: 10px;
    }
    .qe-dropdown-menu {
      display: none;
      position: absolute;
      z-index: 100002;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
      padding: 4px 0;
      min-width: 140px;
      font-family: system-ui, sans-serif;
    }
    .qe-dropdown-menu.open { display: block; }
    .qe-dropdown-option {
      display: block;
      width: 100%;
      padding: 6px 12px;
      border: none;
      background: transparent;
      text-align: left;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      font-family: inherit;
    }
    .qe-dropdown-option:hover {
      background: #f0f0f0;
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

  const sep = () => {
    const s = document.createElement('span');
    s.className = 'qe-separator';
    return s;
  };

  function dispatchKey(key, opts = {}) {
    const editor = document.querySelector('.ProseMirror');
    if (!editor) return;
    const eventOpts = {
      key,
      code: `Key${key.toUpperCase()}`,
      bubbles: true,
      cancelable: true,
      ctrlKey: opts.ctrl || false,
      metaKey: opts.meta || false,
      shiftKey: opts.shift || false,
    };
    const isMac = /Mac/.test(navigator.platform);
    if (isMac) { eventOpts.metaKey = true; } else { eventOpts.ctrlKey = true; }
    editor.dispatchEvent(new KeyboardEvent('keydown', eventOpts));
  }

  const btn = (svg, title, action) => {
    const b = document.createElement('button');
    b.className = 'qe-btn';
    b.title = title;
    b.innerHTML = svg;
    b.addEventListener('mousedown', (e) => {
      e.preventDefault();
      action();
    });
    return b;
  };

  const textBtn = (label, title, action, style) => {
    const b = document.createElement('button');
    b.className = 'qe-btn';
    b.title = title;
    b.textContent = label;
    if (style) b.style.cssText = style;
    b.addEventListener('mousedown', (e) => { e.preventDefault(); action(); });
    return b;
  };

  const dropdown = document.createElement('button');
  dropdown.className = 'qe-dropdown';
  dropdown.textContent = 'Paragraph';
  dropdown.title = 'Block format';

  const formats = [
    { label: 'Paragraph', tag: 'p' },
    { label: 'Heading 1', tag: 'h1' },
    { label: 'Heading 2', tag: 'h2' },
    { label: 'Heading 3', tag: 'h3' },
    { label: 'Heading 4', tag: 'h4' },
    { label: 'Heading 5', tag: 'h5' },
    { label: 'Heading 6', tag: 'h6' },
    { label: 'Code Block', tag: 'pre' },
  ];

  function updateDropdownLabel() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    let node = sel.anchorNode;
    if (node && node.nodeType === 3) node = node.parentElement;
    if (!node) return;
    const block = node.closest('h1,h2,h3,h4,h5,h6,pre,p');
    if (!block) return;
    const tag = block.tagName.toLowerCase();
    const match = formats.find((f) => f.tag === tag);
    dropdown.textContent = match ? match.label : 'Paragraph';
  }

  document.addEventListener('selectionchange', updateDropdownLabel);

  const dropdownMenu = document.createElement('div');
  dropdownMenu.className = 'qe-dropdown-menu';
  formats.forEach(({ label, tag }) => {
    const opt = document.createElement('button');
    opt.className = 'qe-dropdown-option';
    opt.textContent = label;
    opt.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      document.execCommand('formatBlock', false, tag);
      dropdown.textContent = label;
      dropdownMenu.classList.remove('open');
    });
    dropdownMenu.appendChild(opt);
  });

  dropdown.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!document.body.contains(dropdownMenu)) {
      document.body.appendChild(dropdownMenu);
    }
    const rect = dropdown.getBoundingClientRect();
    dropdownMenu.style.position = 'fixed';
    dropdownMenu.style.top = `${rect.bottom + 4}px`;
    dropdownMenu.style.left = `${rect.left}px`;
    dropdownMenu.style.zIndex = '200000';
    dropdownMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('open');
    }
  });

  const svgs = {
    bold: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>',
    italic: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>',
    underline: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>',
    strikethrough: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>',
    superscript: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 7l5.5 8H5v2h7l-1.5-2.18L12 13l1.5 2.18L12 17h7v-2h-5.5L19 7h-4l-3 4.36L9 7H5zm14-4h-2v1h2v1h-2v1h3V3h-1z"/></svg>',
    subscript: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 7l5.5 8H5v2h7l-1.5-2.18L12 13l1.5 2.18L12 17h7v-2h-5.5L19 7h-4l-3 4.36L9 7H5zm14 10h-2v1h2v1h-2v1h3v-4h-1z"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
    unlink: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16v-2zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4.01 1.41-1.41L3.41 2.86 2 4.27z"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    alignLeft: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>',
    alignCenter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>',
    alignRight: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
  };

  const boldBtn = btn(svgs.bold, 'Bold', () => dispatchKey('b'));
  boldBtn.dataset.command = 'bold';
  const italicBtn = btn(svgs.italic, 'Italic', () => dispatchKey('i'));
  italicBtn.dataset.command = 'italic';
  const underlineBtn = btn(svgs.underline, 'Underline', () => dispatchKey('u'));
  underlineBtn.dataset.command = 'underline';
  const strikeBtn = btn(svgs.strikethrough, 'Strikethrough', () => dispatchKey('d', { shift: true }));
  strikeBtn.dataset.command = 'strikeThrough';
  const superBtn = btn(svgs.superscript, 'Superscript', () => dispatchKey('.', { shift: true }));
  superBtn.dataset.command = 'superscript';
  const subBtn = btn(svgs.subscript, 'Subscript', () => dispatchKey(',', { shift: true }));
  subBtn.dataset.command = 'subscript';
  const linkDialog = document.createElement('div');
  linkDialog.className = 'da-page-dialog';
  linkDialog.setAttribute('contenteditable', 'false');
  linkDialog.innerHTML = `
    <span class="palette-title">Edit link</span>
    <div class="palette-field">
      <span class="palette-label">URL</span>
      <input id="qe-link-url" class="palette-input" placeholder="https://...">
    </div>
    <div class="palette-field">
      <span class="palette-label">Display text</span>
      <input id="qe-link-text" class="palette-input" placeholder="Link text">
    </div>
    <div class="palette-field">
      <span class="palette-label">Title</span>
      <input id="qe-link-title" class="palette-input" placeholder="title">
    </div>
    <div class="palette-field" style="flex-direction:row;align-items:center;display:flex;gap:8px;">
      <input type="checkbox" id="qe-link-newtab" style="width:auto;margin:0;">
      <label for="qe-link-newtab" style="font-size:13px;font-weight:600;color:#000;cursor:pointer;">Open in New Window</label>
    </div>
    <div class="palette-actions">
      <button class="palette-btn-cancel">Cancel</button>
      <button class="palette-btn-ok">OK</button>
    </div>
  `;

  let savedSelection = null;

  linkDialog.querySelector('.palette-btn-cancel').addEventListener('click', () => {
    linkDialog.classList.remove('open');
  });

  linkDialog.querySelector('.palette-btn-ok').addEventListener('click', () => {
    const url = linkDialog.querySelector('#qe-link-url').value;
    const text = linkDialog.querySelector('#qe-link-text').value;
    const title = linkDialog.querySelector('#qe-link-title').value;
    const newTab = linkDialog.querySelector('#qe-link-newtab').checked;
    if (!url) { linkDialog.classList.remove('open'); return; }

    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }

    document.execCommand('createLink', false, url);

    const sel = window.getSelection();
    if (sel.anchorNode) {
      let node = sel.anchorNode;
      if (node.nodeType === 3) node = node.parentElement;
      const anchor = node.closest('a') || node.querySelector('a');
      if (anchor) {
        if (text) anchor.textContent = text;
        if (title) anchor.title = title;
        if (newTab) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; } else { anchor.removeAttribute('target'); anchor.removeAttribute('rel'); }
      }
    }

    linkDialog.classList.remove('open');
    savedSelection = null;
  });

  const linkBtn = btn(svgs.link, 'Add Link', () => {
    const sel = window.getSelection();
    if (sel.rangeCount) savedSelection = sel.getRangeAt(0).cloneRange();

    let existingUrl = '';
    let existingText = sel.toString() || '';
    let existingTitle = '';

    let node = sel.anchorNode;
    if (node && node.nodeType === 3) node = node.parentElement;
    const existingLink = node?.closest('a');
    if (existingLink) {
      existingUrl = existingLink.href || '';
      existingText = existingLink.textContent || '';
      existingTitle = existingLink.title || '';
    }

    linkDialog.querySelector('#qe-link-url').value = existingUrl;
    linkDialog.querySelector('#qe-link-text').value = existingText;
    linkDialog.querySelector('#qe-link-title').value = existingTitle;
    linkDialog.querySelector('#qe-link-newtab').checked = existingLink?.target === '_blank';

    if (!document.body.contains(linkDialog)) {
      document.body.appendChild(linkDialog);
    }
    const rect = linkBtn.getBoundingClientRect();
    Object.assign(linkDialog.style, {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${Math.max(8, rect.left - 100)}px`,
      zIndex: '200000',
    });
    linkDialog.classList.add('open');
    setTimeout(() => linkDialog.querySelector('#qe-link-url').focus(), 50);
  });
  linkBtn.dataset.command = 'link';

  document.addEventListener('click', (e) => {
    if (linkDialog.classList.contains('open') && !linkDialog.contains(e.target) && !linkBtn.contains(e.target)) {
      linkDialog.classList.remove('open');
    }
  });

  function updateActiveStates() {
    const cmds = ['bold', 'italic', 'underline', 'strikeThrough', 'superscript', 'subscript'];
    wrapper.querySelectorAll('.qe-btn[data-command]').forEach((b) => {
      const cmd = b.dataset.command;
      if (cmd === 'link') {
        const sel = window.getSelection();
        let node = sel?.anchorNode;
        if (node && node.nodeType === 3) node = node.parentElement;
        b.classList.toggle('active', !!node?.closest('a'));
      } else if (cmds.includes(cmd)) {
        b.classList.toggle('active', document.queryCommandState(cmd));
      }
    });
  }

  document.addEventListener('selectionchange', updateActiveStates);

  // Image insert dialog
  const imageDialog = document.createElement('div');
  imageDialog.className = 'da-page-dialog';
  imageDialog.setAttribute('contenteditable', 'false');
  imageDialog.innerHTML = `
    <span class="palette-title">Insert image</span>
    <div class="palette-field">
      <span class="palette-label">URL</span>
      <input id="qe-img-url" class="palette-input" placeholder="https://...">
    </div>
    <div class="palette-field">
      <span class="palette-label">Alt text</span>
      <input id="qe-img-alt" class="palette-input" placeholder="Describe this image...">
    </div>
    <div class="palette-actions">
      <button class="palette-btn-cancel">Cancel</button>
      <button class="palette-btn-ok">OK</button>
    </div>
  `;

  imageDialog.querySelector('.palette-btn-cancel').addEventListener('click', () => {
    imageDialog.classList.remove('open');
  });

  imageDialog.querySelector('.palette-btn-ok').addEventListener('click', () => {
    const url = imageDialog.querySelector('#qe-img-url').value;
    const alt = imageDialog.querySelector('#qe-img-alt').value || '';
    if (!url) { imageDialog.classList.remove('open'); return; }
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }
    document.execCommand('insertImage', false, url);
    const img = document.querySelector(`img[src="${url}"]`);
    if (img) img.alt = alt;
    imageDialog.classList.remove('open');
  });

  const imageBtn = btn(svgs.image, 'Insert Image', () => {
    const sel = window.getSelection();
    if (sel.rangeCount) savedSelection = sel.getRangeAt(0).cloneRange();
    imageDialog.querySelector('#qe-img-url').value = '';
    imageDialog.querySelector('#qe-img-alt').value = '';
    if (!document.body.contains(imageDialog)) {
      document.body.appendChild(imageDialog);
    }
    const rect = imageBtn.getBoundingClientRect();
    Object.assign(imageDialog.style, {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${Math.max(8, rect.left - 100)}px`,
      zIndex: '200000',
    });
    imageDialog.classList.add('open');
    setTimeout(() => imageDialog.querySelector('#qe-img-url').focus(), 50);
  });

  document.addEventListener('click', (e) => {
    if (imageDialog.classList.contains('open') && !imageDialog.contains(e.target) && !imageBtn.contains(e.target)) {
      imageDialog.classList.remove('open');
    }
  });

  wrapper.append(
    dropdown,
    sep(),
    boldBtn,
    italicBtn,
    underlineBtn,
    strikeBtn,
    superBtn,
    subBtn,
    textBtn('T,', 'Clear formatting', () => dispatchKey('\\', {}), 'font-size:11px;'),
    sep(),
    btn(svgs.code, 'Code', () => dispatchKey('e')),
    sep(),
    linkBtn,
    btn(svgs.unlink, 'Remove Link', () => document.execCommand('unlink')),
    sep(),
    imageBtn,
    sep(),
    btn(svgs.alignLeft, 'Align Left', () => document.execCommand('justifyLeft')),
    btn(svgs.alignCenter, 'Align Center', () => document.execCommand('justifyCenter')),
    btn(svgs.alignRight, 'Align Right', () => document.execCommand('justifyRight')),
    sep(),
    btn(svgs.undo, 'Undo', () => dispatchKey('z')),
    btn(svgs.redo, 'Redo', () => dispatchKey('z', { shift: true })),
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
