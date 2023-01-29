import * as THREE from "three";
import { App } from "./App";

export class AppRaycaster {
  constructor() {
    this._app = new App();
    this.instance = new THREE.Raycaster();
    this._cursor = this._app.cursor;
    this._sizes = this._app.sizes;
    this._mouse = this._cursor.mouse;
    this._coords = null;
    this._camera = this._app.camera.instance;

    this.raycasterTargets = null;
    this.intersects = null;

    this.setCoords();
  }

  setCoords() {
    const x = this._mouse.x / this._sizes.width * 2 - 1;
    const y = 1 - this._mouse.y / this._sizes.height * 2;
    this._coords = { x, y };
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
    const x = this._mouse.x / this._sizes.width * 2 - 1;
    const y = 1 - this._mouse.y / this._sizes.height * 2;
    this._coords = { x, y };
    this.instance.setFromCamera(this._coords, this._camera);
    if (this.raycasterTargets) {
      this.intersects = this.instance.intersectObjects(this.raycasterTargets);
    } else {
      this.intersects = [];
    }
  }
}