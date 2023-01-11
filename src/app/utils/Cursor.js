import * as THREE from "three";
import { EventEmitter } from "./EventEmitter";

export class Cursor extends EventEmitter {
  constructor() {
    super();
    this.mouse = new THREE.Vector2();

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }
}