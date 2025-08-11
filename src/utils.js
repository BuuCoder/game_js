export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const vecNormalizeDiag = (dx, dy) => {
  if (dx && dy){
    const inv = 1 / Math.sqrt(2);
    return [dx*inv, dy*inv];
  }
  return [dx, dy];
};
