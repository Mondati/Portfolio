// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

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

// Cargar tema guardado
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme) {
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

// ===== MOBILE NAV =====
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileNavClose = document.getElementById('mobileNavClose');

hamburger.addEventListener('click', () => mobileNav.classList.add('open'));
mobileNavClose.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
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
