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
    themePanel.classList.toggle('open');
}
themeToggle.addEventListener('click', togglePanel);
themeToggleMobile.addEventListener('click', togglePanel);

// Aplicar tema
document.querySelectorAll('.theme-item').forEach(item => {
    item.querySelector('.theme-btn').addEventListener('click', () => {
        const theme = item.dataset.theme;
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelectorAll('.theme-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        themePanel.classList.remove('open');
    });
});

// Cerrar panel al hacer click afuera
document.addEventListener('click', (e) => {
    if (!themePanel.contains(e.target) && !themeToggle.contains(e.target) && !themeToggleMobile.contains(e.target)) {
        themePanel.classList.remove('open');
    }
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

// ===== MOBILE THEME TOGGLE =====
if (window.innerWidth <= 768) {
    document.getElementById('themeToggleMobile').style.display = 'block';
}
