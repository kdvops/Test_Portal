<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface, DialogCreateNewSectionCard, TypeCard } from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-banner-component',
})
class SectionBannerComponent extends Vue {
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
      style: 'bannerLarge',
      type: 'sectionBanner',
      banner: {
        title: {
          text: '',
          color: ''
        },
        description: {
          text: '',
          color: ''
        },
        background: '',
        newUploadPictureItem: [],
        button: {
          enabled: false,
          text: '',
          color: '',
          link: '',
        },
      },
    }
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
  @Emit('updateSection')
  public updateSection(): SectionTypeInterface {
    const newUploadPictureItem =
      this.section.banner.newUploadPictureItem && this.section.banner.newUploadPictureItem.length > 0
        ? this.section.banner.newUploadPictureItem
        : []

    // RETURN SECTION
    return {
      ...this.section,
      ...{
        banner: {
          ...this.section.banner,
          title: {
            text: this.section.banner.title && this.section.banner.title.text || '',
            color: this.section.banner.title && this.section.banner.title.color || ''
          },
          description: {
            text: this.section.banner.description && this.section.banner.description.text || '',
            color: this.section.banner.description && this.section.banner.description.color || ''
          },
          background: this.section.banner.background || '#12539b',
          newUploadPictureItem
        }
      }
    }
  }

  // REMOVE SECTION
  @Emit('removeSection')
  public removeSection(): number {
    return this.section.position
  }
}
export default SectionBannerComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row no-gutters>
    <v-col cols="12">
      <template v-if="section.style === 'bannerLarge'">
        <v-img width="100%" height="300" class="justify-content-center align-content-center" :src="section.banner.picture?.trim()? section.banner.picture:section.banner.pictureImageDetail?.image" cover>

          <!-- BUTTON MENU -->
          <v-btn class="ma-2" density="comfortable" position="absolute" location="end top" variant="text" icon>
            <v-icon size="20" color="#ffffff">mdi-dots-vertical</v-icon>
            <v-menu activator="parent" location="end" close-on-content-click>
              <v-list>
                <v-list-item @click="updateSection()" title="Editar Sección" />
                <v-list-item @click="removeSection()" title="Eliminar Sección" />
              </v-list>
            </v-menu>
          </v-btn>

          <v-row class="h-100" justify="center" align-content="center">
            <v-col cols="8">
              <v-card width="100%" height="180" rounded="xl"
                :color="section.banner.background ? section.banner.background : '#12539b'">
                <v-row class="h-100 pa-10 ma-0" align-content="center" no-gutters>
                  <v-col cols="8">
                    <p class="text-h5 font-weight-bold"
                      :style="`color: ${section.banner.title && section.banner.title.color ? section.banner.title.color : '#ffffff'}`">
                      {{
                        section.banner.title && section.banner.title.text
                          ? section.banner.title.text
                          : section.name
                      }}</p>
                    <p class="text-caption font-weight-thin pr-15"
                      :style="`color: ${section.banner.title && section.banner.description.color ? section.banner.description.color : '#ffffff'}`">
                      {{
                        section.banner.description && section.banner.description.text
                          ? section.banner.description.text
                          : section.description
                      }}</p>
                  </v-col>
                  <v-col cols="3" class="text-center">
                    <v-btn class="text-body-2 mt-5" v-if="section.banner.button.enabled" rounded="xl"
                      density="comfortable" :color="section.banner.button.color">
                      {{ section.banner.button.text }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>

        </v-img>
      </template>

      <template v-else>
        <v-img :color="section.banner.background ? section.banner.background : '#12539b'" rounded="xl" height="200"
          :src="section.banner.picture?.trim()? section.banner.picture:section.banner.pictureImageDetail?.image" cover>

          <!-- BUTTON MENU -->
          <v-btn class="ma-2" density="comfortable" position="absolute" location="end top" variant="text" icon>
            <v-icon size="20" color="#ffffff">mdi-dots-vertical</v-icon>
            <v-menu activator="parent" location="end" close-on-content-click>
              <v-list>
                <v-list-item @click="updateSection()" title="Editar Sección" />
                <v-list-item @click="removeSection()" title="Eliminar Sección" />
              </v-list>
            </v-menu>
          </v-btn>

          <!-- LAYER TEXT -->
          <v-row class="h-100 pa-10 ma-0" align-content="center" no-gutters>
            <v-col cols="8">
              <p class="text-h5 font-weight-bold"
                :style="`color: ${section.banner.title && section.banner.title.color ? section.banner.title.color : '#ffffff'}`">
                {{
                  section.banner.title && section.banner.title.text
                    ? section.banner.title.text
                    : section.name
                }}</p>
              <p class="text-caption font-weight-thin pr-15"
                :style="`color: ${section.banner.title && section.banner.description.color ? section.banner.description.color : '#ffffff'}`">
                {{
                  section.banner.description && section.banner.description.text
                    ? section.banner.description.text
                    : section.description
                }}</p>
            </v-col>
            <v-col cols="3" class="text-center">
              <v-btn class="text-body-2 mt-2" v-if="section.banner.button.enabled" rounded="xl" density="comfortable"
                :color="section.banner.button.color">
                {{ section.banner.button.text }}
              </v-btn>
            </v-col>
          </v-row>
        </v-img>
      </template>

    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>