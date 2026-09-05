// React Bits Particles, adapted to native ESM. Attribution/licenses: ../vendor/README.md.
export const PARTICLES_CONFIG = Object.freeze({
    particleCount: 80, mobileParticleCount: 35, particleSpread: 10,
    speed: 0.04, particleBaseSize: 85, sizeRandomness: 1, cameraDistance: 20,
    alphaParticles: true, disableRotation: true, moveParticlesOnHover: false,
    pixelRatio: 1, opacity: 0.95, behindTextOpacity: 0.3, depthScale: 0.35,
    maxFPS: 20
});

const vertex = `
attribute vec3 position;
attribute vec4 random;
attribute vec3 color;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime, uSpread, uBaseSize, uSizeRandomness, uDepth;
uniform vec2 uPlane;
varying vec4 vRandom;
varying vec3 vColor;
void main() {
    vRandom = random;
    vColor = color;
    vec3 pos = position * uSpread;
    pos.xy *= uPlane;
    pos.z *= uDepth;
    pos.x += sin(uTime * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    pos.y += sin(uTime * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    pos.z += sin(uTime * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    vec4 view = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5)) / length(view.xyz);
    gl_Position = projectionMatrix * view;
}`;
const fragment = `
precision highp float;
uniform float uOpacity, uBehindText, uAlphaParticles;
uniform vec2 uResolution;
uniform vec4 uTextBounds;
varying vec4 vRandom;
varying vec3 vColor;
void main() {
    float d = length(gl_PointCoord.xy - vec2(0.5));
    float circle = 1.0 - smoothstep(0.4, 0.5, d);
    vec2 p = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
    vec2 inside = smoothstep(uTextBounds.xy - vec2(20.0), uTextBounds.xy, p)
        * (1.0 - smoothstep(uTextBounds.zw, uTextBounds.zw + vec2(20.0), p));
    float alpha = circle * uOpacity * mix(1.0, uBehindText, inside.x * inside.y);
    alpha *= mix(1.0, mix(0.5, 1.0, vRandom.y), uAlphaParticles);
    gl_FragColor = vec4(vColor, alpha);
}`;

function createParticles() {
    const host = document.querySelector('.hero-particles');
    if (!host || new URLSearchParams(location.search).get('particles') === 'off' ||
        !window.IntersectionObserver || !window.ResizeObserver) return null;
    const hero = host.closest('#hero');
    const copy = hero.querySelector('.hero-copy');
    const button = hero.querySelector('.particles-toggle');
    const menu = document.getElementById('mobileNav');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const data = matchMedia('(prefers-reduced-data: reduce)');
    const mobile = matchMedia('(max-width: 850px)');
    const config = PARTICLES_CONFIG;
    let renderer, gl, geometry, program, mesh, camera, canvas;
    let visible = false, paused = false, destroyed = false, loading = false, pageHidden = false;
    let frame = 0, lastTime = null, elapsed = 0, lastRender = null, width = 0, height = 0;
    let renderedFrames = 0;
    const cleanups = [];
    const listen = (target, event, callback) => {
        target?.addEventListener(event, callback);
        cleanups.push(() => target?.removeEventListener(event, callback));
    };
    const savesData = () => data.matches || Boolean(navigator.connection?.saveData);
    const allowed = () => !destroyed && !pageHidden && visible && !document.hidden &&
        !motion.matches && !savesData() && !paused && (!menu || menu.hidden);

    function stop() {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = lastRender = null;
    }
    function update(time) {
        frame = 0;
        if (!allowed() || !width || !height) return;
        if (lastTime !== null) elapsed += (time - lastTime) * config.speed * 0.001;
        lastTime = time;
        if (lastRender === null || time - lastRender >= 1000 / config.maxFPS - 0.5) {
            program.uniforms.uTime.value = elapsed;
            renderer.render({ scene: mesh, camera, frustumCull: false, sort: false });
            renderedFrames++;
            lastRender = time;
        }
        frame = requestAnimationFrame(update);
    }
    function sync() {
        if (destroyed) return;
        host.hidden = motion.matches || savesData();
        button.hidden = !renderer || host.hidden;
        button.textContent = paused ? 'Activar fondo' : 'Pausar fondo';
        if (!allowed()) { stop(); return; }
        if (!renderer) { void initialize(); return; }
        if (width && height && !frame) frame = requestAnimationFrame(update);
    }
    function resize() {
        if (!renderer || destroyed) return;
        // Layout is read only on resize, never in the render loop.
        const bounds = host.getBoundingClientRect();
        const text = copy.getBoundingClientRect();
        width = bounds.width; height = bounds.height;
        if (!width || !height) { stop(); return; }
        renderer.setSize(width, height);
        camera.perspective({ aspect: width / height });
        const halfHeight = Math.tan(15 * Math.PI / 360) * config.cameraDistance;
        program.uniforms.uPlane.value = [halfHeight * width / height / config.particleSpread,
            halfHeight / config.particleSpread];
        program.uniforms.uResolution.value = [canvas.width, canvas.height];
        program.uniforms.uTextBounds.value = [text.left - bounds.left, text.top - bounds.top,
            text.right - bounds.left, text.bottom - bounds.top].map(v => v * config.pixelRatio);
        geometry.setDrawRange(0, mobile.matches ? config.mobileParticleCount : config.particleCount);
        sync();
    }
    function colors() {
        if (!geometry || destroyed) return;
        const style = getComputedStyle(document.documentElement);
        const palette = ['--primary', '--text2', '--text3'].map(key => {
            const value = parseInt(style.getPropertyValue(key).trim().replace('#', ''), 16);
            return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
        });
        const attribute = geometry.attributes.color;
        for (let i = 0; i < config.particleCount; i++) attribute.data.set(palette[i % palette.length], i * 3);
        attribute.needsUpdate = true;
        // A paused background is cleared, not rendered, until explicitly resumed.
        if (!allowed()) gl.clear(gl.COLOR_BUFFER_BIT);
    }
    async function initialize() {
        if (loading || destroyed || !allowed()) return;
        loading = true;
        try {
            const [{ Renderer }, { Camera }, { Geometry }, { Program }, { Mesh }] = await Promise.all([
                import('../vendor/ogl-1.0.11/src/core/Renderer.js'),
                import('../vendor/ogl-1.0.11/src/core/Camera.js'),
                import('../vendor/ogl-1.0.11/src/core/Geometry.js'),
                import('../vendor/ogl-1.0.11/src/core/Program.js'),
                import('../vendor/ogl-1.0.11/src/core/Mesh.js')
            ]);
            if (destroyed || !allowed()) return;
            canvas = document.createElement('canvas');
            canvas.setAttribute('aria-hidden', 'true');
            // Probe and reuse the SAME canvas/context; unsupported WebGL is an ordinary fallback.
            gl = canvas.getContext('webgl', { alpha: true, depth: false, antialias: false,
                premultipliedAlpha: false, powerPreference: 'low-power' });
            if (!gl) { destroy(); return; }
            listen(canvas, 'webglcontextlost', () => destroy(true));
            renderer = new Renderer({ canvas, webgl: 1, alpha: true, depth: false,
                dpr: config.pixelRatio, powerPreference: 'low-power' });
            gl.clearColor(0, 0, 0, 0);
            camera = new Camera(gl, { fov: 15 });
            camera.position.set(0, 0, config.cameraDistance);
            const positions = new Float32Array(config.particleCount * 3);
            const randoms = new Float32Array(config.particleCount * 4);
            // Seeded once: stable depth/distribution across resize and theme changes.
            let seed = 314159;
            const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
            for (let i = 0; i < positions.length; i++) positions[i] = random() * 2 - 1;
            for (let i = 0; i < randoms.length; i++) randoms[i] = random();
            geometry = new Geometry(gl, {
                position: { size: 3, data: positions }, random: { size: 4, data: randoms },
                color: { size: 3, data: new Float32Array(config.particleCount * 3) }
            });
            program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false,
                uniforms: {
                    uTime: { value: 0 }, uSpread: { value: config.particleSpread },
                    uBaseSize: { value: config.particleBaseSize * config.pixelRatio },
                    uSizeRandomness: { value: config.sizeRandomness }, uDepth: { value: config.depthScale },
                    uOpacity: { value: config.opacity }, uBehindText: { value: config.behindTextOpacity },
                    uAlphaParticles: { value: config.alphaParticles ? 1 : 0 },
                    uPlane: { value: [1, 1] }, uResolution: { value: [1, 1] },
                    uTextBounds: { value: [0, 0, 0, 0] }
                } });
            if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) throw new Error('Particle shader unavailable');
            mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS, frustumCulled: false });
            host.append(canvas);
            colors(); resize();
        } catch {
            // Optional decoration must never block the portfolio (including failed imports).
            destroy();
        } finally { loading = false; }
    }
    const intersection = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        sync();
    });
    const sizing = new ResizeObserver(resize);
    const changes = new MutationObserver(entries => {
        if (entries.some(entry => entry.attributeName === 'data-theme')) colors();
        sync();
    });
    function destroy(contextLost = false) {
        if (destroyed) return;
        destroyed = true;
        stop(); intersection.disconnect(); sizing.disconnect(); changes.disconnect();
        cleanups.forEach(cleanup => cleanup());
        button.hidden = true;
        canvas?.remove();
        if (gl && !contextLost && !gl.isContextLost()) {
            geometry?.remove();
            if (program) {
                gl.deleteShader(program.vertexShader); gl.deleteShader(program.fragmentShader);
                program.remove();
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
        renderer = gl = geometry = program = mesh = camera = canvas = null;
    }
    intersection.observe(hero);
    sizing.observe(host); sizing.observe(copy);
    changes.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (menu) changes.observe(menu, { attributes: true, attributeFilter: ['hidden'] });
    listen(button, 'click', () => { paused = !paused; sync(); });
    listen(motion, 'change', sync); listen(data, 'change', sync);
    listen(navigator.connection, 'change', sync); listen(mobile, 'change', resize);
    listen(document, 'visibilitychange', sync);
    listen(window, 'pagehide', event => { pageHidden = true; if (event.persisted) stop(); else destroy(); });
    listen(window, 'pageshow', () => { pageHidden = false; sync(); });
    return { destroy, getState: () => ({ running: Boolean(frame), paused, visible, destroyed,
        renderedFrames, elapsed, count: geometry?.drawRange.count ?? 0 }) };
}

export const heroParticles = createParticles();
