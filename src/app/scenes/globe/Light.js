import * as THREE from "three";
import { App } from "../../App";

export class Light {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;

    this.bottomLight = new THREE.AmbientLight(0xffffff, 1);

    // this.mainLight = new THREE.DirectionalLight(0xffffff, 2);
    // this.mainLight.position.set(55, 125, 0);
    // this.mainLight.castShadow = true;
    // this.mainLight.shadow.camera.near = 0;
    // this.mainLight.shadow.camera.far = 200;
    // this.mainLight.shadow.mapSize.set(512, 512);
    // this.mainLight.shadow.bias = -0.008;
    //
    // this.mainLight.shadow.camera.left = -100;
    // this.mainLight.shadow.camera.right = 100;
    // this.mainLight.shadow.camera.top = 100;
    // this.mainLight.shadow.camera.bottom = -100;

    this.initDebut();
  }

  init() {
    // this.scene.add(this.bottomLight);
    // this.scene.add(this.mainLight);
  }

  initDebut() {
    this.debugFolder = this.app.debug.dat.addFolder("Lights");
    this.debugObject = {
      removeLights: () => {
        this.destroy();
      }
    };
    this.debugFolder.add(this.debugObject, "removeLights");
  }

  destroy() {
    this.bottomLight.dispose();
    // this.mainLight.dispose();
    this.scene.remove(this.bottomLight);
    // this.scene.remove(this.mainLight);
  }
}