// Temas: tolerar almacenamiento bloqueado o preferencias antiguas.
const themePanel = document.getElementById('themePanel');
const themeToggle = document.getElementById('themeToggleMobile');
const themeItems = [...document.querySelectorAll('.theme-item')];

function setThemePanel(open, returnFocus = false) {
    themePanel.hidden = !open;
    themeToggle.setAttribute('aria-expanded', String(open));
    if (open) themePanel.querySelector('.active .theme-btn').focus();
    else if (returnFocus) themeToggle.focus();
}

function applyTheme(theme) {
    if (!themeItems.some(item => item.dataset.theme === theme)) return;
    document.documentElement.dataset.theme = theme;
    themeItems.forEach(item => {
        const active = item.dataset.theme === theme;
        item.classList.toggle('active', active);
        item.querySelector('button').setAttribute('aria-pressed', String(active));
    });
}

applyTheme(document.documentElement.dataset.theme);
try {
    applyTheme(localStorage.getItem('portfolio-theme'));
} catch {
    // El tema sigue funcionando durante esta visita sin almacenamiento.
}

themeToggle.addEventListener('click', () => setThemePanel(themePanel.hidden));
themeItems.forEach(item => {
    item.querySelector('button').addEventListener('click', () => {
        applyTheme(item.dataset.theme);
        try { localStorage.setItem('portfolio-theme', item.dataset.theme); } catch { /* Opcional. */ }
        setThemePanel(false, true);
    });
});
document.addEventListener('click', event => {
    if (!themePanel.hidden && !themePanel.contains(event.target) && !themeToggle.contains(event.target)) {
        setThemePanel(false, themePanel.contains(document.activeElement));
    }
});
document.addEventListener('focusin', event => {
    heroMotion.revealFocused(event.target);
    if (!themePanel.hidden && !themePanel.contains(event.target) && !themeToggle.contains(event.target)) {
        setThemePanel(false);
    }
});

// Menú móvil: foco contenido, Escape y retorno al control de apertura.
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileNavClose = document.getElementById('mobileNavClose');
const mobileLayout = matchMedia('(max-width: 850px)');
const menuBackground = [...document.body.children].filter(element =>
    element !== mobileNav && element.tagName !== 'SCRIPT'
);
const previousInert = new Map();

function setMobileMenu(open, returnFocus = true) {
    if (open === !mobileNav.hidden) return;
    if (open) {
        setThemePanel(false);
        menuBackground.forEach(element => {
            previousInert.set(element, element.inert);
            element.inert = true;
        });
    } else {
        previousInert.forEach((inert, element) => { element.inert = inert; });
        previousInert.clear();
    }
    mobileNav.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    heroMotion.menuChanged();
    if (open) mobileNavClose.focus();
    else if (returnFocus) hamburger.focus();
}

hamburger.addEventListener('click', () => setMobileMenu(true));
mobileNavClose.addEventListener('click', () => setMobileMenu(false));
mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        setMobileMenu(false, false);
        const section = document.querySelector(link.hash);
        // El enlace mantiene su navegación nativa y el destino recibe el foco.
        section.setAttribute('tabindex', '-1');
        section.focus({ preventScroll: true });
    });
});
mobileLayout.addEventListener('change', event => {
    if (!event.matches) setMobileMenu(false, false);
    heroMotion.layoutChanged();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        if (!mobileNav.hidden) setMobileMenu(false);
        else if (!themePanel.hidden) setThemePanel(false, true);
    }
    if (event.key === 'Tab' && !mobileNav.hidden) {
        const items = [...mobileNav.querySelectorAll('button, a')];
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

// Una sola secuencia por carga. El CSS base siempre muestra el estado final.
const heroMotion = (() => {
    const hero = document.getElementById('hero');
    const name = document.getElementById('hero-title');
    const about = document.getElementById('sobre-mi');
    const aboutTitle = about.querySelector('.section-title');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const heroEntries = new Set();
    const aboutEntries = new Set();
    const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const supported = typeof name.animate === 'function' && 'IntersectionObserver' in window;
    const positionKey = 'portfolio-position:' + location.pathname;
    const navigation = performance.getEntriesByType('navigation')[0];
    let restoredPosition = 0;
    try { restoredPosition = Number(sessionStorage.getItem(positionKey)) || 0; } catch { /* Opcional. */ }
    const skipEntry = (location.hash && location.hash !== '#hero') || scrollY > 8 ||
        navigation?.type === 'back_forward' || (navigation?.type === 'reload' && restoredPosition > 8);
    let aboutDone = Boolean(skipEntry || reduced.matches || !supported);
    let heroVisible = false;
    let scrollFrame = 0;
    let listening = false;
    let observer;

    function finish(group) {
        group.forEach(animation => {
            animation.onfinish = null;
            animation.effect.target.closest('.name-mask')?.classList.remove('is-revealing');
            animation.cancel();
        });
        group.clear();
    }

    function resetScroll() {
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
        scrollFrame = 0;
        name.style.removeProperty('transform');
        name.style.removeProperty('opacity');
    }

    function scrollAllowed() {
        return heroVisible && !mobileLayout.matches && !reduced.matches && !document.hidden && mobileNav.hidden;
    }

    function updateScroll() {
        scrollFrame = 0;
        if (!scrollAllowed()) return;
        // Una lectura de geometría; luego solo escrituras de transform y opacity.
        const rect = hero.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.65)));
        name.style.transform = `translateY(${-24 * progress}px)`;
        name.style.opacity = String(1 - 0.15 * progress);
    }

    function scheduleScroll() {
        if (scrollAllowed() && !scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
    }

    function onScroll() {
        if (scrollY > 8 && heroEntries.size) finish(heroEntries);
        syncScroll();
        scheduleScroll();
    }

    function syncScroll() {
        const needed = !document.hidden && (heroEntries.size > 0 || scrollAllowed());
        if (needed !== listening) {
            window[needed ? 'addEventListener' : 'removeEventListener']('scroll', onScroll, { passive: true });
            listening = needed;
        }
        if (!scrollAllowed()) resetScroll();
    }

    function animate(element, frames, delay, duration, group, masked = false) {
        if (element.contains(document.activeElement)) return;
        const mask = masked ? element.closest('.name-mask') : null;
        const animation = element.animate(frames, { duration, delay, easing, fill: 'backwards' });
        mask?.classList.add('is-revealing');
        group.add(animation);
        animation.onfinish = () => {
            mask?.classList.remove('is-revealing');
            group.delete(animation);
            animation.cancel();
            if (group === aboutEntries && !group.size) observer?.unobserve(aboutTitle);
            syncScroll();
        };
    }

    function enterHero() {
        if (skipEntry || reduced.matches || document.hidden || !supported) return;
        const short = mobileLayout.matches;
        const rise = distance => [{ transform: `translateY(${distance}px)`, opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }];
        animate(hero.querySelector('.hero-eyebrow'), rise(8), 0, short ? 280 : 360, heroEntries);
        animate(hero.querySelector('.hero-greeting'), rise(8), short ? 30 : 50, short ? 300 : 380, heroEntries);
        hero.querySelectorAll('.name-word').forEach((word, index) => {
            animate(word, [{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }],
                (short ? 50 : 90) + index * 100, short ? 440 : 600, heroEntries, true);
        });
        animate(hero.querySelector('h2'), rise(short ? 12 : 16), short ? 200 : 340, short ? 380 : 480, heroEntries);
        animate(hero.querySelector('.hero-desc'), rise(short ? 12 : 16), short ? 270 : 450, short ? 380 : 480, heroEntries);
        animate(hero.querySelector('.hero-portrait'), rise(16), short ? 180 : 350, short ? 500 : 600, heroEntries);
        animate(hero.querySelector('.hero-btns'), rise(12), short ? 350 : 570, short ? 350 : 430, heroEntries);
    }

    function enterAbout() {
        if (aboutDone) return;
        aboutDone = true;
        if (reduced.matches || document.hidden || !mobileNav.hidden) return;
        const frames = [{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }];
        animate(aboutTitle, frames, 0, 430, aboutEntries);
        animate(about.querySelector('.about-grid'), frames, 70, 450, aboutEntries);
    }

    function refreshPreferences() {
        if (reduced.matches) {
            finish(heroEntries);
            finish(aboutEntries);
            aboutDone = true;
        }
        syncScroll();
        scheduleScroll();
    }

    if (supported) {
        observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.target === hero) {
                    heroVisible = entry.isIntersecting;
                    if (!heroVisible) finish(heroEntries);
                    syncScroll();
                    scheduleScroll();
                } else if (entry.isIntersecting) {
                    enterAbout();
                    if (!aboutEntries.size) observer.unobserve(aboutTitle);
                } else if (aboutEntries.size) {
                    finish(aboutEntries);
                    observer.unobserve(aboutTitle);
                }
            });
        }, { threshold: 0 });
        observer.observe(hero);
        if (!aboutDone) observer.observe(aboutTitle);
    }

    enterHero();
    refreshPreferences();
    reduced.addEventListener('change', refreshPreferences);
    window.addEventListener('resize', scheduleScroll, { passive: true });
    window.addEventListener('pageshow', event => {
        if (event.persisted || scrollY > 8) {
            finish(heroEntries);
            finish(aboutEntries);
            aboutDone = true;
        }
        syncScroll();
        scheduleScroll();
    });
    window.addEventListener('pagehide', () => {
        try { sessionStorage.setItem(positionKey, String(scrollY)); } catch { /* Opcional. */ }
        finish(heroEntries);
        finish(aboutEntries);
        resetScroll();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            finish(heroEntries);
            finish(aboutEntries);
        }
        syncScroll();
        scheduleScroll();
    });

    return {
        layoutChanged() {
            finish(heroEntries);
            syncScroll();
            scheduleScroll();
        },
        revealFocused(target) {
            if (hero.contains(target)) finish(heroEntries);
            if (about.contains(target)) {
                finish(aboutEntries);
                aboutDone = true;
            }
            syncScroll();
        },
        menuChanged() {
            if (!mobileNav.hidden) {
                finish(heroEntries);
                finish(aboutEntries);
            }
            syncScroll();
            scheduleScroll();
        }
    };
})();
