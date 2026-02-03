<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit, Ref, Model } from "vue-facing-decorator"
import type { DialogImageDetail, ImageDetailInterface } from "~/interfaces/detailed-image.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'detailed-images-component',
})

class DetailedImagesComponent extends Vue {
  @Prop() declare modelValue: ImageDetailInterface[]

  @Prop({ default: null })
  public text: String | undefined;
  @Prop({ default: "auto" })
  public width!: string | number | undefined;
  @Prop({ default: "auto" })
  public height!: string | number | undefined;
  @Prop({ default: "primary" })
  public color!: string;
  @Prop({ default: "" })
  public rounded!: string;
  @Prop({ default: "justify-content-center align-content-center" })
  public class!: string;;

  @Prop({ default: false })
  public multiple: boolean = false;

  @Ref('itemImage') itemImage!: any;
  private fileCallback: ((result: string|null) => void) | null = null

  // DIALOG CREATE CARD
  public dialog: DialogImageDetail = reactive({
    show: false,
    action: 'create',
    item:null
  })

  @Emit('update:modelValue')
  emitValue(value: ImageDetailInterface[]) {
    return value
  }

  @Emit('itemUpdate')
  emitUpdate(index: number) {
    return index
  }

  @Emit('itemCreate')
  emitCreate(index: number) {
    return index
  }

  @Emit('itemDelete')
  emitDelete(index: number) {
    return index
  }

  public changeItem(newValue: ImageDetailInterface|null, index?: number) {
    const arr = this.modelValue
    if(newValue){      
      if(index !== undefined && index >= 0){
        arr[index] = newValue
        this.emitUpdate(index)
      }
      else{
        arr.push(newValue)
        this.emitCreate(arr.length-1)
      }
    }    
    this.emitValue(arr)
  }

  public openDialog() {
    delete this.dialog.index
    this.dialog.item = {image: null, altText: null}    
    this.dialog.show = true
  }

  public editItem(index: number) {    
    const item = this.modelValue.at(index)
    if (!item) return
    this.dialog.index = index
    this.dialog.item = item
    this.dialog.show = true
  }

  public removeItem(index: number) {
    this.emitDelete(index)
  }

  public confirm(){
    this.changeItem(this.dialog.item, this.dialog.index)
    this.dialog.show = false
    this.dialog.item = null
    delete this.dialog.index
  }

  public cancel(){
    this.dialog.show = false
    this.dialog.item = null
    delete this.dialog.index
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
        this.dialog.item = { ...this.dialog.item, image: result, altText: null}
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
export default DetailedImagesComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
<v-hover>
    <template v-slot:default="{ isHovering, props }">      
      <slot :items="modelValue" :openDialog="openDialog" :removeItem="removeItem" :editItem="editItem">        
      </slot>
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
                  :src="dialog.item?.image || undefined" v-bind="props" cover>
                  <!-- LAYER UPLOAD IMAGE -->
                  <div v-if="isHovering" class="w-60 h-100 text-center align-content-center">
                    <v-btn variant="plain" color="#ffffff" :ripple="false" @click="selectMainImage" stacked>
                      <v-icon size="50" color="white">
                        mdi-plus
                      </v-icon>
                      {{ text }}
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