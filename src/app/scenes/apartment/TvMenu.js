import * as THREE from "three";
import { App } from "../../App";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { generateShapeGeometry } from "../../../helpers/helpers";
import { EventEmitter } from "../../utils/EventEmitter";
import { SnakeCanvas } from "./SnakeCanvas";
import { TEXTURES_NAMES_ENUM } from "../../../constants/texturesName";

export class TvMenu extends EventEmitter {
  constructor(width, height, position) {
    super();
    this._app = new App();
    this._scene = this._app.scene;
    this._sizes = this._app.sizes;
    this._camera = this._app.camera;
    this._raycaster = this._app.raycaster;
    this._resources = this._app.resources;
    this._cssRenderer = this._app.renderer._cssRenderer;

    this._menuItemBackgroundColor = 0x8123b8;
    this._backgroundColor = 0x040230;

    this._menuItemsLabels = [
      "Who are we?",
      "Contact us",
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

  _setCurrentPage(pageName) {
    this._currentPage?.destroy();
    if (pageName === "menu-page") {
      this._destroyBackButton();
    } else {
      this._setBackButton();
    }
    this._currentPage = this._pages[pageName];
    this._currentPage.init();
  }

  _setMaterial() {
    this._material = new THREE.MeshBasicMaterial({ color: this._backgroundColor });
  }

  _setGeometry() {
    this._geometry = new THREE.PlaneGeometry(this._width, this._height, 4, 4);
  }

  _setTurnOffButton() {
    // BACK BUTTON
    const buttonWidth = this._scaledWidth * 0.12;
    const buttonHeight = this._scaledHeight * 0.094;
    const backButtonGeometry = generateShapeGeometry(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 0.2);
    const backButtonMaterial = new THREE.MeshBasicMaterial({ color: this._menuItemBackgroundColor });
    this._turnOffButtonMesh = new THREE.Mesh(backButtonGeometry, backButtonMaterial);
    this._turnOffButtonMesh.name = "turnOffButtonMesh";
    const turnOffButtonText = document.createElement("div");
    turnOffButtonText.textContent = "Turn off";
    turnOffButtonText.className = "menu-item";
    const object = new CSS2DObject(turnOffButtonText);
    this._turnOffButtonMesh.position.copy(this._initPosition);
    this._turnOffButtonMesh.position.x += this._scaledWidth / 2 - 1.5;
    this._turnOffButtonMesh.position.y += -this._scaledHeight / 2 + 1;
    this._turnOffButtonMesh.position.z += 0.02;
    this._turnOffButtonMesh.add(object);
    this._scene.add(this._turnOffButtonMesh);

    this._raycaster.updateRaycasterTargets(this._turnOffButtonMesh);
  }

  _destroyTurnOffButton() {
    const cssElement = this._turnOffButtonMesh.children[0];
    cssElement.removeFromParent();
    this._turnOffButtonMesh.geometry.dispose();
    this._turnOffButtonMesh.material.dispose();
    this._scene.remove(this._turnOffButtonMesh);
  }

  _setBackButton() {
    const buttonWidth = this._scaledWidth * 0.12;
    const buttonHeight = this._scaledHeight * 0.094;
    const backButtonGeometry = generateShapeGeometry(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 0.2);
    const backButtonMaterial = new THREE.MeshBasicMaterial({ color: this._menuItemBackgroundColor });
    this._backButtonMesh = new THREE.Mesh(backButtonGeometry, backButtonMaterial);
    this._backButtonMesh.name = "backButtonMesh";
    const backButtonText = document.createElement("div");
    backButtonText.textContent = "Back";
    backButtonText.className = "menu-item";
    const object = new CSS2DObject(backButtonText);
    this._backButtonMesh.position.copy(this._initPosition);
    this._backButtonMesh.position.x -= this._scaledWidth / 2 - 1.5;
    this._backButtonMesh.position.y -= this._scaledHeight / 2 - 1;
    this._backButtonMesh.position.z += 0.02;
    this._backButtonMesh.add(object);
    this._scene.add(this._backButtonMesh);

    this._raycaster.updateRaycasterTargets(this._backButtonMesh);

    this.on("back-button", () => {
      this._setCurrentPage("menu-page");
    });
  }

  _destroyBackButton() {
    const button = this._scene.getObjectByName("backButtonMesh");
    if (button) {
      const cssElement = this._backButtonMesh.children[0];
      cssElement.removeFromParent();
      this._backButtonMesh.geometry.dispose();
      this._backButtonMesh.material.dispose();
      this._raycaster.filterRaycasterTargets(this._backButtonMesh.id);
      this._scene.remove(this._backButtonMesh);
    }
  }

  _setOptions() {
    const menuItemWidth = this._scaledWidth * 0.6;
    const menuItemHeight = this._scaledHeight * 0.125;
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
      menuItemMesh.name = label;
      menuItemMesh.position.copy(this._initPosition);
      menuItemMesh.position.y -= idx * 2 - 2;
      menuItemMesh.add(object);
      this._raycaster.updateRaycasterTargets(menuItemMesh);
      menuGroup.add(menuItemMesh);
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
            this._raycaster.filterRaycasterTargets(child.id);
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

  _getPageMesh(texture = undefined) {
    const textMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(this._scaledWidth, this._scaledHeight, 2, 2),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: texture ? 1 : 0,
        map: texture,
        color: 0xffffff,
        needsUpdate: true,
      }),
    );
    textMesh.position.copy(this._initPosition);
    return textMesh;
  }

  _setSecretZonePage() {
    this._pages[this._menuItemsLabels[2]] = {
      destroy: () => {
        this._destroySecretZonePage();
        console.log("snake destroy");
      },
      init: () => {
        this._snakeGame = new SnakeCanvas(this._scaledHeight * 0.7, this._initPosition);
        this._snakeGame.init();
      }
    };
  }

  _destroySecretZonePage() {
    this._snakeGame.destroy();
    this._snakeGame = null;
  }

  _setWelcomePage() {
    const welcomePageTexture = this._resources.items[TEXTURES_NAMES_ENUM.MENU_INTRO_PAGE_TEXTURE];
    welcomePageTexture.encoding = THREE.sRGBEncoding;
    const pageMesh = this._getPageMesh(welcomePageTexture);
    pageMesh.scale.set(0.9, 0.9, 0.9);
    pageMesh.position.y += 0.7;
    this._pages[this._menuItemsLabels[0]] = {
      page: pageMesh,
      destroy: () => {
        pageMesh.geometry.dispose();
        pageMesh.material.dispose();
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
    this._setTurnOffButton();
    this._setOptions();
    this._setWelcomePage();
    this._setSecretZonePage();
  }

  update() {
    this._cssRenderer.setSize(this._sizes.width, this._sizes.height);
    this._cssRenderer.render(this._scene, this._camera.instance);
    this._snakeGame?.update();
  }

  destroy() {
    this._currentPage.destroy();
    this._material.dispose();
    this._geometry.dispose();
    this._destroyTurnOffButton();
    this._destroyBackButton();
    this._scene.remove(this._mesh);

    this.off("change-page");
  }
}