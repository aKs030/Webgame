// card-fit.js — adaptive embed engine
(function () {
  const params = new URLSearchParams(location.search);
  const force = params.get("card") === "1";
  const popupMode = params.get("popup") === "1";

  const embedded = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  if (!force && !embedded) return;

  let wrapper;
  let resizeObserver = null;
  let raf;

  function markEmbedMode() {
    document.documentElement.classList.add("card-embed-mode");
    document.body.classList.add("card-embed-mode");

    if (popupMode) {
      document.documentElement.classList.add("card-popup-mode");
      document.body.classList.add("card-popup-mode");
    }
  }

  function postSize(width, height, scale) {
    try {
      window.parent.postMessage(
        {
          type: "card-fit-size",
          width,
          height,
          scale,
          popup: popupMode,
        },
        "*",
      );
    } catch {
      // no-op
    }
  }

  function wrap() {
    if (wrapper) return wrapper;
    if (!document.body) return null;

    markEmbedMode();

    wrapper = document.createElement("div");
    wrapper.id = "card-fit-wrapper";
    wrapper.style.transformOrigin = "top left";
    wrapper.style.willChange = "transform";
    wrapper.style.display = "inline-block";

    while (document.body.firstChild) {
      wrapper.appendChild(document.body.firstChild);
    }

    document.body.appendChild(wrapper);

    Object.assign(document.body.style, {
      margin: "0",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100vw",
      height: "100dvh",
      minHeight: "100vh",
      padding: "0",
      background: popupMode ? "transparent" : document.body.style.background,
    });

    return wrapper;
  }

  function measureContent(target) {
    const content = target.firstElementChild || target;
    const rect = content.getBoundingClientRect();
    const width = Math.max(
      Math.ceil(rect.width),
      Math.ceil(content.scrollWidth || 0),
      320,
    );
    const height = Math.max(
      Math.ceil(rect.height),
      Math.ceil(content.scrollHeight || 0),
      220,
    );
    return { width, height };
  }

  function fit() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const w = wrap();
      if (!w) return;

      w.style.transform = "none";
      w.style.width = "auto";
      w.style.height = "auto";

      const { width, height } = measureContent(w);
      const viewportPad = popupMode ? 18 : 0;
      const availableWidth = Math.max(1, innerWidth - viewportPad);
      const availableHeight = Math.max(1, innerHeight - viewportPad);
      const scale = Math.min(
        availableWidth / width,
        availableHeight / height,
        1,
      );

      w.style.width = `${width}px`;
      w.style.height = `${height}px`;
      w.style.transform = scale === 1 ? "none" : `scale(${scale})`;

      postSize(width, height, scale);
    });
  }

  function init() {
    fit();

    addEventListener("resize", fit, { passive: true });
    addEventListener("orientationchange", fit, { passive: true });
    addEventListener("load", fit);

    if ("ResizeObserver" in window && !resizeObserver) {
      resizeObserver = new ResizeObserver(() => fit());
      const node = wrap();
      if (node) resizeObserver.observe(node);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  window.cardFit = { fit };
})();
