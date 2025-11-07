/* a11y.js
   Provides shared accessibility utilities:
   - High contrast toggle sync + persistence
   - Image zoom overlay and setupZoomableImages() for images with class 'zoomable'
   This file is safe to include on any page; it will create DOM overlay elements if missing.
*/
(function () {
  'use strict';

  /**
   * Sets up high contrast mode functionality.
   */
  function setupHighContrast() {
      const CONTRAST_KEY = 'high_contrast_enabled';
      const toggles = document.querySelectorAll('input[id^="highContrastToggle"]');
      
      const applyContrast = (isHigh) => {
          document.body.classList.toggle('high-contrast', isHigh);
          toggles.forEach(toggle => {
              if (toggle) toggle.checked = isHigh;
          });
          localStorage.setItem(CONTRAST_KEY, isHigh);
      };

      toggles.forEach(toggle => {
          if (toggle) {
              toggle.addEventListener('change', (e) => {
                  applyContrast(e.target.checked);
              });
          }
      });

      // Apply on initial load
      const isHigh = localStorage.getItem(CONTRAST_KEY) === 'true';
      applyContrast(isHigh);
  }

  /**
   * Sets up zoomable images functionality.
   */
  function setupZoomableImages() {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          cursor: zoom-out;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
      `;

      const zoomedImage = document.createElement('img');
      zoomedImage.style.cssText = `
          max-width: 90%;
          max-height: 90%;
          object-fit: contain;
          box-shadow: 0 0 30px rgba(0,0,0,0.7);
          transform: scale(0.8);
          transition: transform 0.3s ease;
      `;
      overlay.appendChild(zoomedImage);
      document.body.appendChild(overlay);

      const showOverlay = (src) => {
          zoomedImage.src = src;
          overlay.style.opacity = '1';
          overlay.style.pointerEvents = 'auto';
          setTimeout(() => {
              zoomedImage.style.transform = 'scale(1)';
          }, 10);
      };

      const hideOverlay = () => {
          zoomedImage.style.transform = 'scale(0.8)';
          overlay.style.opacity = '0';
          setTimeout(() => {
              overlay.style.pointerEvents = 'none';
          }, 300);
      };

      document.querySelectorAll('img[data-zoomable]').forEach(image => {
          image.addEventListener('click', (e) => {
              e.preventDefault();
              showOverlay(image.src);
          });
      });

      overlay.addEventListener('click', hideOverlay);
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && overlay.style.opacity === '1') {
              hideOverlay();
          }
      });
  }

  // Expose functions to global scope
  window.setupHighContrast = setupHighContrast;
  window.setupZoomableImages = setupZoomableImages;

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    setupHighContrast();
    // setupZoomableImages will be called manually from pages where it's needed
  });

})();
