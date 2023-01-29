import { App } from "./App";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EventEmitter } from "./utils/EventEmitter";

export class Camera extends EventEmitter {
  constructor() {
    super();
    this._app = new App();
    this._sizes = this._app.sizes;
    this._scene = this._app.scene;
    this._canvas = this._app.canvas;

    this._previousPosition = null;

    this.init();
  }

  init() {
    this._isBlurringIn = false;
    this._isBlurringOut = false;

    this._setInstance();
    this._setOrbitControls();
  }

  _setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this._sizes.width / this._sizes.height,
      0.1,
      200,
    );
    this.instance.position.set(70, 42.5, 70);
    this._scene.add(this.instance);
  }

  _setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this._canvas);
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
    this.instance.aspect = this._sizes.width / this._sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) {
      const oldPosition = this.instance.position.clone();
      if (this._isBlurringIn) {
        const newPosition = oldPosition.multiplyScalar(0.994);
        this.instance.position.copy(newPosition);
      }
      if (this._isBlurringOut) {
        const newPosition = oldPosition.multiplyScalar(1.006);
        this.instance.position.copy(newPosition);
      }
      this.controls.update();
      this.instance.updateProjectionMatrix();
    }
  }

  async runBlurInAnimation() {
    await new Promise((res) => {
      this._isBlurringIn = true;
      this._canvas.classList.add("blur-in");
      this.controls.enableRotate = false;
      this.controls.enableZoom = false;
      setTimeout(() => {
        this._canvas.classList.remove("blur-in");
        this._canvas.classList.add("blurred");
        this._isBlurringIn = false;
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
        res();
      }, 1950);
    });
  }

  async runBlurOutAnimation() {
    await new Promise((res) => {
      this._isBlurringOut = true;
      this._canvas.classList.remove("blurred");
      this._canvas.classList.add("blur-out");
      this.controls.enableRotate = false;
      this.controls.enableZoom = false;
      setTimeout(() => {
        this._canvas.classList.remove("blur-out");
        this._isBlurringOut = false;
        this.controls.enableRotate = true;
        this.controls.enableZoom = true;
        res();
      }, 1950);
    });
  }

  setPrevCameraCoords(posVec) {
    this._previousPosition = posVec;
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
    this.controls.target.set(0, 0, 0);
    this.controls.maxPolarAngle = Math.PI / 4 + Math.PI / 6;
    this.controls.enableRotate = true;
    this.controls.enableZoom = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 60;
    this.controls.maxDistance = 150;
    this.instance.position.copy(this._previousPosition);
    this.setPrevCameraCoords(null);
  }

  destroy() {
    this.controls.dispose();
  }
}