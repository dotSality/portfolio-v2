import * as THREE from "three";
import { App } from "../../App";
import { COLORS_ENUM } from "../../../constants/colors";

export class Globe {
  constructor() {

    if (Globe.instance) {
      return Globe.instance;
    }
    Globe.instance = this;

    this._app = new App();
    this._debug = this._app.debug;
    this._scene = this._app.scene;

    this.radius = 25;
  }

  setGeometry() {
    this._geometry = new THREE.IcosahedronGeometry(this.radius, 32, 32);
  }

  setMaterial() {
    this._material = new THREE.MeshPhysicalMaterial({
      color: COLORS_ENUM.GLOBE_MATERIAL_COLOR,
      roughness: 0,
      metalness: 0,
      transmission: 0.78,
      reflectivity: 1,
      thickness: 0.3,
    });
  }

  setMesh() {
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._scene.add(this._mesh);
  }

  setDebugTools() {
    this._debug.dat.add(this._mesh.material, "roughness").min(0).max(1).step(0.01);
    this._debug.dat.add(this._mesh.material, "metalness").min(0).max(1).step(0.01);
    this._debug.dat.add(this._mesh.material, "transmission").min(0).max(1).step(0.01);
    this._debug.dat.add(this._mesh.material, "reflectivity").min(0).max(1).step(0.01);
    this._debug.dat.addColor(this._mesh.material, "color").name("Globe color");
  }

  getMesh() {
    return this._mesh;
  }

  init() {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setDebugTools();
  }

  destroy() {
    this._geometry.dispose();
    this._material.dispose();
    this._scene.remove(this._mesh);
  }
}