<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { GridInterface, GridLayoutInterface } from "~/interfaces/sections.interface";
import NoImage from '~/assets/backgrounds/noimage.jpeg';
import type { GridStyle } from "~/enums/gridStyle.enum";
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'grid-item-component',
})
class GridItemComponent extends Vue {
  public noimage = NoImage;
  ///////////////
  //// PROPS ////
  ///////////////

  // PROPS CARDS
  @Prop({
    default: {
      name: '',
      description: '',
      color: '',
      position: 0,
      style: 'sizeSmall',
      grid: null
    }
  })
  public grid!: GridInterface;

  @Prop({ default: 'cardsSmall' })
  public cardStyle!: String;
  /////////////
  // METHODS //
  /////////////

  // GET STYLE CARDS
  public get styleCards(): {
    cols: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    width: number;
    height: number;
    background: string;
    color: string;
  } {

    const gridSize = this.gridSizeValue
    // DEFAULT STYLE
    let defaultStyle = {
      cols: 8,
      xs: 12,
      sm: 6,
      md: 5,
      lg: 3,
      xl: 3,
      width: 120,
      height: 60,
      background: '#ffffff',
      color: '#fbfaff'
    };
 
    if (gridSize === 'sizeXLarge') {
      defaultStyle = {
        cols: 12,
        xs: 12,
        sm: 12,
        md: 12,
        lg: 12,
        xl: 12,
        width: 260,
        height: 130,
        background: '#ffffff',
        color: '#fbfaff'
      };
    } 
    else if (gridSize === 'sizeLarge') {
      defaultStyle = {
        cols: 12,
        xs: 12,
        sm: 12,
        md: 12,
        lg: 6,
        xl: 6,
        width: 250,
        height: 125,
        background: '#ffffff',
        color: '#fbfaff'
      };
    } 
    else if (gridSize === 'sizeMedium') {
      defaultStyle = {
        cols: 12,
        xs: 12,
        sm: 8,
        md: 6,
        lg: 3,
        xl: 3,
        width: 200,
        height: 100,
        background: '#ffffff',
        color: '#ffffff'
      };
    } 
    else if (gridSize === 'sizeSmall') {
      defaultStyle = {
        cols: 8,
        xs: 8,
        sm: 4,
        md: 3,
        lg: 2,
        xl: 2,
        width: 100,
        height: 100,
        background: '#ffffff',
        color: '#ffffff'
      };
    } 
    else if (gridSize === 'sizeXSmall') {
      defaultStyle = {
        cols: 2,
        xs: 2,
        sm: 2,
        md: 2,
        lg: 1,
        xl: 1,
        width: 60,
        height: 60,
        background: '#ffffff',
        color: '#ffffff'
      };
    }

    return defaultStyle;
  }

  public validateOnRedirect(link: string) {
    const validateRoute = link.split('/');

    if (validateRoute[0] === 'https:' || validateRoute[0] === 'http:') {
      window.open(link, '_blank');
    } else {
      this.$router.push(link)
    }
  }

  get flattenedGrid() {
    const GRID_SIZE_Y = this.grid.rows
    const GRID_SIZE_X = this.grid.columns
    const matrix: (number | null)[][] = Array.from({ length: GRID_SIZE_Y }, () =>
      Array(GRID_SIZE_X).fill(null)
    )

    const placed = new Set<number>()

    // Rellenar la matriz con índices de layouts
    this.grid.layouts.forEach((layout, index) => {
      const startY = layout.y
      const startX = layout.x
      const endY = startY + layout.h
      const endX = startX + layout.w

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          matrix[y][x] = index
        }
      }
    })

    const renderedLayouts = new Set<number>()
    const flattened: any[] = []

    for (let y = 0; y < GRID_SIZE_Y; y++) {
      for (let x = 0; x < GRID_SIZE_X; x++) {
        const layoutIndex = matrix[y][x]
        if (layoutIndex !== null && !renderedLayouts.has(layoutIndex)) {
          renderedLayouts.add(layoutIndex)
          const layout = this.grid.layouts[layoutIndex]
          flattened.push({
            layout,
            x,
            y,
            w: layout?.w,
            h: layout?.h,
            isEmpty: false,
          })
        } else if (layoutIndex === null) {
          flattened.push({
            x,
            y,
            w: 1,
            h: 1,
            isEmpty: true,
          })
        }
      }
    }

    return flattened
  }

  public getGridAspectRatio(){
    switch(this.gridOrientationValue){
      case 'orientationLarged': return 'grid-landscape-larged'
      case 'orientationLandscape': return 'grid-landscape'
      default:
        return 'grid-square'
    }    
  }

  get gridOrientationValue():string{
    return this.getGridStyleValue('orientation','orientationNormal')
  }

  set gridOrientationValue(newValue: string){
    this.setGridStyleValue(newValue, 'orientation', 'orientationNormal')
  }
    
  get gridStyles(){
    return this.grid.style || []
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

  public getGridStyleValue(style:string, defaultValue:string):string{
    const styles = this.gridStyles.slice()
    const match = styles.find(value => value.toLowerCase().includes(style))
    return match || defaultValue
  }
  
  public setGridStyleValue(value:string, style:string, defaultValue:string){
    if (!this.grid) {
      console.warn("Cannot set align value: grid is null.");
      return;
    }
    let currentStyles = this.grid.style || [];

    const filteredStyles = currentStyles.filter(
      s => !s.toLowerCase().includes(style)
    );

    const newStyles = [...filteredStyles, value as GridStyle];

    this.grid.style = newStyles;
  }

  public isSquared(grid: GridInterface){
    return this.gridOrientationValue === 'orientationNormal'
  }

  public getItemStyleValue(item: GridLayoutInterface, style:string, defaultValue:string):string{
    const styles = item.style?? []
    const match = styles.find(value => value.toLowerCase().includes(style))
        ?.toLowerCase()
        ?.replace(style,'')
    
    return match || defaultValue
  }
}

export default GridItemComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-col v-if="grid"
  :cols="styleCards.cols+(cardStyle === 'cardsMedium'?2:0)" 
  :xxs="styleCards.xs+(cardStyle === 'cardsMedium'?2:0)" 
  :xs="styleCards.xs+(cardStyle === 'cardsMedium'?2:0)" 
  :sm="styleCards.sm+(cardStyle === 'cardsMedium'?2:0)" 
  :md="styleCards.md+(cardStyle === 'cardsMedium'?2:0)" 
  :lg="styleCards.lg+(cardStyle === 'cardsMedium'?2:0)" 
  :xl="styleCards.xl" 
  :xxl="styleCards.xl+(cardStyle === 'cardsMedium'?2:0)"
  :class="this.grid.style?.includes('sizeXLarge' as GridStyle)? '':'px-4 py-2'"
  >
    <v-card 
      :class="`pa-0 my-3 mx-auto mx-md-0 ${getGridAspectRatio()}`"
      :color="grid.color"
      :style="(gridStyleValue.replace('orientation','') || 'styleFlat') === 'styleFlat'? '':`${grid.border? 'border-bottom: '+grid.border+' solid 5px':''}`"
      :flat="(gridStyleValue.replace('orientation','') || 'styleFlat') === 'styleFlat'"
      :elevation="(gridStyleValue.replace('orientation','') || 'styleFlat') === 'styleFlat'? '0':'2'">
      <div :class="`grid-component-c-${grid.columns} grid-component-r-${grid.rows} grid-component ${(gridOrientationValue.replace('orientation','') || 'normal') === 'normal'? '':'-landscape'} h-100`">
        <div
          :class="`grid-layout`"
          v-for="cell in flattenedGrid"
          :key="`${cell.x}-${cell.y}`"
          :style="`
            grid-area: ${cell.y + 1} / ${cell.x + 1} / ${cell.y + cell.h + 1} / ${cell.x + cell.w + 1};
            /*background-color: #${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')};*/
            `"
        >
        
          <template v-if="!cell.isEmpty">            
            <div v-if="cell.layout.type === 'text'" :class="`grid-item-${cell.layout.type} grid-item-content w-100`">
              <span
                  :class="`d-inline-block w-100
                  text-${getItemStyleValue(cell.layout, 'align', 'left')}
                  ${getItemStyleValue(cell.layout, 'size', 'small') === 'medium'? 'text-h6':
                   getItemStyleValue(cell.layout, 'size', 'small') === 'small'? 'text-caption':'text-h4'} 
                  ${getItemStyleValue(cell.layout, 'weight', 'normal') === 'normal'? 'font-weight-regular':'font-weight-bold'}`"
                  :style="`color: ${cell.layout.text?.color?? 'green'}`">
                {{ cell.layout.text?.text }}
                </span>
            </div>

            <div v-else-if="cell.layout.type === 'button'" :class="`grid-item-${cell.layout.type} grid-item-content`">
              <v-btn
                class="btn"
                :color="cell.layout.button?.color ?? 'primary'"
                :href="cell.layout.button?.href ?? '#'"
                :size="`${getItemStyleValue(cell.layout, 'size', 'medium') === 'medium'? 'default':
                          getItemStyleValue(cell.layout, 'size', 'medium') === 'small'? 'small':'large'}`"
                :style="cell.layout.button?.picture
                  ? `background-image: url('${cell.layout.button.picture}');
                    background-size: cover;
                    background-position: center;
                    color: transparent;`
                  : ''"
              >
                <template #prepend>
                  <v-img
                    v-if="cell.layout.button?.icon || cell.layout.button?.iconImageDetail"
                    :src="cell.layout.button?.icon?? cell.layout.button?.iconImageDetail?.image"
                    :alt="cell.layout.button?.iconImageDetail?.altText?? ''"
                    :width="getItemStyleValue(cell.layout, 'size', 'medium') === 'small' ? 20 : getItemStyleValue(cell.layout, 'size', 'medium') === 'x-large' ? 34 : 28" />
                </template>
                {{ cell.layout.button?.text }}
              </v-btn>
            </div>

            <div v-else-if="cell.layout.type === 'image'" class="grid-item-image grid-item-content">
              <v-img
                height="100%"
                width="100%"
                :contain="cell.y+cell.h < grid.rows && cell.x+cell.w < grid.columns"
                :cover="cell.y+cell.h >= grid.rows || cell.x+cell.w >= grid.columns"
                :src="cell.layout.image ?? noimage"
              />
            </div>
            <div v-else-if="cell.layout.type === 'list'" :class="`grid-item-${cell.layout.type} grid-item-content`">
              <v-list class="text-left w-100 mt-n2" style="background: transparent;">
                <v-list-item
                  v-for="(item, i) in cell.layout.list"
                  :key="i"
                  :color="grid.color? 'white':'primary'"                  
                  density="compact"
                  class="py-0 px-0"
                  style="min-height: 25px;"
                >
                  <template v-slot:prepend>
                    <v-icon :icon="'mdi-chevron-right'" :color="grid.color? 'white':'#12b041'" size="small" class="me-n2"></v-icon>
                  </template>

                  <v-list-item-title v-text="`${item.trim()}`" :class="`text-caption text-left ${grid.color? 'text-white':'text-primary'}`"></v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </template>
        </div>
      </div>
    </v-card>
  </v-col>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.grid-component{
  display: grid;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  max-width: 100%;
}

.grid-layout{
  display: grid;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}
.grid-item-content {
 display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  text-align: center;
   /*flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; */
}
.grid-item-image.grid-item-content {
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.grid-landscape{
  aspect-ratio: 21 / 9;
}
.grid-square{
  aspect-ratio: 1 / 1;
}
.grid-landscape-larged{
  aspect-ratio: 32 / 11;
}
.grid-component-c-14{
  grid-template-columns: repeat(14, 1fr);
}
.grid-component-c-12{
  grid-template-columns: repeat(12, 1fr);
}
.grid-component-c-10{
  grid-template-columns: repeat(10, 1fr);
}
.grid-component-c-9{
  grid-template-columns: repeat(9, 1fr);
}
.grid-component-c-8{
  grid-template-columns: repeat(8, 1fr);
}
.grid-component-c-7{
  grid-template-columns: repeat(7, 1fr);
}
.grid-component-c-6{
  grid-template-columns: repeat(6, 1fr);
}
.grid-component-c-5{
  grid-template-columns: repeat(5, 1fr);
}
.grid-component-c-4{
  grid-template-columns: repeat(4, 1fr);
}
.grid-component-c-3{
  grid-template-columns: repeat(3, 1fr);
}
.grid-component-c-2{
  grid-template-columns: repeat(2, 1fr);
}
.grid-component-r-14{
  grid-template-rows: repeat(14, 1fr);
}
.grid-component-r-12{
  grid-template-rows: repeat(12, 1fr);
}
.grid-component-r-10{
  grid-template-rows: repeat(10, 1fr);
}
.grid-component-r-9{
  grid-template-rows: repeat(9, 1fr);
}
.grid-component-r-8{
  grid-template-rows: repeat(8, 1fr);
}
.grid-component-r-7{
  grid-template-rows: repeat(7, 1fr);
}
.grid-component-r-6{
  grid-template-rows: repeat(6, 1fr);
}
.grid-component-r-5{
  grid-template-rows: repeat(5, 1fr);
}
.grid-component-r-4{
  grid-template-rows: repeat(4, 1fr);
}
.grid-component-r-3{
  grid-template-rows: repeat(3, 1fr);
}
.grid-component-r-2{
  grid-template-rows: repeat(2, 1fr);
}
.grid-component-r-1{
  grid-template-rows: repeat(1, 1fr);
}

</style>