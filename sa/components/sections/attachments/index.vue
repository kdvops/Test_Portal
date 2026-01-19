<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type {
  SectionTypeInterface,
  DialogCreateNewSectionAttachments,
  TypeAttachment,
} from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "section-attachments-component",
})
export default class SectionAttachmentsComponent extends Vue {
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
      style: "attachmentsDefault",
      type: "sectionAttachments",
      attachments: [],
    },
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
    window.open(file, "_blank");
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row
    class="px-0 pt-0 pb-10 ma-0 attachments-container"
    justify="center"
    no-gutters
  >
    <v-col cols="12" class="mb-10">
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
    <v-col cols="12" md="11" xl="10">
      <v-row justify="center" no-gutters>
        <v-col v-for="item in section.attachments" cols="10" md="4" xl="3">
          <v-card
            max-width="320"
            min-height="190"
            class="pa-2 mx-auto my-5 attachment-card"
            rounded="lg"
            :style="`border-bottom: ${section.color} solid 5px`"
          >
            <v-card-text class="pa-0 attachment-card-content">
              <v-row justify="start" no-gutters>
                <v-col cols="12" class="text-left mt-2 px-2">
                  <div class="d-flex justify-center align-center">
                    <v-avatar size="60" class="mr-4 flex-shrink-0" color="#fbfaff">
                      <v-icon size="30" color="primary">
                        mdi-file-document
                      </v-icon>
                    </v-avatar>
                    <p
                      class="text-body-2 font-weight-bold attachment-card-text"
                      :style="`color: ${section.color}`"
                    >
                      <strong>{{ item.name }}</strong>
                    </p>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider class="attachment-divider" />
            <v-card-actions class="text-center attachment-card-actions">
              <v-spacer />
              <v-btn
                width="100"
                height="30"
                :disabled="!item.file"
                @click="goToPdf(item.file)"
                class="mt-1 text-caption"
                rounded="xl"
                :color="section.color"
                variant="elevated"
                >Ver Pdf</v-btn
              >
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

/* Estilos para tarjetas de attachments */
.attachment-card {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  height: auto;
  min-height: 190px;
}

.attachment-card-content {
  -webkit-box-flex: 1;
  -webkit-flex: 1 1 auto;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
}

.attachment-card-text {
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  -webkit-line-clamp: 3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-flex: 1;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  min-width: 0;
  margin: 0;
  line-height: 1.4;
}

.attachment-divider {
  -webkit-box-flex: 0;
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  margin: 0;
}

.attachment-card-actions {
  -webkit-box-flex: 0;
  -webkit-flex: 0 0 auto;
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  min-height: 48px;
  padding: 8px 16px !important;
  width: 100%;
  position: relative;
  z-index: 10;
}

/* Asegurar que el botón siempre esté visible */
.attachment-card-actions .v-btn {
  position: relative;
  z-index: 11;
}

/* Responsive */
@media (max-width: 768px) {
  .attachment-card {
    min-height: 180px;
  }
  
  .attachment-card-text {
    -webkit-line-clamp: 2;
  }
}
</style>
