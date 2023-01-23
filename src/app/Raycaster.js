import * as THREE from "three";
import { EventEmitter } from "./utils/EventEmitter";
import { App } from "./App";

export class AppRaycaster extends EventEmitter {
  constructor() {
    super();

    this.app = new App();
    this.instance = new THREE.Raycaster();
    this.cursor = this.app.cursor;
    this.sizes = this.app.sizes;
    this.mouse = this.cursor.mouse;
    this.coords = null;
    this.camera = this.app.camera.instance;

    this.raycasterTargets = null;
    this.intersects = null;

    this.setCoords();
  }

  setCoords() {
    const x = this.mouse.x / this.sizes.width * 2 - 1;
    const y = 1 - this.mouse.y / this.sizes.height * 2;
    this.coords = { x, y };
  }

  setRaycasterTargets(targets) {
    this.raycasterTargets = targets;
  }

  updateRaycasterTargets(_arg) {
    if (Array.isArray(_arg)) {
      this.raycasterTargets = [...this.raycasterTargets, ..._arg];
    } else {
      if (!this.raycasterTargets?.length) {
        this.raycasterTargets = [_arg];
      } else {
        this.raycasterTargets.push(_arg);
      }
    }
  }

  filterRaycasterTargets(_id) {
    this.raycasterTargets = this.raycasterTargets.filter((object) => object.id !== _id);
  }

  update() {
    const x = this.mouse.x / this.sizes.width * 2 - 1;
    const y = 1 - this.mouse.y / this.sizes.height * 2;
    this.coords = { x, y };
    this.instance.setFromCamera(this.coords, this.camera);
    if (this.raycasterTargets) {
      this.intersects = this.instance.intersectObjects(this.raycasterTargets);
    } else {
      this.intersects = [];
    }
  }
}