<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface, DialogCreateNewSectionCard, TypeCard, GridInterface } from "~/interfaces/sections.interface";
import SectionGridsItemComponent from "../grids-item/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-grids-component',
  components:{
    'section-grids-item-component': SectionGridsItemComponent
  }
})
class SectionGridsComponent extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // PROFITS IMAGE REF
  @Ref('cardItemImage') cardItemImage!: any;

  ///////////////
  //// PROPS ////
  ///////////////

  // PROPS CARDS SECTION
  @Prop({
    default: {
      name: '',
      description: '',
      color: '',
      position: 0,
      style: 'cardLarge',
      type: 'sectionCards',
      cards: []
    }
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // DIALOG CREATE CARD
  public dialog: DialogCreateNewSectionCard = {
    show: false,
    action: 'create',
    index: 0,
    card: {
      name: '',
      description: '',
      picture: '',
      link: '',
      newUploadPictureItem: [],
    }
  }

  ///////////////
  /// METHODS ///
  ///////////////
  // VALIDATE IMAGE ITEM CARD
  public get validateImageItemCard(): string {
    return this.dialog.card.newUploadPictureItem
      && this.dialog.card.newUploadPictureItem.length > 0
      ? this.dialog.card.newUploadPictureItem[0].img!
      : this.dialog.card.picture
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  // UPDATE SECTION
  @Emit('updateSection')
  public updateSection(): SectionTypeInterface {
    return this.section
  }

  // REMOVE SECTION
  @Emit('removeSection')
  public removeSection(): number {
    return this.section.position
  }

  // CREATE CARD ITEM
  @Emit('createNewCardSection')
  public createNewCardSection(): { position: number, card: TypeCard } {
    return {
      position: this.section.position,
      card: this.dialog.card
    }
  }

  // CREATE CARD ITEM
  @Emit('updateCardSection')
  public updateCardSection(): { position: number, index: number, card: TypeCard } {
    return {
      position: this.section.position,
      index: this.dialog.index!,
      card: this.dialog.card
    }
  }

  // REMOVE CARD ITEM
  @Emit('removeCardSection')
  public removeCardSection(position: number, index: number): { position: number, index: number } {
    return { position, index }
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

  public addGridElement(){
    if(!this.section.grids) this.section.grids = reactive([]);
    this.section.grids?.push({
        _id: this.makeid(9),
        rowHeight:55,
        rows: 1, 
        columns: 1,
        layouts:[]
    })
  }

  public addBreakLineElement(){
    if(!this.section.grids) this.section.grids = reactive([]);
    this.section.grids?.push({
        _id: this.makeid(9),
        rowHeight:55,
        rows: 1, 
        columns: 1,
        layouts:[],
        breakLine: true
    })
  }

  public removeGrid(item:GridInterface){
    const index = this.section?.grids?.map(item => item._id).indexOf(item._id);
    if(index && index >= 0){
      this.section!.grids!.splice(index, 1);
    }
  }

  public drag: boolean = false;
    // DRAG END
  public dragEnded(evt: any) {
    // NEW SECTIONS
    let newGrids: Array<GridInterface> = [];

    // EMIT EVENT CHANGE POSITION SECTION
    //this.changePositionSection(newSections, evt)

    // DRAG END
    this.drag = false;
  }
}

export default SectionGridsComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="my-5" justify="start" no-gutters>
    <v-col cols="12">
      <div class="text-center py-5 rounded-t-xl"
        :style="`background-color: ${section.color ? section.color : '#12539b'}; position: relative`">
        <h3 class="text-h5 text-white">
          {{ section.name
            ? section.name
            : 'Sección sin titulo'
          }}
        </h3>
        <p class="text-white text-caption">
          {{ section.description || section.name
            ? section.description
            : 'Las secciones sin titulo ni descripción no se mostrara este encabezado!!'
          }}
        </p>
        <v-btn class="ma-2" density="comfortable" position="absolute" location="end top" variant="text" icon>
          <v-icon size="20" color="#ffffff">mdi-dots-vertical</v-icon>
          <v-menu activator="parent" location="end" close-on-content-click>
            <v-list>
              <v-list-item @click="updateSection()" title="Editar Sección" />
              <v-list-item @click="removeSection()" title="Eliminar Sección" />
            </v-list>
          </v-menu>
        </v-btn>
      </div>
    </v-col>
    <v-col cols="12">
      <v-card rounded="b-xl" color="#ffffffbb" class="no-sort" flat>
        <v-card-text class="pa-8">
          <v-row no-gutters>
            <!--<template v-for="(grid, i) in section.grids" :key="section.grids?.length+'_'+grid._id">-->
              <!-- VALIDATE ITEM STATUS -->
              <draggable class="d-flex flex-wrap justify-center w-100" 
                :list="section.grids" 
                @start="drag = true" 
                @end="dragEnded" 
                item-key="_id" 
                :filter="'.no-sort'" 
                :prevent-on-filter="false">
                <template #item="{ element }">
                  <div class="w-100">
                    <section-grids-item-component
                      :section="section"
                      :grid="element"
                      @removedGrid="removeGrid"
                      />
                  </div>
                  </template>
              </draggable>
            <!--</template>-->
            <v-row dense>
              <v-card width="180" height="180" class="pa-0 my-3 mx-2" @click="addGridElement">
                <v-card-text class="pa-0">
                  <v-row align-content="center" justify="center" style="height: 150px" no-gutters>
                    <v-col cols="12" class="text-center">
                      <v-icon color="primary" size="50">mdi-plus</v-icon>
                      <p class="text-primary">Agregar Tarjeta</p>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
              <v-card width="180" height="180" class="pa-0 my-3" @click="addBreakLineElement">
                <v-card-text class="pa-0">
                  <v-row align-content="center" justify="center" style="height: 150px" no-gutters>
                    <v-col cols="12" class="text-center">
                      <v-icon color="primary" size="50">mdi-plus</v-icon>
                      <p class="text-primary">Agregar salto de línea</p>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-row>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- DIALOG CREATE CARD -->
  <teleport to="body">
    <v-dialog v-model="dialog.show" width="500">
      <v-card rounded="xl" :color="section.color">
        <v-toolbar color="transparent">
            <v-toolbar-title class="text-subtitle ext-white font-weight-bold" :text="`Modificar ${dialog.layout?.type}`"/>
          </v-toolbar>
        <v-card-text>
          <v-row justify="center" align-content="center">
            <v-color-picker rounded="md" width="100%" mode="hex" v-model="dialog.grid.color" density="compact"
                  variant="solo" label="Color del botón" />
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
  </teleport>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>