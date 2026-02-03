<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";
import SeoFinanciallyComponent from "~/components/seo/financially/index.vue";

// IMPORT INTERFACE
import type {
  FinanciallyInterface,
  TypePostFinancially,
} from "~/interfaces/financially.interface";
import type {
  SectionTypeInterface,
  TableColumnInterface,
  TypeAttachment,
  TypeCard,
  UploadFileItem,
} from "~/interfaces/sections.interface";

// IMPORT QUERIES
import { GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY } from "~/graphql/query/categories.query";
import { GET_FINANCIALLY_BY_ID } from "~/graphql/query/financially.query";

// IMPORT MUTATIONS
import { UPDATE_FINANCIALLY } from "~/graphql/mutations/financially.mutation";

// IMPORT LODASH
import _ from "lodash";
import type { NewPictureCategory } from "~/interfaces/categories.interface";

import AuthorsComponent from "~/components/authors-component";
// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import {
  mapToUpdateAccordionDto,
  mapToUpdateGalleryDto,
  mapToUpdateGridDto,
  mapToUpdateGridsDto,
} from "~/interfaceMap/dtoMapping";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "financially-update-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    "detailed-image-component": DetailedImageComponent,
    "seo-financially-component": SeoFinanciallyComponent,
    "authors-component": AuthorsComponent,
  },
})
class FinanciallyUpdateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // CATEGORY REF
  @Ref("bannerFinanciallyImage") bannerFinanciallyImage!: any;

  // CATEGORY REF
  @Ref("financiallyFile") financiallyFile!: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // GET PARAM FINANCIALLY ID
  public financiallyID = useRoute().params._id;

  // TARGET IMAGE
  public targetImage: string = "banner";

  // NEW PICTURE FOR BANNER RESPONSIVE CATEGORY PROFIT
  public newUploadBannerResponsive: Array<NewPictureCategory> = [];

  // NEW PICTURE FOR BANNER CATEGORY PROFIT
  public newUploadBanner: Array<NewPictureCategory> = [];

  // NEW THUMBNAIL FOR CATEGORY PROFIT
  public newUploadThumbnail: Array<NewPictureCategory> = [];

  // UPLOAD FILE
  public newUploadFile: Array<UploadFileItem> = [];

  // SECTIONS CARDS DEFAULT VALUES
  public financially: FinanciallyInterface = {
    title: "",
    slug: "",
    excerpt: "",
    subtitle: "",
    description: "",
    type: "postArticle",
    sections: [],
    file: "",
    banner: "",
    responsive: "",
    thumbnail: "",
    disabled: false,
  };

  // VALID FORM
  public valid: boolean = false;

  // LOADING
  public loading: boolean = false;

  // TYPE POST
  public typePost: Array<{ _id: TypePostFinancially; name: string }> = [
    { _id: "postArticle", name: "Artículo" },
    { _id: "postEvents", name: "Evento" },
    { _id: "postRelease", name: "Nota de Prensa" },
  ];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setFinanciallyById();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // OPEN UPLOAD IMAGE
  public selectImage(targetImage: string) {
    // SET TARGET IMAGE
    this.targetImage = targetImage;

    // GET REFERENCE IMAGE
    const imageRefs: any = this.bannerFinanciallyImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // CLICK IMAGE
    imageRefs.click();
  }

  // OPEN UPLOAD IMAGE
  public selectFile() {
    // GET REFERENCE IMAGE
    const fileRefs: any = this.financiallyFile;

    // REF IMAGE RESET
    fileRefs.value = null;

    // CLICK FILE
    fileRefs.click();
  }

  // GET FILE
  public getFinanciallyFile(file: File) {
    if (file) {
      if (file.type === "application/pdf") {
        if (file.size <= 19520000) {
          const newUploadFile = this.newUploadFile;
          const fr = new FileReader();
          fr.onload = (el: any) => {
            newUploadFile.splice(0, 1, {
              file: el.target.result,
              filename: file.name,
              filetype: file.type.split("/")[1],
            });
          };
          fr.readAsDataURL(file);
        } else {
          this.$bus.$emit("handleError", "El peso máximo es de 2 MB");
        }
      } else {
        this.$bus.$emit("handleError", "Solo se aceptan formato .pdf");
      }
    }
  }

  // GET IMAGE FILE AND SET IN BANNER OR THUMBNAIL
  public getFinanciallyImage(file: File) {
    if (file) {
      if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png"
      ) {
        if (file.size <= 19520000) {
          const categoryImage =
            this.targetImage === "banner"
              ? this.newUploadBanner
              : this.targetImage === "thumbnail"
              ? this.newUploadThumbnail
              : this.newUploadBannerResponsive;
          const fr = new FileReader();
          fr.onload = (el: any) => {
            categoryImage.splice(0, 1, {
              img: el.target.result,
              filetype: file.type.split("/")[1],
            });
          };
          fr.readAsDataURL(file);
        } else {
          this.$bus.$emit("handleError", "El peso máximo es de 2 MB");
        }
      } else {
        this.$bus.$emit("handleError", "Solo se aceptan formato .png y .jpeg");
      }
    }
  }

  // SET FINANCIALLY BY ID
  public async setFinanciallyById() {
    try {
      // PAYLOAD BY ID
      const financiallyIdDto = {
        financiallyId: this.financiallyID,
      };

      // GET FINANCIALLY BY ID
      const { data } = await this.$apollo.query({
        query: GET_FINANCIALLY_BY_ID,
        variables: financiallyIdDto,
        fetchPolicy: "no-cache",
      });

      // SET FINANCIALLY
      const financially = data.findFinanciallyById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = financially.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : "",
        };
      });

      // GET TYPE POST
      const type = this.getTypePostName(financially.type);

      // SET FINANCIALLY TO VARIABLE
      this.financially = { ...financially, type, sections };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE FINANCIALLY CARD
  public async updateFinancially() {
    // SET LOADING
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const financiallyClean = _.omit(this.financially, [
        "_id",
        "__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanFinanciallyClean = financiallyClean.sections?.map(
        (section: any) => {
          let cleanSection = _.omit(section, [
            "__typename",
            "image.__typename",
            "cards.__typename",
            "attachments.__typename",
            "banner.__typename",
            "banner.button.__typename",
            "grid.__typename",
            "banner.title.__typename",
            "banner.description.__typename",
            "table.__typename",
          ]);
          cleanSection.cards = section.cards.map((card: any) => {
            let clean = _.omit(card, ["__typename"]);
            return clean;
          });
          cleanSection.attachments = section.attachments.map(
            (attachment: any) => {
              let clean = _.omit(attachment, ["__typename"]);
              return clean;
            }
          );
          cleanSection.text = section.text ? encrypt(section.text) : "";
          (cleanSection._id = section._id
            ? section._id.length >= 9
              ? section._id
              : null
            : null),
            (cleanSection.grids = mapToUpdateGridsDto(section.grids));
          cleanSection.gallery = mapToUpdateGalleryDto(section.gallery);
          cleanSection.accordion = mapToUpdateAccordionDto(section.accordion);
          return cleanSection;
        }
      );

      // FINANCIALLY FINAL
      const financiallyFinal = {
        ...financiallyClean,
        status: "publish",
        sections: sectionCleanFinanciallyClean,
      };

      // PAYLOAD UPDATE FINANCIALLY
      const updateFinanciallyDto = {
        updateFinanciallyDto: {
          financiallyID: this.financiallyID,
          financially: financiallyFinal,
          newUploadBanner: this.newUploadBanner,
          newUploadResponsive: this.newUploadBannerResponsive,
          newUploadThumbnail: this.newUploadThumbnail,
          newUploadFile: this.newUploadFile,
        },
      };

      await this.$apollo.mutate({
        mutation: UPDATE_FINANCIALLY,
        variables: updateFinanciallyDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING
      this.loading = false;

      // GO TO LIST
      this.$router.push("/financially/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Producto actualizado correctamente!",
        color: "success",
        timeout: 6000,
      });
    } catch (err) {
      this.loading = false;
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE FINANCIALLY DRAFT
  public async updateFinanciallyDraft() {
    // SET LOADING
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const financiallyClean = _.omit(this.financially, [
        "_id",
        "__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanFinanciallyClean = financiallyClean.sections?.map(
        (section: any) => {
          let cleanSection = _.omit(section, [
            "__typename",
            "image.__typename",
            "cards.__typename",
            "attachments.__typename",
            "banner.__typename",
            "banner.button.__typename",
            "grid.__typename",
            "banner.title.__typename",
            "banner.description.__typename",
            "table.__typename",
          ]);
          cleanSection.cards = section.cards.map((card: any) => {
            let clean = _.omit(card, ["__typename"]);
            return clean;
          });
          cleanSection.attachments = section.attachments.map(
            (attachment: any) => {
              let clean = _.omit(attachment, ["__typename"]);
              return clean;
            }
          );
          cleanSection.text = section.text ? encrypt(section.text) : "";
          (cleanSection._id = section._id
            ? section._id.length >= 9
              ? section._id
              : null
            : null),
            (cleanSection.grids = mapToUpdateGridsDto(section.grids));
          cleanSection.gallery = mapToUpdateGalleryDto(section.gallery);
          cleanSection.accordion = mapToUpdateAccordionDto(section.accordion);
          return cleanSection;
        }
      );

      // FINANCIALLY FINAL
      const financiallyFinal = {
        ...financiallyClean,
        status: "draft",
        sections: sectionCleanFinanciallyClean,
      };

      // PAYLOAD UPDATE FINANCIALLY
      const updateFinanciallyDto = {
        updateFinanciallyDto: {
          financiallyID: this.financiallyID,
          financially: financiallyFinal,
          newUploadBanner: this.newUploadBanner,
          newUploadResponsive: this.newUploadBannerResponsive,
          newUploadThumbnail: this.newUploadThumbnail,
          newUploadFile: this.newUploadFile,
        },
      };

      const { data } = await this.$apollo.mutate({
        mutation: UPDATE_FINANCIALLY,
        variables: updateFinanciallyDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING
      this.loading = false;

      return data;
    } catch (err) {
      this.loading = false;
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GET TYPE POST NAME
  public getTypePostName(type: string): string {
    let defaultName = "Desconocido";
    switch (type) {
      case "post::article":
        defaultName = "postArticle";
        break;
      case "post::release":
        defaultName = "postRelease";
        break;
      case "post::events":
        defaultName = "postEvents";
        break;
      default:
        defaultName = "Desconocido";
    }
    return defaultName;
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  // EMIT EVENT NEW SECTION
  public makeid(length: number) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public newSection(section: SectionTypeInterface) {
    this.financially.sections = [
      ...this.financially.sections,
      {
        ...section,
        _id: section._id ?? this.makeid(8),
        position: this.financially.sections.length + 1,
      },
    ];
  }
  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.financially.sections[section.position - 1] = section;
  }

  // EMIT EVENT CHANGE POSITION SECTION
  public changePositionSection(evt: any) {
    // NEW SECTIONS
    let newSections = [];

    // OLD INDEX
    const oldIndex = evt.oldIndex;

    // NEW INDEX
    const newIndex = evt.newIndex;

    // MOVE SECTION
    newSections = [...this.financially.sections];

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0];

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected);

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 };
    });

    // REASSIGN FINANCIALLY TO TRIGGER REACTIVITY
    this.financially.sections = newSections;
  }

  // EMIT EVENT REMOVE SECTION
  public removeSection(position: number) {
    this.financially.sections.splice(position - 1, 1);
    // REFRESH POSITION
    this.financially.sections = this.financially.sections.map(
      (section, index) => {
        return {
          ...section,
          position: index + 1,
        };
      }
    );
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number; card: TypeCard }) {
    const getSection = this.financially.sections[section.position - 1];
    getSection.cards = [
      ...getSection.cards,
      { ...section.card, status: "create" },
    ];
  }

  // EMIT EVENT UPDATE CARD SECTION
  public updateCardSection(section: {
    position: number;
    index: number;
    card: TypeCard;
  }) {
    const getSection = this.financially.sections[section.position - 1];
    getSection.cards[section.index] = {
      ...section.card,
      status: section.card._id ? "update" : "create",
    };
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number; index: number }) {
    const getSection = this.financially.sections[section.position - 1];
    const getCard = getSection.cards[section.index];

    // VALIDATE IF CARD IS NEW
    if (getCard.status === "create") {
      getSection.cards.splice(section.index, 1);
    } else {
      getSection.cards[section.index] = { ...getCard, status: "remove" };
    }
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: {
    position: number;
    attachments: TypeAttachment[];
  }) {
    const getSection = this.financially.sections[section.position - 1];
    const attachmentsCreateMap: TypeAttachment[] = section.attachments.map(
      (attachment) => ({
        ...attachment,
        status: "create",
      })
    );

    // ADD NEW ATTACHMENTS
    getSection.attachments = [
      ...getSection.attachments,
      ...attachmentsCreateMap,
    ];
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public updateAttachmentSection(section: {
    position: number;
    index: number;
    attachment: TypeAttachment;
  }) {
    const getSection = this.financially.sections[section.position - 1];
    getSection.attachments[section.index] = {
      ...section.attachment,
      status: section.attachment._id ? "update" : "create",
    };
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number; index: number }) {
    const getSection = this.financially.sections[section.position - 1];
    const getAttachment = getSection.attachments[section.index];

    // VALIDATE IF ATTACHMENT IS NEW
    if (getAttachment.status === "create") {
      getSection.attachments.splice(section.index, 1);
    } else {
      getSection.attachments[section.index] = {
        ...getAttachment,
        status: "remove",
      };
    }
  }

  // EMIT SET DATA TABLE SECTION
  public setDataTable(section: {
    position: number;
    headers: Array<string>;
    columns: Array<TableColumnInterface[]>;
  }) {
    const getSection = this.financially.sections[section.position - 1];
    getSection.table = {
      ...getSection.table,
      headers: section.headers,
      columns: section.columns,
    };
  }

  public updateSlug() {
    this.financially.slug = toSlug(this.financially.title.toLowerCase());
  }

  // SAVE ITEM
  public async saveFinanciallyDraft() {
    // FIRST UPDATE PRODUCT STATUS DRAFT
    await this.updateFinanciallyDraft();

    // REFRESH ROUTE
    window.location.reload();
  }

  public async goPreview() {
    // UPDATE ALL CHANGE
    await this.updateFinanciallyDraft();

    // GO PREVIEW CATEGORY
    const route = this.$router.resolve({
      path: `/previews/financially/${this.financiallyID}`,
    });
    window.open(route.href, "_blank");

    // REFRESH ROUTE
    window.location.reload();
  }
}
export default FinanciallyUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
    <!-- BANNER IMAGE CATEGORY -->
    <v-col cols="3">
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="340"
        v-model="financially.thumbnailImageDetail"
        :legacy-image="financially.thumbnail"
        text="Cargar Miniatura"
      ></detailed-image-component>
    </v-col>

    <v-col cols="7">
      <!-- BANNER LARGE IMAGE -->
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="160"
        v-model="financially.bannerImageDetail"
        :legacy-image="financially.banner"
        text="Cargar Banner"
        class="mt-2"
      ></detailed-image-component>
      <!-- BANNER RESPONSIVE IMAGE -->
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="160"
        v-model="financially.responsiveImageDetail"
        :legacy-image="financially.responsive"
        text="Cargar Banner Responsive"
        class="mt-2"
      ></detailed-image-component>
    </v-col>

    <!-- FORM CATEGORY -->
    <v-col cols="10">
      <v-form v-model="valid" lazy-validation>
        <v-row justify="center">
          <v-col cols="6">
            <v-text-field
              v-model="financially.title"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Titulo"
              @change="updateSlug"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="financially.slug"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Slug"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="financially.subtitle"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Subtitulo"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="financially.excerpt"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Extracto"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="financially.type"
              prepend-inner-icon="mdi-apps"
              density="compact"
              variant="solo"
              rounded="xl"
              :items="typePost"
              item-value="_id"
              item-title="name"
              label="Tipo de Post"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="financially.description"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Description"
            />
          </v-col>

          <!-- SEO COMPONENT -->
          <v-col cols="12">
            <seo-financially-component
              :financially="financially"
              :expanded="false"
            />
          </v-col>

          <v-col v-if="financially.type === 'postRelease'" class="mb-15 pb-15" cols="8">
            <v-hover>
              <template v-slot:default="{ isHovering, props }">
                <v-sheet
                  :color="
                    newUploadFile.length > 0 || financially.file
                      ? 'green'
                      : '#12539b'
                  "
                  rounded="xl"
                  height="180"
                  v-bind="props"
                >
                  <!-- LAYER UPLOAD IMAGE -->
                  <v-container
                    v-if="
                      isHovering ||
                      (newUploadFile.length === 0 && !financially.file)
                    "
                    class="banner-container-image"
                    fluid
                  >
                    <v-row class="banner-row-image" align-content="center">
                      <v-col cols="12" class="text-center">
                        <v-btn
                          variant="plain"
                          color="#ffffff"
                          :ripple="false"
                          @click="selectFile()"
                          stacked
                        >
                          <v-icon size="50" color="white"> mdi-plus </v-icon>
                          Cargar Archivo
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>

                  <v-container v-else class="banner-container-image" fluid>
                    <v-row class="banner-row-image" align-content="center">
                      <v-col cols="12" class="text-center">
                        <v-btn
                          variant="plain"
                          color="#ffffff"
                          :ripple="false"
                          @click="selectFile()"
                          stacked
                        >
                          <v-icon size="50" color="white"> mdi-file </v-icon>
                          {{
                            newUploadFile.length > 0
                              ? newUploadFile[0].filename
                              : financially.file
                          }}
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-sheet>
              </template>
            </v-hover>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
    <v-col v-if="financially.type !== 'postRelease'" cols="12">
      <section-component
        @removeCardSection="removeCardSection"
        @updateCardSection="updateCardSection"
        @createNewCardSection="createNewCardSection"
        @newSection="newSection"
        @editSection="editSection"
        @removeSection="removeSection"
        @createNewAttachmentSection="createNewAttachmentSection"
        @updateAttachmentSection="updateAttachmentSection"
        @removeAttachmentSection="removeAttachmentSection"
        @changePositionSection="changePositionSection"
        @setDataTable="setDataTable"
        :sections="financially.sections"
      />
    </v-col>
    <v-col cols="10" class="mt-1 mb-15">
      <!-- FORM AUTHORS -->
      <authors-component
        v-model="financially.authors"
        label="Autores"
        class="mb-10"
      ></authors-component>
    </v-col>
    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn
        position="absolute"
        rounded="xl"
        :base-color="
          financially.status && financially.status === 'draft'
            ? 'orange'
            : 'green'
        "
        style="height: 30px; top: 15px; left: 10px"
        variant="tonal"
        readonly
      >
        {{
          financially.status && financially.status === "draft"
            ? "Borrador"
            : "Publicado"
        }}
      </v-btn>
      <v-btn @click="updateFinancially()" :loading="loading">
        <v-icon> mdi-upload </v-icon>
        Actualizar y publicar
      </v-btn>
      <v-btn @click="saveFinanciallyDraft()" :loading="loading">
        <v-icon> mdi-content-save </v-icon>
        Guardar borrador
      </v-btn>
      <v-btn @click="goPreview()" :disabled="loading">
        <v-icon> mdi-eye </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->
  </v-row>

  <!-- UPLOAD IMAGE -->
  <v-file-input
    ref="bannerFinanciallyImage"
    class="d-none"
    accept=".jpg, .jpeg, .png"
    @update:model-value="getFinanciallyImage"
  />

  <!-- UPLOAD FILE -->
  <v-file-input
    ref="financiallyFile"
    class="d-none"
    accept=".pdf"
    @update:model-value="getFinanciallyFile"
  />
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}
</style>
