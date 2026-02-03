<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "section-text-component",
})
class SectionTextComponent extends Vue {
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
      style: "textLarge",
      type: "sectionText",
      text: "",
    },
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  // UPDATE SECTION
  @Emit("updateSection")
  public updateSection(): SectionTypeInterface {
    // RETURN SECTION
    return this.section;
  }

  // REMOVE SECTION
  @Emit("removeSection")
  public removeSection(): number {
    return this.section.position;
  }

  public qty = useQuillToVuetify({
    indentRem: 1.25,
    enable: {
      alignment: true,
      indent: true,
      size: true,
      colorClass: true,
      cleanup: true,
    },
    mappings: {
      align: {
        center: "text-center",
        right: "text-end",
        justify: "text-justify",
      },
      size: { small: "text-body-2", large: "text-h6", huge: "text-h4" },
      colorClass: { "ql-color-red": "text-error" },
    },
  });

  get vuetifyHtml() {
    return this.qty.transform(this.section.text);
  }
}
export default SectionTextComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="my-5" no-gutters>
    <v-col cols="12">
      <div
        class="text-center py-5 rounded-t-xl"
        :style="`background-color: ${
          section.color ? section.color : '#12539b'
        }; position: relative`"
      >
        <h3 class="text-h5 text-white">
          {{ section.name ? section.name : "Sección sin titulo" }}
        </h3>
        <p class="text-white text-caption">
          {{
            section.description || section.name
              ? section.description
              : "Las secciones sin titulo ni descripción no se mostrara este encabezado!!"
          }}
        </p>
        <v-btn
          class="ma-2"
          density="comfortable"
          position="absolute"
          location="end top"
          variant="text"
          icon
        >
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
      <v-card rounded="b-xl" flat>
        <v-card-text class="px-10">
          <div v-html="vuetifyHtml"></div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>
