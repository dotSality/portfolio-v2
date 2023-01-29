import { App } from "../../App";
import { Globe } from "./Globe";
import { Snow } from "./Snow";
import { GlobeScene } from "./GlobeScene";
import { EVENTS_ENUM } from "../../../constants/events";
import { GlobeLights } from "./GlobeLights";

export class GlobeWorld {
  constructor() {
    this._app = new App();
    this._resources = this._app.resources;

    this._globe = new Globe();
    this._globeScene = new GlobeScene();
    this._snow = new Snow();
    this._light = new GlobeLights();

    this._resources.on(EVENTS_ENUM.READY, () => {
      this.initWorld();
    });
  }

  initWorld() {
    this._globe.init();
    this._globeScene.init();
    this._snow.init();
    this._light.toggleLight();
  }

  destroyWorld() {
    this._globe.destroy();
    this._globeScene.destroy();
    this._snow.destroy();
    this._light.toggleLight();
  }

  update() {
    this._snow.updateSnow();
  }
}