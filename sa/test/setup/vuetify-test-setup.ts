import { config } from "@vue/test-utils";
import { createTestingVuetify } from "./vuetify";

config.global.plugins = [createTestingVuetify()];

// Avoid warnings for teleport
config.global.stubs = {
  teleport: true,
};

// Polyfill visualViewport for JSDOM
if (typeof window.visualViewport === "undefined") {
  window.visualViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    offsetTop: 0,
    offsetLeft: 0,
    pageTop: 0,
    pageLeft: 0,
    addEventListener: () => {},
    removeEventListener: () => {},
  } as any;
}
