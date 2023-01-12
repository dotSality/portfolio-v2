import * as THREE from "three";
import { EventEmitter } from "./utils/EventEmitter";
import { App } from "./App";
import { Cursor } from "./utils/Cursor";

export class AppRaycaster extends EventEmitter {
  constructor() {
    super();

    this.app = new App();
    this.instance = new THREE.Raycaster();
    this.cursor = new Cursor();
    this.sizes = this.app.sizes;
    this.mouse = this.cursor.mouse;
    this.coords = null;
    this.camera = this.app.camera.instance;

    this.raycasterTarget = null;
    this.intersects = null;

    this.setCoords();
  }

  setCoords() {
    const x = this.mouse.x / this.sizes.width * 2 - 1;
    const y = 1 - this.mouse.y / this.sizes.height * 2;
    this.coords = { x, y };
  }

  setRaycasterTarget(target) {
    this.raycasterTarget = target;
  }

  update() {
    const x = this.mouse.x / this.sizes.width * 2 - 1;
    const y = 1 - this.mouse.y / this.sizes.height * 2;
    this.coords = { x, y };
    this.instance.setFromCamera(this.coords, this.camera);
    if (this.raycasterTarget) {
      this.intersects = this.instance.intersectObject(this.raycasterTarget);
    } else {
      this.intersects = [];
    }
  }
}