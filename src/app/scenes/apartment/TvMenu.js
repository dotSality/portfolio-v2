import * as THREE from "three";
import { App } from "../../App";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
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
    this._cssRenderer = this._app.renderer._cssRenderer;

    this._menuItemBackgroundColor = 0x8123b8;
    this._backgroundColor = 0x040230;

    this._menuItemsLabels = [
      "Haven't heard about us?",
      "Our specs",
      "Secret zone"
    ];

    this._width = width;
    this._height = height;

    this._scaledWidth = this._width * 10;
    this._scaledHeight = this._height * 10;
    this._initPosition = position;

    this._currentPage = null;
    this._pages = {};

    this.on("change-page", (pageName) => {
      this._setCurrentPage(pageName);
    });
  }

  _generateMenuPages() {

  }

  _setCurrentPage(pageName) {
    this._currentPage?.destroy();
    this._currentPage = this._pages[pageName];
    this._currentPage.init();
  }

  _setMaterial() {
    this._material = new THREE.MeshBasicMaterial({ color: this._backgroundColor });
  }

  _setGeometry() {
    this._geometry = new THREE.PlaneGeometry(this._width, this._height, 4, 4);
  }

  _setBackButton() {
    // BACK BUTTON
    const buttonWidth = this._scaledWidth * 0.12;
    const buttonHeight = this._scaledHeight * 0.094;
    const backButtonGeometry = generateShapeGeometry(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 0.2);
    const backButtonMaterial = new THREE.MeshBasicMaterial({ color: this._menuItemBackgroundColor });
    this._backButtonMesh = new THREE.Mesh(backButtonGeometry, backButtonMaterial);
    this._backButtonMesh.name = "backButtonMesh";
    const backButtonText = document.createElement("div");
    backButtonText.textContent = "Turn off";
    backButtonText.className = "menu-item";
    const object = new CSS2DObject(backButtonText);
    this._backButtonMesh.position.copy(this._initPosition);
    this._backButtonMesh.position.x += this._scaledWidth / 2 - 1.5;
    this._backButtonMesh.position.y += -this._scaledHeight / 2 + 1;
    this._backButtonMesh.add(object);
    this._scene.add(this._backButtonMesh);

    this._raycaster.updateRaycasterTargets(this._backButtonMesh);
  }

  _destroyBackButton() {
    const cssElement = this._backButtonMesh.children[0];
    cssElement.removeFromParent();
    this._backButtonMesh.geometry.dispose();
    this._backButtonMesh.material.dispose();
    this._scene.remove(this._backButtonMesh);
  }

  _setOptions() {
    const menuItemWidth = this._scaledWidth * 0.6; // geometry size * size percentage * scale value
    const menuItemHeight = this._scaledHeight * 0.125; // geometry size * size percentage * scale value
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
      this.on(`${label}-page`, (name) => {
        this._setCurrentPage(name);
      });
    });

    this._scene.add(menuGroup);

    // THINK ABOUT SOME REFACTOR
    this._pages["menu-page"] = {
      page: menuGroup,
      destroy: () => {
        menuGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
          if (child instanceof CSS2DObject) {
            child.removeFromParent();
          }
        });
        this._scene.remove(menuGroup);
      },
      init: () => {
        this._setOptions();
      }
    };
    this._currentPage = this._pages["menu-page"];
  }

  _getPageMesh() {
    const textMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(this._scaledWidth, this._scaledHeight, 2, 2),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
    );
    textMesh.position.copy(this._initPosition);
    return textMesh;
  }

  _setWelcomePage() {
    const pageMesh = this._getPageMesh();
    const textElement = document.createElement("div");
    textElement.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis dolor, voluptatum? Accusamus, alias amet asperiores aspernatur doloribus, et eum id ipsa labore mollitia quas quos repellendus sapiente ut veritatis voluptatum!";
    const textObject = new CSS2DObject(textElement);
    pageMesh.add(textObject);

    this._pages["Haven't heard about us?-page"] = {
      page: pageMesh,
      destroy: () => {
        pageMesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            child.material.dispose();
          }
          if (child instanceof CSS2DObject) {
            child.removeFromParent();
          }
        });
        this._scene.remove(pageMesh);
      },
      init: () => {
        this._scene.add(pageMesh);
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
    this._setBackButton();
    this._setOptions();
    this._setWelcomePage();
  }

  update() {
    this._cssRenderer.setSize(this._sizes.width, this._sizes.height);
    this._cssRenderer.render(this._scene, this._camera.instance);
  }

  destroy() {
    this._currentPage.destroy();
    this._material.dispose();
    this._geometry.dispose();
    this._destroyBackButton();
    this._scene.remove(this._mesh);

    this._menuItemsLabels.forEach((label) => {
      this.off(`${label}-page`);
    });
  }
}