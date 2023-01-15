import * as THREE from "three";
import { App } from "../../App";
import { RESOURCES_NAMES_ENUM } from "../../../constants/modelNames";
import { TEXTURES_NAMES_ENUM } from "../../../constants/texturesName";
import { EVENTS_ENUM } from "../../../constants/events";

export class GlobeScene {
  constructor() {
    if (GlobeScene.instance) {
      return GlobeScene.instance;
    }
    GlobeScene.instance = this;

    this.app = new App();
    this.scene = this.app.scene;
    this.resources = this.app.resources;
    this._camera = this.app.camera;
    this._loadingBar = this.app._loadingBar;
    this._raycaster = this.app.raycaster;

    this._loadingBar.on(EVENTS_ENUM.FADING_FINISHED, () => {
      this._raycaster.setRaycasterTargets([this._raycasterTarget]);
    });

    this._camera.on(EVENTS_ENUM.FADE_TO_CITY, () => {
      console.log('ff');
      console.log(this._raycasterTarget);
      this._raycaster.setRaycasterTargets([this._raycasterTarget]);
    });
  }

  _setModel() {
    // Window light material
    const windowLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const windowDarkMaterial = new THREE.MeshBasicMaterial({ color: 0x212121 });

    // Fence material
    const fenceMaterial = new THREE.MeshBasicMaterial({ color: 0x1c1c1c });

    // Car lights material
    const lightsMaterial = new THREE.MeshBasicMaterial({ color: 0xfaffad, });

    // Street poles material
    const streetPolesMaterial = new THREE.MeshBasicMaterial({ color: 0x0d0d0d });

    // Baked city texture
    const bakedCityTexture = this.resources.items[TEXTURES_NAMES_ENUM.GLOBE_CITY_BAKED];
    bakedCityTexture.flipY = false;
    bakedCityTexture.anisotropy = Math.min(this.app.renderer.instance.capabilities.anisotropy, 4);

    // Baked roads texture
    const bakedRoadsTexture = this.resources.items[TEXTURES_NAMES_ENUM.GLOBE_ROADS_BAKED];
    bakedRoadsTexture.flipY = false;

    const bakedCityMaterial = new THREE.MeshBasicMaterial({
      map: bakedCityTexture,
    });

    const bakedRoadsMaterial = new THREE.MeshBasicMaterial({
      map: bakedRoadsTexture,
    });

    this.globeCity = this.resources.items[RESOURCES_NAMES_ENUM.GLOBE_CITY].scene;
    this.globeRoads = this.resources.items[RESOURCES_NAMES_ENUM.GLOBE_ROADS].scene;
    // Set baked city texture
    this.globeCity.traverse((child) => {
      if (/(white)/.test(child.name)) {
        child.material = windowLightMaterial;
        child.renderOrder = 1;
      } else if (/(grey)/.test(child.name)) {
        child.material = windowDarkMaterial;
        child.renderOrder = 1;
      } else if (child instanceof THREE.Mesh) {
        child.material = bakedCityMaterial;
        this._raycasterTarget = child;
      }
    });
    // Set baked roads texture
    this.globeRoads.traverse((child) => {
      if (child.name.includes("parts")) {
        child.material = lightsMaterial;
        child.renderOrder = 1;
      } else if (child.name.includes("fence")) {
        child.material = fenceMaterial;
      } else if (child.name === "streetlights") {
        child.material = streetPolesMaterial;
        child.material.side = THREE.DoubleSide;
      } else if (child.name === "streetlamp") {
        child.material = lightsMaterial;
        child.renderOrder = 1;
      } else if (child instanceof THREE.Mesh) {
        child.material = bakedRoadsMaterial;
      }
    });
    // Globe group
    this.globeGroup = new THREE.Group();
    this.globeGroup.add(this.globeCity, this.globeRoads);
    this.globeGroup.scale.set(25, 25, 25);
    this.globeGroup.position.set(0, -25, 0);
    this.scene.add(this.globeGroup);
  }

  init() {
    this._setModel();
  }

  destroy() {
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
    this.scene.remove(this.globeGroup);
  }
}