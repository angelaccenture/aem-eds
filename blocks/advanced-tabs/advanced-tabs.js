import { getConfig } from '../../scripts/ak.js';

const { log } = getConfig();

function switchTab(tabList, tabPanels, idx) {
  tabList.querySelectorAll('button')
    .forEach((button) => { button.classList.remove('is-active'); });
  tabPanels.forEach((sec) => { sec.classList.remove('is-visible'); });
  tabPanels[idx]?.classList.add('is-visible');
  tabList.children[idx]?.classList.add('is-active');
}

function getTabList(tabs, tabPanels) {
  const tabItems = tabs.querySelectorAll('li');
  const tabList = document.createElement('div');
  tabList.className = 'tab-list';
  tabList.role = 'tablist';

  const tabNames = [];

  for (const [idx, tab] of tabItems.entries()) {
    const btn = document.createElement('button');
    btn.role = 'tab';
    btn.id = `tab-${idx + 1}`;
    btn.textContent = tab.textContent;
    tabNames.push(tab.textContent.trim().replace(/\s+/g, '-'));
    if (idx === 0) {
      btn.classList.add('is-active');
      tabPanels[0].classList.add('is-visible');
    }
    tabList.append(btn);

    btn.addEventListener('click', () => {
      switchTab(tabList, tabPanels, idx);
    });
  }

  // Hash navigation — switch tab when URL hash matches a tab name
  function handleHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const matchIdx = tabNames.findIndex(
      (name) => name.toLowerCase() === hash.toLowerCase(),
    );
    if (matchIdx >= 0) switchTab(tabList, tabPanels, matchIdx);
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();

  // Intercept clicks on links with tab hash (e.g. #Add-ons)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;
    const hash = link.getAttribute('href').split('#')[1];
    if (!hash) return;
    const matchIdx = tabNames.findIndex(
      (name) => name.toLowerCase() === hash.toLowerCase(),
    );
    if (matchIdx >= 0) {
      e.preventDefault();
      switchTab(tabList, tabPanels, matchIdx);
      window.history.replaceState(null, '', `#${hash}`);
    }
  });

  return tabList;
}

export default function init(el) {
  // Find the top most parent where all tab sections live
  const parent = el.closest('.fragment-content, main');

  // Forcefully hide parent because sections may not be loaded yet
  parent.style = 'display: none;';

  // Find the tab items from THIS block instance (not global)
  const tabs = el.querySelector('.advanced-tabs ul');
  if (!tabs) {
    log('Please add an unordered list to the advanced tabs block.');
    parent.removeAttribute('style');
    return;
  }

  // Find the section that contains this tabs block
  const currSection = el.closest('.section');
  currSection.classList.add('tab-section');

  // Count tab items from THIS instance
  const tabCount = tabs.querySelectorAll('li').length;

  // Walk only immediately following sibling sections to collect tab panels
  // This ensures each tabs block only claims its own adjacent sections
  const tabPanels = [];
  let sibling = currSection.nextElementSibling;
  while (sibling && tabPanels.length < tabCount) {
    // Stop if we hit another container block (carousel or tabs)
    if (sibling.querySelector('.advanced-carousel, .advanced-tabs')) break;

    sibling.classList.add('tab-section');
    tabPanels.push(sibling);
    sibling = sibling.nextElementSibling;
  }

  const tabList = getTabList(tabs, tabPanels);

  tabs.remove();
  el.append(tabList, ...tabPanels);
  parent.removeAttribute('style');
}
