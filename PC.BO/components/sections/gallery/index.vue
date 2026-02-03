<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { DialogModifyGalleryItem, GalleryConfigurationInterface, GalleryInterface, GalleryItemInterface, SectionTypeInterface } from "~/interfaces/sections.interface";
import NoImage from '~/assets/backgrounds/noimage.jpeg';

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-gallery-component',
  components:{    
    'detailed-image-component': DetailedImageComponent
  }
})
class SectionGalleryComponent extends Vue {
  @Ref('itemImage') itemImage!: any;
  private fileCallback: ((result: string|null) => void) | null = null

  ///////////////
  //// PROPS ////
  ///////////////
  public noimage = NoImage;
  // PROPS CARDS SECTION
  @Prop({
    default: {
      name: '',
      description: '',
      color: '',
      position: 0,
      style: 'cardLarge',
      type: 'sectionGallery',
      text: '',
    }
  })
  public section!: SectionTypeInterface;

  // DIALOG CREATE CARD
  public dialog: DialogModifyGalleryItem = reactive({
    show: false,
    action: 'create',
    index: 0,
    item:null
  })
  ///////////////
  // VARIABLES //
  ///////////////
  
  public gallery:GalleryInterface = {
    items: [],
  }
  
  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  public created() {
    this.gallery.items = this.section?.gallery?.items || []
    this.configureGallery()
  }

  public configureGallery(){
    this.gallery = {...this.gallery }
    this.configuredGallery({position: this.section.position, gallery: { items: []}})
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  // UPDATE SECTION
  @Emit('updateSection')
  public updateSection(): SectionTypeInterface { 
    // RETURN SECTION
    return { ...this.section }
  }

  // REMOVE SECTION
  @Emit('removeSection')
  public removeSection(): number {
    return this.section.position
  }

  
  @Emit('configureGallery')
  public configuredGallery(sectionItem : GalleryConfigurationInterface): GalleryConfigurationInterface {
    return sectionItem;
  }

    // CLOSE DIALOG CREATE CARD
  public closeDialog() {
    this.dialog.action = 'create'
    this.dialog.show = false
    this.dialog.item = null
    this.dialog.index = 0
  }

  public saveChanges() {
    if(this.dialog?.item){
      const item = this.dialog?.item
      if(this.dialog.action === 'create')this.addGalleryItem(item);
      else this.updateGalleryItem(item)                  
    }
  }

  public makeid(length:number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public openDialogCreate(){
    this.dialog.action = 'create'
    this.dialog.item = {
      image: ''
    }
    this.dialog.show = true
  }

  public openDialogModify(index:number){
    this.dialog.item = {...this.gallery.items[index]}
    this.dialog.action = 'update'
    this.dialog.show = true
    this.dialog.index = index
  }

  // OPEN UPLOAD IMAGE
  public selectImage(callback: (result: string | null) => void) {
    //this.fileCallback = callback
    this.fileCallback = (result: string|null) => callback(result)

    const imageRefs: any = this.itemImage

    // REF IMAGE RESET
    imageRefs.value = null;
    imageRefs.click()
  }

  // GET IMAGE FILE AND SET IN ITEM CARD
  public getImageFromHandler(file: File) {
    if (file) {
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
          this.$bus.$emit('handleError', 'El peso máximo es menor de 2 MB')
        }
      } else {
        this.$bus.$emit('handleError', 'Solo se aceptan formato .png y .jpeg')
      }
    }
  }

  public selectMainImage(){
    this.selectImage((result) => {
      this.dialog.item!.image = result!;
    } );
  }

  public selectIconImage(){
    this.selectImage((result) => {
      this.dialog.item!.icon = result!;
    } );
  }

  public addGalleryItem(item:GalleryItemInterface){
    this.gallery.items.push({...item});
    this.closeDialog();
  }  
  
  public updateGalleryItem(item:GalleryItemInterface){
    //const index = this.gallery.items.map(item => item._id).indexOf(item._id);
    this.gallery.items[this.dialog.index!] = item
    
    this.closeDialog();
    //this.updatedGridElement({element: item, index})
  }
  
  public removeGalleryItem(index:number){
    this.gallery.items.splice(index, 1);
    //this.removedGridElement(index)
  }
}
export default SectionGalleryComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-col class="my-5" no-gutters cols="12">
    <v-card>
      <v-toolbar :color="section.color?? '#12539b'" height="100">
        <!-- Title and Subtitle -->
         <v-container class="d-flex justify-center">
          <div class="d-flex flex-column align-center">
            <span class="text-h5 text-white">
              {{ section.name
                ? section.name
                : 'Sección sin titulo'
              }}
            </span>
            <span class="text-body-2 text-caption text-white">
              {{ section.description || section.name
                ? section.description
                : 'Las secciones sin titulo ni descripción no se mostrara este encabezado!!'
              }}
            </span>
          </div>
        </v-container>
        <template v-slot:append>
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn icon v-bind="props">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="updateSection()" title="Editar Sección" />
              <v-list-item @click="removeSection()" title="Eliminar Sección" />
            </v-list>
          </v-menu>
        </template>
      </v-toolbar>    
      <v-btn
          :color="section.color?? '#12539b'"
          @click="openDialogCreate"
          icon="mdi-plus"
          class="position-absolute"
          style="top: 90px; right: 80px; transform: translateY(-50%); z-index: 2;"
      >
      </v-btn>
      <v-card-text>
        <v-container fluid class="pa-0">
          <v-row no-gutters>
            <v-col
              v-for="(item, index) in gallery.items"
              :cols="12 / gallery.items.length"
              class="d-flex"
            >              
              <v-card
                flat
                tile
                class="d-flex flex-grow-1 image-card overflow-hidden hover-scale"
              >
                <v-card flat tile class="d-flex flex-grow-1 align-end image-card position-relative">
                  <v-img
                    :src="item.image?.trim()? item.image:item.imageDetail?.image?? noimage"
                    aspect-ratio="1.5"
                    height="200px"
                    cover
                    gradient="to top, rgba(0,0,0,.9), rgba(0,0,0,.3)"
                    class="d-flex flex-column hover-zoom"
                  >
                    <div class="position-absolute top-0 right-0" style="z-index: 999;">
                      <v-menu location="top end">
                        <template #activator="{ props }">
                          <v-btn
                            icon="mdi-dots-vertical"
                            size="large"
                            class="m-3"
                            v-bind="props"
                            variant="text"
                          />
                        </template>
                        <v-list>                          
                          <v-list-item @click="openDialogModify(index)" title="Modificar componente" />
                          <v-list-item @click="removeGalleryItem(index)" title="Eliminar componente" />
                        </v-list>
                      </v-menu>
                    </div>
                    <div v-if="item.title || item.icon"
                      class="d-flex align-center px-2 py-2"
                      style="position: absolute; bottom: 0px; left: 0; right: 0; background: rgba(0,0,0,.2)"
                    >
                      <v-col cols="4">
                        <v-img v-if="item.icon || item.iconImageDetail?.image"
                          :src="item?.icon?.trim()? item.icon:item.iconImageDetail?.image?? noimage"
                          height="40px"
                          />
                      </v-col>
                      <v-col cols="8">
                        <span v-if="item.title" class="text-white font-weight-bold text-body-1">
                          {{item.title}}
                        </span>
                      </v-col>
                    </div>

                    <div v-if="item.video" class="play-overlay">
                      <v-icon size="64" color="white">mdi-play-circle</v-icon>
                    </div>
                  </v-img>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-col>
  
  
  <!-- DIALOG CREATE CARD -->
  <v-dialog v-model="dialog.show" width="500">
    <v-card rounded="xl" :color="section.color">
       <v-toolbar color="transparent">
          <v-toolbar-title class="text-subtitle ext-white font-weight-bold" :text="`${dialog.action === 'create'? 'Crear':'Modificar'} item de galería`"/>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" v-if="dialog.item">
              <v-row class="mb-2" >
                <v-col cols="4" class="d-flex flex-column justify-center align-center">
                  <label>Icono</label>
                  <detailed-image-component
                    v-model="dialog.item.iconImageDetail" 
                    :legacy-image="dialog.item.icon"
                    avatar
                    ></detailed-image-component>
                </v-col>
                <v-col cols="8" class="d-flex flex-column justify-center align-center">
                  <label>Imagen</label>
                  <detailed-image-component color="#00a44f" rounded="xl" height="80" 
                    v-model="dialog.item.imageDetail" 
                    :legacy-image="dialog.item.image" 
                    text="Cargar Imagen"></detailed-image-component>
                </v-col>
              </v-row>
              <v-text-field v-model="dialog.item.title" rounded="xl" density="compact" variant="solo"
                label="Título" />
              <v-text-field v-model="dialog.item.video" rounded="xl" density="compact" variant="solo"
                label="Url del vieo" />
            </v-col>      
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="closeDialog()" variant="text">
            Cancelar
          </v-btn>
          <v-spacer />
          <v-btn @click="saveChanges()" variant="text">
            Guardar
          </v-btn>
        </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ITEMS BANNER IMAGE -->
  <v-file-input ref="itemImage" class="d-none" accept=".jpg, .jpeg, .png" @update:model-value="getImageFromHandler" />
</template>

<!-- SASS STYLES -->
<style scoped>
.image-card {
  overflow: hidden;
  position: relative;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 1;
  z-index: 10;
  pointer-events: none;
}
</style>