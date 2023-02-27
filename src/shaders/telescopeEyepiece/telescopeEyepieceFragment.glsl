varying vec2 vUv;

uniform vec2 uPosition;
uniform sampler2D uTexture;

void main() {
  vec3 texture = texture2D(uTexture, vUv).rgb;

  float blurLenght = 0.025;
  float eyepieceRadius = 0.05;
  float strength = (1.0 - step(eyepieceRadius, abs(length(vUv - uPosition) - blurLenght))) *
  (abs(blurLenght + eyepieceRadius - length(vUv - uPosition))) / blurLenght;

  gl_FragColor = vec4(texture, strength);
}