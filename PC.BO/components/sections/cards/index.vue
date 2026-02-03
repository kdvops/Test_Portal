<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type {
  SectionTypeInterface,
  DialogCreateNewSectionCard,
  TypeCard,
} from "~/interfaces/sections.interface";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "section-card-component",
  components: {
    "detailed-image-component": DetailedImageComponent,
  },
})
class SectionCardComponent extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // PROFITS IMAGE REF
  @Ref("cardItemImage") cardItemImage!: any;

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
      style: "cardLarge",
      type: "sectionCards",
      cards: [],
    },
  })
  public section!: SectionTypeInterface;

  public drag: boolean = false;
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // DIALOG CREATE CARD
  public dialog: DialogCreateNewSectionCard = {
    show: false,
    action: "create",
    index: 0,
    card: {
      name: "",
      description: "",
      picture: "",
      link: "",
      newUploadPictureItem: [],
    },
  };

  ///////////////
  /// METHODS ///
  ///////////////

  // GET IMAGE FILE AND SET IN ITEM CARD
  public getImageCardItem(file: File) {
    if (file) {
      if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png"
      ) {
        if (file.size <= 19520000) {
          const itemPicture = this.dialog.card.newUploadPictureItem!;
          const fr = new FileReader();
          fr.onload = (el: any) => {
            itemPicture.splice(0, 1, {
              img: el.target.result,
              filetype: file.type.split("/")[1],
            });
          };
          fr.readAsDataURL(file);
        } else {
          this.$bus.$emit("handleError", "El peso máximo es menor de 2 MB");
        }
      } else {
        this.$bus.$emit("handleError", "Solo se aceptan formato .png y .jpeg");
      }
    }
  }

  // OPEN UPLOAD IMAGE
  public selectImage() {
    const imageRefs: any = this.cardItemImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // REF IMAGE UPLOAD
    imageRefs.click();
  }

  // OPEN DIALOG CREATE CARD
  public openDialogCreateCard() {
    this.dialog.action = "create";
    this.dialog.show = true;
  }

  // OPEN DIALOG UPDATE CARD
  public openDialogUpdateCard(index: number) {
    const newUploadPictureItem =
      this.section.cards[index].newUploadPictureItem || [];
    this.dialog.action = "update";
    this.dialog.show = true;
    this.dialog.index = index;
    this.dialog.card = { ...this.section.cards[index], newUploadPictureItem };
  }

  // CLOSE DIALOG CREATE CARD
  public closeDialog() {
    this.dialog.action = "create";
    this.dialog.show = false;
    this.dialog.card = {
      name: "",
      description: "",
      picture: "",
      link: "",
      newUploadPictureItem: [],
    };
  }

  public validateAction() {
    if (this.dialog.action === "create") {
      this.createNewCardSection();
      this.closeDialog();
    } else {
      this.updateCardSection();
      this.closeDialog();
    }
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  // UPDATE SECTION
  @Emit("updateSection")
  public updateSection(): SectionTypeInterface {
    return this.section;
  }

  // REMOVE SECTION
  @Emit("removeSection")
  public removeSection(): number {
    return this.section.position;
  }

  // CREATE CARD ITEM
  @Emit("createNewCardSection")
  public createNewCardSection(): { position: number; card: TypeCard } {
    return {
      position: this.section.position,
      card: this.dialog.card,
    };
  }

  // CREATE CARD ITEM
  @Emit("updateCardSection")
  public updateCardSection(): {
    position: number;
    index: number;
    card: TypeCard;
  } {
    return {
      position: this.section.position,
      index: this.dialog.index!,
      card: this.dialog.card,
    };
  }

  // REMOVE CARD ITEM
  @Emit("removeCardSection")
  public removeCardSection(
    position: number,
    index: number
  ): { position: number; index: number } {
    return { position, index };
  }
}
export default SectionCardComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="my-5" justify="start" no-gutters>
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
      <v-card rounded="b-xl" color="#ffffffbb" flat>
        <v-card-text class="pa-8">
          <v-row no-gutters>
            <draggable
              class="d-flex flex-wrap justify-center w-100"
              :list="section.cards"
              @start="drag = true"
              @end="drag = false"
              item-key="_id"
              :filter="'.no-sort'"
              :prevent-on-filter="false"
            >
              <template #item="{ element, index }">
                <v-col
                  v-if="element.status !== 'remove'"
                  :cols="section.style === 'cardsLarge' ? '3' : '5'"
                  :key="index"
                >
                  <!-- VALIDATE ITEM STATUS -->
                  <v-card
                    width="180"
                    height="180"
                    class="pa-2 my-3"
                    :style="`border-bottom: ${section.color} solid 5px`"
                  >
                    <v-card-text class="pa-0">
                      <v-btn
                        class="ma-2"
                        density="comfortable"
                        position="absolute"
                        location="end top"
                        variant="text"
                        icon
                      >
                        <v-icon size="20" :color="section.color"
                          >mdi-dots-vertical</v-icon
                        >
                        <v-menu
                          activator="parent"
                          location="end"
                          close-on-content-click
                        >
                          <v-list>
                            <v-list-item
                              @click="openDialogUpdateCard(index)"
                              title="Editar Tarjeta"
                            />
                            <v-list-item
                              @click="removeCardSection(section.position, index)"
                              title="Eliminar Tarjeta"
                            />
                          </v-list>
                        </v-menu>
                      </v-btn>
                      <v-row justify="start" no-gutters>
                        <v-col cols="6" class="text-center my-2">
                          <v-avatar
                            size="70"
                            :image="
                              element.picture?.trim()
                                ? element.picture
                                : element.pictureImageDetail?.image
                            "
                          />
                        </v-col>
                        <v-col cols="12">
                          <p class="text-caption">
                            <strong>{{ element.name }}</strong>
                            {{ element.description }}
                          </p>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </template>
            </draggable>

            <v-col :cols="section.style === 'cardsLarge' ? '3' : '5'">
              <v-card
                width="180"
                height="180"
                class="pa-0 my-3"
                @click="openDialogCreateCard()"
              >
                <v-card-text class="pa-0">
                  <v-row
                    align-content="center"
                    justify="center"
                    style="height: 150px"
                    no-gutters
                  >
                    <v-col cols="12" class="text-center">
                      <v-icon color="primary" size="50">mdi-plus</v-icon>
                      <p class="text-primary">Agregar Tarjeta</p>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- DIALOG CREATE CARD -->
  <v-dialog v-model="dialog.show" width="500">
    <v-card
      rounded="xl"
      :color="section.color"
      :title="`Nueva Tarjeta - ${section.name}`"
    >
      <v-card-text>
        <v-row justify="center" align-content="center">
          <v-col cols="3">
            <detailed-image-component
              v-model="dialog.card.pictureImageDetail"
              :legacy-image="dialog.card.picture"
              avatar
            ></detailed-image-component>
          </v-col>
          <v-col cols="8">
            <v-text-field
              v-model="dialog.card.name"
              rounded="xl"
              density="compact"
              variant="solo"
              label="Nombre de la tarjeta"
            />
            <v-text-field
              v-model="dialog.card.description"
              rounded="xl"
              density="compact"
              variant="solo"
              label="Descripción de la tarjeta"
            />
            <v-text-field
              v-model="dialog.card.link"
              rounded="xl"
              density="compact"
              variant="solo"
              label="Link"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="closeDialog()" variant="text"> Cancelar </v-btn>
        <v-spacer />
        <v-btn @click="validateAction()" variant="text">
          {{ dialog.action === "create" ? "Crear" : "Actualizar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ITEMS BANNER IMAGE -->
  <v-file-input
    ref="cardItemImage"
    class="d-none"
    accept=".jpg, .jpeg, .png"
    @update:model-value="getImageCardItem"
  />
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>
