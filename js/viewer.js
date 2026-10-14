/**
 * NTNU Guesser - Panorama & Street-View Viewport Controller
 * Provides smooth dragging, momentum inertia, wheel/pinch zoom, compass heading, and view reset.
 */
class PanoramaViewer {
  constructor(containerId, imageId, compassId) {
    this.container = document.getElementById(containerId);
    this.img = document.getElementById(imageId);
    this.compass = document.getElementById(compassId);
    this.compassAngle = 0;

    // Viewport transform state
    this.scale = 1.0;
    this.minScale = 1.0;
    this.maxScale = 3.5;
    this.panX = 0;
    this.panY = 0;

    // Drag & Physics state
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.vx = 0;
    this.vy = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.animId = null;

    this.initEvents();
  }

  loadLocation(location) {
    if (!this.img) return;

    this.currentLocation = location;
    // Show loading state
    this.container.classList.add('loading');
    
    // Reset view position
    this.resetView();

    const tempImg = new Image();
    tempImg.onload = () => {
      this.img.src = location.image;
      this.img.alt = location.name;
      this.container.classList.remove('loading');
      this.updateBoundaries();
      this.render();
    };
    tempImg.onerror = () => {
      // Fallback if local image fails
      console.warn("Could not load image:", location.image);
      this.container.classList.remove('loading');
    };
    tempImg.src = location.image;
  }

  resetView() {
    this.scale = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.vx = 0;
    this.vy = 0;
    this.compassAngle = 0;
    this.render();
    this.updateCompass();
  }

  zoom(factor, clientCenterX = null, clientCenterY = null) {
    const prevScale = this.scale;
    const newScale = Math.min(this.maxScale, Math.max(this.minScale, this.scale * factor));
    if (newScale === prevScale) return;

    if (clientCenterX !== null && clientCenterY !== null) {
      const rect = this.container.getBoundingClientRect();
      const cx = clientCenterX - rect.left - rect.width / 2;
      const cy = clientCenterY - rect.top - rect.height / 2;

      const ratio = newScale / prevScale;
      this.panX = cx - (cx - this.panX) * ratio;
      this.panY = cy - (cy - this.panY) * ratio;
    } else {
      const ratio = newScale / prevScale;
      this.panX *= ratio;
      this.panY *= ratio;
    }

    this.scale = newScale;
    this.clampPan();
    this.render();
  }

  zoomIn() {
    this.zoom(1.3);
  }

  zoomOut() {
    this.zoom(1 / 1.3);
  }

  updateBoundaries() {
    const cWidth = this.container.clientWidth;
    const cHeight = this.container.clientHeight;

    const scaledW = cWidth * this.scale;
    const scaledH = cHeight * this.scale;

    this.maxPanX = Math.max(0, (scaledW - cWidth) / 2);
    this.maxPanY = Math.max(0, (scaledH - cHeight) / 2);
  }

  clampPan() {
    this.updateBoundaries();
    // Allow slight extra panning horizontally for 360-degree street exploration feel
    const extraAllowance = (this.container.clientWidth * 0.35) * this.scale;
    const limitX = this.maxPanX + extraAllowance;
    const limitY = this.maxPanY;

    this.panX = Math.max(-limitX, Math.min(limitX, this.panX));
    this.panY = Math.max(-limitY, Math.min(limitY, this.panY));
  }

  render() {
    if (!this.img) return;
    this.img.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  updateCompass() {
    if (!this.compass) return;
    // Map panX to degrees (approx 360 rotation over width * scale)
    const factor = 0.25 / this.scale;
    const deg = (this.panX * factor) % 360;
    this.compassAngle = deg;

    const needle = this.compass.querySelector('.compass-needle');
    const degreeLabel = this.compass.querySelector('.compass-degrees');
    if (needle) {
      needle.style.transform = `rotate(${-deg}deg)`;
    }
    if (degreeLabel) {
      let positiveDeg = Math.round((deg % 360 + 360) % 360);
      let cardinal = 'N';
      if (positiveDeg >= 22.5 && positiveDeg < 67.5) cardinal = 'NØ';
      else if (positiveDeg >= 67.5 && positiveDeg < 112.5) cardinal = 'Ø';
      else if (positiveDeg >= 112.5 && positiveDeg < 157.5) cardinal = 'SØ';
      else if (positiveDeg >= 157.5 && positiveDeg < 202.5) cardinal = 'S';
      else if (positiveDeg >= 202.5 && positiveDeg < 247.5) cardinal = 'SV';
      else if (positiveDeg >= 247.5 && positiveDeg < 292.5) cardinal = 'V';
      else if (positiveDeg >= 292.5 && positiveDeg < 337.5) cardinal = 'NV';
      degreeLabel.textContent = `${positiveDeg}° ${cardinal}`;
    }
  }

  initEvents() {
    const el = this.container;
    if (!el) return;

    // Mouse Drag events
    el.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.vx = 0;
      this.vy = 0;
      el.classList.add('grabbing');
      if (this.animId) cancelAnimationFrame(this.animId);
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;

      this.panX += dx;
      this.panY += dy;

      this.vx = dx * 0.8;
      this.vy = dy * 0.8;

      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.clampPan();
      this.render();
      this.updateCompass();
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      el.classList.remove('grabbing');
      this.applyMomentum();
    });

    // Mouse Wheel Zoom
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      this.zoom(zoomFactor, e.clientX, e.clientY);
    }, { passive: false });

    // Touch events for mobile/tablet
    let touchStartDist = 0;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.lastX = this.startX;
        this.lastY = this.startY;
        this.vx = 0;
        this.vy = 0;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    el.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.lastX;
        const dy = e.touches[0].clientY - this.lastY;

        this.panX += dx;
        this.panY += dy;
        this.vx = dx * 0.8;
        this.vy = dy * 0.8;

        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;

        this.clampPan();
        this.render();
        this.updateCompass();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDist > 0) {
          const factor = dist / touchStartDist;
          this.zoom(factor);
          touchStartDist = dist;
        }
      }
    });

    el.addEventListener('touchend', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.applyMomentum();
      }
      touchStartDist = 0;
    });

    // Window Resize
    window.addEventListener('resize', () => {
      this.clampPan();
      this.render();
    });
  }

  applyMomentum() {
    const decay = 0.92;
    const step = () => {
      if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
        return;
      }
      this.panX += this.vx;
      this.panY += this.vy;
      this.vx *= decay;
      this.vy *= decay;

      this.clampPan();
      this.render();
      this.updateCompass();

      this.animId = requestAnimationFrame(step);
    };
    this.animId = requestAnimationFrame(step);
  }
}
