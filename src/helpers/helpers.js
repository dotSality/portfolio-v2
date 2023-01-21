import * as THREE from "three";

export const getSign = () => Math.random() > 0.5 ? 1 : -1;

const radToDeg = (rad) => rad * (180 / Math.PI);

export const getRandomCoord = (axisPos, radius, delta = 0.03) => {
  return axisPos * 0.94 + (getSign() * radius * delta);
};

export const generateShapeGeometry = (x, y, width, height, radius) => {
  const shape = new THREE.Shape();

  (function roundedRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
  })(shape, -width / 2, -height / 2, width, height, radius);

  const shapeGeometry = new THREE.ShapeGeometry(shape);

  return shapeGeometry;
}