import * as THREE from "three";

import { EventEmitter } from "./utils/EventEmitter";
import { App } from "./App";
import { EVENTS_ENUM } from "../constants/events";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { RGBAFormat, sRGBEncoding, WebGLRenderTarget } from "three";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

export class Renderer extends EventEmitter {
  constructor() {
    super();

    this.app = new App();
    this.canvas = this.app.canvas;
    this.sizes = this.app.sizes;
    this.scene = this.app.scene;
    this.camera = this.app.camera;
    this.time = this.app.time;
    this.isInitialized = false;

    this.setInstance();

    this.app.resources.on(EVENTS_ENUM.READY, () => {
      this.setEffectComposer();
      this.setAntialiasShader();
      this.isInitialized = true;
    });
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

  setAntialiasShader() {
    const renderPath = new RenderPass(this.scene, this.camera.instance);
    this.effectComposer.addPass(renderPath);

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

  update() {
    if (this.isInitialized) {
      // this.instance.render(this.scenes.currentScene, this.camera);
      this.effectComposer.render(this.time.delta);
      this.updateFXAA();
    }
  }
}