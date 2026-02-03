<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit, Model } from "vue-facing-decorator"
import type { ItemActionInterface } from "~/interfaces/item-action.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'color-picker-dialog-component',
})

class ColorPickerDialogComponent extends Vue {
  @Prop() declare modelValue: string | null

  public tempColor: string = "#fff"
  public dialog = false

  @Emit('update:modelValue')
  emitColor(value: string|null) {
    return value
  }

  public changeColor(newColor: string) {
    this.emitColor(newColor)
  }

  public openDialog() {
    this.dialog = true
    this.tempColor = this.modelValue?? this.tempColor
  }

  public confirm(){
    this.changeColor(this.tempColor)
    this.dialog = false
  }

  public cancel(){
    this.tempColor = this.modelValue?? '#fff'
    this.dialog = false
  }

  public reset(){
    this.emitColor(null)
    this.tempColor = 'white'
    this.dialog = false
  }
}
export default ColorPickerDialogComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-btn icon="" class="rainbow-button" variant="elevated" size="x-small" @click="openDialog" :style="`--color: ${modelValue?? tempColor};`"></v-btn>

  <teleport to="body">
    <v-dialog
      v-model="dialog"
      width="400"
    >
      <v-card class="w-100">
        <v-card-title class="text-h6">Selecciona un color</v-card-title>

        <v-card-text>
          <v-color-picker
            v-model="tempColor"
            mode="hex"
            width="100%"
          />
        </v-card-text>

        <v-card-actions>
          <v-btn @click="cancel()" variant="text">
            Cancelar
          </v-btn>
          <v-btn @click="reset()" variant="text">
            Reestablecer
          </v-btn>
          <v-spacer />
          <v-btn @click="confirm()" variant="text">
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </teleport>
</template>

<style scoped>
.rainbow-button {
  border-radius: 50%;
  background: radial-gradient(var(--color, white) 40%, transparent 41%),
              conic-gradient(
                red,
                yellow,
                lime,
                cyan,
                blue,
                magenta,
                red
              );
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
</style>