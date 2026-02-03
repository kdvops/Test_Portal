<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { DialogModifyAccordionItem, AccordionConfigurationInterface, SectionTypeInterface, ListInterface, ListItemInterface } from "~/interfaces/sections.interface";
import NoImage from '~/assets/backgrounds/noimage.jpeg';
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-accordion-component',
})
class SectionAccordionComponent extends Vue {
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
      type: 'sectionAccordion',
      text: '',
    }
  })
  public section!: SectionTypeInterface;

  // DIALOG CREATE CARD
  public dialog: DialogModifyAccordionItem = reactive({
    show: false,
    action: 'create',
    index: 0,
    item:null
  })
  ///////////////
  // VARIABLES //
  ///////////////
  
  public accordion:ListInterface = {
    items: [],
  }
  
  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  public created() {
    this.accordion.items = this.section?.accordion?.items || []
    this.configureAccordion()
  }

  public configureAccordion(){
    this.accordion = {...this.accordion }
    this.configuredAccordion({position: this.section.position, accordion: { items: []}})
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

  
  @Emit('configureAccordion')
  public configuredAccordion(sectionItem : AccordionConfigurationInterface): AccordionConfigurationInterface {
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
      if(this.dialog.action === 'create')this.addAccordionItem(item);
      else this.updateAccordionItem(item)                  
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
      title: '',
      content: ''
    }
    this.dialog.show = true
  }

  public openDialogModify(index:number){
    this.dialog.item = {...this.accordion.items[index]}
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

  public addAccordionItem(item:ListItemInterface){
    this.accordion.items.push({...item});
    this.closeDialog();
  }  
  
  public updateAccordionItem(item:ListItemInterface){
    //const index = this.accordion.items.map(item => item._id).indexOf(item._id);
    this.accordion.items[this.dialog.index!] = item
    
    this.closeDialog();
    //this.updatedGridElement({element: item, index})
  }
  
  public removeAccordionItem(index:number){
    this.accordion.items.splice(index, 1);
    //this.removedGridElement(index)
  }
}
export default SectionAccordionComponent;
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
              <v-container class="pa-4">
                <v-expansion-panels multiple>
                  <v-expansion-panel color="white"
                    v-for="(item, index) in accordion.items"
                    :key="index"
                  >
                    <v-expansion-panel-title>
                      <div class="d-flex justify-space-between align-center w-100">
                        <span class="text-primary font-weight-bold">{{ item.title }}</span>

                        <!-- 3-dots menu placed outside #actions slot -->
                        <v-menu>
                          <template #activator="{ props }">
                            <v-btn
                              icon
                              v-bind="props"
                              @click.stop
                              class="mr-2"
                              color="#ffffff"
                              variant="flat"
                            >
                              <v-icon>mdi-dots-vertical</v-icon>
                            </v-btn>
                          </template>

                          <v-list>
                            <v-list-item >
                              <v-list-item-title @click="openDialogModify(index)">Modificar componente</v-list-item-title>
                            </v-list-item>
                            <v-list-item >
                              <v-list-item-title @click="removeAccordionItem(index)">Eliminar componente</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </div>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text class="bg-grey-lighten-2">
                      {{ item.content }}
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-container>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-col>  
  
  <!-- DIALOG CREATE CARD -->
  <v-dialog v-model="dialog.show" width="500">
    <v-card rounded="xl" :color="section.color">
       <v-toolbar color="transparent">
          <v-toolbar-title class="text-subtitle ext-white font-weight-bold" :text="`${dialog.action === 'create'? 'Crear':'Modificar'} item de acordeón`"/>
        </v-toolbar>
        <v-card-text>
          <v-row>
            <v-col cols="12" v-if="dialog.item">                
              <v-text-field v-model="dialog.item.title" rounded="xl" density="compact" variant="solo"
                label="Título" />
              <v-textarea v-model="dialog.item.content" rounded="xl" density="compact" variant="solo"
                label="Contenido"></v-textarea>
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
::v-deep(.v-expansion-panel-title__icon .v-icon) {
  color: green !important;
}
</style>