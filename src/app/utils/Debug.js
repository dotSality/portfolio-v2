import * as gui from "lil-gui";

export class Debug {
  constructor() {
    // this.active = window.location.hash === "#debug";
    this.active = false;

    if (this.active) {
      this.dat = new gui.GUI();
    }
  }
}