import * as THREE from "three";
import { EventEmitter } from "./EventEmitter";
import { EVENTS_ENUM } from "../../constants/events";
import { App } from "../App";

export class Cursor extends EventEmitter {
  constructor() {
    super();
    this._app = new App();
    this._isMobile = this._app.isMobile;
    this._sizes = this._app.sizes;
    this.mouse = new THREE.Vector2();
    this.proportionMouse = new THREE.Vector2();

    this._onMouseDownCoord = null;

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      this.proportionMouse.x = e.clientX / this._sizes.width;
      this.proportionMouse.y = 1 - e.clientY / this._sizes.height;
    });

    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    window.onmousedown = (e) => {
      this._onMouseDownCoord = {
        x: e.clientX,
        y: e.clientY,
      };
    };
    window.onmouseup = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (x === this._onMouseDownCoord.x
        && y === this._onMouseDownCoord.y
        // check if main mouse button was clicked
        && e.button === 0
      ) {
        this.trigger(EVENTS_ENUM.CLICK);
      }
      this._onMouseDownCoord = null;
    };
  }
}