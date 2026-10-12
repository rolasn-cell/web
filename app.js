'use strict';
const stages=[
 {name:'Analyze',letter:'A',title:'Pahami kebutuhan. Temukan arah.',description:'Kenali masalah pembelajaran, karakteristik siswa, materi, dan teknologi yang dibutuhkan sebelum mulai merancang media.',items:['Analisis kebutuhan pembelajaran','Analisis karakteristik peserta didik','Analisis materi dan teknologi'],output:'Dokumen analisis kebutuhan',previewTitle:'Mulai dari kebutuhan belajar',previewDescription:'Temukan kebutuhan siswa sebagai dasar pengembangan media.',tasks:['Analisis kebutuhan pembelajaran','Analisis karakteristik siswa']},
 {name:'Blueprinting',letter:'B',title:'Rancang sebelum berkarya.',description:'Terjemahkan hasil analisis menjadi rancangan media dengan landasan pedagogis yang jelas. Dosen meninjau blueprint sebelum proses produksi dimulai.',items:['Susun storyboard dan flowchart','Lengkapi blueprint canvas','Ajukan review dan persetujuan dosen'],output:'Blueprint media pembelajaran yang disetujui',previewTitle:'Rancang sebelum berkarya',previewDescription:'Susun ide dan alur pembelajaran dalam blueprint yang utuh.',tasks:['Storyboard pembelajaran','Blueprint canvas']},
 {name:'Digital Design',letter:'D',title:'Wujudkan rancangan menjadi karya.',description:'Kembangkan media digital berdasarkan blueprint. Gunakan aplikasi pilihanmu, lalu dokumentasikan draft, revisi, dan produk final di LMS.',items:['Produksi media sesuai blueprint','Unggah draft dan catat revisi','Siapkan produk untuk implementasi'],output:'Produk media pembelajaran digital',previewTitle:'Dari blueprint menjadi media',previewDescription:'Dokumentasikan versi karya dari draft awal sampai produk final.',tasks:['Draft media digital','Revisi berdasarkan feedback']},
 {name:'Interactive Implementation',letter:'I',title:'Uji bersama. Belajar bersama.',description:'Implementasikan media melalui diskusi, kolaborasi, dan peer teaching. Dapatkan masukan dari teman sejawat untuk melihat cara media bekerja dalam pembelajaran.',items:['Diskusi dan kolaborasi kelompok','Praktik peer teaching','Peer assessment dan peer feedback'],output:'Hasil implementasi dan umpan balik sejawat',previewTitle:'Kembangkan lewat kolaborasi',previewDescription:'Temukan perspektif baru melalui diskusi dan praktik bersama.',tasks:['Diskusi kelompok','Penilaian teman sejawat']},
 {name:'Evaluation & Enhancement',letter:'E',title:'Refleksikan proses. Sempurnakan hasil.',description:'Gunakan hasil implementasi dan umpan balik untuk merevisi media. Catat refleksi belajar dan rangkum perkembanganmu dalam portofolio digital.',items:['Tulis jurnal refleksi terstruktur','Revisi media berdasarkan umpan balik','Selesaikan evaluasi dan portofolio'],output:'Media final, jurnal refleksi, dan portofolio digital',previewTitle:'Jadikan masukan sebagai perbaikan',previewDescription:'Refleksikan pengalaman belajar dan sempurnakan karya akhirmu.',tasks:['Jurnal refleksi','Revisi final media']}
];

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const heroMotionQuery = window.matchMedia('(min-width: 1001px) and (min-height: 700px)');
const root = document.documentElement;
const motionButton = document.querySelector('.motion-toggle');
let manualPause = false;
try { manualPause = localStorage.getItem('abdie-motion-paused') === 'true'; } catch {}
let motionPaused = manualPause || motionQuery.matches;
const activeAnimations = new Map();

function animatePanel(element) {
  activeAnimations.get(element)?.cancel();
  if (motionPaused || !element.animate) return;
  const animation = element.animate([
    {opacity: .35, transform: 'translateY(9px)'},
    {opacity: 1, transform: 'translateY(0)'}
  ], {duration: 380, easing: 'cubic-bezier(.22,1,.36,1)'});
  activeAnimations.set(element, animation);
  animation.onfinish = () => activeAnimations.delete(element);
}

function activate(group, index, focus = false) {
  const buttons = [...document.querySelectorAll(`[data-${group}]`)];
  if (!Number.isInteger(index) || index < 0 || index >= stages.length) return;
  const data = stages[index];
  buttons.forEach((button, i) => {
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
    const symbol = button.querySelector('.method-symbol');
    if (symbol) symbol.textContent = i === index ? '−' : '+';
  });
  const panel = document.getElementById(`${group}-panel`);
  panel.setAttribute('aria-labelledby', `${group}-tab-${index}`);
  if (group === 'method') {
    document.getElementById('method-kicker').textContent = `TAHAP 0${index + 1} / ${data.name.toUpperCase()}`;
    document.getElementById('method-letter').textContent = data.letter;
    document.getElementById('method-title').textContent = data.title;
    document.getElementById('method-description').textContent = data.description;
    document.getElementById('method-output').textContent = data.output;
    document.getElementById('method-list').replaceChildren(...data.items.map(text => {
      const item = document.createElement('li'); item.textContent = text; return item;
    }));
  } else {
    document.getElementById('demo-title').textContent = data.title;
    document.getElementById('preview-name').textContent = data.name;
    document.getElementById('preview-description').textContent = data.previewDescription;
    const step = document.getElementById('demo-step');
    step.replaceChildren(document.createTextNode(`0${index + 1}`));
    const total = document.createElement('span'); total.textContent = '/05'; step.append(total);
    data.tasks.forEach((text, i) => document.getElementById(`preview-task-${i + 1}`).textContent = text);
    document.querySelector('.demo-progress i').style.width = `${(index + 1) * 20}%`;
  }
  animatePanel(panel);
  if (focus) buttons[index].focus({preventScroll: true});
}

for (const group of ['method', 'preview']) {
  const buttons = [...document.querySelectorAll(`[data-${group}]`)];
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => activate(group, index));
    button.addEventListener('keydown', event => {
      const forward = group === 'method' ? 'ArrowDown' : 'ArrowRight';
      const back = group === 'method' ? 'ArrowUp' : 'ArrowLeft';
      let next = index;
      if (event.key === forward) next = (index + 1) % buttons.length;
      else if (event.key === back) next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault(); activate(group, next, true);
    });
  });
}

// Mobile navigation: Escape returns focus to the menu toggle.
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
const header = document.querySelector('.site-header');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Buka menu');
  navigation.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {closeMenu(); menuToggle.focus();}
});
window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Manual carousel: native touch scrolling, pointer dragging, buttons and keyboard.
const track = document.getElementById('feature-track');
const cards = [...track.querySelectorAll('.feature-card')];
const prev = document.querySelector('.carousel-prev');
const next = document.querySelector('.carousel-next');
const carouselPosition = document.querySelector('.carousel-position');
const carouselBar = document.querySelector('.carousel-progress i');
let trackFrame = 0;
function updateCarousel() {
  const max = Math.max(0, track.scrollWidth - track.clientWidth);
  const ratio = max ? Math.max(0, Math.min(1, track.scrollLeft / max)) : 0;
  prev.disabled = track.scrollLeft <= 2;
  next.disabled = track.scrollLeft >= max - 2;
  // The index follows the leading card and reaches the last card at the rail's end.
  const index = max === 0 ? 0 : Math.min(cards.length - 1, Math.round(ratio * (cards.length - 1)));
  const label = `0${index + 1} / 0${cards.length}`;
  if (carouselPosition.textContent !== label) carouselPosition.textContent = label;
  carouselBar.style.left = `${ratio * 75}%`;
}
function scrollCards(direction) {
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  const amount = cards[0].getBoundingClientRect().width + gap;
  track.scrollBy({left: direction * amount, behavior: motionPaused ? 'auto' : 'smooth'});
}
prev.addEventListener('click', () => scrollCards(-1));
next.addEventListener('click', () => scrollCards(1));
track.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); scrollCards(event.key === 'ArrowRight' ? 1 : -1);
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault();
    track.scrollTo({left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: motionPaused ? 'auto' : 'smooth'});
  }
});
track.addEventListener('scroll', () => {
  if (!trackFrame) trackFrame = requestAnimationFrame(() => {trackFrame = 0; updateCarousel();});
}, {passive: true});
let drag = null;
track.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0) return;
  drag = {id: event.pointerId, x: event.clientX, left: track.scrollLeft};
  track.classList.add('is-dragging');
  track.setPointerCapture(event.pointerId);
});
track.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  track.scrollLeft = drag.left - (event.clientX - drag.x);
});
function endDrag(event) {
  if (!drag || event.pointerId !== drag.id) return;
  if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
  drag = null; track.classList.remove('is-dragging');
}
track.addEventListener('pointerup', endDrag);
track.addEventListener('pointercancel', endDrag);
track.addEventListener('lostpointercapture', () => {drag = null; track.classList.remove('is-dragging');});

// FAQ keeps semantic <details> behavior and animates its answer height only.
const faqAnimations = new Map();
function finishFaq(record) {
  record.animation?.cancel();
  record.details.open = record.target;
  record.answer.style.height = '';
  faqAnimations.delete(record.details);
}
document.querySelectorAll('.faq-item').forEach(details => {
  const summary = details.querySelector('summary');
  const answer = details.querySelector('.faq-answer');
  summary.addEventListener('click', event => {
    if (motionPaused || !answer.animate) return; // Native keyboard/click behavior remains.
    event.preventDefault();
    const previous = faqAnimations.get(details);
    const target = previous ? !previous.target : !details.open;
    const startHeight = details.open ? answer.getBoundingClientRect().height : 0;
    previous?.animation.cancel();
    details.open = true;
    const endHeight = target ? answer.scrollHeight : 0;
    const animation = answer.animate([{height: `${startHeight}px`, opacity: target ? .4 : 1}, {height: `${endHeight}px`, opacity: target ? 1 : .4}], {duration: 320, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards'});
    const record = {details, answer, target, animation}; faqAnimations.set(details, record);
    animation.onfinish = () => finishFaq(record);
  });
});

// Scroll transforms use one scheduled frame per event, never a continuous animation loop.
const hero = document.querySelector('.hero-shell');
const readProgress = document.querySelector('.reading-progress span');
const navLinks = [...navigation.querySelectorAll('a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
let scrollFrame = 0;
function updateScroll() {
  const scroll = window.scrollY;
  header.classList.toggle('is-scrolled', scroll > 45);
  const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  readProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, scroll / range))})`;
  const heroProgress = !motionPaused && heroMotionQuery.matches ? Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / 300)) : 0;
  hero.style.setProperty('--hero-progress', String(heroProgress));
  let current = -1;
  sections.forEach((section, index) => {if (section.getBoundingClientRect().top < window.innerHeight * .4) current = index;});
  navLinks.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}
function scheduleScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(() => {scrollFrame = 0; updateScroll();});
}
window.addEventListener('scroll', scheduleScroll, {passive: true});
window.addEventListener('resize', () => {scheduleScroll(); updateCarousel();}, {passive: true});

const tiltCard = document.querySelector('[data-tilt]');
let tiltFrame = 0;
function resetTilt() {
  cancelAnimationFrame(tiltFrame); tiltFrame = 0;
  tiltCard.style.setProperty('--tilt-x', '0deg'); tiltCard.style.setProperty('--tilt-y', '0deg');
}
tiltCard.addEventListener('pointermove', event => {
  if (motionPaused || !finePointer.matches || event.pointerType === 'touch') return;
  const rect = tiltCard.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - .5;
  const y = (event.clientY - rect.top) / rect.height - .5;
  cancelAnimationFrame(tiltFrame);
  tiltFrame = requestAnimationFrame(() => {
    tiltCard.style.setProperty('--tilt-x', `${x * 3}deg`);
    tiltCard.style.setProperty('--tilt-y', `${-y * 3}deg`);
  });
});
tiltCard.addEventListener('pointerleave', resetTilt);
finePointer.addEventListener('change', resetTilt);

let revealObserver = null;
if ('IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {threshold: .1, rootMargin: '0px 0px -25px 0px'});
  document.querySelectorAll('[data-reveal]').forEach(element => revealObserver.observe(element));
  root.classList.add('motion-ready');
}
function setMotionPreference() {
  motionPaused = manualPause || motionQuery.matches;
  root.classList.toggle('motion-off', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  const label = motionQuery.matches ? 'Animasi dikurangi sesuai pengaturan perangkat' : motionPaused ? 'Aktifkan animasi' : 'Jeda animasi';
  motionButton.setAttribute('aria-label', label);
  motionButton.title = label;
  motionButton.disabled = motionQuery.matches;
  root.style.scrollBehavior = motionPaused ? 'auto' : '';
  if (motionPaused) {
    activeAnimations.forEach(animation => animation.cancel()); activeAnimations.clear();
    [...faqAnimations.values()].forEach(finishFaq);
    resetTilt();
  }
  scheduleScroll();
}
motionButton.addEventListener('click', () => {
  if (motionQuery.matches) return;
  manualPause = !manualPause;
  try { localStorage.setItem('abdie-motion-paused', String(manualPause)); } catch {}
  setMotionPreference();
});
motionQuery.addEventListener('change', setMotionPreference);
// Make every tab's full name available to assistive technology.
document.querySelectorAll('[data-preview]').forEach((button, index) => button.setAttribute('aria-label', stages[index].name));
document.getElementById('year').textContent = new Date().getFullYear();
setMotionPreference(); updateCarousel(); updateScroll();
