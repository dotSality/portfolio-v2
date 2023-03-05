import { mobileDetectionRegex } from "../../constants/regex";

export class DeviceDetection {
  constructor(userAgent) {
    this._userAgent = userAgent;
  }

  isMobile() {
    return mobileDetectionRegex.test(this._userAgent);
  }
}