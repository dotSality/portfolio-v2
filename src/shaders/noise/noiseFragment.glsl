varying vec2 vUv;
uniform float uTime;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float strength = random(vUv.xy * uTime / 40.0);

  gl_FragColor = vec4(strength, strength, strength, 1.0);
}