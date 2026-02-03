<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { 
  DialogCreateNewSection, 
  SectionTypeInterface, 
  TypeCard, 
  TypeAttachment, 
  TableColumnInterface,
  GalleryConfigurationInterface,
  AccordionConfigurationInterface,
} from "~/interfaces/sections.interface";

// IMPORT COMPONENTS
import SectionCardComponent from "~/components/sections/cards/index.vue";
import SectionBannerComponent from "~/components/sections/banner/index.vue";
import SectionVideoComponent from "~/components/sections/video/index.vue";
import SectionImageComponent from "~/components/sections/image/index.vue";
import SectionTextComponent from "~/components/sections/text/index.vue";
import SectionAttachmentsComponent from "~/components/sections/attachments/index.vue";
import SectionTableComponent from "~/components/sections/table/index.vue";
import SectionGridsComponent from "~/components/sections/grids/index.vue";
import sectionGalleryComponent from "./gallery/index.vue";
import SectionAccordionComponent from "./accordion/index.vue";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'sections-component',
  components: {
    // COMPONENTS CUSTOM APP
    'section-card-component': SectionCardComponent,
    'section-banner-component': SectionBannerComponent,
    'section-image-component': SectionImageComponent,
    'section-video-component': SectionVideoComponent,
    'section-text-component': SectionTextComponent,
    'section-table-component': SectionTableComponent,
    'section-attachments-component': SectionAttachmentsComponent,
    'section-grids-component': SectionGridsComponent,
    'section-gallery-component': sectionGalleryComponent,
    'section-accordion-component': SectionAccordionComponent,
    'detailed-image-component': DetailedImageComponent
  },
})
class SectionComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // PROPS SECTION
  @Prop({
    default: {
      name: '',
      description: '',
      color: '',
      position: 0,
      style: '',
      type: '',
      image: {
        url: '',
        newUploadPictureItem: []
      },
      text: '',
      video: '',
      cards: [],
      banner: {
        button: {
          text: '',
          color: '',
          link: '',
          background: '',
          enabled: false,
        },
        picture: '',
        newUploadPictureItem: []
      },
      attachments: [],
    }
  })
  public sections!: Array<SectionTypeInterface>;

  ///////////////
  ///// REF /////
  ///////////////

  // SLIDER DEFAULT VALUES
  @Ref('bannerImage') bannerImage!: any;

  // RICH TEXT EDITOR REF
  @Ref('descriptionEditor') descriptionEditor!: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // DRAG START
  public drag: boolean = false;

  // DIALOG SECTION CREATE
  public dialog: DialogCreateNewSection = {
    action: 'create',
    show: false,
    step: 1,
    section: {
      name: '',
      description: '',
      color: '#12539b',
      position: 0,
      style: 'cardsLarge',
      type: 'sectionCards',
      image: {
        url: '',
        newUploadPictureItem: []
      },
      video: '',
      text: '',
      table: {
        columns: [],
        headers: []
      },
      cards: [],
      banner: {
        title: {
          text: '',
          color: '',
        },
        description: {
          text: '',
          color: ''
        },
        background: '',
        button: {
          text: '',
          color: '',
          link: '',
          background: '',
          enabled: false,
        },
        picture: '',
        newUploadPictureItem: []
      },
      attachments: [],
      gallery:{
        items:[]
      },
      accordion:{
        items:[]
      }
    }
  }

  // STYLE SECTION TEXT
  public styleSectionImage: Array<{ name: string, value: string }> = [
    {
      name: 'Pequeño',
      value: 'imageSmall'
    },
    {
      name: 'Mediana',
      value: 'imageMedium'
    },
    {
      name: 'Grande',
      value: 'imageLarge'
    },    
    {
      name: 'Completa',
      value: 'imageCover'
    },
  ]

  // STYLE SECTION TEXT
  public styleSectionText: Array<{ name: string, value: string }> = [
    {
      name: 'Grande',
      value: 'textLarge'
    },
    {
      name: 'Mediana',
      value: 'textMedium'
    },
  ]

  // STYLE SECTION VIDEOS
  public styleSectionVideo: Array<{ name: string, value: string }> = [
    {
      name: 'Grande',
      value: 'videoLarge'
    },
    {
      name: 'Mediana',
      value: 'videoMedium'
    },
  ]

  // STYLE SECTION ATTACHMENTS
  public styleSectionAttachments: Array<{ name: string, value: string }> = [
    {
      name: 'Grande',
      value: 'attachmentsLarge'
    },
    {
      name: 'Mediana',
      value: 'attachmentsMedium'
    },
  ]

  // STYLE SECTION TABLE
  public styleSectionTable: Array<{ name: string, value: string }> = [
    {
      name: 'Pequeño',
      value: 'tableSmall'
    },
    {
      name: 'Grande',
      value: 'tableLarge'
    },
    {
      name: 'Mediana',
      value: 'tableMedium'
    },
  ]

  // STYLE SECTION CARDS
  public styleSectionCards: Array<{ name: string, value: string }> = [
    {
      name: 'Grande',
      value: 'cardsLarge'
    },
    {
      name: 'Mediana',
      value: 'cardsMedium'
    },
  ]

  // STYLE SECTION BANNERS
  public styleSectionBanner: Array<{ name: string, value: string }> = [
    {
      name: 'Grande',
      value: 'bannerLarge'
    },
    {
      name: 'Mediano',
      value: 'bannerMedium'
    },
  ]

  ///////////////
  /// METHODS ///
  ///////////////

  // OPEN UPLOAD IMAGE
  public selectImage() {
    const imageRefs: any = this.bannerImage

    // REF IMAGE RESET
    imageRefs.value = null;

    // REF ON CLICK
    imageRefs.click()
  }

  // GET IMAGE AND FILE
  public getBannerImage(file: File) {
    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
        if (file.size <= 19520000) {
          const bannerImage = this.dialog.section.type === 'sectionBanner'
            ? this.dialog.section.banner.newUploadPictureItem!
            : this.dialog.section.image.newUploadPictureItem!;
          const fr = new FileReader()
          fr.onload = (el: any) => {
            bannerImage.splice(0, 1, {
              img: el.target.result,
              filetype: file.type.split('/')[1]
            })
          }
          fr.readAsDataURL(file)
        } else {
          this.$bus.$emit('handleError', 'El peso máximo es de 2 MB')
        }
      } else {
        this.$bus.$emit('handleError', 'Solo se aceptan formato .png y .jpeg')
      }
    }
  }

  // CHECK MOVE
  public checkMove(evt: any) {
    return evt.dragged.className !== 'ghost';
  }

  // DRAG END
  public dragEnded(evt: any) {
    // NEW SECTIONS
    let newSections: Array<SectionTypeInterface> = [];

    // EMIT EVENT CHANGE POSITION SECTION
    this.changePositionSection(newSections, evt)

    // DRAG END
    this.drag = false;
  }

  // CREATE SECTION
  public createSection() {
    this.dialog.action = 'create';
    this.dialog.show = true;
    this.dialog.step = 1;
  }

  // UPDATE SECTION
  public updateSection(section: SectionTypeInterface) {
    this.dialog.action = 'update';
    this.dialog.show = true;
    this.dialog.step = 2;
    this.dialog.section = { ...this.dialog.section, ...section }

    // SET HTML EDITOR
    this.dialog.section.type === 'sectionText' && this.setHtmlEditor(section.text);
  }

  // CLOSE MODAL CREATE NEW SECTION
  public closeDialog() {
    this.dialog.show = false;
    this.dialog.step = 1;
    this.dialog.section = {
      name: '',
      description: '',
      color: '',
      position: 0,
      style: 'cardsLarge',
      type: 'sectionCards',
      image: {
        url: '',
        newUploadPictureItem: []
      },
      video: '',
      text: '',
      table: {
        columns: [],
        headers: []
      },
      cards: [],
      banner: {
        title: {
          text: '',
          color: '',
        },
        description: {
          text: '',
          color: ''
        },
        background: '',
        button: {
          text: '',
          color: '',
          link: '',
          background: '',
          enabled: false,
        },
        picture: '',
        newUploadPictureItem: []
      },
      attachments: [],      
      gallery:{
        items:[]
      },
      accordion:{
        items:[]
      }
    }
  }

  // INCREMENT STEP
  public incStep() {
    this.dialog.step === 2
      ? (this.newSection(), this.closeDialog())
      : this.dialog.step++;
  }

  // VALIDATE ACTION
  public validateAction() {
    if (this.dialog.action === 'create' && this.dialog.section.type === 'sectionAttachments') {

      // CREATE SECTION ATTACHMENTS
      this.dialog.section = {
        ...this.dialog.section,
        name: 'Sección de archivos',
        description: 'Sección de archivos',
        color: '#12539b',
        attachments: []
      }

      // EMIT EVENT CREATE SECTION
      this.newSection()

      // CLOSE DIALOG
      this.closeDialog()
    } else if (this.dialog.action === 'create') {

      // INCREMENT STEP CREATE SECTION
      this.incStep()
    } else {

      // EMIT EVENT EDIT SECTION
      this.editSection()

      // CLOSE DIALOG
      this.closeDialog()
    }
  }

  // VALIDATE TYPE SECTION AND SIZE
  public validateTypeSectionAndSize(section: SectionTypeInterface): string {
    // DEFAULT COLS
    let cols = '12';

    // VALIDATE TYPE SECTION
    if (section.type === 'sectionCards') {
      section.style === 'cardsLarge' ? cols = '12' : cols = '6'
    } else if (section.type === 'sectionBanner') {
      section.style === 'bannerLarge' ? cols = '12' : cols = '8'
    } else if (section.type === 'sectionVideo') {
      section.style === 'videoLarge' ? cols = '12' : cols = '6'
    } else if (section.type === 'sectionText') {
      section.style === 'textLarge' ? cols = '12' : cols = '7'
    } else if (section.type === 'sectionTable') {
      section.style === 'tableLarge' ? cols = '12' : section.style === 'tableMedium' ? cols = '7' : cols = '5'
    } else if (section.type === 'sectionImage') {
      section.style === 'imageLarge' || section.style === 'imageCover'
        ? cols = '12'
        : section.style === 'imageMedium'
          ? cols = '6'
          : cols = '4'
    } 
    else if (section.type === 'sectionGallery') {
      section.style === 'cardsLarge' ? cols = '12' : cols = '6'
    }
    else if (section.type === 'sectionGrids') {
      section.style === 'cardsLarge' ? cols = '12' : cols = '8'
    }
    else if (section.type === 'sectionAccordion') {
      section.style === 'cardsLarge' ? cols = '12' : cols = '6'
    } 
    else {
      cols = '12'
    }

    // RETURN COLS
    return cols;
  }

  // GET HTML EDITOR TEXT
  public async getHtmlEditor() {
    this.dialog.section.text = this.descriptionEditor.getHTML();
  }

  // SET HTML EDITOR
  public setHtmlEditor(html: string) {
    setTimeout(() => {
      this.descriptionEditor.setHTML(html);
    }, 200);
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  // EMIT EVENT CREATE SECTION
  @Emit('newSection')
  public newSection(): SectionTypeInterface {
    // RETURN SECTION CREATE
    return this.dialog.section;
  }

  // EMIT EVENT EDIT SECTION
  @Emit('editSection')
  public editSection(): SectionTypeInterface {
    // RETURN SECTION CREATE
    return this.dialog.section;
  }

  // EMIT EVENT REMOVE SECTION
  @Emit('changePositionSection')
  public changePositionSection(sections: Array<SectionTypeInterface>, evt: any): { sections: Array<SectionTypeInterface>, evt: any } {
    // RETURN SECTION CREATE
    return { sections, evt };
  }

  // EMIT EVENT REMOVE SECTION
  @Emit('removeSection')
  public removeSection(position: number): number {
    // RETURN SECTION CREATE
    return position;
  }

  //////////////////////////
  /// SECTION TYPE TABLE ///
  //////////////////////////

  // EMIT EVENT SET DATA TABLE SECTION
  @Emit('setDataTable')
  public setDataTable(section: { position: number; headers: Array<string>; columns: Array<TableColumnInterface[]> }): { position: number; headers: Array<string>; columns: Array<TableColumnInterface[]> } {
    // RETURN TABLE DATA CREATE
    return section;
  }

  //////////////////////////
  /// SECTION TYPE CARDS ///
  //////////////////////////

  // EMIT EVENT CREATE NEW CARD SECTION
  @Emit('createNewCardSection')
  public createNewCardSection(card: { position: number, card: TypeCard }): { position: number, card: TypeCard } {
    // RETURN CARD CREATE
    return card;
  }

  // EMIT EVENT UPDATE NEW CARD SECTION
  @Emit('updateCardSection')
  public updateCardSection(updateCard: { position: number, index: number, card: TypeCard }): { position: number, index: number, card: TypeCard } {
    // RETURN CARD CREATE
    return updateCard;
  }

  // EMIT EVENT UPDATE NEW CARD SECTION
  @Emit('removeCardSection')
  public removeCardSection(removeCard: { position: number, index: number }): { position: number, index: number } {
    // RETURN CARD REMOVE
    return removeCard;
  }

  @Emit('configureGallery')
  public configuredGallery(sectionEvent : GalleryConfigurationInterface): GalleryConfigurationInterface {    
    return sectionEvent;
  }

  
  @Emit('configureAccordion')
  public configuredAccordion(sectionEvent : AccordionConfigurationInterface): AccordionConfigurationInterface {    
    return sectionEvent;
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  @Emit('createNewAttachmentSection')
  public createNewAttachmentSection(payload: { position: number, attachments: TypeAttachment[] }): { position: number, attachments: TypeAttachment[] } {
    // Return payload matching attachments component: { position, attachments: TypeAttachment[] }
    return payload;
  }

  // EMIT EVENT UPDATE NEW ATTACHMENT SECTION
  @Emit('updateAttachmentSection')
  public updateAttachmentSection(payload: { position: number, index: number, attachment: TypeAttachment }): { position: number, index: number, attachment: TypeAttachment } {
    return payload;
  }

  // EMIT EVENT UPDATE NEW ATTACHMENT SECTION
  @Emit('removeAttachmentSection')
  public removeAttachmentSection(removeAttachment: { position: number, index: number }): { position: number, index: number } {
    // RETURN ATTACHMENT REMOVE
    return removeAttachment;
  }
}
export default SectionComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" no-gutters>
    <v-col class="banner-create-sections py-0 px-5 mb-10 mx-auto text-center align-center d-flex" cols="12">
      <p class="text-weight-bold">
        Crear nueva sección personalizada
      </p>
      <v-btn @click="createSection()" class="ml-5" density="compact" variant="outlined" color="white" icon>
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-col>
    <draggable class="d-flex flex-wrap justify-center w-100" :list="sections" @start="drag = true" @end="dragEnded"
      item-key="_id" :filter="'.no-sort'" :prevent-on-filter="false">
      <template #item="{ element }">
        <v-col class="px-5" :cols="validateTypeSectionAndSize(element)">
          <template v-if="element.type === 'sectionCards'">
            <section-card-component @removeCardSection="removeCardSection" @updateCardSection="updateCardSection"
              @updateSection="updateSection" @removeSection="removeSection" @createNewCardSection="createNewCardSection"
              :section="element" />
          </template>
          <template v-else-if="element.type === 'sectionBanner'">
            <section-banner-component @updateSection="updateSection" @removeSection="removeSection"
              :section="element" />
          </template>
          <template v-else-if="element.type === 'sectionImage'">
            <section-image-component @updateSection="updateSection" @removeSection="removeSection" :section="element" />
          </template>
          <template v-else-if="element.type === 'sectionVideo'">
            <section-video-component @updateSection="updateSection" @removeSection="removeSection" :section="element" />
          </template>
          <template v-else-if="element.type === 'sectionText'">
            <section-text-component @updateSection="updateSection" @removeSection="removeSection" :section="element" />
          </template>
          <template v-else-if="element.type === 'sectionTable'">
            <section-table-component @setDataTable="setDataTable" @updateSection="updateSection"
              @removeSection="removeSection" :section="element" />
          </template>
          <template v-else-if="element.type === 'sectionGrids'">            
            <section-grids-component
              @updateSection="updateSection" 
              @removeSection="removeSection" 
              :section="element"
              :key="element._id"
            ></section-grids-component>
          </template>
          <template v-else-if="element.type === 'sectionGallery'">
            <section-gallery-component 
              @configureGallery="configuredGallery"
              @updateSection="updateSection" 
              @removeSection="removeSection" 
              :section="element"
              :key="element._id"/>
          </template>
          <template v-else-if="element.type === 'sectionAccordion'">
            <section-accordion-component 
              @configureAccordion="configuredAccordion"
              @updateSection="updateSection" 
              @removeSection="removeSection" 
              :section="element"
              :key="element._id"/>
          </template>
          <template v-else>
            <section-attachments-component @createNewAttachmentSection="createNewAttachmentSection"
              @updateAttachmentSection="updateAttachmentSection" @removeAttachmentSection="removeAttachmentSection"
              @removeSection="removeSection" @updateSection="updateSection" :section="element" />
          </template>
        </v-col>
      </template>
    </draggable>
  </v-row>

  <!-- DIALOG CREATE NEW SECTION -->
  <v-dialog width="80%" height="90%" class="dialog-create-section" v-model="dialog.show" persistent>
    <v-stepper prev-text="Atrás" height="100%" :items="['Tipo de sección', 'Llenar campos']" v-model="dialog.step"
      rounded="xl" elevation="0" color="primary">

      <!-- SELECT SECTIONS STEP  -->
      <template v-slot:item.1>
        <v-card flat>
          <v-card-text>
            <v-row class="pa-4" no-gutters>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionCards'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionCards' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-cards.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de tarjetas</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionBanner'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionBanner' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-banner.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de banner</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionAttachments'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionAttachments' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-attachments.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de archivos</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionVideo'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionVideo' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-video.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de video</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionText'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionText' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-text.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de texto</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionImage'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionImage' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-image.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de imagen</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionTable'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionTable' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-table.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de Tabla</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionGrids'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionGrids' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-4" src="~/assets/icons/section-grid.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de tarjetas de mallas</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionGallery'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionGallery' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-gallery.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de galería</p>
              </v-col>
              <v-col cols="3" class="pa-5">
                <div @click="dialog.section.type = 'sectionAccordion'" class="rounded-xl"
                  :style="`background-color: ${dialog.section.type === 'sectionAccordion' ? '#12539b' : '#e0e0e0'}; cursor: pointer`">
                  <img width="100%" height="200" class="pa-2" src="~/assets/icons/section-accordion.svg" />
                </div>
                <p class="text-center text-uppercase my-2">Sección de acordeón</p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </template>

      <!-- FILL FIELDS STEP -->
      <template v-slot:item.2>

        <!-- SECTION CARDS -->
        <template v-if="dialog.section.type === 'sectionCards'">
          <v-card title="Crear sección de tarjetas" flat>
            <v-row class="pa-4">
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Nombre de la sección" />
              </v-col>
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Descripción de la sección" />
              </v-col>
              <v-col cols="4">
                <v-select rounded="xl" :items="styleSectionCards" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de sección" />
              </v-col>
              <v-col cols="12">
                <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.color" density="compact"
                  variant="solo" label="Color de la sección" />
              </v-col>
            </v-row>
          </v-card>
        </template>

        <!-- SECTION BANNERS -->
        <template v-else-if="dialog.section.type === 'sectionBanner'">
          <v-card title="Crear sección de banner" flat>
            <v-row class="pa-4">
              <v-col cols="12">
                <template v-if="dialog.section.style === 'bannerLarge'">
                  <detailed-image-component 
                    color="#00a44f" rounded="xl" height="300" 
                    v-model="dialog.section.banner.pictureImageDetail" :legacy-image="dialog.section.banner.picture" 
                    text="Cargar Imagen">
                    <template #default>
                      <v-row class="h-100" justify="center" align-content="center">
                        <v-col cols="8">
                          <v-card width="100%" height="180" rounded="xl" :color="dialog.section.banner.background">
                            <v-row class="h-100 pa-10 ma-0" align-content="center" no-gutters>
                              <v-col cols="8">
                                <p class="text-h5 font-weight-bold"
                                  :style="`color: ${dialog.section.banner.title.color}`">
                                  {{ dialog.section.banner.title.text }}</p>
                                <p class="text-caption font-weight-thin"
                                  :style="`color: ${dialog.section.banner.description.color}`">
                                  {{ dialog.section.banner.description.text }}</p>
                              </v-col>
                              <v-col cols="3" class="text-center">
                                <v-btn class="text-body-2 mt-2" v-if="dialog.section.banner.button.enabled"
                                  rounded="xl" density="comfortable" :color="dialog.section.banner.button.color">
                                  {{ dialog.section.banner.button.text }}
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card>
                        </v-col>
                      </v-row>
                    </template>
                  </detailed-image-component>
                </template>
                <template v-else>
                  <detailed-image-component 
                    color="#00a44f" rounded="xl" height="300" 
                    v-model="dialog.section.banner.pictureImageDetail" :legacy-image="dialog.section.banner.picture" 
                    text="Cargar Imagen"></detailed-image-component>
                </template>
              </v-col>
              <v-col cols="6">
                <v-text-field rounded="xl" v-model="dialog.section.banner.title.text" density="compact" variant="solo"
                  label="Titulo del banner" />
              </v-col>
              <v-col cols="6">
                <v-text-field rounded="xl" v-model="dialog.section.banner.title.color" density="compact" variant="solo"
                  label="Color de titulo del banner">
                  <template #prepend-inner>
                    <v-icon :color="dialog.section.banner.title.color">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.banner.title.color"
                      density="compact" variant="solo" label="Color del fondo" />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field rounded="xl" v-model="dialog.section.banner.description.text" density="compact"
                  variant="solo" label="Descripción del banner" />
              </v-col>
              <v-col cols="6">
                <v-text-field rounded="xl" v-model="dialog.section.banner.description.color" density="compact"
                  variant="solo" label="Color de descripción del banner">
                  <template #prepend-inner>
                    <v-icon :color="dialog.section.banner.description.color">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker rounded="xl" width="100%" mode="hex"
                      v-model="dialog.section.banner.description.color" density="compact" variant="solo"
                      label="Color del fondo" />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select rounded="xl" :items="styleSectionBanner" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de banner" />
              </v-col>
              <v-col cols="6">
                <v-text-field rounded="xl" v-model="dialog.section.banner.background" density="compact" variant="solo"
                  label="Color de fondo de banner">
                  <template #prepend-inner>
                    <v-icon :color="dialog.section.banner.background">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.banner.background"
                      density="compact" variant="solo" label="Color del fondo" />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col class="py-0 mx-auto text-center d-flex justify-center" cols="12">
                <v-switch color="green" class="mx-5" density="compact" v-model="dialog.section.banner.button.enabled"
                  label="¿Botón?" inset />
              </v-col>
              <template v-if="dialog.section.banner.button.enabled">
                <v-col cols="4">
                  <v-text-field rounded="xl" v-model="dialog.section.banner.button.text" density="compact"
                    variant="solo" label="Texto del botón" />
                </v-col>
                <v-col cols="4">
                  <v-text-field rounded="xl" v-model="dialog.section.banner.button.link" density="compact"
                    variant="solo" label="Link del botón" />
                </v-col>
                <v-col cols="4">
                  <v-text-field rounded="xl" v-model="dialog.section.banner.button.color" density="compact"
                    variant="solo" label="Color de botón">
                    <template #prepend-inner>
                      <v-icon :color="dialog.section.banner.button.color">
                        mdi-record
                      </v-icon>
                    </template>
                    <v-menu activator="parent">
                      <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.banner.button.color"
                        density="compact" variant="solo" label="Color del fondo" />
                    </v-menu>
                  </v-text-field>
                </v-col>
              </template>
            </v-row>
          </v-card>
        </template>

        <!-- SECTION IMAGE -->
        <template v-else-if="dialog.section.type === 'sectionImage'">
          <v-card title="Crear sección de imagen" flat>
            <v-row class="pa-4">
              <v-col cols="12">
                <detailed-image-component 
                      color="#00a44f" rounded="xl" height="300" 
                      v-model="dialog.section.imageDetail" :legacy-image="dialog.section.image" 
                      text="Cargar Imagen"></detailed-image-component>
              </v-col>
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Titulo del sección" />
              </v-col>
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Subtitulo del sección" />
              </v-col>
              <v-col cols="4">
                <v-select rounded="xl" :items="styleSectionImage" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de imagen" />
              </v-col>
            </v-row>
          </v-card>
        </template>

        <!-- SECTION ATTACHMENTS -->
        <template v-if="dialog.section.type === 'sectionAttachments'">
          <v-card title="Crear sección de documentos" flat>
            <v-row class="pa-4">
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Nombre de la sección" />
              </v-col>
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Descripción de la sección" />
              </v-col>
              <v-col cols="4">
                <v-select rounded="xl" :items="styleSectionAttachments" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de sección" />
              </v-col>
              <v-col cols="12">
                <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.color" density="compact"
                  variant="solo" label="Color de la sección" />
              </v-col>
            </v-row>
          </v-card>
        </template>

        <!-- SECTION VIDEO -->
        <template v-else-if="dialog.section.type === 'sectionVideo'">
          <v-card title="Crear sección de video" flat>
            <v-row justify="center" class="pa-4">
              <v-col cols="10">
                <v-card v-if="dialog.section.video" class="mx-auto" color="#12539b" rounded="xl" width="450"
                  height="300">
                  <iframe width="100%" height="100%" :src="`https://www.youtube.com/embed/${dialog.section.video}`"
                    title="El Junte Financiero - Primera Temporada Episodio #04 - Invierte ¿Cómo y en qué?"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </v-card>
                <v-card v-else class="mx-auto" color="#12539b" rounded="xl" width="450" height="300">
                  <v-card-text>
                    <div class="card-info-container px-15 d-flex justify-center">
                      <p class="text-h6 text-uppercase">Previsualización</p>
                      <p class="text-caption">Debe llenar el campo con su código de YouTube <br> y podrá ver el video
                      </p>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="5">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Nombre de la sección" />
              </v-col>
              <v-col cols="5">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Descripción de la sección" />
              </v-col>
              <v-col cols="5">
                <v-text-field rounded="xl" v-model="dialog.section.video" density="compact" variant="solo"
                  label="Código del video Youtube" />
              </v-col>
              <v-col cols="5">
                <v-select rounded="xl" :items="styleSectionVideo" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de sección" />
              </v-col>
            </v-row>
          </v-card>
        </template>

        <!-- SECTION TEXT -->
        <template v-else-if="dialog.section.type === 'sectionText'">
          <v-card title="Crear sección de texto" flat>
            <v-row justify="center" class="pa-4">
              <v-col cols="3">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Nombre de la sección" />
              </v-col>
              <v-col cols="3">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Descripción de la sección" />
              </v-col>
              <v-col cols="3">
                <v-select rounded="xl" :items="styleSectionText" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de sección" />
              </v-col>
              <v-col cols="10">
                <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.color" density="compact"
                  variant="solo" label="Color de la sección" />
              </v-col>
              <v-col cols="10">
                <v-card width="100%" height="250" class="card-editor-description" rounded="xl">
                  <app-editor-text ref="descriptionEditor" theme="snow" @textChange="getHtmlEditor" />
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </template>

        <!-- SECTION TABLE -->
        <template v-else-if="dialog.section.type === 'sectionTable'">
          <v-card title="Crear sección de texto" flat>
            <v-row justify="center" class="pa-4">
              <v-col cols="3">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Nombre de la sección" />
              </v-col>
              <v-col cols="3">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Descripción de la sección" />
              </v-col>
              <v-col cols="3">
                <v-select rounded="xl" :items="styleSectionTable" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de sección" />
              </v-col>
              <v-col cols="10">
                <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.color" density="compact"
                  variant="solo" label="Color de la sección" />
              </v-col>
            </v-row>
          </v-card>
        </template>
        
        <!-- SECTION GRIDS -->
        <template v-if="dialog.section.type === 'sectionGrids'">
          <v-card title="Crear sección de cuadrículas" flat>
            <v-row class="pa-4">
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Nombre de la sección" />
              </v-col>
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Descripción de la sección" />
              </v-col>
              <v-col cols="4">
                <v-select rounded="xl" :items="styleSectionCards" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de sección" />
              </v-col>
              <v-col cols="12">
                <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.color" density="compact"
                  variant="solo" label="Color de la sección" />
              </v-col>
            </v-row>
          </v-card>
        </template>
        
        <!-- SECTION IMAGE -->
        <template v-else-if="dialog.section.type === 'sectionGallery'">
          <v-card title="Crear sección de galería" flat>
            <v-row class="pa-4">
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Nombre de la sección" />
              </v-col>
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Descripción de la sección" />
              </v-col>
              <v-col cols="4">
                <v-select rounded="xl" :items="styleSectionCards" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de sección" />
              </v-col>
              <v-col cols="12">
                <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.color" density="compact"
                  variant="solo" label="Color de la sección" />
              </v-col>
            </v-row>
          </v-card>
        </template>

        <!-- SECTION IMAGE -->
        <template v-else-if="dialog.section.type === 'sectionAccordion'">
          <v-card title="Crear sección de acordeón" flat>
            <v-row class="pa-4">
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.name" density="compact" variant="solo"
                  label="Nombre de la sección" />
              </v-col>
              <v-col cols="4">
                <v-text-field rounded="xl" v-model="dialog.section.description" density="compact" variant="solo"
                  label="Descripción de la sección" />
              </v-col>
              <v-col cols="4">
                <v-select rounded="xl" :items="styleSectionCards" item-title="name" item-value="value"
                  v-model="dialog.section.style" density="compact" variant="solo" label="Tamaño de sección" />
              </v-col>
              <v-col cols="12">
                <v-color-picker rounded="xl" width="100%" mode="hex" v-model="dialog.section.color" density="compact"
                  variant="solo" label="Color de la sección" />
              </v-col>
            </v-row>
          </v-card>
        </template>
      </template>

      <template v-slot:prev>
        <v-btn :text="dialog.action === 'update' ? 'Cerrar' : 'Atrás'"
          @click="dialog.action === 'update' || dialog.step === 1 ? closeDialog() : dialog.step--" :disabled="false" />
      </template>

      <template v-slot:next>
        <v-btn :text="dialog.step === 2 ? 'Finalizar' : 'Siguiente'" @click="validateAction()" :disabled="false" />
      </template>

    </v-stepper>
  </v-dialog>
  <v-file-input ref="bannerImage" class="d-none" accept=".jpg, .jpeg, .png" @update:model-value="getBannerImage" />
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.v-sheet {
  &::-webkit-scrollbar {
    display: none !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
}

.dialog-create-section {
  .v-overlay__content {
    .v-card {
      &::-webkit-scrollbar {
        display: none !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    }
  }
}

.banner-create-sections {
  height: 80px;
  background-color: #12539b;
  color: #ffffff;
  text-align: center;
  justify-content: center;
  box-shadow: 0px 0px 10px 0px #0000001a;
}

.card-info-container {
  height: 265px;
  align-content: center;
  flex-wrap: wrap;

  p {
    width: 100%;
  }
}
</style>