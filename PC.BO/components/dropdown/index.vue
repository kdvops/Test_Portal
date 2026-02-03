<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit } from "vue-facing-decorator"

// IMPORT INTERFACES
import type { itemSelectedInterface } from '~/interfaces/dropdown.interface'

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-dropdown-component',
})
class AppDropdownComponent extends Vue {
  // READONLY TYPE
  readonly [key: string]: any;

  ///////////////
  //// PROPS ////
  ///////////////

  // DROPDOWN TARGET
  @Prop({ default: 'title' })
  name?: string;

  // DROPDOWN EAGER
  @Prop({ default: true })
  eager?: boolean;

  // DROPDOWN ICON
  @Prop({ default: 'mdi-dots-vertical' })
  icon!: string;

  // DROPDOWN COLOR
  @Prop({ default: 'primary' })
  color!: string;

  // DROPDOWN TYPE
  @Prop({ default: 'color' })
  type!: string;

  // DROPDOWN ITEMS
  @Prop({ default: 'aligns' })
  mode?: string;

  ///////////////
  // VARIABLES //
  ///////////////

  // SIZES TEXT
  public size: Array<string> = [
    'text-caption',
    'text-button',
    'text-body-2',
    'text-body-1',
    'text-subtitle-1',
    'text-subtitle-2',
    'text-h1',
    'text-h2',
    'text-h3',
    'text-h4',
    'text-h5',
    'text-h6'
  ];

  // ALIGN TEXT
  public align: Array<string> = [
    'left',
    'center',
    'right'
  ];

  // WEIGHT TEXT
  public weight: Array<string> = [
    'thin',
    'light',
    'medium',
    'regular',
    'bold',
    'black'
  ];

  /////////////////////
  /// EMIT METHODS ////
  /////////////////////

  // RETURN SELECTED ITEM
  @Emit('selectedItem')
  selectedItem(item: string): itemSelectedInterface {
    return { item, mode: this.mode ? this.mode : 'aligns' };
  }

  // RETURN SELECTED COLOR
  @Emit('selectedColor')
  selectedColor(color: string): string {
    return color;
  }

  /////////////
  // METHODS //
  /////////////

  public get modeItems(): Array<string> {
    return this.mode ? this[this.mode] : []
  }
}
export default AppDropdownComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-menu :eager="eager" max-width="350" max-height="250" offset-y>
    <template v-slot:activator="{ props }">
      <v-btn width="40" height="40" class="mx-2" :color="color" v-bind="props" icon>
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>
    <template v-if="type === 'list'">
      <v-list>
        <template v-for="item in modeItems" :key="item">
          <v-list-item @click="selectedItem(item)" :class="`align-${item} font-weight-${item} ${item}`">
            {{ item }}
          </v-list-item>
        </template>
      </v-list>
    </template>
    <template v-else>
      <v-color-picker @update:model-value="selectedColor" show-swatches hide-inputs mode="hexa" />
    </template>
  </v-menu>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>