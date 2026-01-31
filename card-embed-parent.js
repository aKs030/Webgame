// card-embed-parent.js
// Adds parent-side handlers for embedded app postMessage actions.
// Include this script on the portfolio page that embeds apps via <iframe>.

(function () {
  if (window.cardEmbedParent) return;

  function findIframeFromSource(source) {
    const iframes = document.querySelectorAll('iframe');
    for (const iframe of iframes) {
      try {
        if (iframe.contentWindow === source) return iframe;
      } catch (e) {
        // cross-origin iframes may throw — ignore
      }
    }
    return null;
  }

  function openModalForSrc(src, title) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'card-embed-overlay';
    overlay.innerHTML = `
      <div class="card-embed-modal" role="dialog" aria-modal="true">
        <div class="card-embed-modal-header">
          <div class="card-embed-title">${(title||'App Preview')}</div>
          <div class="card-embed-actions"><button class="card-embed-close">✕</button></div>
        </div>
        <iframe class="card-embed-modal-iframe" src="${src}" loading="lazy" allow="*"></iframe>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('.card-embed-close').addEventListener('click', ()=> overlay.remove());
    overlay.addEventListener('click', (ev)=> { if (ev.target === overlay) overlay.remove(); });
    document.addEventListener('keydown', function esc(e){ if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); } });
  }

  // Inject minimal styles
  function injectStyles(){
    if (document.getElementById('card-embed-parent-style')) return;
    const s = document.createElement('style');
    s.id = 'card-embed-parent-style';
    s.textContent = `
.card-embed-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;z-index:100000}
.card-embed-modal{width:min(1200px,98vw);height:min(840px,95vh);background:#010101;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column}
.card-embed-modal-header{display:flex;align-items:center;justify-content:space-between;padding:0.6rem}
.card-embed-modal-iframe{flex:1;width:100%;border:0}
.embed-expanded{position:fixed;inset:4vh 2vw;z-index:99999;width:auto;height:auto;box-shadow:0 20px 60px rgba(0,0,0,0.6)}
`;
    document.head.appendChild(s);
  }

  function handleMessage(e){
    const data = e.data || {};
    if (data && data.type === 'card-action'){
      const iframe = findIframeFromSource(e.source);
      const action = data.action;
      injectStyles();
      if (action === 'request-parent-fullscreen'){
        if (!iframe) return;
        // toggle expand on the iframe element
        iframe.classList.toggle('embed-expanded');
      } else if (action === 'request-parent-mockup'){
        if (!iframe) return;
        iframe.classList.add('embed-mockup');
      } else if (action === 'request-parent-mockup-cancel'){
        if (!iframe) return;
        iframe.classList.remove('embed-mockup');
      } else if (action === 'request-parent-modal'){
        openModalForSrc(iframe ? iframe.src : (data.src || ''), data.title || document.title);
      }
    }
  }

  window.addEventListener('message', handleMessage, false);

  window.cardEmbedParent = {
    openModalForSrc,
  };
})();
