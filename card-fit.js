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
          viewportWidth: Math.round(innerWidth),
          viewportHeight: Math.round(innerHeight),
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
    wrapper.style.transformOrigin = "center center";
    wrapper.style.willChange = "transform";
    wrapper.style.display = "inline-block";

    while (document.body.firstChild) {
      wrapper.appendChild(document.body.firstChild);
    }

    document.body.appendChild(wrapper);

    Object.assign(document.body.style, {
      margin: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0",
      background: "transparent",
    });

    // Override popup integration fallbacks that set body sizing with !important.
    document.body.style.setProperty("overflow", "hidden", "important");
    document.body.style.setProperty("width", "100vw", "important");
    document.body.style.setProperty("height", "100dvh", "important");
    document.body.style.setProperty("min-height", "100vh", "important");
    document.body.style.setProperty("display", "flex", "important");
    document.body.style.setProperty("align-items", "center", "important");
    document.body.style.setProperty("justify-content", "center", "important");

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

  function measurePopupContent(target) {
    let root = target.firstElementChild || target;
    if (
      root instanceof HTMLElement &&
      /^(root|app)$/i.test(root.id || "") &&
      root.firstElementChild instanceof HTMLElement
    ) {
      root = root.firstElementChild;
    }

    const candidates = [];
    const seen = new Set();
    const addCandidate = (node) => {
      if (!(node instanceof HTMLElement)) return;
      if (seen.has(node)) return;
      seen.add(node);
      candidates.push(node);
    };

    addCandidate(root);

    if (root instanceof HTMLElement) {
      const preferredSelector =
        ".calculator, .card, .game-container, .weather-container, .app-container, .container, main, [data-card-root]";
      const preferred = root.querySelectorAll(preferredSelector);
      for (let i = 0; i < preferred.length; i += 1) {
        addCandidate(preferred[i]);
      }

      const topLevel = root.children;
      const maxTopLevel = Math.min(topLevel.length, 12);
      for (let i = 0; i < maxTopLevel; i += 1) {
        addCandidate(topLevel[i]);
      }
    }

    let bestWidth = 0;
    let bestHeight = 0;
    let bestScore = -1;

    for (const node of candidates) {
      const styles = getComputedStyle(node);
      if (styles.display === "none" || styles.visibility === "hidden") continue;
      if (styles.position === "fixed" || styles.position === "absolute")
        continue;

      const rect = node.getBoundingClientRect();
      let width = Math.ceil(Math.max(rect.width, node.scrollWidth || 0));
      let height = Math.ceil(Math.max(rect.height, node.scrollHeight || 0));
      if (width < 140 || height < 110) continue;

      const marginX =
        (parseFloat(styles.marginLeft) || 0) +
        (parseFloat(styles.marginRight) || 0);
      const marginY =
        (parseFloat(styles.marginTop) || 0) +
        (parseFloat(styles.marginBottom) || 0);

      width = Math.ceil(width + marginX);
      height = Math.ceil(height + marginY);

      let score = width * height;

      // Prefer actual app cards/containers over full viewport wrappers.
      if (width >= innerWidth * 0.94) score *= 0.58;
      if (height >= innerHeight * 1.35) score *= 0.72;
      if (width >= innerWidth * 0.94 && height >= innerHeight * 0.9) {
        score *= 0.48;
      }
      if (node === root) score *= 0.86;

      if (score > bestScore) {
        bestScore = score;
        bestWidth = width;
        bestHeight = height;
      }
    }

    if (bestScore < 0) {
      const fallbackRect = target.getBoundingClientRect();
      bestWidth = Math.ceil(
        Math.max(fallbackRect.width, target.scrollWidth || 0, MIN_CONTENT_WIDTH),
      );
      bestHeight = Math.ceil(
        Math.max(
          fallbackRect.height,
          target.scrollHeight || 0,
          MIN_CONTENT_HEIGHT,
        ),
      );
    }

    return {
      width: Math.max(bestWidth, MIN_CONTENT_WIDTH),
      height: Math.max(bestHeight, MIN_CONTENT_HEIGHT),
    };
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
      target.style.margin = "0";

      const { width, height } = measurePopupContent(target);
      const viewportPadding = 10;
      const availableWidth = Math.max(1, innerWidth - viewportPadding);
      const availableHeight = Math.max(1, innerHeight - viewportPadding);
      const scale = Math.min(
        availableWidth / width,
        availableHeight / height,
        1,
      );
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
    setTimeout(fit, 120);
    setTimeout(fit, 360);
    setTimeout(fit, 900);

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
