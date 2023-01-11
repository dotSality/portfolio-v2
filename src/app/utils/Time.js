import * as THREE from "three";
import { EventEmitter } from "./EventEmitter";
import { EVENTS_ENUM } from "../../constants/events";

export class Time extends EventEmitter {
  constructor() {
    super();

    this.startTime = Date.now();
    this.current = this.startTime;
    this.elapsedTime = 0;
    this.delta = 16;

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }

  tick() {
    const currentTime = Date.now();
    this.delta = currentTime - this.current;
    this.current = currentTime;
    this.elapsedTime = this.current - this.startTime;

    this.trigger(EVENTS_ENUM.TICK);

    window.requestAnimationFrame(() => {
      this.tick();
    });
  }
}