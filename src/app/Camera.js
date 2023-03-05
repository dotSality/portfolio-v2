import { App } from "./App";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EventEmitter } from "./utils/EventEmitter";
import { EVENTS_ENUM } from "../constants/events";

export class Camera extends EventEmitter {
  constructor() {
    super();
    this._app = new App();
    this._sizes = this._app.sizes;
    this._scene = this._app.scene;
    this._canvas = this._app.canvas;

    this._previousPosition = null;

    this._isMobile = this._app.isMobile;

    this.init();
  }

  init() {
    this._isBlurringIn = false;
    this._isBlurringOut = false;

    this._setInstance();
    this._setOrbitControls();

    if (this._isMobile) {
      this.initMobileEvents();
    }
  }

  initMobileEvents() {
    const oldPosition = this.instance.position.clone();

    this._sizes.on(EVENTS_ENUM.HORIZONTAL_ORIENTATION, () => {
      if (this.controls.enableRotate) {
        this.controls.minDistance = 10;
        this.controls.maxDistance = 60;
        const newPosition = oldPosition.multiplyScalar(2);
        this.instance.position.copy(newPosition);
      }
    });
    this._sizes.on(EVENTS_ENUM.VERTICAL_ORIENTATION, () => {
      if (this.controls.enableRotate) {
        this.controls.minDistance = 20;
        this.controls.maxDistance = 100;
        console.log(this.controls.maxDistance);
        const newPosition = oldPosition.multiplyScalar(0.8);
        this.instance.position.copy(newPosition);
      }
    });
  }

  _setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      35,
      this._sizes.width / this._sizes.height,
      0.1,
      200,
    );
    const initPositionVec = new THREE.Vector3(70, 42.5, 70);
    if (this._sizes.isHorizontal && this._isMobile) {
      initPositionVec.multiplyScalar(0.8);
    }
    this.instance.position.copy(initPositionVec);
    this._scene.add(this.instance);
  }

  _setOrbitControls() {
    this.controls = new OrbitControls(this.instance, this._canvas);
    this.controls.enableDamping = true;

    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = Math.PI / 4 + Math.PI / 6;

    const mobileMinDistance = this._isMobile ? 20 : 60;
    const mobileMaxDistance = this._isMobile ? 100 : 150;

    this.controls.minDistance = this._sizes.isHorizontal ? 10 : mobileMinDistance;
    this.controls.maxDistance = this._sizes.isHorizontal ? 60 : mobileMaxDistance;

    this.controls.zoomSpeed = 0.3;
    this.controls.rotateSpeed = 0.5;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableRotate = false;
  }

  setDefaultControlsRotation() {
    this.controls.saveState();
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;
  }

  _resetCameraAngle() {
    const distance = this.instance.position.distanceTo(new THREE.Vector3(0, 0, 0)) / 150;
    this.controls.reset();
    this.instance.position.multiplyScalar(distance);
  }

  resize() {
    this.instance.aspect = this._sizes.width / this._sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update() {
    if (this.controls) {
      const oldPosition = this.instance.position.clone();
      if (this._isBlurringIn) {
        const newPosition = oldPosition.multiplyScalar(0.996);
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
      }, 950);
    });
  }

  async runBlurOutAnimation() {
    await new Promise((res) => {
      this._resetCameraAngle();
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
      }, 950);
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
    this.controls.enableZoom = this._isMobile;
    if (this._isMobile) {
      this.controls.minDistance = 10;
      this.controls.maxDistance = 30;
    }
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
    this.controls.minDistance = this._isMobile ? 20 : 60;
    this.controls.maxDistance = this._isMobile ? 100 : 150;
    this.instance.position.copy(this._previousPosition);
    this.setPrevCameraCoords(null);
  }

  destroy() {
    this.controls.dispose();
  }
}