import "./style.css";
import { App } from "./app/App";
import { mobileDetectionRegex } from "./constants/regex";

export const isMobile = mobileDetectionRegex.test(navigator.userAgent);
console.log(isMobile);

if (isMobile) {
  const div = document.createElement("div");
  div.className = "mobile-placeholder";
  div.innerText = "Unfortunately, mobile devices can't use our app in the way we want since some features wont work proper on some mobile devices, " +
    "so we highly recommend you to enter our website from your PC!";
  document.body.appendChild(div);
} else {
  document.body.innerHTML = `<canvas class="webgl"></canvas>
    <div class="hello-message">PRESS
      <span class="hello-message_clickable">
        ENTER
      </span>
    </div>
    <div class="enter-message">
      Wrong :)
    </div>`;
  const canvas = document.querySelector(".webgl");
  const app = new App(canvas);
}
