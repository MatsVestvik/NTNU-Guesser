/**
 * NTNU Guesser - Static Image Viewport Controller (Panning removed)
 * Provides clean centered view, zoom in/out controls, and view reset.
 */
class PanoramaViewer {
  constructor(containerId, imageId, compassId = null) {
    this.container = document.getElementById(containerId);
    this.img = document.getElementById(imageId);

    // Viewport transform state
    this.scale = 1.0;
    this.minScale = 1.0;
    this.maxScale = 3.5;

    this.initEvents();
  }

  loadLocation(location) {
    if (!this.img) return;

    this.currentLocation = location;
    if (this.container) {
      this.container.classList.add('loading');
    }
    
    // Reset view position
    this.resetView();

    const tempImg = new Image();
    tempImg.onload = () => {
      this.img.src = location.image;
      this.img.alt = location.name;
      if (this.container) {
        this.container.classList.remove('loading');
      }
      this.render();
    };
    tempImg.onerror = () => {
      console.warn("Could not load image:", location.image);
      if (this.container) {
        this.container.classList.remove('loading');
      }
    };
    tempImg.src = location.image;
  }

  resetView() {
    this.scale = 1.0;
    this.render();
  }

  zoom(factor) {
    const prevScale = this.scale;
    const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    if (newScale === prevScale) return;

    this.scale = newScale;
    this.render();
  }

  zoomIn() {
    this.zoom(1.3);
  }

  zoomOut() {
    this.zoom(1 / 1.3);
  }

  render() {
    if (!this.img) return;
    this.img.style.transform = `scale(${this.scale})`;
  }

  initEvents() {
    const el = this.container;
    if (!el) return;

    // Mouse Wheel Zoom (centered, no panning)
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      this.zoom(zoomFactor);
    }, { passive: false });

    // Window Resize
    window.addEventListener('resize', () => {
      this.render();
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PanoramaViewer };
}
