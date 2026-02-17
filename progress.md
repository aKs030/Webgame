Original prompt: app grösse an popup anpassen - kleiner machen das ohne scrollen anze app zu sehen ist

## 2026-02-17
- Continuing popup fit stabilization in `card-fit.js`.
- Goal: all apps render fully inside popup viewport (desktop/mobile) without clipping or scrolling.
- Current approach: simplify popup measurement + center scaling + parent-triggered refit already wired in iweb app.
- Updated popup fit strategy in `card-fit.js`:
  - popup wrapper now centered by body flex layout
  - simplified popup content measurement to real wrapper/document dimensions
  - removed fixed popup wrapper width/height assignment (prevents clipping)
  - fixed function mix-up: embed uses `measureEmbedContent`, popup uses `measurePopupContent`
- Added popup fallback dark background in `card-integration.css` (`body.card-popup-mode`) so transparent app shells render correctly inside popup (no white washout).
- Re-ran Playwright screenshots for key apps (calculator, color-changer, weather-app, snake-game) on desktop and mobile.
- Ran smoke screenshot sweep across all apps in popup mode on desktop + iPhone 13; no run failures.
