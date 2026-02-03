<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit } from "vue-facing-decorator"

// IMPORT INTERFACES
import type { SnackbarOptions } from "~/interfaces/snackbar.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-snackbar-component',
})
class AppSnackbarComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // SNACKBAR OPTIONS
  @Prop({
    default: {
      show: false,
      btn: '',
      y: 'bottom',
      x: '',
      mode: '',
      timeout: 3000,
      text: '',
      color: 'success'
    }
  })
  options!: SnackbarOptions;

  //////////////////
  // EMIT EVENTS //
  /////////////////

  @Emit('close')
  public close() {
    return this.options
  }

}
export default AppSnackbarComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-snackbar v-model="options.show" :bottom="options.y === 'bottom'" :left="options.x === 'left'"
    :multi-line="options.mode === 'multi-line'" :right="options.x === 'right'" :timeout="options.timeout"
    :top="options.y === 'top'" :vertical="options.mode === 'vertical'" :color="options.color" rounded="pill"
    class="py-0">
    {{ options.text }}
    <v-btn variant="text" rounded @click="close()">
      {{ options.btn ? options.btn : "Ok" }}
    </v-btn>
  </v-snackbar>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>