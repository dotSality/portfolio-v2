import { App } from "../../App";
import { Globe } from "./Globe";
import { Snow } from "./Snow";
import { GlobeScene } from "./GlobeScene";
import { EVENTS_ENUM } from "../../../constants/events";

export class GlobeWorld {
  constructor() {
    this._app = new App();
    this._resources = this._app.resources;

    this._globe = new Globe();
    this._globeScene = new GlobeScene();
    this._snow = new Snow();

    this._resources.on(EVENTS_ENUM.READY, () => {
      this.initWorld();
    });
  }

  initWorld() {
    this._globe.init();
    this._globeScene.init();
    this._snow.init();
  }

  destroyWorld() {
    this._globe.destroy();
    this._globeScene.destroy();
    this._snow.destroy();
  }

  update() {
    this._snow.updateSnow();
  }
}