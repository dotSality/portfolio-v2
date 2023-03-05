import * as THREE from "three";
import { EventEmitter } from "../../utils/EventEmitter";
import { App } from "../../App";
import { Globe } from "./Globe";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import { getRandomCoord, getSign } from "../../../helpers/helpers";
import { GlobeScene } from "./GlobeScene";
import { TEXTURES_NAMES_ENUM } from "../../../constants/texturesName";
import { COLORS_ENUM } from "../../../constants/colors";

export class Snow extends EventEmitter {
  constructor() {
    super();

    this._app = new App();
    this._scene = this._app.scene;
    this._debug = this._app.debug;
    this._resources = this._app.resources;
    this._globe = new Globe();
    this._time = this._app.time;
    this._globeScene = new GlobeScene();

    this._disposed = false;

    this._isMobile = this._app.isMobile;
    this._snowflakesCount = this._isMobile ? 150 : 250;
    this._velocityValue = this._isMobile ? 0.05 : 0.2;
  }

  init() {
    this._disposed = false;
    this.render();
  }

  _getVelocities() {
    const velocityX = getSign() * (Math.random() * this._velocityValue + this._velocityValue);
    const velocityY = (Math.random() * this._velocityValue + this._velocityValue);
    const velocityZ = getSign() * (Math.random() * this._velocityValue + this._velocityValue);
    return [velocityX, velocityY, velocityZ];
  }

  _setGeometry() {
    const count = this._snowflakesCount * 3;
    this._geometry = new THREE.BufferGeometry(count);
    const positions = new Float32Array(count);
    const velocities = new Float32Array(count);

    this._globeSampler = new MeshSurfaceSampler(this._globe.getMesh()).build();

    for (let i = 0 ; i < count ; i += 1) {
      let newPosition = new THREE.Vector3();
      const index = i * 3;
      this._globeSampler.sample(newPosition);

      while (newPosition.y < this._globe.radius / 3) {
        newPosition = new THREE.Vector3();
        this._globeSampler.sample(newPosition);
      }

      const startX = getRandomCoord(newPosition.x, this._globe.radius);
      const startY = getRandomCoord(Math.abs(newPosition.y), this._globe.radius);
      const startZ = getRandomCoord(newPosition.z, this._globe.radius);

      const [velocityX, velocityY, velocityZ] = this._getVelocities();

      positions[index] = startX;
      positions[index + 1] = startY;
      positions[index + 2] = startZ;

      velocities[index] = velocityX;
      velocities[index + 1] = velocityY;
      velocities[index + 2] = velocityZ;
    }

    this._geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this._geometry.setAttribute("velocities", new THREE.BufferAttribute(velocities, 3));
  }

  _setMaterial() {
    this._material = new THREE.PointsMaterial({
      size: this._isMobile ? 0.8 : 2,
      sizeAttenuation: true,
      depthWrite: false,
      alphaMap: this._resources.items[TEXTURES_NAMES_ENUM.PARTICLE_TEXTURE],
      blending: THREE.AdditiveBlending,
      color: COLORS_ENUM.WHITE,
    });
  }

  _setPoints() {
    this._mesh = new THREE.Points(this._geometry, this._material);
    this._scene.add(this._mesh);
  }

  updateSnow() {
    if (this._mesh && !this._disposed) {
      const velocities = this._geometry.attributes["velocities"].array;
      for (let i = 0 ; i < this._snowflakesCount ; i += 1) {
        const index = i * 3;

        const velocityX = velocities[index];
        const velocityY = velocities[index + 1];
        const velocityZ = velocities[index + 2];

        const currentX = this._geometry.attributes.position.array[index];
        const currentY = this._geometry.attributes.position.array[index + 1];
        const currentZ = this._geometry.attributes.position.array[index + 2];

        const currentVec3 = new THREE.Vector3(currentX, currentY, currentZ);
        const testSpherical = new THREE.Spherical().setFromVector3(currentVec3);

        const isParticleReset = testSpherical.radius > (this._globe.radius * 0.97);

        if (currentY > 0.5 && !isParticleReset) {
          this._geometry.attributes.position.array[index] += 0.1 * velocityX;
          this._geometry.attributes.position.array[index + 1] -= 0.1 * velocityY;
          this._geometry.attributes.position.array[index + 2] += 0.1 * velocityZ;
        } else {
          const newVec3 = new THREE.Vector3();

          this._globeSampler.sample(newVec3);

          const newX = getRandomCoord(newVec3.x, this._globe.radius);
          const newY = getRandomCoord(Math.abs(newVec3.y), this._globe.radius);
          const newZ = getRandomCoord(newVec3.z, this._globe.radius);

          const [newVelocityX, newVelocityY, newVelocityZ] = this._getVelocities();

          this._geometry.attributes["velocities"].array[index] = newVelocityX;
          this._geometry.attributes["velocities"].array[index + 1] = newVelocityY;
          this._geometry.attributes["velocities"].array[index + 2] = newVelocityZ;

          this._geometry.attributes.position.array[index] = newX;
          this._geometry.attributes.position.array[index + 1] = newY;
          this._geometry.attributes.position.array[index + 2] = newZ;
        }
      }
      this._geometry.attributes.position.needsUpdate = true;
    }
  }

  destroy() {
    this._geometry.dispose();
    this._material.dispose();
    this._scene.remove(this._mesh);
    this._disposed = true;
  }

  render() {
    this._setGeometry();
    this._setMaterial();
    this._setPoints();
  }
}