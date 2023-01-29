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

    this.app = new App();
    this.scene = this.app.scene;
    this.debug = this.app.debug;
    this.resources = this.app.resources;
    this.globe = new Globe();
    this.time = this.app.time;
    this.globeScene = new GlobeScene();

    this.disposed = false;
    this.snowflakesCount = 250;
  }

  init() {
    this.disposed = false;
    this.render();
  }

  getVelocities() {
    const velocityX = getSign() * (Math.random() * 0.2 + 0.2);
    const velocityY = (Math.random() * 0.2 + 0.2);
    const velocityZ = getSign() * (Math.random() * 0.2 + 0.2);
    return [velocityX, velocityY, velocityZ];
  }

  setGeometry() {
    const count = this.snowflakesCount * 3;
    this.geometry = new THREE.BufferGeometry(count);
    const positions = new Float32Array(count);
    const velocities = new Float32Array(count);

    this.globeSampler = new MeshSurfaceSampler(this.globe.mesh).build();

    for (let i = 0 ; i < count ; i += 1) {
      let newPosition = new THREE.Vector3();
      const index = i * 3;
      this.globeSampler.sample(newPosition);

      while (newPosition.y < this.globe.radius / 3) {
        newPosition = new THREE.Vector3();
        this.globeSampler.sample(newPosition);
      }

      const startX = getRandomCoord(newPosition.x, this.globe.radius);
      const startY = getRandomCoord(Math.abs(newPosition.y), this.globe.radius);
      const startZ = getRandomCoord(newPosition.z, this.globe.radius);

      const [velocityX, velocityY, velocityZ] = this.getVelocities();

      positions[index] = startX;
      positions[index + 1] = startY;
      positions[index + 2] = startZ;

      velocities[index] = velocityX;
      velocities[index + 1] = velocityY;
      velocities[index + 2] = velocityZ;
    }

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("velocities", new THREE.BufferAttribute(velocities, 3));
  }

  setMaterial() {
    this.material = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      depthWrite: false,
      alphaMap: this.resources.items[TEXTURES_NAMES_ENUM.PARTICLE_TEXTURE],
      blending: THREE.AdditiveBlending,
      color: COLORS_ENUM.WHITE,
    });
  }

  setPoints() {
    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  updateSnow() {
    if (this.mesh && !this.disposed) {
      const velocities = this.geometry.attributes["velocities"].array;
      for (let i = 0 ; i < this.snowflakesCount ; i += 1) {
        const index = i * 3;

        const velocityX = velocities[index];
        const velocityY = velocities[index + 1];
        const velocityZ = velocities[index + 2];

        const currentX = this.geometry.attributes.position.array[index];
        const currentY = this.geometry.attributes.position.array[index + 1];
        const currentZ = this.geometry.attributes.position.array[index + 2];

        const currentVec3 = new THREE.Vector3(currentX, currentY, currentZ);
        const testSpherical = new THREE.Spherical().setFromVector3(currentVec3);

        const isParticleReset = testSpherical.radius > (this.globe.radius * 0.97);

        // TODO improve/remove snowflakes raycaster
        // const raycaster = new THREE.Raycaster(
        //   new THREE.Vector3(currentX, currentY, currentZ),
        //   new THREE.Vector3(velocityX, velocityY, velocityZ),
        //   0,
        //   2,
        // );

        // const int = raycaster.intersectObject(this.globeScene.sceneToIntersect);
        // if (int.length > 0) {
        //   console.log(int);
        // }

        if (currentY > 0.5 && !isParticleReset/* && int.length === 0*/) {
          this.geometry.attributes.position.array[index] += 0.1 * velocityX;
          this.geometry.attributes.position.array[index + 1] -= 0.1 * velocityY;
          this.geometry.attributes.position.array[index + 2] += 0.1 * velocityZ;
        } else {
          const newVec3 = new THREE.Vector3();

          this.globeSampler.sample(newVec3);

          const newX = getRandomCoord(newVec3.x, this.globe.radius);
          const newY = getRandomCoord(Math.abs(newVec3.y), this.globe.radius);
          const newZ = getRandomCoord(newVec3.z, this.globe.radius);

          const [newVelocityX, newVelocityY, newVelocityZ] = this.getVelocities();

          this.geometry.attributes["velocities"].array[index] = newVelocityX;
          this.geometry.attributes["velocities"].array[index + 1] = newVelocityY;
          this.geometry.attributes["velocities"].array[index + 2] = newVelocityZ;

          this.geometry.attributes.position.array[index] = newX;
          this.geometry.attributes.position.array[index + 1] = newY;
          this.geometry.attributes.position.array[index + 2] = newZ;
        }
      }
      this.geometry.attributes.position.needsUpdate = true;
    }
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.scene.remove(this.mesh);
    this.disposed = true;
  }

  render() {
    this.setGeometry();
    this.setMaterial();
    this.setPoints();
  }
}