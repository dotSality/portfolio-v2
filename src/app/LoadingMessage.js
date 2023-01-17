import { EventEmitter } from "./utils/EventEmitter";
import { App } from "./App";
import { EVENTS_ENUM } from "../constants/events";

export class LoadingMessage extends EventEmitter {
  constructor() {
    super();

    this._app = new App();
    this._messageElement = document.querySelector(".hello-message");
    this._loadingBar = this._app.loadingBar;
    this._resources = this._app.resources;

    this._app.resources.on(EVENTS_ENUM.READY, () => {
      this._messageElement.classList.add("fade-in");
      const clickableElement = document.querySelector(".hello-message_clickable");
      clickableElement.addEventListener("click", () => {
        this._messageElement.classList.add("fade-out");
        this.trigger(EVENTS_ENUM.READY_CLICK);
      });
    });

    this._loadingBar.on(EVENTS_ENUM.FADING_FINISHED, () => {
      this._messageElement.remove();
    });
  }
}