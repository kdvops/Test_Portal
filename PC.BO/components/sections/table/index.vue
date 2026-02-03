<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue, Watch } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface, DialogCreateNewSectionCard, TypeCard, TableColumnInterface, TypeTable } from "~/interfaces/sections.interface";

import _ from 'lodash';
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-table-component',
})
class SectionTableComponent extends Vue {
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
      style: 'tableLarge',
      type: 'sectionTable',
      table: {
        columns: [],
        headers: []
      }
    }
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // VALUE INPUT HEADER
  public inputHeader: string = ''

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  ///////////////
  /// METHODS ///
  ///////////////

  public mounted() {
    // CLEAN TABLE SECTION
    const tableSectionClean: any = _.omit(this.section.table, ['__typename']);
    this.section.table = tableSectionClean

    // CLEAN COLUMN TYPENAME
    this.section.table.columns = this.section.table.columns.map(column => {
      const colClean: Array<{ name: string; value: string }> = column.map(col => {
        const cClean: any = _.omit(col, ['__typename'])
        return cClean
      })
      return colClean
    })
  }

  public addHeader() {
    const header: string = this.inputHeader;

    this.section.table.headers.push(header);

    // Añadir el nuevo header a todas las columnas existentes
    this.section.table.columns.forEach((column, index) => {
      column.push({ name: header, value: `${header} - column ${index}` });
    });
  }

  public addColumn() {
    const newColumn: TableColumnInterface[] = this.section.table.headers.map((header) => ({
      name: header,
      value: `${header} - column ${this.section.table.columns.length}`
    }));

    // Añadir la nueva columna a la tabla
    this.section.table.columns.push(newColumn);

    // Asegurar que todas las columnas tengan la misma estructura
    this.section.table.headers.forEach((header) => {
      this.section.table.columns.forEach((column) => {
        if (!column.some(col => col.name === header)) {
          column.push({ name: header, value: `${header} - column ${this.section.table.columns.length}` });
        }
      });
    });
  }

  public removeHeader(header: string, index: number) {
    // Eliminar el header
    this.section.table.headers.splice(index, 1);

    // Eliminar la fila correspondiente al nuevo header en las columnas
    this.section.table.columns.forEach((column) => {
      const columnIndex = column.findIndex(col => col.name === header);
      if (columnIndex !== -1) {
        column.splice(columnIndex, 1);
      }
    });
  }

  public removeColumn(index: number) {
    // Eliminar el header
    this.section.table.columns.splice(index, 1);
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

  // DATA TABLE EMIT
  @Emit('setDataTable')
  public setDataTable(): { position: number, headers: Array<string>, columns: Array<TableColumnInterface[]> } {
    // RETURN DATA
    return {
      position: this.section.position,
      headers: this.section.table.headers,
      columns: this.section.table.columns
    }
  }


  // @Watch('section.table.headers', { deep: true })
  // public setHeadersDeep() {
  //   // CLEAN COLUMN TYPENAME
  //   this.section.table.columns.map(column => {
  //     const colClean = column.map(col => {
  //       const cClean = _.omit(col, ['__typename'])
  //       return cClean
  //     })
  //     return colClean
  //   })
  // }

  // @Watch('section.table.columns', { deep: true })
  // public setColumnsDeep() {
  //   // CLEAN COLUMN TYPENAME
  //   this.section.table.columns.map(column => {
  //     const colClean = column.map(col => {
  //       const cClean = _.omit(col, ['__typename'])
  //       return cClean
  //     })
  //     return colClean
  //   })
  // }
}

export default SectionTableComponent;
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
      <v-card rounded="b-xl" color="#ffffffbb" flat>
        <v-card-text class="pa-8">
          <v-row justify="center" no-gutters>
            <v-col cols="10">
              <v-toolbar :color="section.color ? section.color : '#12539b'" height="60">
                <v-row justify="center">
                  <v-col class="mt-5" cols="3">
                    <v-text-field v-model="inputHeader" variant="solo" density="compact" rounded="xl"
                      label="Agregar nueva fila">
                      <template #append-inner>
                        <v-btn @click="addHeader()" density="compact" color="blue" icon>
                          <v-icon>
                            mdi-plus
                          </v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-col>
                  <v-col class="mt-7 text-right" cols="5">
                    <v-btn :disabled="section.table.headers.length === 0" @click="addColumn()" class="text-caption"
                      rounded="xl" density="compact" color="white">
                      Agregar columna
                      <v-icon>
                        mdi-plus
                      </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-toolbar>
              <v-table>
                <thead class="bg-primary">
                  <tr>
                    <template v-for="(header, i) in section.table.headers" :key="i" class="text-left">
                      <v-hover>
                        <template v-slot:default="{ isHovering, props }">
                          <th v-bind="props" class="px-5 text-uppercase font-weight-bold" style="position: relative">
                            {{ header }}
                            <v-btn v-if="isHovering" @click="removeHeader(header, i)" style="right: 25px"
                              position="absolute" color="red" density="compact" icon>
                              <v-icon size="17">mdi-delete</v-icon>
                            </v-btn>
                          </th>
                        </template>
                      </v-hover>
                    </template>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(column, x) in section.table.columns" :key="x">
                    <v-hover close-delay="500">
                      <template v-slot:default="{ isHovering, props }">
                        <tr v-bind="props">
                          <template v-for="(header, i) in section.table.headers" :key="i">
                            <td>
                              <v-text-field class="mt-5" density="compact" variant="outlined"
                                v-model="column[i].value"></v-text-field>
                            </td>
                          </template>
                          <v-btn v-if="isHovering" @click="removeColumn(x)" class="ml-5 mt-4" position="absolute"
                            color="red" density="compact" icon>
                            <v-icon size="17">mdi-delete</v-icon>
                          </v-btn>
                        </tr>
                      </template>
                    </v-hover>
                  </template>
                </tbody>
              </v-table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>