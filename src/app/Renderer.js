import * as THREE from "three";

import { EventEmitter } from "./utils/EventEmitter";
import { App } from "./App";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { RaycasterClickHandler } from "./RaycasterClickHandler";
import { COLORS_ENUM } from "../constants/colors";

export class Renderer extends EventEmitter {
  constructor() {
    super();

    this._app = new App();
    this._canvas = this._app.canvas;
    this._cursor = this._app.cursor;
    this._sizes = this._app.sizes;
    this._scene = this._app.scene;
    this._camera = this._app.camera;
    this._time = this._app.time;
    this._roomWorld = this._app.roomWorld;

    this._raycaster = this._app.raycaster;

    this._setInstance();
    this._setCSSRenderer();
    this._setEffectComposer();
    this._setEffectPasses();
    this._setRaycasterClickHandler();
  }

  _setCSSRenderer() {
    this._cssRenderer = new CSS2DRenderer();
    this._cssRenderer.setSize(this._sizes.width, this._sizes.height);
    this._cssRenderer.domElement.style.position = "absolute";
    this._cssRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(this._cssRenderer.domElement);
  }

  _setInstance() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this._canvas,
    });
    this.instance.physicallyCorrectLights = true;
    this.instance.setClearColor(COLORS_ENUM.BLACK);
    this.instance.setSize(this._sizes.width, this._sizes.height);
    this.instance.setPixelRatio(this._sizes.pixelRatio);
    this.instance.toneMapping = THREE.CineonToneMapping;
    this.instance.toneMappingExposure = 1;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _setEffectComposer() {
    this._effectComposer = new EffectComposer(this.instance);
    this._effectComposer.setPixelRatio(this._sizes.pixelRatio);
    this._effectComposer.setSize(this._sizes.width, this._sizes.height);
  }

  _setEffectPasses() {
    const renderPath = new RenderPass(this._scene, this._camera.instance);
    this._effectComposer.addPass(renderPath);

    this._outlinePass = new OutlinePass(
      new THREE.Vector2(this._sizes.width, this._sizes.height),
      this._scene,
      this._camera.instance,
    );
    this._outlinePass.edgeStrength = 10;
    this._outlinePass.edgeGlow = 0.5;
    this._outlinePass.edgeThickness = 2;
    this._outlinePass.visibleEdgeColor = new THREE.Color(COLORS_ENUM.WHITE);
    this._outlinePass.hiddenEdgeColor = new THREE.Color(COLORS_ENUM.OUTLINE_HIDDEN_EDGE);
    this._effectComposer.addPass(this._outlinePass);

    const gammaCorrectionShader = new ShaderPass(GammaCorrectionShader);
    this._effectComposer.addPass(gammaCorrectionShader);

    const pixelRatio = this.instance.getPixelRatio();

    this._fxaaPass = new ShaderPass(FXAAShader);
    this._fxaaPass.material.uniforms["resolution"].value.x = 1 / (this._sizes.width * pixelRatio);
    this._fxaaPass.material.uniforms["resolution"].value.y = 1 / (this._sizes.height * pixelRatio);
    this._effectComposer.addPass(this._fxaaPass);
  }

  resize() {
    this.instance.setSize(this._sizes.width, this._sizes.height);
    this.instance.setPixelRatio(this._sizes.pixelRatio);

    this._effectComposer.setPixelRatio(this._sizes.pixelRatio);
    this._effectComposer.setSize(this._sizes.width, this._sizes.height);
    this._updateFXAA();
  }

  _updateFXAA() {
    const pixelRatio = this.instance.getPixelRatio();
    this._fxaaPass.material.uniforms["resolution"].value.x = 1 / (this._sizes.width * pixelRatio);
    this._fxaaPass.material.uniforms["resolution"].value.y = 1 / (this._sizes.height * pixelRatio);
  }

  _setRaycasterClickHandler() {
    this._raycasterClickHandler = new RaycasterClickHandler(this._outlinePass);
  }

  update() {
    this._effectComposer.render(this._time.delta);
    this._raycasterClickHandler.update();
    this._updateFXAA();
  }
}