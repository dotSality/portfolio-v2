import * as THREE from "three";
import { App } from "../../App";
import telescopeEyepieceVertex from "../../../shaders/telescopeEyepiece/telescopeEyepieceVertex.glsl";
import telescopeEyepieceFragment from "../../../shaders/telescopeEyepiece/telescopeEyepieceFragment.glsl";
import { TEXTURES_NAMES_ENUM } from "../../../constants/texturesName";
import { EVENTS_ENUM } from "../../../constants/events";
import { EventEmitter } from "../../utils/EventEmitter";

export class StarSky extends EventEmitter {
  constructor() {
    super();
    this._app = new App();
    this._scene = this._app.scene;
    this._resources = this._app.resources;
    this._cursor = this._app.cursor;
    this._proportionMouse = this._cursor.proportionMouse;

    this._resources.on(EVENTS_ENUM.READY, () => {
      this._starSkyTexture = this._resources.items[TEXTURES_NAMES_ENUM.STAR_SKY_TEXTURE];
      this._starSkyTexture.encoding = THREE.sRGBEncoding;
    });

    this._exitCallback = () => {
      this.trigger(EVENTS_ENUM.STAR_SKY_DESTROY);
    };
  }

  _setMaterial() {
    this._starSkyMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: telescopeEyepieceVertex,
      fragmentShader: telescopeEyepieceFragment,
      uniforms: {
        uTexture: { value: this._starSkyTexture },
        uPosition: { value: this._proportionMouse },
      }
    });
  }

  _setGeometry() {
    this._starSkyGeometry = new THREE.PlaneGeometry(
      2,
      2,
      64,
      64,
    );
  }

  _setMesh() {
    this._starSkyMesh = new THREE.Mesh(
      this._starSkyGeometry,
      this._starSkyMaterial,
    );
    this._scene.add(this._starSkyMesh);
  }

  destroy() {
    this._starSkyMaterial.dispose();
    this._starSkyGeometry.dispose();
    this._scene.remove(this._starSkyMesh);
    document.body.classList.remove("no-cursor");
    window.removeEventListener("mousedown", this._exitCallback);
  }

  init() {
    document.body.classList.add("no-cursor");
    this._setMaterial();
    this._setGeometry();
    this._setMesh();
    window.addEventListener("mousedown", this._exitCallback);
  }

  update() {
    this._starSkyMaterial.uniforms.uPosition.value = this._proportionMouse;
  }
}