import { defineNuxtPlugin } from "#app";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

// OPTIONS
const globalOptions = {
  theme: "snow",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ 'direction': 'rtl' }], 
      [{ size: ["small", false, "large", "huge"] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ color: [] }, { background: [] }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      //[{ font: [] }],
      [{ align: [] }],
      ["link"],
    ],
  },
};

// SET DEFAULT OPTIONS
QuillEditor.props.globalOptions.default = () => globalOptions;

// REGISTER COMPONENT
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("app-editor-text", QuillEditor);
});
