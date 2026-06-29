/* ===== Wonderful Car — App Logic ===== */

const DEFAULT_CAR_IMAGE = '/assets/cars/dacia-sandero.jpg';

let CARS = [];

const FALLBACK_SETTINGS = {
  brandName: 'Wonderful',
  brandAccent: 'Car',
  logoIcon: 'WC',
  logoUrl: '',
  phone: '+212 625 699 723',
  whatsapp: '212625699723',
  email: 'contact@wonderfulcar.ma',
  address: "Route de l'Aéroport, Fès 30000\nMaroc",
  city: 'Fès',
  mapUrl:
    'https://www.google.com/maps/place/Wonderful+car/@34.0118964,-4.9883199,17z/data=!3m6!1s0xd9f8b820ef15e9b:0x42def445d4b05c24!8m2!3d34.0118964!4d-4.9883199',
  metaTitle: 'Wonderful Car | Location de Voitures à Fès',
  metaDescription:
    'Wonderful Car — Location de voitures à Fès, Maroc. Véhicules récents, assurance tous risques, livraison aéroport 24/7. À partir de 199 DH/jour.',
  heroBadge: 'Disponible 24h/24 — Fès, Maroc',
  heroDescription:
    "Wonderful Car vous propose des véhicules récents avec assurance tous risques. Livraison gratuite à l'aéroport Fès-Saïss et dans toute la ville.",
  openingHours: 'Ouvert 24h/24, 7j/7',
  heroVideoUrl: '7727416-hd_1280_720_50fps.mp4',
  footerTagline: 'Location de voitures premium à Fès, Maroc. Véhicules récents, service 24/7.',
  contactTitle: 'Retrouvez-nous à Fès',
};

let SITE_SETTINGS = { ...FALLBACK_SETTINGS };

async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && data.brandName) {
        SITE_SETTINGS = data;
        return;
      }
    }
  } catch {
    /* use fallback */
  }
  SITE_SETTINGS = { ...FALLBACK_SETTINGS };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fullBrandName(settings = SITE_SETTINGS) {
  return settings.brandAccent
    ? `${settings.brandName} ${settings.brandAccent}`.trim()
    : settings.brandName.trim();
}

function updateLogoEl(logo, settings, brandFull) {
  let img = logo.querySelector('.logo-img');
  const icon = logo.querySelector('.logo-icon');
  const text = logo.querySelector('.logo-text');

  if (settings.logoUrl) {
    if (!img) {
      img = document.createElement('img');
      img.className = 'logo-img';
      logo.insertBefore(img, logo.firstChild);
    }
    img.src = settings.logoUrl;
    img.alt = brandFull;
    img.style.display = 'block';
    if (icon) icon.style.display = 'none';
    if (text) text.style.display = 'none';
  } else {
    if (img) img.style.display = 'none';
    if (icon) {
      icon.textContent = settings.logoIcon || settings.brandName.slice(0, 2).toUpperCase();
      icon.style.display = '';
    }
    if (text) {
      text.innerHTML = settings.brandAccent
        ? `${escapeHtml(settings.brandName)}<span>${escapeHtml(settings.brandAccent)}</span>`
        : escapeHtml(settings.brandName);
      text.style.display = '';
    }
  }
}

function applySettings() {
  const s = SITE_SETTINGS;
  const brandFull = fullBrandName(s);

  document.title = s.metaTitle;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', s.metaDescription);

  const loaderLogo = document.querySelector('.loader-logo');
  if (loaderLogo) {
    loaderLogo.innerHTML = s.brandAccent
      ? `${escapeHtml(s.brandName)}<span>${escapeHtml(s.brandAccent)}</span>`
      : escapeHtml(s.brandName);
  }

  document.querySelectorAll('.logo').forEach((logo) => updateLogoEl(logo, s, brandFull));

  document.querySelectorAll('[data-setting]').forEach((el) => {
    const key = el.dataset.setting;
    if (key === 'copyright') return;

    let val = s[key];
    if (key === 'footerAddress') val = s.address.split('\n')[0];
    if (val == null) return;

    if (key === 'address') {
      el.innerHTML = escapeHtml(val).replace(/\n/g, '<br />');
    } else {
      el.textContent = val;
    }
  });

  const copyright = document.querySelector('[data-setting="copyright"]');
  if (copyright) {
    copyright.innerHTML = `&copy; ${new Date().getFullYear()} ${escapeHtml(brandFull)}. Tous droits réservés.`;
  }

  const telDigits = s.phone.replace(/\D/g, '');
  const telHref = telDigits ? `tel:+${telDigits}` : '#';
  document.querySelectorAll('[data-setting-link="tel"]').forEach((a) => {
    a.href = telHref;
  });

  document.querySelectorAll('[data-setting-link="whatsapp"]').forEach((a) => {
    const base = `https://wa.me/${s.whatsapp}`;
    if (a.classList.contains('whatsapp-float')) {
      a.href = `${base}?text=${encodeURIComponent(`Bonjour, je souhaite louer une voiture chez ${brandFull}.`)}`;
    } else {
      a.href = base;
    }
  });

  document.querySelectorAll('[data-setting-link="mailto"]').forEach((a) => {
    a.href = `mailto:${s.email}`;
  });

  document.querySelectorAll('[data-setting-link="map"]').forEach((a) => {
    a.href = s.mapUrl;
  });

  const mapWrap = document.querySelector('.map-wrap');
  if (mapWrap) mapWrap.dataset.mapUrl = s.mapUrl;

  const mapIframe = document.querySelector('.map-wrap iframe');
  if (mapIframe) mapIframe.title = `${brandFull} sur Google Maps`;

  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && s.heroVideoUrl) heroVideo.src = s.heroVideoUrl;
}

async function loadFallbackCars() {
  try {
    const res = await fetch('/data/cars.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((car, index) => ({ id: index + 1, ...car }));
      }
    }
  } catch {
    /* no fallback file */
  }
  return [];
}

async function loadCars() {
  try {
    const res = await fetch('/api/cars');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        CARS = data;
        return;
      }
    }
  } catch {
    /* use fallback */
  }
  CARS = await loadFallbackCars();
}

let activeCategory = 'all';
let selectedCar = null;
let testimonialIndex = 0;

/* ===== DOM Ready ===== */
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  applySettings();
  initLoader();
  initHeroVideo();
  initMap();
  initParticles();
  initCursorGlow();
  initHeader();
  initNav();
  initScrollReveal();
  initCounters();
  await loadCars();
  initFleet();
  initSearch();
  initTestimonials();
  initModal();
  initForms();
  initScrollButtons();
  setMinDates();
});

/* ===== Google Maps ===== */
function initMap() {
  const wrap = document.querySelector('.map-wrap');
  if (!wrap) return;

  const mapUrl = wrap.dataset.mapUrl;
  if (!mapUrl) return;

  const iframe = wrap.querySelector('iframe');
  if (iframe) {
    iframe.src = buildGoogleMapsEmbed(mapUrl);
  }

  document.querySelectorAll('.map-external-link').forEach((link) => {
    link.href = mapUrl;
  });
}

function buildGoogleMapsEmbed(url) {
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const placeIdMatch = url.match(/!1s(0x[a-f0-9]+:0x[a-f0-9]+)/i);
  const placeNameMatch = url.match(/\/place\/([^/@]+)/);

  const lat = coordMatch?.[1];
  const lng = coordMatch?.[2];
  const placeId = placeIdMatch?.[1];
  const placeName = decodeURIComponent((placeNameMatch?.[1] || 'Location').replace(/\+/g, ' '));

  if (placeId && lat && lng) {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${encodeURIComponent(placeId)}!2s${encodeURIComponent(placeName)}!5e0!3m2!1sfr!2sma!4v${Date.now()}!5m2!1sfr!2sma`;
  }

  if (lat && lng) {
    const query = encodeURIComponent(placeName);
    return `https://maps.google.com/maps?q=${query}&ll=${lat},${lng}&z=16&output=embed&hl=fr`;
  }

  return url;
}

/* ===== Hero Video ===== */
function initHeroVideo() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  const playVideo = () => {
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        const resume = () => {
          video.play().catch(() => {});
        };
        document.addEventListener('click', resume, { once: true });
        document.addEventListener('touchstart', resume, { once: true });
      });
    }
  };

  if (video.readyState >= 2) {
    playVideo();
  } else {
    video.addEventListener('loadeddata', playVideo, { once: true });
    video.addEventListener('canplay', playVideo, { once: true });
  }
}

/* ===== Loader ===== */
function initLoader() {
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('loaded'), 800);
  });
}

/* ===== Particles ===== */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${8 + Math.random() * 12}s`;
    p.style.animationDelay = `${Math.random() * 10}s`;
    container.appendChild(p);
  }
}

/* ===== Cursor Glow ===== */
function initCursorGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!window.matchMedia('(pointer: fine)').matches) {
    glow.style.display = 'none';
    return;
  }
  let ticking = false;
  document.addEventListener('mousemove', (e) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
        ticking = false;
      });
      ticking = true;
    }
  });
}

/* ===== Header Scroll ===== */
function initHeader() {
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ===== Navigation ===== */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const navLinks = document.querySelectorAll('.nav-link');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
    document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
}

/* ===== Scroll Reveal ===== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach((el) => observer.observe(el));
}

/* ===== Counters ===== */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => observer.observe(c));
}

function animateCounter(el, target) {
  const duration = 1500;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ===== Fleet ===== */
function initFleet() {
  renderFleet(CARS);
  populateCarSelect();

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.filter;
      applyFilters();
    });
  });

  document.getElementById('resetFilters').addEventListener('click', resetFilters);
}

function renderFleet(cars) {
  const grid = document.getElementById('fleetGrid');
  const empty = document.getElementById('fleetEmpty');

  if (cars.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = cars
    .map(
      (car, i) => `
    <article class="car-card" style="animation-delay: ${i * 0.08}s" data-id="${car.id}">
      <div class="car-card-image">
        <img src="${car.image}" alt="${car.name}" loading="lazy" onerror="this.onerror=null;this.src='${DEFAULT_CAR_IMAGE}';" />
        <span class="car-badge">${car.badge}</span>
      </div>
      <div class="car-card-body">
        <h3>${car.name}</h3>
        <div class="car-specs">
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            ${car.seats} places
          </span>
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
            ${car.transmission}
          </span>
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            ${car.fuel}
          </span>
          <span class="car-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            ${car.bags} bagages
          </span>
        </div>
        <div class="car-card-footer">
          <div class="car-price">
            <strong>${car.price} DH</strong>
            <small>/ jour</small>
          </div>
          <button class="btn btn-primary btn-sm book-btn" data-id="${car.id}">Réserver</button>
        </div>
      </div>
    </article>
  `
    )
    .join('');

  grid.querySelectorAll('.book-btn').forEach((btn) => {
    btn.addEventListener('click', () => openBookingModal(parseInt(btn.dataset.id, 10)));
  });
}

function getFilteredCars() {
  const query = document.getElementById('searchQuery').value.toLowerCase().trim();
  const category = document.getElementById('categoryFilter').value;
  const maxPrice = document.getElementById('priceFilter').value;
  const transmission = document.getElementById('transmissionFilter').value;

  return CARS.filter((car) => {
    const matchQuery = !query || car.name.toLowerCase().includes(query) || car.category.includes(query);
    const matchCategory =
      activeCategory === 'all' ? true : car.category === activeCategory;
    const matchCategorySelect = category === 'all' || car.category === category;
    const matchPrice = maxPrice === 'all' || car.price <= parseInt(maxPrice, 10);
    const matchTransmission = transmission === 'all' || car.transmission === transmission;
    return matchQuery && matchCategory && matchCategorySelect && matchPrice && matchTransmission;
  });
}

function applyFilters() {
  renderFleet(getFilteredCars());
}

function resetFilters() {
  document.getElementById('searchQuery').value = '';
  document.getElementById('categoryFilter').value = 'all';
  document.getElementById('priceFilter').value = 'all';
  document.getElementById('transmissionFilter').value = 'all';
  activeCategory = 'all';
  document.querySelectorAll('.filter-chip').forEach((c) => {
    c.classList.toggle('active', c.dataset.filter === 'all');
  });
  renderFleet(CARS);
}

/* ===== Search ===== */
function initSearch() {
  const form = document.getElementById('searchForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFilters();
    document.getElementById('flotte').scrollIntoView({ behavior: 'smooth' });
  });

  let debounce;
  document.getElementById('searchQuery').addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(applyFilters, 300);
  });

  ['categoryFilter', 'priceFilter', 'transmissionFilter'].forEach((id) => {
    document.getElementById(id).addEventListener('change', applyFilters);
  });
}

/* ===== Testimonials ===== */
function initTestimonials() {
  const track = document.getElementById('testimonialTrack');
  const dotsContainer = document.getElementById('testimonialDots');
  const cards = track.querySelectorAll('.testimonial-card');
  const total = cards.length;

  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = `dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Avis ${i + 1}`);
    dot.addEventListener('click', () => goToTestimonial(i));
    dotsContainer.appendChild(dot);
  }

  setInterval(() => goToTestimonial((testimonialIndex + 1) % total), 5000);
}

function goToTestimonial(index) {
  testimonialIndex = index;
  const track = document.getElementById('testimonialTrack');
  track.style.transform = `translateX(-${index * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

/* ===== Modal ===== */
function initModal() {
  const overlay = document.getElementById('bookingModal');
  document.getElementById('modalClose').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openBookingModal(carId) {
  selectedCar = CARS.find((c) => c.id === carId);
  if (!selectedCar) return;

  document.getElementById('modalTitle').textContent = `Réserver — ${selectedCar.name}`;
  document.getElementById('modalSubtitle').textContent = `${selectedCar.transmission} · ${selectedCar.seats} places · ${selectedCar.fuel}`;
  document.getElementById('modalPrice').innerHTML = `À partir de <strong>${selectedCar.price} DH</strong> / jour`;

  document.getElementById('bookingModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('active');
  document.body.style.overflow = '';
  selectedCar = null;
}

/* ===== Forms ===== */
function initForms() {
  document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('bookName').value;
    const phone = document.getElementById('bookPhone').value;
    const pickup = document.getElementById('bookPickup').value;
    const ret = document.getElementById('bookReturn').value;
    const location = document.getElementById('bookLocation').selectedOptions[0].text;

    const msg = encodeURIComponent(
      `Bonjour, je souhaite réserver:\n\n` +
        `Véhicule: ${selectedCar.name}\n` +
        `Nom: ${name}\n` +
        `Téléphone: ${phone}\n` +
        `Prise en charge: ${pickup}\n` +
        `Retour: ${ret}\n` +
        `Lieu: ${location}\n` +
        `Prix: ${selectedCar.price} DH/jour`
    );

    window.open(`https://wa.me/${SITE_SETTINGS.whatsapp}?text=${msg}`, '_blank');
    closeModal();
    showToast('Demande envoyée ! Nous vous contacterons rapidement.');
    e.target.reset();
  });

  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;
    const car = document.getElementById('contactCar').selectedOptions[0].text;
    const pickup = document.getElementById('contactPickup').value;
    const ret = document.getElementById('contactReturn').value;
    const message = document.getElementById('contactMessage').value;

    const msg = encodeURIComponent(
      `Demande de réservation ${fullBrandName()}\n\n` +
        `Nom: ${name}\nTéléphone: ${phone}\nEmail: ${email || 'N/A'}\n` +
        `Véhicule: ${car}\nDu: ${pickup} au ${ret}\n` +
        `Message: ${message || 'Aucun'}`
    );

    window.open(`https://wa.me/${SITE_SETTINGS.whatsapp}?text=${msg}`, '_blank');
    showToast('Votre demande a été envoyée via WhatsApp !');
    e.target.reset();
  });
}

function populateCarSelect() {
  const select = document.getElementById('contactCar');
  CARS.forEach((car) => {
    const opt = document.createElement('option');
    opt.value = car.id;
    opt.textContent = `${car.name} — ${car.price} DH/jour`;
    select.appendChild(opt);
  });
}

function setMinDates() {
  const today = new Date().toISOString().split('T')[0];
  ['contactPickup', 'contactReturn', 'bookPickup', 'bookReturn'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });
}

/* ===== Toast ===== */
function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMessage').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ===== Scroll Buttons ===== */
function initScrollButtons() {
  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
