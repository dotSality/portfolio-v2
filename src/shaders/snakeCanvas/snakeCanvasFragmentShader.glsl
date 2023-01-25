varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  vec3 t = texture2D(uTexture, vUv).rgb;

  gl_FragColor = vec4(t, 1.0);
}
