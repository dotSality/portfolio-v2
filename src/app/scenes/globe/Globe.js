import * as THREE from "three";
import { App } from "../../App";

export class Globe {
  constructor() {

    if (Globe.instance) {
      return Globe.instance;
    }
    Globe.instance = this;

    this.app = new App();
    this.debug = this.app.debug;
    this.scene = this.app.scene;

    this.radius = 25;
  }

  setGeometry() {
    this.geometry = new THREE.IcosahedronGeometry(this.radius, 32, 32);
  }

  setMaterial() {
    this.material = new THREE.MeshPhysicalMaterial({
      roughness: 0,
      metalness: 0,
      transmission: 1,
      reflectivity: 1,
      clearcote: 1,
      clearcoatRoughness: 1,
      thickness: 0.3,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  setDebugTools() {
    this.debug.dat.add(this.mesh.material, "roughness").min(0).max(1).step(0.01);
    this.debug.dat.add(this.mesh.material, "metalness").min(0).max(1).step(0.01);
    this.debug.dat.add(this.mesh.material, "transmission").min(0).max(1).step(0.01);
    this.debug.dat.add(this.mesh.material, "reflectivity").min(0).max(1).step(0.01);
    this.debug.dat.add(this.mesh.material, "clearcoat").min(0).max(1).step(0.01);
    this.debug.dat.add(this.mesh.material, "clearcoatRoughness").min(0).max(1).step(0.01);
  }

  init() {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setDebugTools();
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
  }
}