export default function init(el) {
  const parent = el.closest('.fragment-content, main');

  const list = el.querySelector('.advanced-accordion ul');
  if (!list) {
    // eslint-disable-next-line no-console
    console.warn('Please add an unordered list to the advanced accordion block.');
    return;
  }

  const items = [...list.querySelectorAll('li')];
  // Collect subsequent sibling sections as accordion panels
  const blockSection = el.closest('.section .advanced-accordion')?.closest('.section');
  if (blockSection) blockSection.classList.add('accordion-owner');

  const sibSections = [...parent.querySelectorAll('.accordion-owner ~ .section')];
  const panels = sibSections.slice(0, items.length);
  panels.forEach((s) => s.classList.add('accordion-panel'));

  // Build accordion from details/summary
  const accordion = document.createElement('div');
  accordion.className = 'accordion-items';

  items.forEach((item, idx) => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = item.textContent;
    details.append(summary);

    if (panels[idx]) {
      const body = document.createElement('div');
      body.className = 'accordion-item-body';
      body.append(...panels[idx].childNodes);
      details.append(body);
      panels[idx].remove();
    }

    accordion.append(details);
  });

  list.remove();
  el.append(accordion);
}
