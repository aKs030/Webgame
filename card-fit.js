// card-fit.js
// Dynamically scale app content to fit both width and height of the embedding Card.
// Usage: automatically runs in any app that includes this file. To opt-out, add
// `data-card-fit="false"` on <body>.
(function () {
    const OPT_OUT = document.body.getAttribute('data-card-fit') === 'false';
    if (OPT_OUT) return;

    function wrapContent() {
        if (document.getElementById('card-fit-wrapper')) return document.getElementById('card-fit-wrapper');

        const wrapper = document.createElement('div');
        wrapper.id = 'card-fit-wrapper';
        wrapper.style.display = 'inline-block';
        wrapper.style.willChange = 'transform';
        wrapper.style.transformOrigin = 'top left';
        wrapper.style.pointerEvents = 'auto';

        // Move existing children into wrapper
        while (document.body.firstChild) {
            wrapper.appendChild(document.body.firstChild);
        }
        document.body.appendChild(wrapper);

        // Apply safe body styles for card embedding
        document.documentElement.style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.display = 'flex';
        document.body.style.alignItems = 'center';
        document.body.style.justifyContent = 'center';

        return wrapper;
    }

    function fitOnce() {
        const wrapper = wrapContent();
        if (!wrapper) return;

        // Measure wrapper natural size
        // Temporarily reset transform & ensure block flow to measure unscaled size
        wrapper.style.transform = 'none';
        wrapper.style.display = 'block';

        // Use bounding rect which is more reliable for layout-driven sizes
        const rect = wrapper.getBoundingClientRect();
        const contentWidth = rect.width || wrapper.scrollWidth || wrapper.offsetWidth || wrapper.clientWidth;
        const contentHeight = rect.height || wrapper.scrollHeight || wrapper.offsetHeight || wrapper.clientHeight;

        const cardWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const cardHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        // Avoid division by zero
        if (!contentWidth || !contentHeight || !cardWidth || !cardHeight) return;

        // Choose scale that fits both dimensions (preserve aspect ratio)
        let scale = Math.min(cardWidth / contentWidth, cardHeight / contentHeight, 1);

        // If content already fits, keep scale=1 (no transform)
        if (scale >= 0.9999) {
            wrapper.style.transform = 'none';
            document.documentElement.style.removeProperty('--card-fit-scale');
            return;
        }

        wrapper.style.transform = `scale(${scale})`;

        // Optional: set a CSS variable for debugging
        document.documentElement.style.setProperty('--card-fit-scale', scale);
    }

    let resizeTimer;
    function fit() {
        // Debounce
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            fitOnce();
            resizeTimer = null;
        }, 50);
    }

    // Refit on relevant events
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    window.addEventListener('load', fit);
    document.addEventListener('DOMContentLoaded', fit);

    // Observe DOM changes inside the wrapper to refit when content changes
    const observer = new MutationObserver(() => fit());
    function ensureObserver() {
        const wrapper = wrapContent();
        if (!wrapper) return;
        observer.disconnect();
        observer.observe(wrapper, { childList: true, subtree: true, characterData: true, attributes: true });
    }

    // Initial setup
    ensureObserver();
    fit();

    // Expose a small API
    window.cardFit = {
        fit,
        disable() { observer.disconnect(); document.body.removeAttribute('data-card-fit'); },
    };
})();