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
    this._toLoad = this.sources.length;
    this._loaded = 0;

    this._setLoaders();
    this._startLoading();
  }

  _setLoaders() {
    const loadingManager = new THREE.LoadingManager(
      undefined,
      (_, loaded, total) => {
        this.trigger(EVENTS_ENUM.LOADING_STATUS, ([loaded / total]));
      }
    );
    this._loaders = {};
    Object.defineProperty(this._loaders, "gltfLoader", {
      value: (function () {
        const gltfLoader = new GLTFLoader(loadingManager);
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("/draco/");
        gltfLoader.setDRACOLoader(dracoLoader);
        return gltfLoader;
      })(),
      writable: false,
    });
    Object.defineProperty(this._loaders, "textureLoader", {
      value: new THREE.TextureLoader(loadingManager),
      writable: false,
    });
    Object.defineProperty(this._loaders, "cubeTextureLoader", {
      value: new THREE.CubeTextureLoader(loadingManager),
      writable: false,
    });
    Object.defineProperty(this._loaders, "hdrTextureLoader", {
      value: new RGBELoader(loadingManager),
      writable: false,
    });
  }

  _startLoading() {
    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this._loaders["gltfLoader"].load(
          source.path,
          (file) => {
            this._handleLoadedSource(source, file);
          }
        );
      } else if (source.type === "texture") {
        this._loaders["textureLoader"].load(
          source.path,
          (file) => {
            this._handleLoadedSource(source, file);
          }
        );
      } else if (source.type === "hdrTexture") {
        this._loaders["hdrTextureLoader"].load(
          source.path,
          (file) => {
            this._handleLoadedSource(source, file);
          }
        );
      }
    }
  }

  _handleLoadedSource(source, file) {
    this.items[source.name] = file;
    this._loaded += 1;
    if (this._loaded === this._toLoad) {
      this.trigger(EVENTS_ENUM.READY);
    }
  }
}