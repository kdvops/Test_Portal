import { defineNuxtPlugin } from "#app";

// IMPORT DRAGGABLE
import Draggable from 'vuedraggable'

// REGISTER COMPONENT
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("draggable", Draggable);
})
