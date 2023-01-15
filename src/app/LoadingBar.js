import * as THREE from "three";
import { App } from "./App";
import loadingBarVertex from "../shaders/loadingBar/loadingBarVertex.glsl";
import loadingBarFragment from "../shaders/loadingBar/loadingBarFragment.glsl";
import { EVENTS_ENUM } from "../constants/events";
import { EventEmitter } from "./utils/EventEmitter";

export class LoadingBar extends EventEmitter {
  constructor() {
    super();
    this._app = new App();
    this._scene = this._app.scene;
    this._cursor = this._app.cursor;
    this._resources = this._app.resources;
    this._time = this._app.time;

    this._fadingOutSpeed = 0.02;
    this._progress = 0;
    this._isLoading = true;
    this._isFading = false;
    this._setOverlayMesh();

    this._resources.on(EVENTS_ENUM.READY, () => {
      this._isFading = true;
    });

    this._resources.on(EVENTS_ENUM.LOADING_STATUS, (progress) => {
      this._progress = progress;
    });

    this.on(EVENTS_ENUM.FADING_FINISHED, () => {
      this.destroy();
    });
  }

  _setOverlayMaterial() {
    this._overlayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: loadingBarVertex,
      fragmentShader: loadingBarFragment,
      uniforms: {
        uAlpha: { value: 1 },
        uProgress: { value: this._progress },
      }
    });
  }

  _setOverlayGeometry() {
    this._overlayGeometry = new THREE.PlaneGeometry(
      2,
      2,
      1,
      1
    );
  }

  _setOverlayMesh() {
    this._setOverlayMaterial();
    this._setOverlayGeometry();
    this._overlayMesh = new THREE.Mesh(this._overlayGeometry, this._overlayMaterial);
    this._scene.add(this._overlayMesh);
  }

  update() {
    if (this._isLoading) {
      this._overlayMaterial.uniforms.uProgress.value = this._progress;
      if (this._progress === 1) {
        this._isLoading = false;
      }
    }
    if (this._isFading) {
      this._overlayMaterial.uniforms.uAlpha.value -= this._fadingOutSpeed;
      if (this._overlayMaterial.uniforms.uAlpha.value <= 0) {
        this._isFading = false;
        this.trigger(EVENTS_ENUM.FADING_FINISHED);
      }
    }
  }

  destroy() {
    this._overlayGeometry.dispose();
    this._overlayMaterial.dispose();
    this._scene.remove(this._overlayMesh);
  }
}