import { App } from "../../App";
import * as THREE from "three";

export class GlobeLights {
  constructor() {
    this._app = new App();
    this._scene = this._app.scene;

    this._setLight();
  }

  _setLight() {
    this._light = new THREE.SpotLight(0xffffff, 20, 60, 120, 1);
    this._light.position.set(25, 40, 25);
    this._scene.add(this._light);
    this._scene.add(this._light.target);
    this._light.visible = false;
  }

  init() {
    this._setLight();
  }

  toggleLight() {
    this._light.visible = !this._light.visible;
  }
}