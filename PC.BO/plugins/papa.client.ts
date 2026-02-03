import { defineNuxtPlugin } from "#app";

import papa from "vue-papa-parse";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(papa)
});
