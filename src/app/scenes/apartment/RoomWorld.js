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
    this.roomScene = this.resources.items[RESOURCES_NAMES_ENUM.ROOM_SCENE];

    this.roomScene.scale.set(50, 50, 50);
    this.roomScene.position.set(0, -50, 0);

    this.scene.add(this.roomScene);
  }

  destroy() {
    this.roomScene.material.dispose();
    this.roomScene.geometry.dispose();
    this.roomScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.dispose();
        child.geometry.dispose();
      }
    });
    this.scene.remove(this.roomScene);
  }
}