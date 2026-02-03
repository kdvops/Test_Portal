<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { template } from "lodash";
import { Vue, Prop, Emit, Ref, Model } from "vue-facing-decorator"
import type { DialogImageDetail, ImageDetailInterface } from "~/interfaces/detailed-image.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'detailed-image-component',
})

class DetailedImageComponent extends Vue {
  @Prop() declare modelValue: ImageDetailInterface | null

  @Prop({ default: "Cargar Imagen" })
  public text!: String;
  @Prop({ default: "auto" })
  public width!: string | number | undefined;
  @Prop({ default: "auto" })
  public height!: string | number | undefined;
  @Prop({ default: "primary" })
  public color!: string;
  @Prop({ default: "" })
  public rounded!: string;
  @Prop({ default: "justify-content-center align-content-center" })
  public class!: string;
  @Prop({ default: null})
  public legacyImage: string | null | undefined;

  @Prop({ type: Boolean, default: false })
  readonly avatar!: boolean

  @Ref('itemImage') itemImage!: any;
  private fileCallback: ((result: string|null) => void) | null = null

  // DIALOG CREATE CARD
  public dialog: DialogImageDetail = reactive({
    show: false,
    action: 'create',
    item:null
  })

  @Emit('update:modelValue')
  emitValue(value: ImageDetailInterface|null) {
    return value
  }

  public changeItem(newValue: ImageDetailInterface|null) {
    this.emitValue(newValue)
  }

  public openDialog() {
    this.dialog.item = this.modelValue?? {image: this.legacyImage || null, altText: null}
    this.dialog.show = true
  }

  public confirm(){
    this.changeItem(this.dialog.item)
    this.dialog.show = false
  }

  public cancel(){
    this.dialog.item = null
    this.dialog.show = false
  }

  public selectImage(callback: (result: string | null) => void) {
    //this.fileCallback = callback
    this.fileCallback = (result: string|null) => {
      callback(result) 
    }

    const imageRefs: any = this.itemImage

    // REF IMAGE RESET
    imageRefs.value = null;
    imageRefs.click()
  }

  public selectMainImage(){
    this.selectImage((result) => {
      if(result){
        //this.changeItem({ ...this.modelValue, image: result, altText: null})
        this.dialog.item = { ...this.dialog.item, image: result, altText: this.dialog.item?.altText?? null}
      }
    } );
  }

   public getImageFromHandler(input: File|File[]) {
    if (!Array.isArray(input)) {
      const file:File = input
      if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
        if (file.size <= 19520000) {
          const fr = new FileReader()
          fr.onload = (el: any) => {
            if (this.fileCallback) {
              this.fileCallback(el.target.result)
              this.fileCallback = null // optional cleanup
            }
          }
          fr.readAsDataURL(file)
        } else {
          throw new Error('El peso máximo es menor de 2 MB')
        }
      } else {
        throw new Error('El peso máximo es menor de 2 MB')
      }
    }
  }
}
export default DetailedImageComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <template v-if="avatar" >
    <v-avatar @click="openDialog()" :icon="modelValue?.image || legacyImage || undefined ? 'mdi-pencil' : 'mdi-plus'" class="mt-3"
              size="80" color="#12539b" :image="modelValue?.image || legacyImage || undefined" />
  </template>
  <v-hover v-else>
    <template v-slot:default="{ isHovering, props }">
      <v-img 
      :width="width"
      :height="height"
      :color="color"
      :rounded="rounded"
      :class="class"
       class="w-100"
      :src="(modelValue?.image ?? '') || legacyImage || undefined" v-bind="props" cover>
        <v-tooltip v-if="modelValue?.altText" activator="parent" location="top">{{modelValue.altText}}</v-tooltip>
        <!-- LAYER UPLOAD IMAGE -->
        <v-container v-if="isHovering || (!modelValue?.image && modelValue?.image?.trim() === '' || legacyImage && legacyImage?.trim?.() === '')" class="banner-container-image h-100" fluid>
          <v-row class="banner-row-image h-100" align-content="center">
            <v-col cols="12" class="text-center">
              <v-btn variant="plain" color="#ffffff" :ripple="false" @click="openDialog" stacked>
                <v-icon size="50" color="white"> mdi-plus </v-icon>
                {{text}}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
        <template v-else>
          <slot name="fallback" v-if="$slots.fallback">
          </slot>
        </template>   
        <slot></slot>     
      </v-img>
    </template>
  </v-hover>

  <teleport to="body">
    <v-dialog
      v-model="dialog.show"
      width="400"
      v-if="dialog.item"
    >
      <v-card class="w-100">
        <v-card-title class="text-h6">Detalles de la imagen</v-card-title>
        <v-card-text> 
          <v-col cols="12">
            <v-hover>
              <template v-slot:default="{ isHovering, props }">
                <v-img width="100%" height="250" color="primary" class="justify-content-center align-content-center"
                  :src="dialog.item?.image || legacyImage || undefined" v-bind="props" cover>
                  <!-- LAYER UPLOAD IMAGE -->
                  <div v-if="isHovering" class="w-60 h-100 text-center align-content-center">
                    <v-btn variant="plain" color="#ffffff" :ripple="false" @click="selectMainImage" stacked>
                      <v-icon size="50" color="white">
                        mdi-plus
                      </v-icon>
                      Cargar Imagen
                    </v-btn>
                  </div>
                </v-img>
              </template>
            </v-hover>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="dialog.item.altText" rounded="xl" density="compact" variant="solo"
              label="ALT text de la imagen" />
          </v-col>
        </v-card-text>

        <v-card-actions>
          <v-btn @click="cancel()" variant="text">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn @click="confirm()" variant="text">
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </teleport>

  <v-file-input ref="itemImage" class="d-none" accept=".jpg, .jpeg, .png" @update:model-value="getImageFromHandler" />
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