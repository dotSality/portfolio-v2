import "./style.css";
// import testVertexShader from "./shaders/broken-tv/brokenTvVertex.glsl";
// import testFragmentShader from "./shaders/broken-tv/brokenTvFragment.glsl";
import { App } from "./app/App";

const canvas = document.querySelector(".webgl");
const app = new App(canvas);