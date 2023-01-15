uniform float uAlpha;
uniform float uProgress;

varying vec2 vUv;

void main() {
  float deltaYtop=0.505;
  float deltaYbottom=0.495;
  float deltaXleft=0.15;
  float deltaXright=0.85;
  float posY = step(deltaYbottom, vUv.y) - step(deltaYtop, vUv.y);
  float posX = step(deltaXleft, vUv.x) - step(deltaXright*uProgress, vUv.x);
  float posResult = posY * posX;

  // Loading bar border
  float border = (step(vUv.y, deltaYtop + 0.004) * step(deltaYtop+0.003, vUv.y) // upper top border
    + step(vUv.y, deltaYbottom - 0.003) * step(deltaYbottom-0.004, vUv.y)) // lower top border
      *step(deltaXleft-0.004, vUv.x)*step(vUv.x, deltaXright+0.004) // removing parts which out of X borders
  + (step(deltaXleft-0.004, vUv.x)*step(vUv.x, deltaXleft-0.003) // left part of X border
    + step(deltaXright+0.003, vUv.x)*step(vUv.x, deltaXright+0.004)) // right part of X botder
      *step(vUv.y,deltaYtop+0.004)*step(deltaYbottom-0.004,vUv.y); // removing parts which out of Y borders

  float totalResult = posResult + border; // both patters sum

  gl_FragColor = vec4(totalResult, totalResult, totalResult, uAlpha);
}
