varying vec2 vUv;
varying float vTime;

uniform float uTime;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    vUv = uv;
    vTime = uTime;
}