// test/setup/vuetify.ts
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export function createTestingVuetify() {
  return createVuetify({
    components,
    directives,
    ssr: true,
  });
}
