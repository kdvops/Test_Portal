<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Prop, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type {
  SectionTypeInterface,
  DialogCreateNewSectionCard,
  TypeCard,
  TableColumnSectionInterface,
  TypeTable,
} from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "section-table-component",
})
export default class SectionTableComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // PROPS CARDS SECTION
  @Prop({
    default: {
      name: "",
      description: "",
      color: "",
      position: 0,
      style: "tableLarge",
      type: "sectionTable",
      table: {
        columns: [],
        headers: [],
      },
    },
  })
  public section!: SectionTypeInterface;
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="ma-5" justify="start" no-gutters>
    <v-col cols="12">
      <div
        v-if="section.name"
        class="text-center py-10"
        :style="`background-color: ${
          section.color ? section.color : 'var(--bsc-primary-color)'
        }; position: relative`"
      >
        <h2 class="text-h5 text-white">
          {{ section.name }}
        </h2>
        <p class="text-white text-caption">
          {{ section.description }}
        </p>
      </div>
    </v-col>
    <v-col cols="10">
      <v-table class="rounded-lg elevation-2">
        <thead class="bg-primary">
          <tr>
            <template
              v-for="(header, i) in section.table.headers"
              :key="i"
              class="text-left"
            >
              <th
                class="px-5 text-uppercase font-weight-bold"
                style="position: relative"
              >
                {{ header }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <template v-for="(column, x) in section.table.columns" :key="x">
            <tr>
              <template v-for="(header, i) in section.table.headers" :key="i">
                <td class="text-primary">
                  {{ column[i].value }}
                </td>
              </template>
            </tr>
          </template>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
/* Estilos para sección de tabla */
</style>
