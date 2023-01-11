import { App } from "../../App";
import { Globe } from "./Globe";
import { Snow } from "./Snow";
import { GlobeScene } from "./GlobeScene";
import { Light } from "./Light";
import { EVENTS_ENUM } from "../../../constants/events";
import { SCENES_NAMES_ENUM } from "../../../constants/sceneNames";
import { Camera } from "../../Camera";

export class GlobeWorld {
  constructor() {
    this.app = new App();
    this.resources = this.app.resources;

    this.globe = new Globe();
    // this.light = new Light();
    this.globeScene = new GlobeScene();
    this.snow = new Snow();

    this.resources.on(EVENTS_ENUM.READY, () => {
      this.initWorld();
    });
  }

  initWorld() {
    this.globe.init();
    // this.light.init();
    this.globeScene.setModel();
    this.snow.init();
  }

  destroyWorld() {
    this.globe.destroy();
    // this.light.destroy();
    this.globeScene.destroy();
    this.snow.destroy();
  }

  update() {
    this.snow.updateSnow();
  }
}