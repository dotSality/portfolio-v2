import * as THREE from "three";
import { EventEmitter } from "../../utils/EventEmitter";
import { App } from "../../App";
import { RESOURCES_NAMES_ENUM } from "../../../constants/modelNames";
import { EVENTS_ENUM } from "../../../constants/events";

export class RoomWorld extends EventEmitter {
  constructor() {
    super();

    this.app = new App();
    this.resources = this.app.resources;
    this.scene = this.app.scene;
    this._camera = this.app.camera;

    this.raycaster = this.app.raycaster;

    this._camera.on(EVENTS_ENUM.FADE_TO_ROOM, () => {
      this.raycaster.setRaycasterTargets(this._raycastingTargets);
    });
  }

  setScene() {
    this.roomScene = this.resources.items[RESOURCES_NAMES_ENUM.ROOM_SCENE].scene;

    this.roomScene.scale.set(10, 10, 10);
    this.roomScene.position.set(0, -20, 0);

    const targets = [];
    this.roomScene.traverse((child) => {
      if (child.name === "exitsign" || child.name === "Cube045_1") {
        targets.push(child);
      }
    });
    this._raycastingTargets = targets;

    this.scene.add(this.roomScene);
  }

  setLights() {
    this.ambientLight = new THREE.AmbientLight(0xfff5b6, 1);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0xfff5b6, 4, 100, 0);
    this.pointLight.position.set(0, 35, 0);
    this.scene.add(this.pointLight);

    // this.app.debug.dat.addColor(this.pointLight, "color")
    //     .name('room color');
    // this.app.debug.dat.add(this.pointLight, "intensity")
    //     .min(0)
    //     .max(10)
    //     .name('point light intensity');
    // this.app.debug.dat.addColor(this.ambientLight, "color")
    //     .name('ambient color');
  }

  initWorld() {
    this.setScene();
    this.setLights();
  }

  destroyWorld() {
    this.ambientLight.dispose();
    this.scene.remove(this.ambientLight);
    this.pointLight.dispose();
    this.scene.remove(this.pointLight);
    this.roomScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
    this.scene.remove(this.roomScene);
  }
}