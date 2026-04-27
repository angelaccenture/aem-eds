import { getConfig } from '../../scripts/ak.js';

const { log } = getConfig();

let carouselInstanceId = 0;

function updateNavButtons(prevBtn, nextBtn, activeIndex, total) {
  prevBtn.disabled = activeIndex === 0;
  nextBtn.disabled = activeIndex === total - 1;
}

function goToSlide(index, carouselList, carouselPanels, prevBtn, nextBtn) {
  const buttons = carouselList.querySelectorAll('.carousel-slide-indicator button');
  buttons.forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-selected', 'false');
  });
  carouselPanels.forEach((sec) => { sec.classList.remove('is-visible'); });

  buttons[index].classList.add('is-active');
  buttons[index].setAttribute('aria-selected', 'true');
  carouselPanels[index].classList.add('is-visible');
  updateNavButtons(prevBtn, nextBtn, index, carouselPanels.length);
}

function getActiveIndex(carouselList) {
  const buttons = [...carouselList.querySelectorAll('.carousel-slide-indicator button')];
  return buttons.findIndex((btn) => btn.classList.contains('is-active'));
}

function getCarouselList(carousel, carouselPanels, instanceId) {
  const carouselItems = carousel.querySelectorAll('li');
  const carouselList = document.createElement('div');
  carouselList.className = 'carousel-list carousel-slide-indicators';
  carouselList.role = 'tablist';

  for (const [idx, item] of carouselItems.entries()) {
    const indicator = document.createElement('div');
    indicator.className = 'carousel-slide-indicator';

    const btn = document.createElement('button');
    btn.role = 'tab';
    btn.id = `carousel-${instanceId}-${idx + 1}`;
    btn.setAttribute('aria-controls', `carouselpanel-${instanceId}-${idx + 1}`);
    btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    btn.textContent = item.textContent;
    if (idx === 0) {
      btn.classList.add('is-active');
      carouselPanels[0]?.classList.add('is-visible');
    }
    indicator.append(btn);
    carouselList.append(indicator);
  }
  return carouselList;
}

function createPlayPauseButton() {
  const btn = document.createElement('button');
  btn.className = 'carousel-play-pause is-playing';
  btn.setAttribute('aria-label', 'Pause autoplay');
  return btn;
}

function createNavButtons() {
  const nav = document.createElement('div');
  nav.className = 'carousel-navigation-buttons';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'slide-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.disabled = true;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'slide-next';
  nextBtn.setAttribute('aria-label', 'Next slide');

  const playPauseBtn = createPlayPauseButton();

  nav.append(prevBtn, nextBtn);
  return { nav, prevBtn, nextBtn, playPauseBtn };
}

export default function init(el) {
  const instanceId = carouselInstanceId;
  carouselInstanceId += 1;

  const carousel = el.querySelector('.advanced-carousel ul');
  if (!carousel) {
    log('Please add an unordered list to the advanced carousel block.');
    return;
  }

  const currSection = el.closest('.section');
  currSection.classList.add('carouselSection');

  // Count expected slides from the list items
  const carouselCount = carousel.querySelectorAll('li').length;

  // Walk only immediately following sibling sections to collect slides
  // This ensures each carousel only claims its own adjacent slides
  const carouselPanels = [];
  let sibling = currSection.nextElementSibling;
  while (sibling && carouselPanels.length < carouselCount) {
    // Stop if we hit another container block (carousel or tabs)
    if (sibling.querySelector('.advanced-carousel, .advanced-tabs')) break;

    sibling.classList.add('carouselSection');
    sibling.id = `carouselpanel-${instanceId}-${carouselPanels.length + 1}`;
    sibling.role = 'tabpanel';
    sibling.setAttribute('aria-labelledby', `carousel-${instanceId}-${carouselPanels.length + 1}`);
    carouselPanels.push(sibling);
    sibling = sibling.nextElementSibling;
  }

  const carouselList = getCarouselList(carousel, carouselPanels, instanceId);
  const { nav, prevBtn, nextBtn, playPauseBtn } = createNavButtons();

  // Autoplay
  const AUTOPLAY_INTERVAL = 6000;
  let autoplayTimer = null;

  function advanceSlide() {
    const activeIndex = getActiveIndex(carouselList);
    const nextIndex = (activeIndex + 1) % carouselPanels.length;
    goToSlide(nextIndex, carouselList, carouselPanels, prevBtn, nextBtn);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    playPauseBtn.classList.remove('is-playing');
    playPauseBtn.setAttribute('aria-label', 'Play autoplay');
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(advanceSlide, AUTOPLAY_INTERVAL);
    playPauseBtn.classList.add('is-playing');
    playPauseBtn.setAttribute('aria-label', 'Pause autoplay');
  }

  // Wire up play/pause button
  playPauseBtn.addEventListener('click', () => {
    if (autoplayTimer) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  // Wire up indicator button clicks
  carouselList.querySelectorAll('.carousel-slide-indicator button').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(idx, carouselList, carouselPanels, prevBtn, nextBtn);
    });
  });

  // Wire up prev/next buttons
  prevBtn.addEventListener('click', () => {
    stopAutoplay();
    const activeIndex = getActiveIndex(carouselList);
    if (activeIndex > 0) {
      goToSlide(activeIndex - 1, carouselList, carouselPanels, prevBtn, nextBtn);
    }
  });

  nextBtn.addEventListener('click', () => {
    stopAutoplay();
    const activeIndex = getActiveIndex(carouselList);
    if (activeIndex < carouselPanels.length - 1) {
      goToSlide(activeIndex + 1, carouselList, carouselPanels, prevBtn, nextBtn);
    }
  });

  carousel.remove();
  // Place indicators and play/pause between prev and next: [prev] [indicators] [play/pause] [next]
  const nextBtn2 = nav.querySelector('.slide-next');
  nav.insertBefore(carouselList, nextBtn2);
  nav.insertBefore(playPauseBtn, nextBtn2);
  el.append(...carouselPanels, nav);

  // Start autoplay
  startAutoplay();
}
