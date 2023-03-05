import * as THREE from "three";
import { App } from "../../App";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { generateShapeGeometry } from "../../../helpers/helpers";
import { EventEmitter } from "../../utils/EventEmitter";
import { SnakeCanvas } from "./SnakeCanvas";
import { TEXTURES_NAMES_ENUM } from "../../../constants/texturesName";
import { TEXT_LABEL_ENUM } from "../../../constants/textLabels";
import { EVENTS_ENUM } from "../../../constants/events";
import { COLORS_ENUM } from "../../../constants/colors";

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

    this._menuItemsLabels = [
      TEXT_LABEL_ENUM.WHO_ARE_WE,
      TEXT_LABEL_ENUM.CONTACT_US,
      TEXT_LABEL_ENUM.SECRET_ZONE,
    ];

    this._isMobile = this._app.isMobile;
    this._substractingValue = this._isMobile ? 2.5 : 1;
    this._width = width;
    this._height = height;

    this._scaleValue = 10 / this._substractingValue;
    this._scaledWidth = this._width * this._scaleValue;
    this._scaledHeight = this._height * this._scaleValue;
    this._initPosition = position;

    this._currentPage = null;
    this._pages = {};
  }

  _setCurrentPage(pageName) {
    this._currentPage?.destroy();
    if (pageName === TEXT_LABEL_ENUM.MENU_PAGE) {
      this._destroyBackButton();
    } else {
      this._setBackButton();
    }
    this._currentPage = this._pages[pageName];
    this._currentPage.init();
  }

  _setMaterial() {
    this._material = new THREE.MeshBasicMaterial({ color: COLORS_ENUM.MENU_BACKGROUND });
  }

  _setGeometry() {
    this._geometry = new THREE.PlaneGeometry(this._width, this._height, 4, 4);
  }

  _setTurnOffButton() {
    // BACK BUTTON
    const buttonWidth = this._scaledWidth * 0.12 * (this._isMobile ? 2 : 1);
    const buttonHeight = this._scaledHeight * 0.094;
    const turnOffButtonGeometry = generateShapeGeometry(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 0.2 / this._substractingValue);
    const turnOffButtonMaterial = new THREE.MeshBasicMaterial({ color: COLORS_ENUM.MENU_ITEM_BACKGROUND });
    this._turnOffButtonMesh = new THREE.Mesh(turnOffButtonGeometry, turnOffButtonMaterial);
    this._turnOffButtonMesh.name = "turnOffButtonMesh";
    const turnOffButtonText = document.createElement("div");
    turnOffButtonText.textContent = TEXT_LABEL_ENUM.TURN_OFF;
    turnOffButtonText.className = `menu-item ${this._isMobile ? "menu-item__mobile" : ""}`;
    if (this._isMobile && this._sizes.isHorizontal) {
      turnOffButtonText.classList.add("menu-item__horizontal");
    }
    const object = new CSS2DObject(turnOffButtonText);
    this._turnOffButtonMesh.position.copy(this._initPosition);
    this._turnOffButtonMesh.position.x += this._scaledWidth / 2 - 1.5 / this._substractingValue;
    if (this._isMobile) {
      this._turnOffButtonMesh.position.x -= 0.8;
    }
    this._turnOffButtonMesh.position.y += -this._scaledHeight / 2 + 1 / this._substractingValue;
    this._turnOffButtonMesh.position.z += 0.02 / this._substractingValue;
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
    const buttonWidth = this._scaledWidth * 0.12 * (this._isMobile ? 2 : 1);
    const buttonHeight = this._scaledHeight * 0.094;
    const backButtonGeometry = generateShapeGeometry(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 0.2 / this._substractingValue);
    const backButtonMaterial = new THREE.MeshBasicMaterial({ color: COLORS_ENUM.MENU_ITEM_BACKGROUND });
    this._backButtonMesh = new THREE.Mesh(backButtonGeometry, backButtonMaterial);
    this._backButtonMesh.name = "backButtonMesh";
    const backButtonText = document.createElement("div");
    backButtonText.textContent = TEXT_LABEL_ENUM.BACK;
    backButtonText.className = `menu-item ${this._isMobile ? "menu-item__mobile" : ""}`;
    backButtonText.classList.add(this._isMobile && this._sizes.isHorizontal
      ? "menu-item__horizontal"
      : "menu-item__vertical");
    const object = new CSS2DObject(backButtonText);
    this._backButtonMesh.position.copy(this._initPosition);
    this._backButtonMesh.position.x -= this._scaledWidth / 2 - 1.5 / this._substractingValue;
    if (this._isMobile) {
      this._backButtonMesh.position.x += 0.8;
    }
    this._backButtonMesh.position.y -= this._scaledHeight / 2 - 1 / this._substractingValue;
    this._backButtonMesh.position.z += 0.02 / this._substractingValue;
    this._backButtonMesh.add(object);
    this._scene.add(this._backButtonMesh);

    this._raycaster.updateRaycasterTargets(this._backButtonMesh);

    this.on(EVENTS_ENUM.GO_BACK_CLICK, () => {
      this._setCurrentPage(TEXT_LABEL_ENUM.MENU_PAGE);
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
      this.off(EVENTS_ENUM.GO_BACK_CLICK);
    }
  }

  _setOptions() {
    const menuItemWidth = this._scaledWidth * 0.6;
    const menuItemHeight = this._scaledHeight * 0.125;
    const menuItemMaterial = new THREE.MeshBasicMaterial({ color: COLORS_ENUM.MENU_ITEM_BACKGROUND });

    const menuItemGeometry = generateShapeGeometry(-menuItemWidth / 2, -menuItemHeight / 2, menuItemWidth, menuItemHeight, 0.5 / this._substractingValue);

    const menuGroup = new THREE.Group();
    // THINK ABOUT SOME REFACTOR
    this._menuItemsLabels.forEach((label, idx) => {
      const element = document.createElement("div");
      element.className = `menu-item ${this._isMobile ? "menu-item__mobile" : ""}`;
      if (this._isMobile && this._sizes.isHorizontal) {
        element.classList.add("menu-item__horizontal");
      }
      element.textContent = label;
      const object = new CSS2DObject(element);
      const menuItemMesh = new THREE.Mesh(menuItemGeometry, menuItemMaterial);
      menuItemMesh.name = label;
      menuItemMesh.position.copy(this._initPosition);
      menuItemMesh.position.y -= idx * 2 / this._substractingValue - 2 / this._substractingValue;
      menuItemMesh.add(object);
      this._raycaster.updateRaycasterTargets(menuItemMesh);
      menuGroup.add(menuItemMesh);
    });

    this._scene.add(menuGroup);

    // THINK ABOUT SOME REFACTOR
    this._pages[TEXT_LABEL_ENUM.MENU_PAGE] = {
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
    this._currentPage = this._pages[TEXT_LABEL_ENUM.MENU_PAGE];
  }

  _getPageMesh(texture = undefined) {
    const textMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(this._scaledWidth, this._scaledHeight, 2, 2),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: texture ? 1 : 0,
        map: texture,
        color: COLORS_ENUM.WHITE,
      }),
    );
    textMesh.position.copy(this._initPosition);
    return textMesh;
  }

  _setSecretZonePage() {
    this._pages[this._menuItemsLabels[2]] = {
      destroy: () => {
        this._snakeGame.destroy();
        this._snakeGame = null;
      },
      init: () => {
        this._snakeGame = new SnakeCanvas(this._scaledHeight * 0.7, this._initPosition);
        this._snakeGame.init();
      }
    };
  }

  _setWelcomePage() {
    const welcomePageTexture = this._resources.items[TEXTURES_NAMES_ENUM.MENU_INTRO_PAGE_TEXTURE];
    welcomePageTexture.encoding = THREE.sRGBEncoding;
    const pageMesh = this._getPageMesh(welcomePageTexture);
    const pageScale = 0.9;
    pageMesh.scale.set(pageScale, pageScale, pageScale);
    pageMesh.position.y += 0.7 / this._substractingValue;
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

  _setContactPage() {
    const contactPageTexture = this._resources.items[TEXTURES_NAMES_ENUM.MENU_CONTACT_PAGE_TEXTURE];
    contactPageTexture.encoding = THREE.sRGBEncoding;
    const pageMesh = this._getPageMesh(contactPageTexture);
    const pageScale = 0.9;
    pageMesh.scale.set(pageScale, pageScale, pageScale);
    pageMesh.position.y += 0.7 / this._substractingValue;
    this._pages[this._menuItemsLabels[1]] = {
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
    const meshScale = this._scaleValue;
    this._mesh.scale.set(meshScale, meshScale, meshScale);
    this._scene.add(this._mesh);
  }

  init() {
    this._setMaterial();
    this._setGeometry();
    this._setMesh();
    this._setTurnOffButton();
    this._setOptions();
    this._setWelcomePage();
    this._setContactPage();
    this._setSecretZonePage();

    this.on(EVENTS_ENUM.CHANGE_PAGE, (pageName) => {
      this._setCurrentPage(pageName);
    });

    if (this._isMobile) {
      this._sizes.on(EVENTS_ENUM.HORIZONTAL_ORIENTATION, () => {
        document.querySelectorAll(".menu-item")
                .forEach((el) => {
                  el.classList.add("menu-item__horizontal");
                  el.classList.remove("menu-item__vertical");
                });
      });

      this._sizes.on(EVENTS_ENUM.VERTICAL_ORIENTATION, () => {
        document.querySelectorAll(".menu-item")
                .forEach((el) => {
                  el.classList.remove("menu-item__horizontal");
                  el.classList.add("menu-item__vertical");
                });
      });
    }
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

    this.off(EVENTS_ENUM.CHANGE_PAGE);
  }
}