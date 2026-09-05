// Entrada única por tarjeta; el contenido permanece visible sin JavaScript.
(() => {
    const section = document.getElementById('proyectos');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!section || reduced.matches || !('IntersectionObserver' in window) ||
        typeof section.animate !== 'function') return;

    const mobile = matchMedia('(max-width: 699px)');
    const active = new Map();
    const observer = new IntersectionObserver(entries => {
        // El desfase pertenece a este grupo visible, nunca al índice global.
        let batchIndex = 0;
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            observer.unobserve(card);
            if (reduced.matches || document.hidden || card.contains(document.activeElement)) return;
            const delay = mobile.matches ? 0 : Math.min(batchIndex++ * 80, 80);
            const animation = card.animate([
                { opacity: 0, transform: `translateY(${mobile.matches ? 8 : 14}px)` },
                { opacity: 1, transform: 'translateY(0)' }
            ], { duration: 450, delay, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'backwards' });
            active.set(card, animation);
            animation.onfinish = () => {
                active.delete(card);
                animation.cancel();
            };
        });
    }, { threshold: 0.08 });

    section.querySelectorAll('.project-card, .published-project').forEach(card => observer.observe(card));

    function finish(card) {
        const animation = active.get(card);
        if (animation) {
            animation.onfinish = null;
            animation.cancel();
            active.delete(card);
        }
    }

    section.addEventListener('focusin', event => {
        const card = event.target.closest('.project-card, .published-project');
        if (card) {
            observer.unobserve(card);
            finish(card);
        }
    });
    reduced.addEventListener('change', () => {
        if (!reduced.matches) return;
        observer.disconnect();
        active.forEach((_, card) => finish(card));
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) active.forEach((_, card) => finish(card));
    });
    window.addEventListener('pagehide', () => {
        observer.disconnect();
        active.forEach((_, card) => finish(card));
    });
})();
