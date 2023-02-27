import * as THREE from "three";
import { EventEmitter } from "../../utils/EventEmitter";
import { App } from "../../App";
import { RESOURCES_NAMES_ENUM } from "../../../constants/modelNames";
import { EVENTS_ENUM } from "../../../constants/events";
import { TvMenu } from "./TvMenu";
import { OBJECT_NAMES_ENUM } from "../../../constants/objectNames";
import { noiseVertex } from "../../../shaders/noise/noiseVertex";
import { noiseFragment } from "../../../shaders/noise/noiseFragment";

export class RoomWorld extends EventEmitter {
  constructor() {
    super();

    this._app = new App();
    this._resources = this._app.resources;
    this._scene = this._app.scene;
    this._camera = this._app.camera;
    this._time = this._app.time;

    this._raycaster = this._app.raycaster;

    this._camera.on(EVENTS_ENUM.FADE_TO_ROOM, () => {
      this._raycaster.setRaycasterTargets(this._raycastingTargets);
    });

    this._setNoiseShader();
  }

  _setNoiseShader() {
    this._noiseShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: noiseVertex,
      fragmentShader: noiseFragment,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
      }
    });
  }

  _setScene() {
    this._roomScene = this._resources.items[RESOURCES_NAMES_ENUM.ROOM_SCENE].scene;

    this._roomScene.scale.set(10, 10, 10);
    this._roomScene.position.set(0, -20, 0);

    const targets = [];

    this._roomScene.traverse((child) => {
      if (child.name === OBJECT_NAMES_ENUM.EXIT_SIGN ||
        child.name === OBJECT_NAMES_ENUM.TV_PANEL ||
        child.name === OBJECT_NAMES_ENUM.TELESCOPE_TUBE) {
        if (child.name === OBJECT_NAMES_ENUM.TV_PANEL) {
          child.material = this._noiseShaderMaterial;
        }
        targets.push(child);
      }
    });
    this._raycastingTargets = targets;

    this._scene.add(this._roomScene);
  }

  _setLights() {
    this._ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this._scene.add(this._ambientLight);

    this._pointLight = new THREE.PointLight(0xffffff, 3.61, 100, 0);
    this._pointLight.position.set(0, 35, 0);
    this._scene.add(this._pointLight);

    // TO
    // this._app.debug.dat.addColor(this._pointLight, "color")
    //     .name("room color");
    // this._app.debug.dat.add(this._pointLight, "intensity")
    //     .min(0)
    //     .max(10)
    //     .name("point light intensity");
    // this._app.debug.dat.addColor(this._ambientLight, "color")
    //     .name("ambient color");
  }

  update() {
    this._noiseShaderMaterial.uniforms.uTime.value = this._time.elapsedTime;
    if (this._menu) {
      this._menu.update();
    }
  }

  setMenuMesh() {
    this._roomScene.traverse((child) => {
      if (child.name === OBJECT_NAMES_ENUM.TV_PANEL) {
        const positionVector = new THREE.Vector3();
        const tvPosition = child.getWorldPosition(positionVector);
        const box = child.geometry.boundingBox;
        const sizes = new THREE.Vector2(
          box.max.x - box.min.x,
          box.max.y - box.min.y
        );
        this._menu = new TvMenu(sizes.x, sizes.y, tvPosition);
        this._menu.init();
      }
    });
  }

  initWorld() {
    this._setScene();
    this._setLights();
  }

  destroyWorld() {
    this._ambientLight.dispose();
    this._scene.remove(this._ambientLight);
    this._pointLight.dispose();
    this._scene.remove(this._pointLight);
    this._roomScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        child.material.dispose();
      }
    });
    this._scene.remove(this._roomScene);
  }
}