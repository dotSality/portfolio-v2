import { App } from "./App";
import { OBJECT_NAMES_ENUM } from "../constants/objectNames";
import * as THREE from "three";
import { EVENTS_ENUM } from "../constants/events";
import { TEXT_LABEL_ENUM } from "../constants/textLabels";

export class RaycasterClickHandler {
  constructor(_outlinePass) {
    this._app = new App();
    this._sizes = this._app.sizes;
    this._raycaster = this._app.raycaster;
    this._camera = this._app.camera;
    this._canvas = this._app.canvas;
    this._roomWorld = this._app.roomWorld;
    this._starSky = this._app.starSky;
    this._cursor = this._app.cursor;
    this._outlineObjects = [];
    this._outlinePass = _outlinePass;

    this._isMobile = this._app.isMobile;

    this._cursor.on(EVENTS_ENUM.CLICK, () => {
      this._onCityClickHandler();
    });
  }

  _checkIntersection() {
    this._raycaster.update();
    const intersects = this._raycaster.intersects;
    const outlineObject = intersects[0]?.object;
    this._outlineObjects = outlineObject ? [outlineObject] : [];
    if (outlineObject) {
      this._canvas.classList.add("pointer");
    } else {
      this._canvas.classList.remove("pointer");
    }
    this._outlinePass.selectedObjects = this._outlineObjects;
  }

  async _onCityClickHandler() {
    if (this._outlineObjects.length > 0 && !this._camera._isBlurringIn) {
      const outlinedObject = this._outlineObjects[0];
      if (outlinedObject.name === OBJECT_NAMES_ENUM.MERGED_CITY) {
        await this._app.goToRoomWorld();
      } else if (outlinedObject.name === OBJECT_NAMES_ENUM.EXIT_SIGN) {
        await this._app.goToGlobeWorld();
      } else if (outlinedObject.name === OBJECT_NAMES_ENUM.TV_PANEL) {
        const prevPosition = this._camera.instance.position.clone();
        const lookVec = new THREE.Vector3();
        lookVec.setFromMatrixPosition(outlinedObject.matrixWorld);
        const posVec = lookVec.clone();
        const mobileDelta = this._isMobile ? 35 : 20;
        posVec.z += this._sizes.isHorizontal ? 15 : mobileDelta;

        this._camera.controls.rotateSpeed = 0;

        this._camera.controls.enableRotate = false;
        this._camera.setPrevCameraCoords(prevPosition);
        this._camera.moveControlsTo(posVec, lookVec);
        this._raycaster.setRaycasterTargets(null);
        this._roomWorld.setMenuMesh();
      } else if (outlinedObject.name === OBJECT_NAMES_ENUM.TURN_OFF_BUTTON) {
        this._roomWorld._menu.destroy();
        this._camera.resetControls();
        this._camera.trigger(EVENTS_ENUM.FADE_TO_ROOM);
        this._camera.initMobileEvents();
      } else if (outlinedObject.name === OBJECT_NAMES_ENUM.GO_BACK_BUTTON) {
        this._roomWorld._menu.trigger(EVENTS_ENUM.CHANGE_PAGE, [TEXT_LABEL_ENUM.MENU_PAGE]);
      } else if (outlinedObject.name === OBJECT_NAMES_ENUM.TELESCOPE_TUBE) {
        this._starSky.trigger(EVENTS_ENUM.STAR_SKY_INIT);
      } else {
        if (this._roomWorld._menu) {
          this._roomWorld._menu.trigger(EVENTS_ENUM.CHANGE_PAGE, [outlinedObject.name]);
        }
      }
    }
  }

  update() {
    this._checkIntersection();
  }
}