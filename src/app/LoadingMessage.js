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

    this._triggerEnterMessageCallback = (e) => {
      if (e.key === "Enter") {
        if (this._timeoutId) {
          return;
        }
        const enterMessageElement = document.querySelector(".enter-message");
        enterMessageElement.classList.add("appear");
        const enterMessageProgressBar = document.createElement("div");
        enterMessageProgressBar.className = "enter-message_progress-bar";
        enterMessageElement.appendChild(enterMessageProgressBar);
        this._timeoutId = setTimeout(() => {
          enterMessageElement.classList.remove("appear");
          enterMessageProgressBar.remove();
          this._timeoutId = null;
        }, 3000);
      }
    };

    this._app.resources.on(EVENTS_ENUM.READY, () => {
      this._messageElement.classList.add("fade-in");
      const clickableElement = document.querySelector(".hello-message_clickable");
      clickableElement.addEventListener("click", () => {
        this._messageElement.classList.add("fade-out");
        this._messageElement.style.pointerEvents = "none";
        window.removeEventListener("keydown", this._triggerEnterMessageCallback);
        this.trigger(EVENTS_ENUM.READY_CLICK);
      });

      window.addEventListener("keydown", this._triggerEnterMessageCallback);
    });

    this._loadingBar.on(EVENTS_ENUM.FADING_FINISHED, () => {
      this._messageElement.remove();
    });
  }
}