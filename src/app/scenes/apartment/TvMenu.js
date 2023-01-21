import * as THREE from "three";
import { App } from "../../App";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { generateShapeGeometry } from "../../../helpers/helpers";
import { EventEmitter } from "../../utils/EventEmitter";

export class TvMenu extends EventEmitter {
  constructor(width, height, position) {
    super();
    this._app = new App();
    this._scene = this._app.scene;
    this._sizes = this._app.sizes;
    this._camera = this._app.camera;
    this._raycaster = this._app.raycaster;

    this._menuItemBackgroundColor = 0x8123b8;
    this._backgroundColor = 0x040230;

    this._menuItemsLabels = [
      "Haven't heard about us?",
      "Our specs",
      "Secret zone"
    ];
    this._menuPages = null;

    this._width = width;
    this._height = height;
    this._initPosition = position;

    this._currentPage = null;
    this._pages = {};

    this.on("change-page", (pageName) => {
      this._currentPage.destroy();
      this.currentPage = this._pages[pageName];
      this._currentPage.init();
    });
  }

  _generateMenuPages() {

  }

  _setCurrentPage(pageName) {
    this._currentPage.destroy();
    this._currentPage = this._pages[pageName];
    this._currentPage.init();
  }

  _setMaterial() {
    this._material = new THREE.MeshBasicMaterial({ color: this._backgroundColor });
  }

  _setGeometry() {
    this._geometry = new THREE.PlaneGeometry(this._width, this._height, 4, 4);
  }

  _setCSSRenderer() {
    this._cssRenderer = new CSS2DRenderer();
    this._cssRenderer.setSize(this._sizes.width, this._sizes.height);
    this._cssRenderer.domElement.style.position = "absolute";
    this._cssRenderer.domElement.style.pointerEvents = "none";
    document.body.appendChild(this._cssRenderer.domElement);
  }

  _setBackButton() {
    // BACK BUTTON
    const buttonWidth = this._width * 0.12 * 10;
    const buttonHeight = this._height * 0.094 * 10;
    const backButtonGeometry = generateShapeGeometry(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 0.2);
    const backButtonMaterial = new THREE.MeshBasicMaterial({ color: this._menuItemBackgroundColor });
    const backButtonMesh = new THREE.Mesh(backButtonGeometry, backButtonMaterial);
    backButtonMesh.name = "backButtonMesh";
    const backButtonText = document.createElement("div");
    backButtonText.textContent = "Turn off";
    backButtonText.className = "menu-item";
    const object = new CSS2DObject(backButtonText);
    backButtonMesh.position.copy(this._initPosition);
    backButtonMesh.position.x += this._width * 10 / 2 - 1.5;
    backButtonMesh.position.y += -this._height * 10 / 2 + 1;
    backButtonMesh.add(object);
    this._scene.add(backButtonMesh);

    this._raycaster.updateRaycasterTargets(backButtonMesh);
  }

  _setOptions() {
    const menuItemWidth = this._width * 0.6 * 10; // geometry size * size percentage * scale value
    const menuItemHeight = this._height * 0.125 * 10; // geometry size * size percentage * scale value
    const menuItemMaterial = new THREE.MeshBasicMaterial({ color: this._menuItemBackgroundColor });

    const menuItemGeometry = generateShapeGeometry(-menuItemWidth / 2, -menuItemHeight / 2, menuItemWidth, menuItemHeight, 0.5);

    const menuGroup = new THREE.Group();
    // THINK ABOUT SOME REFACTOR
    this._menuItemsLabels.forEach((label, idx) => {
      const element = document.createElement("div");
      element.className = "menu-item";
      element.textContent = label;
      const object = new CSS2DObject(element);
      const menuItemMesh = new THREE.Mesh(menuItemGeometry, menuItemMaterial);
      menuItemMesh.name = `${label}-page`;
      menuItemMesh.position.copy(this._initPosition);
      menuItemMesh.position.y -= idx * 2 - 2;
      menuItemMesh.add(object);
      this._raycaster.updateRaycasterTargets(menuItemMesh);
      menuGroup.add(menuItemMesh);
      this._scene.add(menuGroup);

      this.on(`${label}-page`, (name) => {
        console.log(name);
      });
    });
    // THINK ABOUT SOME REFACTOR
    this._pages["menu-page"] = {
      group: menuGroup,
      destroy: () => {
        menuGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child?.geometry.dispose();
            child?.material.dispose();
            this._scene.remove(child);
          }
        });
        this._scene.remove(menuGroup);
      },
      init: () => {
        this._setOptions();
      }
    };
  }

  _setMesh() {
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._mesh.position.copy(this._initPosition);
    this._mesh.scale.set(10, 10, 10);
    this._scene.add(this._mesh);
  }

  init() {
    this._setMaterial();
    this._setGeometry();
    this._setMesh();
    this._setCSSRenderer();
    this._setBackButton();
    this._setOptions();
  }

  update() {
    this._cssRenderer.setSize(this._sizes.width, this._sizes.height);
    this._cssRenderer.render(this._scene, this._camera.instance);
  }

  destroy() {
    this._currentPage.destroy();
    this._material.dispose();
    this._geometry.dispose();
    this._scene.remove(this._mesh);

    this._menuItemsLabels.forEach((label) => {
      this.off(`${label}-page`);
    });
  }
}