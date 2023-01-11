import * as THREE from "three";
import { Time } from "./utils/Time";
import { EVENTS_ENUM } from "../constants/events";
import { Sizes } from "./utils/Sizes";
import { Renderer } from "./Renderer";
import { Resources } from "./utils/Resources";
import { Debug } from "./utils/Debug";
import { GlobeWorld } from "./scenes/globe/GlobeWorld";
import { Camera } from "./Camera";
import { RoomWorld } from "./scenes/apartment/RoomWorld";

export class App {
  constructor(canvas) {
    if (App.instance) {
      return App.instance;
    }
    App.instance = this;

    this.canvas = canvas;
    this.resources = new Resources();
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.globeWorld = new GlobeWorld();
    this.roomWorld = new RoomWorld();
    this.renderer = new Renderer();

    this.time.on(EVENTS_ENUM.TICK, () => {
      this.update();
    });

    this.sizes.on(EVENTS_ENUM.RESIZE, () => {
      this.resize();
    });

    this.resources.on(EVENTS_ENUM.READY, () => {
      console.log("All resources have been loaded");
    });
  }

  goToRoomWorld() {
    this.camera.runBlurInAnimation();
    this.roomWorld.destroy();
    this.globeWorld.initWorld();
    this.camera.runBlurOutAnimation();
  }

  goToGlobeWorld() {
    this.camera.runBlurInAnimation();
    this.globeWorld.destroyWorld();
    this.roomWorld.setScene();
    this.camera.runBlurOutAnimation();
  }

  resize() {
    this.camera.resize();
    this.renderer.resize();
  }

  update() {
    this.camera.update();
    this.globeWorld.update();
    this.renderer.update();
  }
}