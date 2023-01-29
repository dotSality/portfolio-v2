import * as THREE from "three";
import { CanvasTexture } from "three";
import { App } from "../../App";
import { snakeCanvasVertex } from "../../../shaders/snakeCanvas/snakeCanvasVertex";
import { snakeCanvasFragment } from "../../../shaders/snakeCanvas/snakeCanvasFragment";
import { COLORS_STRING_ENUM } from "../../../constants/colors";

export class SnakeCanvas {
  constructor(size, position) {
    this._app = new App();
    this._time = this._app.time;
    this._scene = this._app.scene;
    this._position = new THREE.Vector3().copy(position);
    this._position.z += 1;
    this._position.y += 0.5;

    this._delta = 50;
    this._speed = 4;

    this._listener = this._keyDown.bind(this);

    this._size = size;

    this._isFinished = true;
    this._isLoading = true;
    this._loadingStatus = 0;
    this._restartTimer = 10000;
    this._isMoved = false;
  }

  _createPart(x, y) {
    return new THREE.Vector2(x, y);
  }

  _drawLoadingBar() {
    if (this._isLoading) {
      this._canvasTexture.needsUpdate = true;
      this._loadingStatus += 1;
      this._ctx.fillStyle = COLORS_STRING_ENUM.WHITE_STRING;

      const initX = 20;
      const initY = this._canvas.clientHeight / 2 - 2;
      const barWitdh = (this._canvas.clientWidth - 40) / 100 * this._loadingStatus;
      const barHeight = 4;
      this._ctx.fillRect(
        initX,
        initY,
        barWitdh,
        barHeight,
      );
      if (this._loadingStatus >= 100) {
        this._isLoading = false;
        this._isFinished = false;
        window.addEventListener("keydown", this._listener);
      }
    }
  }

  _drawRestartTimer() {
    if (this._restartTimer < 100) {
      this.restart();
    }
    if (this._isFinished && !this._isLoading) {
      this._canvasTexture.needsUpdate = true;
      this._ctx.clearRect(
        this._canvas.clientWidth / 3.2,
        this._canvas.clientHeight / 2 + 20,
        this._canvas.clientWidth,
        30,
      );
      this._restartTimer -= this._time.delta;
      const seconds = Math.floor(this._restartTimer / 1000);
      this._ctx.fillStyle = COLORS_STRING_ENUM.WHITE_STRING;
      this._ctx.font = "30px custom";
      this._ctx.fillText(
        "Restart in " + seconds,
        this._canvas.clientWidth / 3.2,
        this._canvas.clientHeight / 2 + 40
      );
    }
  }

  _isWallBang() {
    let wallBang = false;

    if (this._velocity.y === 0 && this._velocity.x === 0) {
      return false;
    }

    wallBang = this._headX < 0
      || this._headX === this._foodCount
      || this._headY < 0
      || this._headY === this._foodCount;

    for (let i = 0 ; i < this._parts.length ; i += 1) {
      const part = this._parts.at(i);
      if (part.x === this._headX && part.y === this._headY) {
        wallBang = true;
        break;
      }
    }

    if (wallBang) {
      this._ctx.fillStyle = COLORS_STRING_ENUM.WHITE_STRING;
      this._ctx.font = "50px custom";
      this._ctx.fillText("Game Over! ", this._canvas.clientWidth / 4, this._canvas.clientHeight / 2);
    }

    return wallBang;
  }

  _drawScore() {
    this._ctx.fillStyle = COLORS_STRING_ENUM.WHITE_STRING;
    this._ctx.font = "20px custom";
    this._ctx.fillText("Score: " + this._score, this._canvas.clientWidth - 90, 30);
  }

  _clearScreen() {
    this._ctx.fillStyle = COLORS_STRING_ENUM.BLACK_STRING;
    this._ctx.fillRect(0, 0, this._canvas.clientWidth, this._canvas.clientHeight);
  }

  _drawSnake() {
    this._ctx.fillStyle = COLORS_STRING_ENUM.SNAKE_PART;
    for (let i = 0 ; i < this._parts.length ; i += 1) {
      const part = this._parts.at(i);
      this._ctx.fillRect(part.x * this._foodCount, part.y * this._foodCount, this._tileSize, this._tileSize);
    }

    this._parts.push(this._createPart(this._headX, this._headY));
    if (this._parts.length > this._tailLength) {
      this._parts.shift();
    }
    this._ctx.fillStyle = COLORS_STRING_ENUM.SNAKE_PART;
    this._ctx.fillRect(this._headX * this._foodCount, this._headY * this._foodCount, this._tileSize, this._tileSize);
  }

  _changeSnakePosition() {
    this._headX += this._velocity.x;
    this._headY += this._velocity.y;
  }

  _drawGrass() {
    this._ctx.fillStyle = COLORS_STRING_ENUM.SNAKE_GRASS;
    this._ctx.fillRect(this._grassX * this._foodCount, this._grassY * this._foodCount, this._tileSize, this._tileSize);
  }

  _checkCollision() {
    if (this._grassX === this._headX && this._grassY === this._headY) {
      this._grassX = Math.floor(Math.random() * this._foodCount);
      this._grassY = Math.floor(Math.random() * this._foodCount);
      this._tailLength += 1;
      this._score += 1;
    }
  }

  _keyDown(e) {
    if (!this._isMoved) {
      switch (e.key) {
        case "ArrowLeft":
          if (this._velocity.x === 1) return;
          this._velocity.set(-1, 0);
          break;
        case "ArrowUp":
          if (this._velocity.y === 1) return;
          this._velocity.set(0, -1);
          break;
        case "ArrowRight":
          if (this._velocity.x === -1) return;
          this._velocity.set(1, 0);
          break;
        case "ArrowDown":
          if (this._velocity.y === -1) return;
          this._velocity.set(0, 1);
          break;
        default:
          break;
      }
      this._isMoved = true;
    }
  }

  _setFieldMesh() {
    this._fieldGeometry = new THREE.PlaneGeometry(this._size, this._size, 24, 24);
    this._fieldMaterial = new THREE.ShaderMaterial({
      fragmentShader: snakeCanvasFragment,
      vertexShader: snakeCanvasVertex,
      uniforms: {
        uTexture: { value: this._canvasTexture }
      }
    });
    this._fieldMesh = new THREE.Mesh(
      this._fieldGeometry,
      this._fieldMaterial,
    );
    this._fieldMesh.position.copy(this._position);
    this._scene.add(this._fieldMesh);
  }

  update() {
    this._drawLoadingBar();
    this._drawRestartTimer();
    if (!this._isFinished) {
      this._delta += this._speed;
      if (this._canvas && this._delta > 30) {
        this._isMoved = false;
        this._canvasTexture.needsUpdate = true;
        this._changeSnakePosition();
        const result = this._isWallBang();
        if (result) {
          this._isFinished = true;
          return;
        }
        this._clearScreen();
        this._drawSnake();
        this._drawGrass();
        this._checkCollision();
        this._drawScore();
        this._delta = 0;
      }
    }
  }

  restart() {
    this._isFinished = false;
    this._isMoved = false;
    this._restartTimer = 10000;
    this._headX = 10;
    this._headY = 10;
    this._parts = [];
    this._tailLength = 0;
    this._velocity = new THREE.Vector2(0, 0);

    this._grassX = 5;
    this._grassY = 5;

    this._score = 0;
    this._delta = 0;
  }

  init() {
    this._canvas = document.createElement("canvas");
    this._canvas.style.position = "absolute";
    this._canvas.style.left = "-1000px";
    this._canvas.style.top = "1500px";
    document.body.append(this._canvas);
    this._canvas.id = "snake-game";
    this._canvas.width = 400;
    this._canvas.height = 400;
    this._ctx = this._canvas.getContext("2d");

    this._foodCount = 20;
    this._tileSize = this._canvas.clientWidth / this._foodCount;
    this._headX = 10;
    this._headY = 10;
    this._parts = [];
    this._tailLength = 0;
    this._velocity = new THREE.Vector2(0, 0);

    this._grassX = 5;
    this._grassY = 5;

    this._score = 0;
    this._delta = 0;

    this._restartTimer = 10000;
    this._loadingStatus = 0;
    this._isLoading = true;
    this._isMoved = false;

    this._canvasTexture = new CanvasTexture(this._canvas, THREE.UVMapping);
    this._canvasTexture.needsUpdate = true;
    this._setFieldMesh();
  }

  destroy() {
    this._canvas.remove();
    this._canvas = null;

    this._fieldMaterial.dispose();
    this._fieldGeometry.dispose();
    this._scene.remove(this._fieldMesh);

    window.removeEventListener("keydown", this._listener);
  }
}