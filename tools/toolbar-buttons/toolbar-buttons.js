const PAGE_FIELDS = [
  { id: 'page-title', label: 'Title', prop: 'og:title', type: 'property' },
  { id: 'page-description', label: 'Description', prop: 'og:description', type: 'property', textarea: true },
  { id: 'page-template', label: 'Template', prop: 'template', type: 'name' },
  { id: 'page-breadcrumbs', label: 'Breadcrumbs', prop: 'breadcrumbs', type: 'name', placeholder: '/fragments/breadcrumbs' },
  { id: 'page-robots', label: 'Robots', prop: 'robots', type: 'name', placeholder: 'index, follow' },
];

function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .quick-edit-publish {
      display: flex;
      background: #0078d4;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 6px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .quick-edit-publish:hover { background: #0067b8; }
    .quick-edit-publish:disabled { background: #999; cursor: not-allowed; }
    .quick-edit-page-props {
      display: flex;
      background: #fff;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 6px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .quick-edit-page-props:hover { background: #f0f0f0; }
    .quick-edit-page-btn {
      display: flex;
      background: #fff;
      color: #333;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 6px 16px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }
    .quick-edit-page-btn:hover { background: #f0f0f0; }
    .da-page-dialog {
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
    .da-page-dialog.open { display: flex; flex-direction: column; }
    .da-page-dialog .palette-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 0 0 16px;
      color: #000;
    }
    .da-page-dialog .palette-field { margin-bottom: 12px; }
    .da-page-dialog .palette-label {
      font-size: 13px;
      font-weight: 600;
      color: #000;
      display: block;
      margin-bottom: 4px;
    }
    .da-page-dialog .palette-input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 8px;
      font-size: 14px;
      font-family: inherit;
    }
    .da-page-dialog .palette-input:focus {
      outline: none;
      border-color: #0078d4;
    }
    .da-page-dialog .palette-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
    .da-page-dialog .palette-actions button {
      padding: 8px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .da-page-dialog .palette-btn-cancel {
      border: 1px solid #ccc;
      background: #fff;
      color: #000;
    }
    .da-page-dialog .palette-btn-ok {
      border: 1px solid #0078d4;
      background: #0078d4;
      color: #fff;
    }
    .qe-edit-menu {
      display: none;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
      padding: 12px;
      min-width: 160px;
      font-family: system-ui, sans-serif;
    }
    .qe-edit-menu.open { display: flex; flex-direction: column; gap: 6px; }
    .qe-edit-menu .palette-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      color: #666;
      margin: 0 0 4px;
    }
    .qe-edit-menu .edit-option {
      padding: 8px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #fff;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
    }
    .qe-edit-menu .edit-option:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }
    .quick-edit-buttons { display: flex !important; }
    .quick-edit-buttons .quick-edit-page-btn,
    .quick-edit-buttons .quick-edit-page-props,
    .quick-edit-buttons .quick-edit-publish { display: flex !important; }
    .quick-edit-buttons .quick-edit-close,
    .quick-edit-buttons .quick-edit-exit,
    .quick-edit-buttons .quick-edit-preview { display: none !important; }
  `;
  document.head.appendChild(style);
}

function getHostParts() {
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

function getMetaValue(prop, type) {
  const attr = type === 'property' ? 'property' : 'name';
  const el = document.head.querySelector(`meta[${attr}="${prop}"]`);
  return el ? el.content : '';
}

function setMetaValue(prop, type, value) {
  const attr = type === 'property' ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${prop}"]`);
  if (value) {
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, prop);
      document.head.appendChild(el);
    }
    el.content = value;
  } else if (el) {
    el.remove();
  }
}

function createPageDialog() {
  const pageDialog = document.createElement('div');
  pageDialog.className = 'da-page-dialog';
  pageDialog.setAttribute('contenteditable', 'false');
  const fieldsHTML = PAGE_FIELDS.map((f) => {
    const input = f.textarea
      ? `<textarea id="${f.id}" class="palette-input" placeholder="${f.placeholder || ''}"></textarea>`
      : `<input id="${f.id}" class="palette-input" placeholder="${f.placeholder || ''}">`;
    return `<div class="palette-field"><span class="palette-label">${f.label}</span>${input}</div>`;
  }).join('');
  pageDialog.innerHTML = `
    <span class="palette-title">Page Settings</span>
    ${fieldsHTML}
    <div class="palette-actions">
      <button class="palette-btn-cancel">Cancel</button>
      <button class="palette-btn-ok">OK</button>
    </div>
  `;

  pageDialog.querySelector('.palette-btn-cancel').addEventListener('click', () => {
    pageDialog.classList.remove('open');
  });

  pageDialog.querySelector('.palette-btn-ok').addEventListener('click', () => {
    PAGE_FIELDS.forEach((f) => {
      const val = pageDialog.querySelector(`#${f.id}`).value;
      setMetaValue(f.prop, f.type, val);
    });
    const title = pageDialog.querySelector('#page-title').value;
    if (title) document.title = title;
    pageDialog.classList.remove('open');
  });

  document.addEventListener('click', (e) => {
    if (pageDialog.classList.contains('open') && !pageDialog.contains(e.target)) {
      pageDialog.classList.remove('open');
    }
  });

  return pageDialog;
}

function createPageButton(pageDialog) {
  const pageBtn = document.createElement('button');
  pageBtn.className = 'quick-edit-page-btn';
  pageBtn.textContent = 'Page';
  pageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.body.contains(pageDialog)) {
      document.body.appendChild(pageDialog);
    }
    PAGE_FIELDS.forEach((f) => {
      const input = pageDialog.querySelector(`#${f.id}`);
      input.value = getMetaValue(f.prop, f.type);
    });
    const titleInput = pageDialog.querySelector('#page-title');
    if (!titleInput.value) titleInput.value = document.title || '';

    const rect = pageBtn.getBoundingClientRect();
    pageDialog.style.position = 'absolute';
    pageDialog.style.top = `${rect.bottom + window.scrollY + 8}px`;
    pageDialog.style.left = `${Math.max(8, rect.left)}px`;
    pageDialog.classList.add('open');
    setTimeout(() => titleInput.focus(), 50);
  });
  return pageBtn;
}

function createEditButton() {
  const btn = document.createElement('button');
  btn.className = 'quick-edit-page-props';
  btn.textContent = 'Edit';

  const menu = document.createElement('div');
  menu.className = 'qe-edit-menu';
  menu.setAttribute('contenteditable', 'false');
  menu.innerHTML = `
    <span class="palette-title">Edit Mode</span>
    <button class="edit-option" data-mode="da-edit">DA Edit</button>
    <button class="edit-option" data-mode="quick-edit">Quick Edit</button>
    <button class="edit-option" data-mode="layout-mode">Layout Mode</button>
  `;

  menu.querySelectorAll('.edit-option').forEach((option) => {
    option.addEventListener('click', () => {
      const mode = option.dataset.mode;
      menu.classList.remove('open');
      const { owner, repo, pagePath } = getHostParts();
      if (mode === 'da-edit') {
        window.open(`https://da.live/edit#/${owner}/${repo}${pagePath}`, '_blank');
      } else {
        const base = window.location.origin + window.location.pathname;
        window.location.href = `${base}?${mode}=on`;
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== btn) {
      menu.classList.remove('open');
    }
  });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.body.contains(menu)) {
      document.body.appendChild(menu);
    }
    const rect = btn.getBoundingClientRect();
    Object.assign(menu.style, {
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top + 4}px`,
      left: `${rect.left}px`,
      top: 'auto',
      zIndex: '200000',
    });
    menu.classList.toggle('open');
  });

  return btn;
}

function createPublishButton() {
  const btn = document.createElement('button');
  btn.className = 'quick-edit-publish';
  btn.textContent = 'Publish';
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Publishing...';
    try {
      const { owner, repo, pagePath } = getHostParts();
      const resp = await fetch(`https://admin.hlx.page/live/${owner}/${repo}/main${pagePath}`, {
        method: 'POST',
        credentials: 'include',
      });
      btn.textContent = resp.ok ? 'Published!' : 'Failed';
    } catch {
      btn.textContent = 'Failed';
    }
    setTimeout(() => { btn.textContent = 'Publish'; btn.disabled = false; }, 2000);
  });
  return btn;
}

export default function injectToolbarButtons() {
  const buttonsBar = document.querySelector('.quick-edit-buttons');
  if (!buttonsBar || buttonsBar.querySelector('.quick-edit-publish')) return;

  addStyles();

  const pageDialog = createPageDialog();
  const pageBtn = createPageButton(pageDialog);
  const editBtn = createEditButton();
  const publishBtn = createPublishButton();

  const previewBtn = buttonsBar.querySelector('.quick-edit-preview');
  if (previewBtn) {
    previewBtn.after(pageBtn, editBtn, publishBtn);
  } else {
    buttonsBar.append(pageBtn, editBtn, publishBtn);
  }
}
