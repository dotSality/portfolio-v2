import { App } from "../../App";
import { Globe } from "./Globe";
import { Snow } from "./Snow";
import { GlobeScene } from "./GlobeScene";
import { EVENTS_ENUM } from "../../../constants/events";

export class GlobeWorld {
  constructor() {
    this.app = new App();
    this.resources = this.app.resources;

    this.globe = new Globe();
    this.globeScene = new GlobeScene();
    this.snow = new Snow();

    this.resources.on(EVENTS_ENUM.READY, () => {
      this.initWorld();
    });
  }

  initWorld() {
    this.globe.init();
    this.globeScene.init();
    this.snow.init();
  }

  destroyWorld() {
    this.globe.destroy();
    this.globeScene.destroy();
    this.snow.destroy();
  }

  update() {
    this.snow.updateSnow();
  }
}