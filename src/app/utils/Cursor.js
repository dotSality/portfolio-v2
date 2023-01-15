import * as THREE from "three";
import { EventEmitter } from "./EventEmitter";
import { EVENTS_ENUM } from "../../constants/events";

export class Cursor extends EventEmitter {
  constructor() {
    super();
    this.mouse = new THREE.Vector2();

    this.onMouseDownCoord = null;

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.onmousedown = (e) => {
      this.onMouseDownCoord = {
        x: e.clientX,
        y: e.clientY,
      };
    };
    window.onmouseup = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (x === this.onMouseDownCoord.x && y === this.onMouseDownCoord.y) {
        this.trigger(EVENTS_ENUM.CLICK);
      }
      this.onMouseDownCoord = null;
    };

    this.on(EVENTS_ENUM.CLICK, () => {
      console.log("click event");
    });
  }
}