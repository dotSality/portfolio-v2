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
import { AppRaycaster } from "./Raycaster";
import { Cursor } from "./utils/Cursor";

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
    this.cursor = new Cursor();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = new Camera();
    this.raycaster = new AppRaycaster();
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

    this.debugObject = {
      goToRoom: async () => {
        await this.goToRoomWorld();
      },
      goToGlobe: async () => {
        await this.goToGlobeWorld();
      },
    };
    const folder = this.debug.dat.addFolder("scenes");
    folder.add(this.debugObject, "goToRoom");
    folder.add(this.debugObject, "goToGlobe");
  }

  async goToRoomWorld() {
    this.raycaster.setRaycasterTargets(null);
    await this.camera.runBlurInAnimation();
    this.globeWorld.destroyWorld();
    this.roomWorld.initWorld();
    await this.camera.runBlurOutAnimation();
  }

  async goToGlobeWorld() {
    this.raycaster.setRaycasterTargets(null);
    await this.camera.runBlurInAnimation();
    this.roomWorld.destroyWorld();
    this.globeWorld.initWorld();
    await this.camera.runBlurOutAnimation();
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