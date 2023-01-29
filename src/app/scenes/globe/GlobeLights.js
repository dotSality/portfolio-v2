import { App } from "../../App";
import * as THREE from "three";
import { COLORS_ENUM } from "../../../constants/colors";

export class GlobeLights {
  constructor() {
    this._app = new App();
    this._scene = this._app.scene;

    this._setLight();
  }

  _setLight() {
    this._light = new THREE.SpotLight(COLORS_ENUM.WHITE, 30, 60, 120, 1, 0.9);
    this._light.position.set(15, 40, -10);
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