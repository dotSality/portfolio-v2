import { ShaderChunk } from "three";

export const snakeCanvasVertex = ShaderChunk.common + "\n" + ShaderChunk.logdepthbuf_pars_vertex + `
  varying vec2 vUv;

  void main() {
    vUv=uv;
  ` + ShaderChunk.logdepthbuf_vertex + `
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;