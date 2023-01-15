import * as THREE from "three";
import { sources } from "../../sources/sources";
import { EventEmitter } from "./EventEmitter";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EVENTS_ENUM } from "../../constants/events";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

export class Resources extends EventEmitter {
  constructor() {
    super();
    this.sources = sources;
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    const loadingManager = new THREE.LoadingManager(
      undefined,
      (_, loaded, total) => {
        this.trigger(EVENTS_ENUM.LOADING_STATUS, ([loaded / total]));
      }
    );
    this.loaders = {};
    Object.defineProperty(this.loaders, "gltfLoader", {
      value: (function () {
        const gltfLoader = new GLTFLoader(loadingManager);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/draco/");
        gltfLoader.setDRACOLoader(dracoLoader);
        return gltfLoader;
      })(),
      writable: false,
    });
    Object.defineProperty(this.loaders, "textureLoader", {
      value: new THREE.TextureLoader(loadingManager),
      writable: false,
    });
    Object.defineProperty(this.loaders, "hdrTextureLoader", {
      value: new RGBELoader(loadingManager),
      writable: false,
    });
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this.loaders["gltfLoader"].load(
          source.path,
          (file) => {
            this.handleLoadedSource(source, file);
          }
        );
      } else if (source.type === "texture") {
        this.loaders["textureLoader"].load(
          source.path,
          (file) => {
            this.handleLoadedSource(source, file);
          }
        );
      } else if (source.type === "hdrTexture") {
        this.loaders["hdrTextureLoader"].load(
          source.path,
          (file) => {
            this.handleLoadedSource(source, file);
          }
        );
      }
    }
  }

  handleLoadedSource(source, file) {
    this.items[source.name] = file;
    this.loaded += 1;
    if (this.loaded === this.toLoad) {
      this.trigger(EVENTS_ENUM.READY);
    }
  }
}