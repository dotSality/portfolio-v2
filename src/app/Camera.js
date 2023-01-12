import { App } from "./App";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class Camera {
  constructor() {
    this.app = new App();
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.canvas = this.app.canvas;
    this.time = this.app.time;

    this.debug = this.app.debug;

    this.init();
  }

  init() {
    this.isBlurringIn = false;
    this.isBlurringOut = false;

    this.setInstance();
    this.setOrbitControls();

    // this.initDebug();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      400,
    );
    this.instance.position.set(140, 85, 140);
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;

    // this.controls.minPolarAngle = Math.PI / 4;
    // this.controls.maxPolarAngle = Math.PI / 4 + Math.PI / 6;

    // this.controls.minDistance = 150;
    // this.controls.maxDistance = 300;
    //
    // this.controls.zoomSpeed = 0.3;
    // this.controls.rotateSpeed = 0.5;
    // this.controls.enablePan = false;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) {
      if (this.isBlurringIn) {
        this.instance.zoom += (1 / this.time.delta) / 2;
        console.log(this.instance.zoom);
      }
      if (this.isBlurringOut) {
        this.instance.zoom -= (1 / this.time.delta) / 2;
      }
      this.controls.update();
      this.instance.updateProjectionMatrix();
    }
  }

  async runBlurInAnimation() {
    await new Promise((res) => {
      this.isBlurringIn = true;
      this.canvas.classList.add("blur-in");
      this.controls.enableRotate = false;
      this.controls.enableZoom = false;
      setTimeout(() => {
        this.canvas.classList.remove("blur-in");
        this.canvas.classList.add("blurred");
        this.isBlurringIn = false;
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
        res();
      }, 1950);
    });
  }

  async runBlurOutAnimation() {
    await new Promise((res) => {
      this.isBlurringOut = true;
      this.instance.position.set(140, 85, 140);
      this.instance.zoom = 4.52;
      this.canvas.classList.remove("blurred");
      this.canvas.classList.add("blur-out");
      this.controls.enableRotate = false;
      this.controls.enableZoom = false;
      setTimeout(() => {
        this.canvas.classList.remove("blur-out");
        this.isBlurringOut = false;
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
        res();
      }, 1950);
    });
  }

  // initDebug() {
  //   this.debugFolder = this.debug.dat.addFolder("Camera");
  //
  //   this.debugFolder.add({
  //     "Blur in": () => {
  //       this.runBlurInAnimation();
  //     }
  //   }, "Blur in");
  //   this.debugFolder.add({
  //     "Blur out": () => {
  //       this.runBlurOutAnimation();
  //     }
  //   }, "Blur out");
  //   this.debugFolder.add({
  //     "Destroy camera": () => {
  //       this.destroy();
  //     }
  //   }, "Destroy camera");
  // }

  destroy() {
    this.controls.dispose();
  }
}