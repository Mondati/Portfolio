// Load optional decoration after page assets, when the browser has idle time.
let scheduled = false;
let started = false;

function scheduleParticles() {
    if (scheduled || started || document.hidden ||
        new URLSearchParams(location.search).get('particles') === 'off') return;
    scheduled = true;
    const load = () => {
        scheduled = false;
        if (document.hidden || started) return;
        started = true;
        // The effect itself checks reduced motion/data before importing WebGL modules.
        import('./hero-particles.js').catch(() => {
            // Optional background: the page remains usable if loading fails.
        });
    };
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(load, { timeout: 2000 });
    } else {
        window.setTimeout(load, 200);
    }
}

if (document.readyState === 'complete') scheduleParticles();
else window.addEventListener('load', scheduleParticles, { once: true });
document.addEventListener('visibilitychange', () => {
    if (document.readyState === 'complete') scheduleParticles();
});
