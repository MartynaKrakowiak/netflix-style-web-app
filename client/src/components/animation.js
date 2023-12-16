export function getSlideInKeyframes(listItemCoords) {
  return `
    @keyframes slideIn {
      0% {
        transform: scale(0.34);
        left: ${listItemCoords.left}px;
        top: ${listItemCoords.top}px;
      }
      100% {
        transform: scale(1);
        left: 502px;
        top: 30px;
      }
    }
  `;
}

export function getZoomOutKeyframes(listItemCoords) {
  
  return `
    @keyframes zoomOut {
      0% {
        left: 502px;
        top: 30px;
        transform: scale(1);

      }
      100% {
        left: ${listItemCoords.left}px;
        top: ${listItemCoords.top}px;
        transform: scale(0.34);

      }
    }
  `;
}

export function getZoomOutFeaturedKeyframes() {
  return `
    @keyframes zoomOutFeatured {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `;
}

export function getZoomInFeaturedKeyframes() {
  return `
    @keyframes zoomInFeatured {
      0% {
        transform: scale(0.6);
      }
      100% {
        transform: scale(1);
      }
    }
  `;
}
