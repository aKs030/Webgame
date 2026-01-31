// card-fit.js
// Dynamically scale app content to fit both width and height of the embedding Card.
// Usage: automatically runs in any app that includes this file. To opt-out, add
// `data-card-fit="false"` on <body>.
(function () {
    const OPT_OUT = document.body.getAttribute('data-card-fit') === 'false';
    if (OPT_OUT) return;

    // Inject card-integration.css if not present (supports common relative paths)
    (function injectIntegrationCss() {
        if (document.getElementById('card-integration-css')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = 'card-integration-css';
        // Try relative path candidates (from typical embed paths)
        const candidates = ['../../card-integration.css', '/card-integration.css', '../card-integration.css'];
        let appended = false;
        function tryLoad(idx) {
            if (idx >= candidates.length) return;
            link.href = candidates[idx];
            link.addEventListener('error', () => {
                // try next path
                tryLoad(idx + 1);
            }, { once: true });
            // Append only once; rely on error handler to try next src
            if (!appended) { document.head.appendChild(link); appended = true; }
        }
        tryLoad(0);
    })();

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

    // Controls & Modal for card embedding (expand, mockup, inline modal)
    function createControls() {
        const wrapper = wrapContent();
        if (!wrapper || wrapper.querySelector('.card-controls')) return;
        const controls = document.createElement('div');
        controls.className = 'card-controls';
        controls.innerHTML = `
            <button type="button" class="card-btn card-expand" aria-label="Expand" title="Expand (E)">⤢</button>
            <button type="button" class="card-btn card-mockup" aria-label="Mockup" title="Mockup (M)">🖥️</button>
            <button type="button" class="card-btn card-modal-open" aria-label="Open" title="Open in Modal (O)">🔍</button>
        `;
        controls.style.pointerEvents = 'auto';
        wrapper.style.position = wrapper.style.position || 'relative';
        wrapper.appendChild(controls);

        const btnExpand = controls.querySelector('.card-expand');
        const btnMockup = controls.querySelector('.card-mockup');
        const btnModal = controls.querySelector('.card-modal-open');

        btnExpand.addEventListener('click', () => {
            toggleExpand();
        });
        btnMockup.addEventListener('click', () => {
            toggleMockup();
        });
        btnModal.addEventListener('click', () => {
            openInlineModal();
        });

        // keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') toggleExpand();
            if (e.key === 'm' || e.key === 'M') toggleMockup();
            if (e.key === 'o' || e.key === 'O') openInlineModal();
        });
    }

    function toggleExpand() {
        const wrapper = wrapContent();
        if (!wrapper) return;
        if (wrapper.classList.contains('card-expanded')) {
            wrapper.classList.remove('card-expanded');
            // restore original flow
            if (wrapper.dataset._origStyle) {
                try { Object.assign(wrapper.style, JSON.parse(wrapper.dataset._origStyle)); } catch (e) { }
                wrapper.removeAttribute('data-_origStyle');
            }
            fit();
        } else {
            // remember original styles
            wrapper.dataset._origStyle = JSON.stringify({
                position: wrapper.style.position || '',
                inset: wrapper.style.inset || '',
                width: wrapper.style.width || '',
                height: wrapper.style.height || '',
            });
            wrapper.classList.add('card-expanded');
            wrapper.style.position = 'fixed';
            wrapper.style.inset = '0';
            wrapper.style.width = '100vw';
            wrapper.style.height = '100vh';
            wrapper.style.transform = 'none';
            fit();
            // notify parent we want fullscreen (so parent can expand iframe if supported)
            sendParentMessage({ type: 'card-action', action: 'request-parent-fullscreen' });
        }
    }

    function toggleMockup() {
        const wrapper = wrapContent();
        if (!wrapper) return;
        wrapper.classList.toggle('mockup-enabled');
        // when mockup enabled, allow pointer events inside and remove scale (so app is interactive)
        if (wrapper.classList.contains('mockup-enabled')) {
            wrapper.style.transform = 'none';
            wrapper.style.pointerEvents = 'auto';
            sendParentMessage({ type: 'card-action', action: 'request-parent-mockup' });
        } else {
            fit();
            sendParentMessage({ type: 'card-action', action: 'request-parent-mockup-cancel' });
        }
    }

    let modalEl = null;
    function openInlineModal() {
        if (modalEl) return;
        modalEl = document.createElement('div');
        modalEl.className = 'card-modal-overlay';
        modalEl.innerHTML = `
            <div class="card-modal" role="dialog" aria-modal="true" aria-label="App modal">
              <div class="card-modal-header">
                <div class="modal-title" style="font-weight:600;color:var(--fg-color)">${document.title || ''}</div>
                <div class="modal-actions">
                  <button type="button" class="card-btn card-modal-close" aria-label="Close">✕</button>
                  <button type="button" class="card-btn card-modal-open-new" aria-label="Open new tab">↗</button>
                </div>
              </div>
              <iframe class="card-modal-iframe" src="${location.href}" title="App preview" loading="lazy"></iframe>
            </div>
        `;
        document.body.appendChild(modalEl);
        const closeBtn = modalEl.querySelector('.card-modal-close');
        const openNewBtn = modalEl.querySelector('.card-modal-open-new');
        closeBtn.addEventListener('click', closeInlineModal);
        openNewBtn.addEventListener('click', () => window.open(location.href, '_blank', 'noopener'));
        document.addEventListener('keydown', handleModalKey);
    }

    function closeInlineModal() {
        if (!modalEl) return;
        document.removeEventListener('keydown', handleModalKey);
        modalEl.remove();
        modalEl = null;
    }

    function handleModalKey(e) {
        if (e.key === 'Escape') closeInlineModal();
    }

    function sendParentMessage(payload) {
        try {
            if (window.parent && window.parent !== window) {
                window.parent.postMessage(payload, '*');
            }
        } catch (e) { }
    }

    // create controls on load and when DOM changes
    document.addEventListener('DOMContentLoaded', createControls);
    const ctrlObserver = new MutationObserver(() => createControls());
    const _wrapper = wrapContent();
    if (_wrapper) ctrlObserver.observe(_wrapper, { childList: true, subtree: false });

    // Expose a small API
    window.cardFit = {
        fit,
        disable() { observer.disconnect(); document.body.removeAttribute('data-card-fit'); },
        expand: toggleExpand,
        mockup: toggleMockup,
        openModal: openInlineModal,
        closeModal: closeInlineModal
    };
})();