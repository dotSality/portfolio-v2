export const getSign = () => Math.random() > 0.5 ? 1 : -1;

const radToDeg = (rad) => rad * (180 / Math.PI);

export const getRandomCoord = (axisPos, radius, delta = 0.03) => {
  return axisPos * 0.94 + (getSign() * radius * delta);
};