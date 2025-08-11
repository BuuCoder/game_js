export const CONFIG = {
  world: {
    width: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--world-w')) || 1800,
    height: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--world-h')) || 800,
  },
  player: {
    size: 72,
    baseSpeed: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--speed')) || 3.2,
  }
};
