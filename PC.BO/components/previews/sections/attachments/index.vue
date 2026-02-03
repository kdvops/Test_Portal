<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface, DialogCreateNewSectionAttachments, TypeAttachment } from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-attachments-component',
})
class SectionAttachmentsComponent extends Vue {
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
      style: 'attachmentsDefault',
      type: 'sectionAttachments',
      attachments: []
    }
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  ///////////////
  /// METHODS ///
  ///////////////

  // GO TO PDF
  public goToPdf(file: string) {
    window.open(file, '_blank')
  }
}
export default SectionAttachmentsComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-0 pb-10 ma-0 attachments-container" justify="center" no-gutters>
    <v-col cols="12" class="mb-10">
      <div v-if="section.name" class="text-center py-10"
        :style="`background-color: ${section.color ? section.color : 'var(--bsc-primary-color)'}; position: relative`">
        <h1 class="text-h5 text-white">
          {{ section.name }}
        </h1>
        <p class="text-white text-caption">
          {{ section.description }}
        </p>
      </div>
    </v-col>
    <v-col cols="12" md="11" xl="10">
      <v-row justify="center" no-gutters>
        <v-col v-for="item in section.attachments" cols="10" md="4" xl="3">
          <v-card max-width="320" height="190" class="pa-2 mx-auto my-5" rounded="lg"
            :style="`border-bottom: ${section.color} solid 5px`">
            <v-card-text class="pa-0" style="height: 120px;">
              <v-row justify="start" no-gutters>
                <v-col cols="12" class="text-left mt-2 px-2">
                  <div class="d-flex justify-center align-center">
                    <v-avatar size="60" class="mr-4" color="#fbfaff">
                      <v-icon size="30" color="primary">
                        mdi-file-document
                      </v-icon>
                    </v-avatar>
                    <p class="text-body-2 font-weight-bold" :style="`color: ${section.color}`">
                      <strong>{{ item.name }}</strong>
                    </p>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider />
            <v-card-actions class="text-center">
              <v-spacer />
              <v-btn width="100" height="30" :disabled="!item.file" @click="goToPdf(item.file)" class="mt-1 text-caption" rounded="xl"
                :color="section.color" variant="elevated">Ver Pdf</v-btn>
              <v-spacer />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.attachments-container {
  background-color: #fbfaff;
}
</style>