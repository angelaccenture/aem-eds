function buildPostMeta(main) {
  const h1 = main.querySelector('h1');
  if (!h1) return;

  const metaEl = h1.nextElementSibling;
  if (!metaEl) return;

  metaEl.classList.add('blog-post-meta');
}

function buildHeroImage(main) {
  const h1 = main.querySelector('h1');
  if (!h1) return;

  const section = h1.closest('.section');
  if (!section) return;

  const pic = section.querySelector('picture');
  if (!pic) return;

  const wrapper = pic.closest('p') || pic.parentElement;
  wrapper.classList.add('blog-hero-image');
}

function buildShareBar(main) {
  const ul = main.querySelector('.section > .default-content > ul');
  if (!ul) return;

  const links = ul.querySelectorAll('a');
  const hasShareLinks = [...links].some(
    (a) => /facebook|twitter|linkedin|threads/i.test(a.href),
  );
  if (!hasShareLinks) return;

  ul.classList.add('blog-share-bar');
}

function buildBlockquotes(main) {
  main.querySelectorAll('blockquote').forEach((bq) => {
    bq.classList.add('blog-quote');
  });
}

function buildTags(main) {
  const paragraphs = main.querySelectorAll('p');
  const tagsP = [...paragraphs].find(
    (p) => p.textContent.trim().startsWith('Tags:'),
  );
  if (!tagsP) return;

  tagsP.classList.add('blog-tags');
}

function buildAuthorBio(main) {
  const paragraphs = [...main.querySelectorAll('p')];
  const bioP = paragraphs.find((p) => {
    const em = p.querySelector(':scope > em > span, :scope > em');
    return em && em.textContent.length > 100;
  });
  if (!bioP) return;

  bioP.classList.add('blog-author-bio');
}

function buildArticleWrapper(main) {
  const sections = main.querySelectorAll(':scope > .section');
  sections.forEach((section) => {
    section.classList.add('blog-article-section');
  });
}

export default function init() {
  const main = document.querySelector('main');
  if (!main) return;

  buildArticleWrapper(main);
  buildPostMeta(main);
  buildHeroImage(main);
  buildShareBar(main);
  buildBlockquotes(main);
  buildTags(main);
  buildAuthorBio(main);
}
