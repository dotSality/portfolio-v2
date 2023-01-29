import { ShaderChunk } from "three";

export const snakeCanvasFragment = ShaderChunk.logdepthbuf_pars_fragment + `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  
  void main() {
    vec3 t = texture2D(uTexture, vUv).rgb;
  ` + ShaderChunk.logdepthbuf_fragment + `
    gl_FragColor = vec4(t, 1.0);
  }
`;