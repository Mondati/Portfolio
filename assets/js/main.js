// ===== NAVBAR SCROLL (throttled with rAF) =====
const navbar = document.getElementById('navbar');
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// ===== THEME PANEL =====
const themePanel = document.getElementById('themePanel');
const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');

function togglePanel() {
    const isOpen = themePanel.classList.toggle('open');
    navbar.classList.toggle('panel-open', isOpen);
}
if (themeToggle) {
    themeToggle.addEventListener('click', togglePanel);
}
if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', togglePanel);
}

// Cargar tema guardado (con validación contra whitelist)
const VALID_THEMES = ['marino', 'dark', 'bowser', 'choco', 'light', 'default'];
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme && VALID_THEMES.includes(savedTheme)) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('.theme-item').forEach(i => {
        i.classList.toggle('active', i.dataset.theme === savedTheme);
    });
}

// Aplicar tema
document.querySelectorAll('.theme-item').forEach(item => {
    item.querySelector('.theme-btn').addEventListener('click', () => {
        const theme = item.dataset.theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
        document.querySelectorAll('.theme-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        themePanel.classList.remove('open');
        navbar.classList.remove('panel-open');
    });
});

// Cerrar panel al hacer click afuera
document.addEventListener('click', (e) => {
    const clickedInsidePanel = themePanel.contains(e.target);
    const clickedToggle = (themeToggle && themeToggle.contains(e.target)) || (themeToggleMobile && themeToggleMobile.contains(e.target));

    if (!clickedInsidePanel && !clickedToggle) {
        themePanel.classList.remove('open');
        navbar.classList.remove('panel-open');
    }
});

// ===== MOBILE NAV (con focus trap y soporte Escape) =====
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileNavClose = document.getElementById('mobileNavClose');

function trapFocus(element) {
    const focusable = element.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function onKeydown(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    }

    element.addEventListener('keydown', onKeydown);
    return () => element.removeEventListener('keydown', onKeydown);
}

let releaseTrap = null;

function openMobileNav() {
    mobileNav.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    releaseTrap = trapFocus(mobileNav);
    mobileNavClose.focus();
}

function closeMobileNav() {
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
    hamburger.focus();
}

hamburger.addEventListener('click', openMobileNav);
mobileNavClose.addEventListener('click', closeMobileNav);
// Auto-cerrar el nav mobile al hacer click en un link
mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileNav);
});
// Cerrar con Escape
mobileNav.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
});

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
