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
        newUploadPictureItem: [],
        title: {
          text: '',
          color: ''
        },
        description: {
          text: '',
          color: ''
        },
        background: '',
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

  public validateOnRedirect(link: string) {
    const validateRoute = link.split('/');

    if (validateRoute[0] === 'https:' || validateRoute[0] === 'http:') {
      window.open(link, '_blank');
    } else {
      this.$router.push(link)
    }
  }
}
export default SectionBannerComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="ma-0 pa-0" no-gutters>
    <v-col class="ma-0 pa-0" cols="12">
      <template v-if="section.style === 'bannerLarge'">
        <v-img width="100%" height="500" class="justify-content-center align-content-center"
          :src="section.banner.picture?? section.banner.pictureImageDetail?.image?? ''" 
          :alt="section.banner.pictureImageDetail?.altText?? ''" 
          cover>
          <v-row class="h-100" justify="center" align-content="center">
            <v-col cols="11" md="7" lg="7">
              <v-card width="100%" height="200" rounded="xl"
                :color="section.banner.background ? section.banner.background : '#12539b'">
                <v-row class="h-100 pa-10 ma-0" align-content="center" no-gutters>
                  <v-col cols="12" md="8" lg="8">
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
                  <v-col cols="12" md="3" lg="3" class="text-center">
                    <v-btn width="80%" height="45" class="text-title mt-5" v-if="section.banner.button.enabled"
                      rounded="xl" @click="validateOnRedirect(section.banner.button.link)"
                      :color="section.banner.button.color">
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
        <v-img class="my-10" :rounded="$vuetify.display.mdAndDown ? 'none' : 'xl'"
          :color="section.banner.background ? section.banner.background : '#12539b'" height="200"
          :src="section.banner.picture?? section.banner.pictureImageDetail?.image?? ''" 
          :alt="section.banner.pictureImageDetail?.altText?? ''"
          cover>
          <!-- LAYER TEXT -->
          <v-row class="h-100 pa-10 ma-0" align-content="center" no-gutters>
            <v-col class="text-center text-md-left" cols="12" md="8" lg="8">
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
              <v-btn height="45" class="text-title mt-5" @click="validateOnRedirect(section.banner.button.link)"
                v-if="section.banner.button.enabled" rounded="xl" :color="section.banner.button.color">
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