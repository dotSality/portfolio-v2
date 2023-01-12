import * as THREE from "three";
import { EventEmitter } from "../../utils/EventEmitter";
import { App } from "../../App";
import { RESOURCES_NAMES_ENUM } from "../../../constants/modelNames";

export class RoomWorld extends EventEmitter {
  constructor() {
    super();

    this.app = new App();
    this.resources = this.app.resources;
    this.scene = this.app.scene;
  }

  setScene() {
    this.roomScene = this.resources.items[RESOURCES_NAMES_ENUM.ROOM_SCENE].scene;

    this.roomScene.scale.set(15, 15, 15);
    this.roomScene.position.set(0, -15, 0);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0xf3e7d3, 10, 200, 0);
    this.pointLight.position.set(0,35,0)
    this.scene.add(this.pointLight);

    const lightHelper = new THREE.PointLightHelper(this.pointLight);
    this.scene.add(lightHelper)

    this.scene.add(this.roomScene);
  }

  destroy() {
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