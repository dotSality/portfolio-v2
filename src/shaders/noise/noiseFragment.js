import { ShaderChunk } from "three";

export const noiseFragment = ShaderChunk.logdepthbuf_pars_fragment + `
  uniform float uTime;
  
  varying vec2 vUv;
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  void main() {
    float strength = random(vUv.xy * uTime / 40.0);
    ` + ShaderChunk.logdepthbuf_fragment + `
    gl_FragColor = vec4(strength, strength, strength, 1.0);
  }
`;