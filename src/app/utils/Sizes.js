import { EventEmitter } from "./EventEmitter";
import { EVENTS_ENUM } from "../../constants/events";
import { App } from "../App";

export class Sizes extends EventEmitter {
  constructor() {
    super();
    this._app = new App();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this._isMobile = this._app.isMobile;

    if (this._isMobile) {
      this.isHorizontal = this.width > this.height;
    }

    window.addEventListener("resize", () => {
      console.log("resize");
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.pixelRatio = Math.min(window.devicePixelRatio, 2);
      this.trigger(EVENTS_ENUM.RESIZE);
    });

    if (this._isMobile) {
      window.addEventListener("orientationchange", (e) => {
        const { angle } = e.target.screen.orientation;
        this.isHorizontal = this.width < this.height;
        console.log("sized: ", this.isHorizontal);
        const event = Math.abs(angle) === 90
          ? EVENTS_ENUM.HORIZONTAL_ORIENTATION
          : EVENTS_ENUM.VERTICAL_ORIENTATION;
        this.trigger(event);
      });
    }
  }
}