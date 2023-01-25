import * as THREE from "three";

import { EventEmitter } from "./utils/EventEmitter";
import { App } from "./App";
import { EVENTS_ENUM } from "../constants/events";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";

export class Renderer extends EventEmitter {
  constructor() {
    super();

    this.app = new App();
    this.canvas = this.app.canvas;
    this.cursor = this.app.cursor;
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.camera = this.app.camera;
    this.time = this.app.time;
    this._roomWorld = this.app.roomWorld;

    this.raycaster = this.app.raycaster;
    this.outlineObjects = [];

    this.setInstance();
    this._setCSSRenderer();
    // this.app.resources.on(EVENTS_ENUM.READY, () => {
    this.setEffectComposer();
    this.setEffectPasses();
    // });

    this.cursor.on(EVENTS_ENUM.CLICK, () => {
      this.onCityClickHandler();
    });
  }

  _setCSSRenderer() {
    this._cssRenderer = new CSS2DRenderer();
    this._cssRenderer.setSize(this.sizes.width, this.sizes.height);
    this._cssRenderer.domElement.style.position = "absolute";
    this._cssRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(this._cssRenderer.domElement);
  }

  setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
    });
    this.instance.physicallyCorrectLights = true;
    this.instance.setClearColor("#211d20");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.instance.toneMapping = THREE.CineonToneMapping;
    this.instance.toneMappingExposure = 1;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setEffectComposer() {
    this.effectComposer = new EffectComposer(this.instance);
    this.effectComposer.setPixelRatio(this.sizes.pixelRatio);
    this.effectComposer.setSize(this.sizes.width, this.sizes.height);
  }

  setEffectPasses() {
    const renderPath = new RenderPass(this.scene, this.camera.instance);
    this.effectComposer.addPass(renderPath);

    this.outlinePass = new OutlinePass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      this.scene,
      this.camera.instance,
    );
    this.outlinePass.edgeStrength = 10;
    this.outlinePass.edgeGlow = 0.5;
    this.outlinePass.edgeThickness = 2;
    this.outlinePass.visibleEdgeColor = new THREE.Color(0xffffff);
    this.outlinePass.hiddenEdgeColor = new THREE.Color(0x190a05);
    this.effectComposer.addPass(this.outlinePass);

    const gammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
    this.effectComposer.addPass(gammaCorrectionShader);

    const pixelRatio = this.instance.getPixelRatio();

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.material.uniforms["resolution"].value.x = 1 / (this.sizes.width * pixelRatio);
    this.fxaaPass.material.uniforms["resolution"].value.y = 1 / (this.sizes.height * pixelRatio);
    this.effectComposer.addPass(this.fxaaPass);
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);

    this.effectComposer.setPixelRatio(this.sizes.pixelRatio);
    this.effectComposer.setSize(this.sizes.width, this.sizes.height);
    this.updateFXAA();
  }

  updateFXAA() {
    const pixelRatio = this.instance.getPixelRatio();
    this.fxaaPass.material.uniforms["resolution"].value.x = 1 / (this.sizes.width * pixelRatio);
    this.fxaaPass.material.uniforms["resolution"].value.y = 1 / (this.sizes.height * pixelRatio);
  }

  checkIntersection() {
    this.raycaster.update();
    const intersects = this.raycaster.intersects;
    const outlineObject = intersects[0]?.object;
    this.outlineObjects = outlineObject ? [outlineObject] : [];
    if (outlineObject) {
      this.canvas.classList.add("pointer");
    } else {
      this.canvas.classList.remove("pointer");
    }
    this.outlinePass.selectedObjects = this.outlineObjects;
  }

  async onCityClickHandler() {
    // EXTRACT THIS
    if (this.outlineObjects.length > 0 && !this.camera.isBlurringIn) {
      const outlinedObject = this.outlineObjects[0];
      if (outlinedObject.name === "mergecity") {
        await this.app.goToRoomWorld();
      } else if (outlinedObject.name === "exitsign") {
        await this.app.goToGlobeWorld();
      } else if (outlinedObject.name === "Cube045_1") {
        const prevPosition = this.camera.instance.position.clone();
        const lookVec = new THREE.Vector3();
        lookVec.setFromMatrixPosition(outlinedObject.matrixWorld);
        const posVec = lookVec.clone();
        posVec.z += 20;

        this.camera.controls.rotateSpeed = 0;

        this.camera.controls.enableRotate = false;
        this.camera.setPrevCameraCoords(prevPosition);
        this.camera.moveControlsTo(posVec, lookVec);
        this.raycaster.setRaycasterTargets(null);
        this._roomWorld.setMenuMesh();
      } else if (outlinedObject.name === "turnOffButtonMesh") {
        this._roomWorld._menu.destroy();
        this.camera.resetControls();
        this.camera.trigger(EVENTS_ENUM.FADE_TO_ROOM);
      } else if (outlinedObject.name === "backButtonMesh") {
        this._roomWorld._menu.trigger("change-page", ["menu-page"]);
      } else if (outlinedObject.name === "Secret zone") {
        this._roomWorld._menu.trigger("change-page", [outlinedObject.name]);
        this._roomWorld._menu.trigger("snake-game");
      } else {
        if (this._roomWorld._menu) {
          this._roomWorld._menu.trigger("change-page", [outlinedObject.name]);
        }
      }
    }
  }

  update() {
    this.effectComposer.render(this.time.delta);
    this.checkIntersection();
    this.updateFXAA();
  }
}