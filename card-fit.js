// card-fit.js — adaptive embed engine
(function () {
  const params = new URLSearchParams(location.search);
  const force = params.get("card") === "1";
  const popupMode = params.get("popup") === "1";
  const MIN_CONTENT_WIDTH = 320;
  const MIN_CONTENT_HEIGHT = 220;

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
  let lastPosted = null;

  function markMode() {
    if (!document.body) return;

    if (popupMode) {
      document.documentElement.classList.add("card-popup-mode");
      document.body.classList.add("card-popup-mode");
      return;
    }

    document.documentElement.classList.add("card-embed-mode");
    document.body.classList.add("card-embed-mode");
  }

  function postSize(width, height, scale) {
    const roundedWidth = Math.max(MIN_CONTENT_WIDTH, Math.round(width));
    const roundedHeight = Math.max(MIN_CONTENT_HEIGHT, Math.round(height));
    const roundedScale = Number.isFinite(scale) ? Number(scale.toFixed(4)) : 1;

    if (
      lastPosted &&
      Math.abs(lastPosted.width - roundedWidth) < 2 &&
      Math.abs(lastPosted.height - roundedHeight) < 2 &&
      Math.abs(lastPosted.scale - roundedScale) < 0.002
    ) {
      return;
    }

    lastPosted = {
      width: roundedWidth,
      height: roundedHeight,
      scale: roundedScale,
    };

    try {
      window.parent.postMessage(
        {
          type: "card-fit-size",
          width: roundedWidth,
          height: roundedHeight,
          scale: roundedScale,
          popup: popupMode,
        },
        "*",
      );
    } catch {
      // no-op
    }
  }

  function wrapForEmbed() {
    if (wrapper) return wrapper;
    if (!document.body) return null;

    markMode();

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
    });

    return wrapper;
  }

  function wrapForPopup() {
    if (wrapper) return wrapper;
    if (!document.body) return null;

    markMode();

    wrapper = document.createElement("div");
    wrapper.id = "card-popup-fit-wrapper";
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
      background: "transparent",
    });

    return wrapper;
  }

  function measureEmbedContent(target) {
    const content = target.firstElementChild || target;
    const rect = content.getBoundingClientRect();
    const width = Math.max(
      Math.ceil(rect.width),
      Math.ceil(content.scrollWidth || 0),
      MIN_CONTENT_WIDTH,
    );
    const height = Math.max(
      Math.ceil(rect.height),
      Math.ceil(content.scrollHeight || 0),
      MIN_CONTENT_HEIGHT,
    );
    return { width, height };
  }

  function fitEmbed() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const target = wrapForEmbed();
      if (!target) return;

      target.style.transform = "none";
      target.style.width = "auto";
      target.style.height = "auto";

      const { width, height } = measureEmbedContent(target);
      const availableWidth = Math.max(1, innerWidth);
      const availableHeight = Math.max(1, innerHeight);
      const scale = Math.min(
        availableWidth / width,
        availableHeight / height,
        1,
      );

      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
      target.style.transform = scale === 1 ? "none" : `scale(${scale})`;

      postSize(width, height, scale);
    });
  }

  function fitPopup() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const target = wrapForPopup();
      if (!target) return;

      target.style.transform = "none";
      target.style.width = "auto";
      target.style.height = "auto";

      const { width, height } = measureEmbedContent(target);
      const viewportPadding = 10;
      const availableWidth = Math.max(1, innerWidth - viewportPadding);
      const availableHeight = Math.max(1, innerHeight - viewportPadding);
      const scale = Math.min(
        availableWidth / width,
        availableHeight / height,
        1,
      );

      target.style.width = `${width}px`;
      target.style.height = `${height}px`;
      target.style.transform = scale === 1 ? "none" : `scale(${scale})`;

      // Report natural content size to the parent popup while rendering scaled locally.
      postSize(width, height, scale);
    });
  }

  function fit() {
    if (popupMode) {
      fitPopup();
      return;
    }
    fitEmbed();
  }

  function handleParentMessage(event) {
    const payload = event?.data;
    if (!payload || payload.type !== "card-fit-request") return;
    fit();
  }

  function init() {
    markMode();
    if (popupMode) wrapForPopup();
    fit();

    addEventListener("resize", fit, { passive: true });
    addEventListener("orientationchange", fit, { passive: true });
    addEventListener("load", fit);
    addEventListener("message", handleParentMessage);

    if ("ResizeObserver" in window && !resizeObserver) {
      resizeObserver = new ResizeObserver(() => fit());
      const node = popupMode ? wrapForPopup() : wrapForEmbed();
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
