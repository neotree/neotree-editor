/* global window */

const BREAKPOINTS = {
  desktop: 1000,
  tablet: 800,
  phone: 600,
};

export const getViewPort = () => {
  const w = window.innerWidth;
  if (w <= BREAKPOINTS.phone) {
    return 'phone';
  } else if (w <= BREAKPOINTS.tablet) {
    return 'tablet';
  }
  return 'desktop';
};

export default {
  viewport: getViewPort(),
  BREAKPOINTS,
  AUTH_FORM_WIDTH: 350,
  HEADER_HEIGHT: 60,
  HEADER_ZINDEX: 100,
  DRAWER_WIDTH: 200,
};
