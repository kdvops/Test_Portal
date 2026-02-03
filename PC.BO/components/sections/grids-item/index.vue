<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue, Watch } from "vue-facing-decorator"


// IMPORT INTERFACE
import type { 
  DialogCreateNewSectionCard, 
  DialogModifyGridLayout,
  SectionTypeInterface,
  TypeCard, 
  GridLayoutInterface, 
  GridInterface,   
  GridConfigurationInterface, 
  GridElementCreationInterface, 
  GridElementUpdateInterface, 
  SectionElementDeletionInterface, 
  SectionStyle} from "~/interfaces/sections.interface";

import NoImage from '~/assets/backgrounds/noimage.jpeg';
import type { GridElementStyle } from "~/enums/gridElementStyle.enum";
import { GridStyle } from "~/enums/gridStyle.enum";
import ColorPickerDialogComponent from "~/components/color-picker-dialog/index.vue"

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-grids-item-component',
  components:{
    'color-picker-dialog-component': ColorPickerDialogComponent,
    'detailed-image-component': DetailedImageComponent
  }
})
class SectionGridsItemComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////
  public allowedProperties = [
    'i',
    'x',
    'y',
    'w',
    'h',
    'type',
    'image',
    'button',
    'text',
    'style'
  ] as (keyof GridLayoutInterface)[];

  // PROPS CARDS SECTION
  @Prop({
    default: {
      name: '',
      description: '',
      color: '',
      position: 0,
      style: 'cardLarge',
      type: 'sectionGrid',
      grids: []
    }
  })
  public section!: SectionTypeInterface;

  @Prop({ default: 0 })
  public grid!: GridInterface;
  ///////////////
  // VARIABLES //
  ///////////////

  public noimage = NoImage;
  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  public targetImage: string = "banner";

  public gridComponents = [
    {
      title: "Botón",
      type: "button"
    }, 
    {
      title: "Texto",
      type: "text"
    }, 
    {
      title: "Imagen",
      type: "image"
    }, 
    {
      title: "Lista",
      type: "list"
    }
  ]

  public gridLayout:GridInterface = {
    layouts: [],
    rowHeight: 1,
    columns: 1,
    rows: 1
  }

  // DIALOG CREATE CARD
  public dialog: DialogModifyGridLayout = reactive({
    show: false,
    action: 'create',
    index: 0,
    layout:null
  })

  
  public styleSectionCards:  Array<{ name: string, value: string }> = [  
    {
      name: 'XS',
      value: 'sizeXSmall'
    },
    {
      name: 'Pequeña',
      value: 'sizeSmall'
    },
    {
      name: 'Mediana',
      value: 'sizeMedium'
    },
    {
      name: 'Grande',
      value: 'sizeLarge'
    },
    {
      name: 'XL',
      value: 'sizeXLarge'
    },
  ]

  ///////////////
  /// METHODS ///
  ///////////////
  public created() {
    this.gridLayout = {...this.grid, layouts: this.grid.layouts || [], style: this.grid.style || []}
    this.configureGrid()
  }

  public isSquared(columns:number, rows:number){
    return columns === rows;
  }
  
  public getGridAspectRatio(){
    switch(this.gridOrientationValue){
      case 'orientationLarged': return 'grid-landscape-larged'
      case 'orientationLandscape': return 'grid-landscape'
      default:
        return 'grid-square'
    }    
  }

  public getGrid(orientation:string, gridSize: string){
    let columns = 14
    let rows = 14
    switch(this.gridOrientationValue){
      case 'orientationLarged': rows = 4; break;
      case 'orientationLandscape': rows = 5; break;
      default:
        rows = 14; break;
    } 
    let rowHeight = 40

    return {columns, rows, rowHeight};
  }
  public configureGrid(){
    const configs = { ...this.getGrid(this.gridOrientationValue, this.gridSizeValue), style: this.gridLayout.style || [] }
    this.gridLayout = {...this.gridLayout, ...configs}
    this.configuredGrid({position: this.section.position, grid: { ...configs, layouts: []}})
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

  public addGridComponent(type:string){
    const layout = {
      x: (this.gridLayout.layouts.length * 2) % this.gridLayout.columns,
      y: 0, // puts it at the bottom
      w: 2,
      h: 2,
      i: `${this.makeid(5)}_${this.gridLayout.layouts.length}_${this.makeid(2)}`,
      type
    }
    this.gridLayout.layouts.push(layout);
    //this.createdGridElement(layout)
  }

  public removeGridItem(item:GridLayoutInterface){
    const index = this.gridLayout.layouts.map(item => item.i).indexOf(item.i);
    this.gridLayout.layouts.splice(index, 1);
    //this.removedGridElement(index)
  }

  public modifyComponent(item:GridLayoutInterface){
    switch(item.type)
    {
      case 'button': 
        this.dialog.layout = {...item, button: { ...item.button, text: item.button?.text?? "Botón", href: item.button?.href?? "#", color: item.button?.color?? '#12539b' }};
        break;
      case 'text':
        this.dialog.layout = {...item, text: { ...item.text, text: item.text?.text?? "Texto", color: item.text?.color?? '#000' } };
        break;
      case 'image':
        this.dialog.layout = {...item, image: item.image };
        break;
      case 'list':
        this.dialog.layout = {...item, list: item.list?? [] };
        break;
    }
    
    this.dialog.action = 'create'
    this.dialog.show = true
  }

  public updateComponent(item:GridLayoutInterface){
    const index = this.gridLayout.layouts.map(item => item.i).indexOf(item.i);
    this.gridLayout.layouts[index] = item
    
    this.dialog.layout = null
    this.dialog.show = false
    //this.updatedGridElement({element: item, index})
  }

  // OPEN DIALOG CREATE CARD
  public openDialogCreateCard() {
    this.dialog.action = 'create'
    this.dialog.show = true
  }

  // OPEN DIALOG UPDATE CARD
  public openDialogUpdateCard(index: number) {
    this.dialog.action = 'update'
    this.dialog.show = true
    this.dialog.index = index
  }

  // CLOSE DIALOG CREATE CARD
  public closeDialog() {
    this.dialog.action = 'create'
    this.dialog.show = false
    this.dialog.layout = null
  }

  public saveChanges() {
    if(this.dialog?.layout){
      const layout = this.dialog?.layout
      this.updateComponent(layout)                  
    }
  }

  public capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  get layoutStyles(){
    return this.dialog?.layout?.style || [];
  }

  get alignValue():string{
    return this.getStyleValue('align','alignLeft')
  }

  set alignValue(newValue: string) {
    this.setStyleValue(newValue, 'align', 'alignLeft')
  }
  
  get sizeValue():string{
    return this.getStyleValue('size','sizeSmall')
  }

  set sizeValue(newValue: string) {
    this.setStyleValue(newValue, 'size', 'sizeSmall')
  }
  
  get weightValue():string{
    return this.getStyleValue('weight','weightNormal')
  }

  set weightValue(newValue: string) {
    this.setStyleValue(newValue, 'weight', 'weightNormal')
  }

  get gridOrientationValue():string{
    return this.getGridStyleValue('orientation','orientationNormal')
  }

  set gridOrientationValue(newValue: string){
    this.setGridStyleValue(newValue, 'orientation', 'orientationNormal')
    this.configureGrid();
  }
    
  get gridStyles(){
    return this.gridLayout.style || []
  }

  get gridStyleValue():string{
    return this.getGridStyleValue('style','styleShadow')
  }

  set gridStyleValue(newValue: string){
    this.setGridStyleValue(newValue, 'style', 'styleShadow')
  }
    
  get gridSizeValue():string{
    return this.getGridStyleValue('size','sizeSmall')
  }

  set gridSizeValue(newValue: string) {
    this.setGridStyleValue(newValue, 'size', 'sizeSmall')
    this.configureGrid();
  }

  get layoutDialogList(){
    return this.dialog?.layout?.list || [];
  }

  get listValues(): string {
    return (this.layoutDialogList ?? []).join("\n");
  }

  set listValues(newValue: string) {
    const lines = newValue
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0); // remove empty lines

    this.dialog!.layout!.list = lines;
  }

  // SET STYLES FOR GRID ELEMENT
  public getStyleValue(style:string, defaultValue:string):string{
    const styles = this.layoutStyles.slice()
    const match = styles.find(value => value.toLowerCase().includes(style))
    return match || defaultValue
  }
  
  public setStyleValue(value:string, style:string, defaultValue:string){
    if (!this.dialog.layout) {
      console.warn("Cannot set align value: dialog.layout is null.");
      return;
    }
    let currentStyles = this.dialog.layout.style || [];

    const filteredStyles = currentStyles.filter(
      s => !s.toLowerCase().includes(style)
    );

    const newStyles = [...filteredStyles, value as GridElementStyle];

    this.dialog.layout.style = newStyles;
  }

  // SET STYLES FOR GRID
  
  public getGridStyleValue(style:string, defaultValue:string):string{
    const styles = this.gridStyles.slice()
    const match = styles.find(value => value.toLowerCase().includes(style))
    return match || defaultValue
  }
  
  public setGridStyleValue(value:string, style:string, defaultValue:string){
    if (!this.gridLayout) {
      console.warn("Cannot set align value: grid is null.");
      return;
    }
    let currentStyles = this.gridLayout.style || [];

    const filteredStyles = currentStyles.filter(
      s => !s.toLowerCase().includes(style)
    );

    const newStyles = [...filteredStyles, value as GridStyle];

    this.gridLayout.style = reactive(newStyles);
  }

  public getItemStyleValue(item: GridLayoutInterface, style:string, defaultValue:string):string{
    const styles = item.style?? []
    const match = styles.find(value => value.toLowerCase().includes(style))
        ?.toLowerCase()
        ?.replace(style,'')
    
    return match || defaultValue
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////
  @Watch('gridLayout.style')
  onStyleValueChanged(newVal: any, oldVal: any) {
    this.grid.style = newVal;
  }
  @Watch('gridLayout.color')
  onColorValueChanged(newVal: string, oldVal: string) {
    this.grid.color = newVal;
  }
  @Watch('gridLayout.border')
  onBorderValueChanged(newVal: string, oldVal: string) {
    this.grid.border = newVal;
  }
  @Watch('gridLayout.columns')
  onColumnsValueChanged(newVal: number, oldVal: number) {
    this.grid.columns = newVal;
  }
  @Watch('gridLayout.rows')
  onRowsValueChanged(newVal: number, oldVal: number) {
    this.grid.rows = newVal;
  }
  // UPDATE SECTION
  @Emit('updatedGrid')
  public updateGrid(): GridInterface {
    return this.grid
  }

  // REMOVE SECTION
  @Emit('removedGrid')
  public removeGrid(): GridInterface {
    return this.grid
  }

  @Emit('configureGrid')
  public configuredGrid(sectionItem : GridConfigurationInterface): GridConfigurationInterface {
    return sectionItem;
  }
}

export default SectionGridsItemComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="my-5 w-100" justify="start" no-gutters>
    <v-row class="w-100 py-2" style="cursor: move;" v-if="grid.breakLine">
      <v-col cols="12" class="d-flex align-center">
        <v-divider
          :thickness="3"
          class="flex-grow-1 border-opacity-75"
          color="success"
        />

        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn icon v-bind="props" size="small" class="ms-2">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="removeGrid()" title="Eliminar salto de línea" />
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-card class="w-100" v-else>
      <v-card class="px-2 py-1 bg-grey-lighten-4" flat style="height: auto; min-height: 100px;">
        <!-- Title and Subtitle -->
          
        <v-row no-gutters align="center" 
        style="overflow-x: auto; white-space: nowrap; scrollbar-width: thin;"
         class="d-flex flex-nowrap overflow-x-auto">
          <v-col cols="auto">
            <v-card flat color="transparent" class="pa-2">
                  <div class="text-caption font-weight-medium mb-1">Forma</div>
                  <v-btn-toggle rounded divided class="mx-1"
                    v-model="gridOrientationValue"
                    :key="gridOrientationValue"
                    mandatory
                  >
                    <v-btn variant="elevated" icon="mdi-crop-square" value="orientationNormal"></v-btn>
                    <v-btn variant="elevated" icon="mdi-card-outline" value="orientationLandscape"></v-btn>
                    <v-btn variant="elevated" icon="mdi-crop-landscape" value="orientationLarged"></v-btn>
                  </v-btn-toggle>
            </v-card>
          </v-col>
          <v-col cols="auto">
            <v-card flat color="transparent" class="pa-2">
                  <div class="text-caption font-weight-medium mb-1">Sombreado</div>
                  <v-btn-toggle rounded divided class="mx-1"
                    v-model="gridStyleValue"
                    :key="gridStyleValue"
                    mandatory
                  >
                    <v-btn variant="elevated" icon="mdi-box-shadow" value="styleShadow"></v-btn>
                    <v-btn variant="elevated" icon="mdi-square" value="styleFlat"></v-btn>                      
                  </v-btn-toggle>
            </v-card>
          </v-col>
          <v-col cols="auto">
            <v-row>
              <v-card flat color="transparent" class="pa-2 mt-n2">
                  <div class="text-caption font-weight-medium mb-3">Fondo</div>      
                  <div class="d-flex align-center h-50">
                    <color-picker-dialog-component v-model="gridLayout.color"></color-picker-dialog-component>
                  </div>
              </v-card>
              <v-card flat color="transparent" class="pa-2 mt-n2">
                  <div class="text-caption font-weight-medium mb-3">Borde</div>      
                  <div class="d-flex align-center h-50">
                    <color-picker-dialog-component v-model="gridLayout.border"></color-picker-dialog-component>
                  </div>
              </v-card>
            </v-row>
          </v-col>
          <v-col cols="6">
            <v-card flat color="transparent" class="ml-4 mt-4 pa-2 w-100">
                  <div class="text-caption font-weight-medium mb-1">Tamaño</div>
                  <v-select 
                  class="w-100" rounded="xl" :items="styleSectionCards" item-title="name" item-value="value"
                  v-model="gridSizeValue" density="compact" variant="solo" label="Tamaño de la tarjeta"
                  :menu-props="{ attach: 'body' }"></v-select>
            </v-card>
          </v-col>          
          <v-spacer />
          <div style="position: absolute; top: 4px; right: 4px;">
            <v-menu location="bottom end">
              <template #activator="{ props }">
                <v-btn flat icon v-bind="props">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="removeGrid()" title="Eliminar tarjeta" />
              </v-list>
            </v-menu>
          </div>
        </v-row>
      </v-card> 
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            :color="section.color?? '#12539b'"
            v-bind="props"
            icon="mdi-plus"
            class="position-absolute"
            style="top: 125px; right: 40px; transform: translateY(-50%); z-index: 2;"
          >
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in gridComponents"
            :key="index"
            :value="index"
          >
            <v-list-item-title @click="addGridComponent(item.type)">{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-card-text>          
          <v-row no-gutters class="justify-center no-sort" cols="12">
            <v-card col="12" 
              :style="`width: auto; ${gridLayout.border? 'border-bottom: '+gridLayout.border+' solid 5px':''}`" 
              :color="gridLayout.color?? '#fff'"
              :flat="gridStyleValue === 'styleFlat'"
              :elevation="gridStyleValue === 'styleFlat'? 0:4"
              >
              <client-only>
                <GridLayout 
                  class="grid fill-height width-100" 
                  :class="getGridAspectRatio()"
                  :style="`--columns: ${gridLayout.columns};--rows: ${gridLayout.rows};width: ${(gridLayout.rowHeight*gridLayout.columns)}px; height: ${(gridLayout.rowHeight*gridLayout.rows)}px;`"
                  :layout="gridLayout.layouts"
                  :col-num="gridLayout.columns"
                  :max-rows="gridLayout.rows"
                  :max-h="240"
                  :row-height="gridLayout.rowHeight"
                  :is-draggable="true"
                  :is-resizable="true"
                  :vertical-compact="false"
                  :prevent-collision="true"
                  :use-css-transforms="false"
                  :margin="[5, 5]"
                  :key="section._id+'_'+grid._id"
                >
                  <GridItem
                    v-for="(item, index) in gridLayout.layouts"
                    :key="section._id+'_'+grid._id+'_'+index"
                    :x="item.x"
                    :y="item.y"
                    :w="item.w"
                    :h="item.h"
                    :i="item.i"
                  >
                    <div class='grid-box'>
                      <div class="position-absolute top-0 left-0" style="z-index: 999;">
                        <v-menu location="bottom end">
                          <template #activator="{ props }">
                            <v-btn
                              icon="mdi-dots-vertical"
                              size="x-small"
                              class="p-0"
                              v-bind="props"
                              variant="text"
                              color="black"
                            />
                          </template>
                          <v-list>                          
                            <v-list-item @click="modifyComponent(item)" title="Modificar componente" />
                            <v-list-item @click="removeGridItem(item)" title="Eliminar componente" />
                          </v-list>
                        </v-menu>
                      </div>

                      <div v-if="item.type === 'text'" class="drag-disabled w-100">
                        <span
                          :class="`d-inline-block w-100
                          text-${getItemStyleValue(item, 'align', 'left')}
                          ${getItemStyleValue(item, 'size', 'small') === 'medium'? 'text-h6':
                            getItemStyleValue(item, 'size', 'small') === 'small'? 'text-caption':'text-h4'} 
                          ${getItemStyleValue(item, 'weight', 'normal') === 'normal'? 'font-weight-regular':'font-weight-bold'}`"
                          :style="`color: ${item.text?.color?? 'green'};`">
                        {{ item.text?.text ?? 'Texto de ejemplo' }}
                        </span>                 
                      </div>
                      <div  v-else-if="item.type === 'button'" class="drag-disabled">
                        <v-btn 
                          class="btn" 
                          :color="`${item.button?.color?? 'primary'}`" 
                          :href="item.button?.href?? '#'"
                          :size="`${getItemStyleValue(item, 'size', 'medium') === 'medium'? 'default':
                                    getItemStyleValue(item, 'size', 'medium') === 'small'? 'small':'large'}`"
                          :style="item.button?.picture || item.button?.pictureImageDetail?.image?
                            `background-image: url('${ item.button.picture?? item.button.pictureImageDetail?.image }');
                            background-size: cover;
                            background-position: center;
                            color: white;`:''
                          ">
                          <template #prepend>
                            <v-img
                              v-if="item.button?.icon || item.button?.pictureImageDetail?.image"
                              :src="item.button?.icon?? item.button.pictureImageDetail?.image"
                              alt="icon"
                              :width="getItemStyleValue(item, 'size', 'medium') === 'small' ? 20 : getItemStyleValue(item, 'size', 'medium') === 'x-large' ? 34 : 28" />
                          </template>
                          {{item.button?.text?? "Botón"}}
                        </v-btn>
                      </div>
                      <div v-else-if="item.type === 'image'" class="drag-disabled fill-width fill-height w-100">
                        <v-img
                          height="100%"
                          width="100%"
                          class="justify-content-center align-content-center"
                          contain
                          :src="item.image?? item.imageDetail?.image?? noimage"/> 
                      </div>
                      <div v-else-if="item.type === 'list'" class="drag-disabled fill-width fill-height w-100">
                        <v-list lines="one">
                          <v-list-item
                            v-for="(listElement, i) in item.list"
                            :key="i"
                            color="primary"
                          >
                            <template v-slot:prepend>
                              <v-icon :icon="'mdi-chevron-right'" class="me-n5" color="#12b041" size="x-large"></v-icon>
                            </template>

                            <v-list-item-title v-text="listElement"></v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </div>
                    </div>
                  </GridItem>
                </GridLayout>
              </client-only>
            </v-card>
          </v-row>
        </v-card-text>
    </v-card>    
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
            <v-toolbar color="transparent" class="mb-2">
                <v-btn-toggle v-if="dialog.layout?.type === 'text'" class="mx-1"
                  v-model="alignValue"
                  :key="alignValue"
                  mandatory
                >
                  <v-btn size="small" icon="mdi-format-align-left" value="alignLeft"></v-btn>
                  <v-btn size="small" icon="mdi-format-align-center" value="alignCenter"></v-btn>
                  <v-btn size="small" icon="mdi-format-align-right" value="alignRight"></v-btn>
                </v-btn-toggle>
                <v-btn-toggle v-if="dialog.layout?.type === 'text' || dialog.layout?.type === 'button'" class="mx-1"
                  v-model="sizeValue" :key="sizeValue" mandatory>
                  <v-btn size="small" value="sizeLarge"><v-icon :icon="dialog.layout?.type === 'text'? 'mdi-format-text':'mdi-square'" size="large"></v-icon></v-btn>
                  <v-btn size="small" value="sizeMedium"><v-icon :icon="dialog.layout?.type === 'text'? 'mdi-format-text':'mdi-square'" size="medium"></v-icon></v-btn>
                  <v-btn size="small" value="sizeSmall"><v-icon :icon="dialog.layout?.type === 'text'? 'mdi-format-text':'mdi-square'" size="small"></v-icon></v-btn>
                </v-btn-toggle>
                <v-btn-toggle v-if="dialog.layout?.type === 'text'"
                  v-model="weightValue" :key="weightValue" mandatory>
                  <v-btn size="small" value="weightNormal">N</v-btn>
                  <v-btn size="small" value="weightBold"><v-icon icon="mdi-format-bold"></v-icon></v-btn>
                </v-btn-toggle>
            </v-toolbar>
            <v-col cols="12" v-if="dialog.layout?.type === 'button' && dialog.layout?.button">
              <v-text-field v-model="dialog.layout.button.text" rounded="xl" density="compact" variant="solo"
                label="Texto" />
              <v-text-field v-model="dialog.layout.button.href" rounded="xl" density="compact" variant="solo"
                label="Link" />
              <v-row class="mb-2" >
                <v-col cols="4" class="d-flex flex-column justify-center align-center">
                  <label>Icono</label>
                  <detailed-image-component
                    v-model="dialog.layout.button.iconImageDetail" 
                    :legacy-image="dialog.layout.button.icon"
                    avatar
                    ></detailed-image-component>
                </v-col>
                <v-col cols="8" class="d-flex flex-column justify-center align-center">
                  <label>Fondo</label>
                  <detailed-image-component 
                      v-if="dialog.layout && dialog.layout.button" 
                      color="#00a44f" rounded="xl" height="85" 
                      v-model="dialog.layout.button.pictureImageDetail" :legacy-image="dialog.layout.button.picture" 
                      text="Cargar Miniatura"></detailed-image-component>
                </v-col>
              </v-row>
              <v-color-picker rounded="md" width="100%" mode="hex" v-model="dialog.layout.button.color" density="compact"
                  variant="solo" label="Color del botón" />
            </v-col>
            <v-col cols="12" v-else-if="dialog.layout?.type === 'text' && dialog.layout?.text">              
              <v-text-field v-model="dialog.layout.text.text" rounded="xl" density="compact" variant="solo"
                label="Texto" />
              <v-color-picker rounded="md" width="100%" mode="hex" v-model="dialog.layout.text.color" density="compact"
                  variant="solo" label="Color del texto" />
            </v-col>
            <v-col cols="12" v-else-if="dialog.layout?.type === 'image'" class="d-flex flex-column justify-center align-center">
              <detailed-image-component 
              v-if="dialog.layout" 
                color="#00a44f" rounded="xl" height="250" 
                v-model="dialog.layout.imageDetail" :legacy-image="dialog.layout.image" 
                text="Cargar Miniatura"></detailed-image-component>
            </v-col>
            <v-col cols="12" v-else-if="dialog.layout?.type === 'list' && dialog.layout?.list">
              <v-textarea v-model="listValues" rounded="xl" density="compact" variant="solo"
                label="Elementos" />
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
  </teleport>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.grid-box {
  background-color: #fafafa;
  border: 1px dashed #aaa;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-landscape{
  aspect-ratio: 21 / 9;
}
.grid-square{
  aspect-ratio: 14 / 16;
}
.grid-landscape-larged{
  aspect-ratio: 32/11;
}

.grid-component-c-12{
  grid-template-columns: repeat(12, 1fr);
}
.grid-component-c-8{
  grid-template-columns: repeat(12, 1fr);
}
.grid-component-c-6{
  grid-template-columns: repeat(12, 1fr);
}
.grid-component-c-4{
  grid-template-columns: repeat(12, 1fr);
}
.grid-component-c-2{
  grid-template-columns: repeat(12, 1fr);
}
.grid-big-square-r-6{
  grid-template-rows: repeat(6, 1fr);
}
.grid-big-square-r-4{
  grid-template-rows: repeat(4, 1fr);
}
.grid-big-square-r-3{
  grid-template-rows: repeat(3, 1fr);
}
.grid-big-square-r-2{
  grid-template-rows: repeat(2, 1fr);
}
.grid-big-square-r-1{
  grid-template-rows: repeat(1, 1fr);
}

.grid::before {
    content: '';
    background-size: calc(calc(100% - 5px) / var(--columns)) 45px;
    background-image: linear-gradient(
            to right,
            lightgrey 1px,
            transparent 1px
    ),
    linear-gradient(to bottom, lightgrey 1px, transparent 1px);
    height: 100%;
    width: 100%;
    position: absolute;
    background-repeat: repeat;
    margin:1px;
}

.grid-4-4::before {
    content: '';
    background-size: 56px 56px;
    background-image: linear-gradient(
            to right,
            lightgrey 1px,
            transparent 1px
    ),
    linear-gradient(to bottom, lightgrey 1px, transparent 1px);
    height: calc(100% - 5px);
    width: calc(100% - 5px);
    position: absolute;
    background-repeat: repeat;
    margin:5px;
}

.drag-disabled {
  pointer-events: none;
  user-select: none;
  cursor: grabbing;
}
</style>