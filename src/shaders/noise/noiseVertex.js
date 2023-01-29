import { ShaderChunk } from "three";

export const noiseVertex = ShaderChunk.common + "\n" + ShaderChunk.logdepthbuf_pars_vertex + `
  varying vec2 vUv;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
` + ShaderChunk.logdepthbuf_vertex + `
    vUv = uv;
  }
`;