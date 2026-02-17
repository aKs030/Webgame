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

  function preparePopupLayout() {
    if (!document.body) return;

    markMode();

    Object.assign(document.body.style, {
      margin: "0",
      padding: "0",
      background: "transparent",
      overflow: "visible",
      width: "auto",
      height: "auto",
      minHeight: "0",
    });
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

  function isPopupCandidate(node) {
    if (!(node instanceof HTMLElement)) return false;

    const tag = node.tagName.toLowerCase();
    if (
      tag === "script" ||
      tag === "style" ||
      tag === "link" ||
      tag === "meta" ||
      tag === "noscript"
    ) {
      return false;
    }

    const styles = getComputedStyle(node);
    if (
      styles.display === "none" ||
      styles.visibility === "hidden" ||
      Number(styles.opacity || "1") === 0
    ) {
      return false;
    }

    const position = styles.position;
    if (position === "fixed" || position === "absolute") {
      return false;
    }

    return true;
  }

  function scorePopupCandidate(node) {
    const rect = node.getBoundingClientRect();
    const width = Math.ceil(Math.max(rect.width, node.scrollWidth || 0));
    const height = Math.ceil(Math.max(rect.height, node.scrollHeight || 0));

    if (width < 120 || height < 80) return -1;

    // Prefer substantial app containers without selecting full-page wrappers blindly.
    let score = width * height;

    const classAndId = `${node.className || ""} ${node.id || ""}`.toLowerCase();
    if (/app|root|container|game|card|panel|main/.test(classAndId)) {
      score *= 1.08;
    }

    if (width > innerWidth * 1.4 && height > innerHeight * 1.4) {
      score *= 0.6;
    }

    return score;
  }

  function pickPopupTarget() {
    const body = document.body;
    if (!body) return null;

    let target = body.firstElementChild || body;
    if (
      target &&
      /^(root|app)$/i.test(target.id || "") &&
      target.firstElementChild
    ) {
      target = target.firstElementChild;
    }

    let bestTarget = target;
    let bestScore = scorePopupCandidate(target);

    // Scan descendants to find the most likely content root.
    const descendants = target.querySelectorAll("*");
    const maxScan = 350;
    for (let i = 0; i < descendants.length && i < maxScan; i += 1) {
      const node = descendants[i];
      if (!isPopupCandidate(node)) continue;

      const score = scorePopupCandidate(node);
      if (score > bestScore) {
        bestScore = score;
        bestTarget = node;
      }
    }

    return bestTarget;
  }

  function measurePopupContent() {
    const doc = document.documentElement;
    const body = document.body;
    const target = pickPopupTarget();

    let preferredWidth = 0;
    let preferredHeight = 0;
    if (target) {
      const rect = target.getBoundingClientRect();
      const styles = getComputedStyle(target);
      const marginX =
        (parseFloat(styles.marginLeft) || 0) +
        (parseFloat(styles.marginRight) || 0);
      const marginY =
        (parseFloat(styles.marginTop) || 0) +
        (parseFloat(styles.marginBottom) || 0);

      preferredWidth = Math.ceil(
        Math.max(rect.width + marginX, target.scrollWidth || 0),
      );
      preferredHeight = Math.ceil(
        Math.max(rect.height + marginY, target.scrollHeight || 0),
      );
    }

    const fallbackWidth = Math.ceil(
      Math.max(
        body?.scrollWidth || 0,
        body?.offsetWidth || 0,
        doc?.scrollWidth || 0,
        doc?.offsetWidth || 0,
      ),
    );
    const fallbackHeight = Math.ceil(
      Math.max(
        body?.scrollHeight || 0,
        body?.offsetHeight || 0,
        doc?.scrollHeight || 0,
        doc?.offsetHeight || 0,
      ),
    );

    const width = Math.max(preferredWidth || fallbackWidth, MIN_CONTENT_WIDTH);
    const height = Math.max(
      preferredHeight || fallbackHeight,
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
      preparePopupLayout();
      const { width, height } = measurePopupContent();
      postSize(width, height, 1);
    });
  }

  function fit() {
    if (popupMode) {
      fitPopup();
      return;
    }
    fitEmbed();
  }

  function init() {
    markMode();
    if (popupMode) preparePopupLayout();
    fit();

    addEventListener("resize", fit, { passive: true });
    addEventListener("orientationchange", fit, { passive: true });
    addEventListener("load", fit);

    if ("ResizeObserver" in window && !resizeObserver) {
      resizeObserver = new ResizeObserver(() => fit());
      const node = popupMode ? document.body : wrapForEmbed();
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
