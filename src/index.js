import "./style.css";
// import testVertexShader from "./shaders/broken-tv/brokenTvVertex.glsl";
// import testFragmentShader from "./shaders/broken-tv/brokenTvFragment.glsl";
import { App } from "./app/App";
import { DeviceDetection } from "./app/utils/DeviceDetection";

const dd = new DeviceDetection(navigator.userAgent);
const isMobile = dd.isMobile();
console.log(isMobile);
const canvas = document.querySelector(".webgl");
const app = new App(canvas, isMobile);