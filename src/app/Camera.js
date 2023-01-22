import { App } from "./App";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EventEmitter } from "./utils/EventEmitter";

export class Camera extends EventEmitter {
  constructor() {
    super();
    this.app = new App();
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.canvas = this.app.canvas;

    this.previousPosition = null;

    this.init();
  }

  init() {
    this.isBlurringIn = false;
    this.isBlurringOut = false;

    this.setInstance();
    this.setOrbitControls();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this.sizes.width / this.sizes.height,
      0.1,
      200,
    );
    this.instance.position.set(70, 42.5, 70);
    this.scene.add(this.instance);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;

    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = Math.PI / 4 + Math.PI / 6;

    this.controls.minDistance = 60;
    this.controls.maxDistance = 150;

    this.controls.zoomSpeed = 0.3;
    this.controls.rotateSpeed = 0.5;
    this.controls.enablePan = false;
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) {
      const oldPosition = this.instance.position.clone();
      if (this.isBlurringIn) {
        const newPosition = oldPosition.multiplyScalar(0.994);
        this.instance.position.copy(newPosition);
      }
      if (this.isBlurringOut) {
        const newPosition = oldPosition.multiplyScalar(1.006);
        this.instance.position.copy(newPosition);
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

  setPrevCameraCoords(posVec) {
    this.previousPosition = posVec;
  }

  moveControlsTo(posVec, lookVec) {
    this.controls.maxPolarAngle = Math.PI;
    this.controls.minDistance = 0;
    this.controls.dampingFactor = 0;
    this.controls.enableRotate = false;
    this.controls.enableZoom = false;
    this.instance.position.copy(posVec);
    this.controls.target.copy(lookVec);
  }

  resetControls() {
    // this.instance.position.reset();
    this.controls.target.set(0, 0, 0);
    this.controls.maxPolarAngle = Math.PI / 4 + Math.PI / 6;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 60;
    this.controls.maxDistance = 150;
    this.instance.position.copy(this.previousPosition);
    this.setPrevCameraCoords(null);
  }

  destroy() {
    this.controls.dispose();
  }
}