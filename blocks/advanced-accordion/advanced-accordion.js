export default function init(el) {
  const list = el.querySelector('.advanced-accordion ul');
  if (!list) {
    // eslint-disable-next-line no-console
    console.warn('Please add an unordered list to the advanced accordion block.');
    return;
  }

  const items = [...list.querySelectorAll('li')];

  const currSection = el.closest('.section');
  if (!currSection) return;

  const panelCount = items.length;
  const panels = [];
  let sibling = currSection.nextElementSibling;
  while (sibling && panels.length < panelCount) {
    if (sibling.querySelector('.advanced-accordion, .advanced-carousel, .advanced-tabs')) break;
    panels.push(sibling);
    sibling = sibling.nextElementSibling;
  }

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
