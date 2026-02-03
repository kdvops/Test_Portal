<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { TargetInterface } from "~/interfaces/targets.interface";
import type { CreateCategoryRules } from "~/interfaces/rules.interface";

// IMPORT COMPONENTS
import AppDropdownComponent from "~/components/dropdown/index.vue";
import SectionComponent from "~/components/sections/index.vue";
import SeoTargetsComponent from "~/components/seo/targets/index.vue";

// IMPORT MUTATIONS
import { UPDATE_TARGET } from "~/graphql/mutations/targets.mutation";

// IMPORT QUERIES
import { GET_TARGET_BY_ID } from "~/graphql/query/targets.query";

// IMPORT LODASH
import _ from "lodash";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import {
  mapToUpdateAccordionDto,
  mapToUpdateGalleryDto,
  mapToUpdateGridDto,
  mapToUpdateGridsDto,
} from "~/interfaceMap/dtoMapping";

// IMPORT CRYPTO UTILS
import { encrypt, decrypt } from "~/utils/cryptoUtils";

// IMPORT INTERFACE
import type {
  SectionTypeInterface,
  TableColumnInterface,
  TypeAttachment,
  TypeCard,
  UploadFileItem,
} from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "targets-update-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-dropdown-component": AppDropdownComponent,
    "section-component": SectionComponent,
    "seo-targets-component": SeoTargetsComponent,
  },
})
class TargetsUpdateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM TARGET ID
  public targetId = useRoute().params._id;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public override $apollo: any;

  // TARGET DEFAULT VALUES
  public target: TargetInterface = {
    name: "",
    slug: "",
    icon: "mdi-folder",
    color: "#12539b",
    description: "",
    featured: "hidden",
    sections: [],
    status: "publish",
    showCategories: true,
    showPosts: true,

    // SEO FIELDS
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    tags: [],
    ogImage: "",
    twitterImage: "",
    socialTitle: "",
    socialDescription: "",
    altText: "",
    robotsDirectives: "index, follow",
    language: "es",
    structuredType: "Organization",
    schemaMarkup: "",
    relatedTargets: [],
    isFeatured: false,
  };

  // LOADING
  public loading: boolean = false;

  // FORM VALID
  public formValid: boolean = false;

  // SEO STATE
  public seoExpanded: boolean = false;
  public keywordInput: string = "";
  public tagInput: string = "";

  // UPLOAD FILES
  public newUploadPictureOgImage: Array<any> = [];
  public newUploadPictureTwitterImage: Array<any> = [];

  // RULES VALIDATION FORM
  public rules: CreateCategoryRules = {
    name: [(v: string) => !!v || "El nombre es requerido"],
    slug: [(v: string) => !!v || "El slug es requerido"],
    description: [(v: string) => !!v || "La descripción es requerida"],
    tags: [(v: Array<string>) => !!v.length || "Los tags son requeridos"],
  };

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setTarget();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET TARGET
  public async setTarget() {
    try {
      // GET TARGET
      const { data } = await this.$apollo.query({
        query: GET_TARGET_BY_ID,
        variables: {
          targetId: this.targetId,
        },
        fetchPolicy: "no-cache",
      });

      // VALIDATE DATA EXISTS
      if (!data || !data.findTargetById) {
        throw new Error("Target no encontrado");
      }

      // SET TARGET
      const target = data.findTargetById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = target.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : ''
        };
      });

      // SET TARGET TO VARIABLE
      this.target = { ...target, sections };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE TARGET
  public async updateTarget() {
    this.loading = true;
    try {
      // OMIT FIELDS NOT NECESSARY
      const targetClean = _.omit(this.target, [
        "_id",
        "__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanTarget = (targetClean.sections || []).map((section: any) => {
        let cleanSection = _.omit(section, [
          "__typename",
          "image.__typename",
          "cards.__typename",
          "attachments.__typename",
          "banner.__typename",
          "banner.button.__typename",
          "banner.title.__typename",
          "banner.description.__typename",
          "table.__typename",
        ]);
        
        // VALIDATE AND CLEAN CARDS
        cleanSection.cards = (section.cards || []).map((card: any) => {
          let clean = _.omit(card, ["__typename"]);
          return clean;
        });
        
        // VALIDATE AND CLEAN ATTACHMENTS
        cleanSection.attachments = (section.attachments || []).map(
          (attachment: any) => {
            let clean = _.omit(attachment, ["__typename"]);
            return clean;
          }
        );
        
        cleanSection.text = section.text ? encrypt(section.text) : "";

        cleanSection._id = section._id
          ? section._id.length >= 9
            ? section._id
            : null
          : null;
        
        cleanSection.grids = mapToUpdateGridsDto(section.grids);
        cleanSection.gallery = mapToUpdateGalleryDto(section.gallery);
        cleanSection.accordion = mapToUpdateAccordionDto(section.accordion);
        return cleanSection;
      });

      // PRODUCT FINAL
      const targetFinal = {
        ...targetClean,
        status: "publish",
        sections: sectionCleanTarget,
      };

      // PAYLOAD UPDATE PRODUCT
      const updateTargetDto = {
        updateTargetDto: {
          targetID: this.targetId,
          target: targetFinal,
        },
      };

      // UPDATE TARGET MUTATION
      await this.$apollo.mutate({
        mutation: UPDATE_TARGET,
        variables: updateTargetDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO TARGETS LIST
      this.$router.push("/targets/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Target actualizado correctamente!",
        color: "success",
        timeout: 6000,
      });
    } catch (err) {
      // SET LOADING FALSE
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE TARGET DRAFT
  public async updateTargetDraft() {
    this.loading = true;
    try {
      // OMIT FIELDS NOT NECESSARY
      const targetClean = _.omit(this.target, [
        "_id",
        "__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanTarget = (targetClean.sections || []).map((section: any) => {
        let cleanSection = _.omit(section, [
          "__typename",
          "image.__typename",
          "cards.__typename",
          "attachments.__typename",
          "banner.__typename",
          "banner.button.__typename",
          "banner.title.__typename",
          "banner.description.__typename",
          "table.__typename",
        ]);
        
        // VALIDATE AND CLEAN CARDS
        cleanSection.cards = (section.cards || []).map((card: any) => {
          let clean = _.omit(card, ["__typename"]);
          return clean;
        });
        
        // VALIDATE AND CLEAN ATTACHMENTS
        cleanSection.attachments = (section.attachments || []).map(
          (attachment: any) => {
            let clean = _.omit(attachment, ["__typename"]);
            return clean;
          }
        );
        
        cleanSection.text = section.text ? encrypt(section.text) : "";

        cleanSection._id = section._id
          ? section._id.length >= 9
            ? section._id
            : null
          : null;
        
        cleanSection.grids = mapToUpdateGridsDto(section.grids);
        cleanSection.gallery = mapToUpdateGalleryDto(section.gallery);
        cleanSection.accordion = mapToUpdateAccordionDto(section.accordion);
        return cleanSection;
      });

      // PRODUCT FINAL
      const targetFinal = {
        ...targetClean,
        status: "draft",
        sections: sectionCleanTarget,
      };

      // PAYLOAD UPDATE PRODUCT
      const updateTargetDto = {
        updateTargetDto: {
          targetID: this.targetId,
          target: targetFinal,
        },
      };

      // UPDATE TARGET MUTATION
      const { data } = await this.$apollo.mutate({
        mutation: UPDATE_TARGET,
        variables: updateTargetDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      return data;
    } catch (err) {
      // SET LOADING FALSE
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE SLUG
  public updateSlug() {
    if (this.target.name) {
      this.target.slug = toSlug(this.target.name.toLowerCase());
    }
  }

  // SEO METHODS
  public addKeyword() {
    if (
      this.keywordInput.trim() &&
      !this.target.keywords?.includes(this.keywordInput.trim())
    ) {
      this.target.keywords = [
        ...(this.target.keywords || []),
        this.keywordInput.trim(),
      ];
      this.keywordInput = "";
    }
  }

  public removeKeyword(keyword: string) {
    this.target.keywords =
      this.target.keywords?.filter((k) => k !== keyword) || [];
  }

  public addTag() {
    if (
      this.tagInput.trim() &&
      !this.target.tags?.includes(this.tagInput.trim())
    ) {
      this.target.tags = [...(this.target.tags || []), this.tagInput.trim()];
      this.tagInput = "";
    }
  }

  public removeTag(tag: string) {
    this.target.tags = this.target.tags?.filter((t) => t !== tag) || [];
  }

  public uploadOgImage(files: Array<any>) {
    try {
      if (!files || !Array.isArray(files)) return;
      
      this.newUploadPictureOgImage = files;
      this.target.ogImage = files[0]?.url || "";
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  public uploadTwitterImage(files: Array<any>) {
    try {
      if (!files || !Array.isArray(files)) return;
      
      this.newUploadPictureTwitterImage = files;
      this.target.twitterImage = files[0]?.url || "";
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

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

  // EMIT EVENT NEW SECTION
  public newSection(section: SectionTypeInterface) {
    this.target.sections = [
      ...this.target.sections,
      {
        ...section,
        _id: section._id ?? this.makeid(8),
        position: this.target.sections.length + 1
      }
    ];
  }

  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.target.sections[section.position - 1] = section;
  }

  // EMIT EVENT CHANGE POSITION SECTION
  public changePositionSection(evt: any) {
    // NEW SECTIONS
    let newSections = []

    // OLD INDEX
    const oldIndex = evt.oldIndex;

    // NEW INDEX
    const newIndex = evt.newIndex;

    // MOVE SECTION
    newSections = [...this.target.sections]

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0]

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected)

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 }
    })

    // REASSIGN TARGET TO TRIGGER REACTIVITY
    this.target.sections = newSections;
  }

  // EMIT EVENT REMOVE SECTION
  public removeSection(position: number) {
    this.target.sections.splice(position - 1, 1);
    // REFRESH POSITION
    this.target.sections = this.target.sections.map((section, index) => {
      return {
        ...section,
        position: index + 1
      }
    });
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number; card: TypeCard }) {
    if (!this.target.sections || !section.position) return;

    const index = section.position - 1;
    if (index < 0 || index >= this.target.sections.length) return;

    const getSection = this.target.sections[index];
    if (!getSection) return;
    
    getSection.cards = [
      ...(getSection.cards || []),
      { ...section.card, status: 'create' }
    ];
  }

  // EMIT EVENT UPDATE CARD SECTION
  public updateCardSection(section: {
    position: number;
    index: number;
    card: TypeCard;
  }) {
    if (!this.target.sections || !section.position) return;

    const sectionIndex = section.position - 1;
    if (sectionIndex < 0 || sectionIndex >= this.target.sections.length) return;

    const getSection = this.target.sections[sectionIndex];
    if (!getSection || !getSection.cards) return;
    
    const cardIndex = section.index;
    if (cardIndex < 0 || cardIndex >= getSection.cards.length) return;
    
    getSection.cards[cardIndex] = { ...section.card, status: section.card._id ? 'update' : 'create' };
  }

  // EMIT EVENT REMOVE CARD SECTION
  public removeCardSection(section: { position: number; index: number }) {
    if (!this.target.sections || !section.position) return;

    const sectionIndex = section.position - 1;
    if (sectionIndex < 0 || sectionIndex >= this.target.sections.length) return;

    const getSection = this.target.sections[sectionIndex];
    if (!getSection || !getSection.cards) return;
    
    const cardIndex = section.index;
    if (cardIndex < 0 || cardIndex >= getSection.cards.length) return;
    
    const getCard = getSection.cards[cardIndex];

    // VALIDATE IF CARD IS NEW
    if (getCard.status === 'create') {
      getSection.cards.splice(cardIndex, 1);
    } else {
      getSection.cards[cardIndex] = { ...getCard, status: 'remove' };
    }
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: {
    position: number;
    attachments: TypeAttachment[];
  }) {
    if (!this.target.sections || !section.position || !section.attachments) return;

    const index = section.position - 1;
    if (index < 0 || index >= this.target.sections.length) return;

    const getSection = this.target.sections[index];
    if (!getSection) return;
    
    const attachmentsCreateMap: TypeAttachment[] = section.attachments.map(attachment => ({
      ...attachment,
      status: 'create'
    }));

    // ADD NEW ATTACHMENTS
    getSection.attachments = [
      ...(getSection.attachments || []),
      ...attachmentsCreateMap,
    ];
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public updateAttachmentSection(section: {
    position: number;
    index: number;
    attachment: TypeAttachment;
  }) {
    if (!this.target.sections || !section.position) return;

    const sectionIndex = section.position - 1;
    if (sectionIndex < 0 || sectionIndex >= this.target.sections.length) return;

    const getSection = this.target.sections[sectionIndex];
    if (!getSection || !getSection.attachments) return;
    
    const attachmentIndex = section.index;
    if (attachmentIndex < 0 || attachmentIndex >= getSection.attachments.length) return;
    
    getSection.attachments[attachmentIndex] = { ...section.attachment, status: section.attachment._id ? 'update' : 'create' };
  }

  // EMIT EVENT REMOVE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number; index: number }) {
    if (!this.target.sections || !section.position) return;

    const sectionIndex = section.position - 1;
    if (sectionIndex < 0 || sectionIndex >= this.target.sections.length) return;

    const getSection = this.target.sections[sectionIndex];
    if (!getSection || !getSection.attachments) return;
    
    const attachmentIndex = section.index;
    if (attachmentIndex < 0 || attachmentIndex >= getSection.attachments.length) return;
    
    const getAttachment = getSection.attachments[attachmentIndex];

    // VALIDATE IF ATTACHMENT IS NEW
    if (getAttachment.status === 'create') {
      getSection.attachments.splice(attachmentIndex, 1);
    } else {
      getSection.attachments[attachmentIndex] = { ...getAttachment, status: 'remove' };
    }
  }

  // EMIT SET DATA TABLE SECTION
  public setDataTable(section: {
    position: number;
    headers: Array<string>;
    columns: Array<TableColumnInterface[]>;
  }) {
    if (!this.target.sections || !section.position) return;

    const index = section.position - 1;
    if (index < 0 || index >= this.target.sections.length) return;

    const getSection = this.target.sections[index];
    if (!getSection) return;
    
    getSection.table = {
      ...(getSection.table || {}),
      headers: section.headers || [],
      columns: section.columns || [],
    };
  }

  // SAVE ITEM
  public async saveTargetDraft() {
    try {
      // FIRST CREATE PRODUCT STATUS DRAFT
      await this.updateTargetDraft();

      // REFRESH ROUTE
      window.location.reload();
    } catch (err) {
      // Error already handled in updateTargetDraft
      console.error("Error al guardar borrador:", err);
    }
  }

  // GO TO UPDATE SUBCATEGORY
  public async goPreview() {
    try {
      // UPDATE ALL CHANGE
      await this.updateTargetDraft();

      // GO PREVIEW TARGET
      const route = this.$router.resolve({
        path: `/previews/targets/${this.targetId}`,
      });
      window.open(route.href, "_blank");

      // REFRESH ROUTE
      window.location.reload();
    } catch (err) {
      // Error already handled in updateTargetDraft
      console.error("Error al abrir vista previa:", err);
    }
  }
}
export default TargetsUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="pa-5" justify="center">
    <!-- FORM TARGET -->
    <v-col cols="10">
      <v-form v-model="formValid">
        <v-row align-content="center" justify="center">
          <!-- INPUTS COMPONENT -->
          <v-col class="py-0 mt-5 mx-auto text-center" cols="6">
            <v-text-field
              :rules="rules.name"
              prepend-inner-icon="mdi-folder"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="target.name"
              label="Nombre del Target"
              required
              clearable
              @change="updateSlug"
            />
          </v-col>
          <v-col class="py-0 mt-5 mx-auto text-center" cols="6">
            <v-text-field
              :rules="rules.slug"
              prepend-inner-icon="mdi-folder"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="target.slug"
              label="Slug"
              required
              clearable
            />
          </v-col>
          <v-col class="py-0 mt-5 mx-auto text-center" cols="6">
            <v-text-field
              prepend-inner-icon="mdi-icon"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="target.icon"
              label="Icono"
              required
              clearable
            />
          </v-col>
          <v-col class="py-0 mt-5 mx-auto text-center" cols="6">
            <v-select
              v-model="target.featured"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Posicionado o Destacado de la sección"
              item-title="text"
              item-value="value"
              :items="[
                {
                  text: 'Oculto',
                  value: 'hidden',
                },
                {
                  text: 'Menu',
                  value: 'menu',
                },
                {
                  text: 'Menu Expanded',
                  value: 'menuExpanded',
                },
              ]"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              rounded="xl"
              v-model="target.color"
              density="compact"
              variant="solo"
              label="Color de seccion"
            >
              <template #prepend-inner>
                <v-icon :color="target.color"> mdi-record </v-icon>
              </template>
              <v-menu activator="parent">
                <v-color-picker
                  rounded="xl"
                  width="100%"
                  mode="hex"
                  v-model="target.color"
                  density="compact"
                  variant="solo"
                  label="Color de seccion"
                />
              </v-menu>
            </v-text-field>
          </v-col>
          <v-col class="py-0 mx-auto text-center" cols="12">
            <v-textarea
              :rules="rules.description"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="target.description"
              label="Descripción del Target"
              required
              clearable
            />
          </v-col>

          <v-col cols="12" class="d-flex justify-center">
            <v-switch
              class="mx-5"
              v-model="target.disabled"
              label="Deshabilitar"
              color="#12539b"
              inset
            />
            <v-switch
              class="mx-5"
              v-model="target.showCategories"
              label="Mostrar categorías"
              color="#12539b"
              inset
            />
          </v-col>
        </v-row>
      </v-form>
    </v-col>

    <!-- SEO SECTION -->
    <v-col cols="10" class="pa-6">
      <seo-targets-component :target="target" />
    </v-col>

    <!-- SECTIONS COMPONENT -->
    <v-col cols="12" class="pb-15 mb-15">
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
        :sections="target.sections || []"
      />
    </v-col>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn
        position="absolute"
        rounded="xl"
        :base-color="
          target.status && target.status === 'disabled' ? 'orange' : 'green'
        "
        style="height: 30px; top: 15px; left: 10px"
        variant="tonal"
        readonly
      >
        {{
          target.status && target.status === "disabled"
            ? "Deshabilitado"
            : "Habilitado"
        }}
      </v-btn>
      <v-btn @click="updateTarget()" :disabled="!formValid" :loading="loading">
        <v-icon> mdi-upload </v-icon>
        Actualizar Target
      </v-btn>
      <v-btn @click="saveTargetDraft()" :loading="loading">
        <v-icon> mdi-content-save </v-icon>
        Guardar
      </v-btn>
      <v-btn @click="goPreview()" :loading="loading">
        <v-icon> mdi-eye </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.seo-card {
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(18, 83, 155, 0.2);
    box-shadow: 0 8px 25px rgba(18, 83, 155, 0.15);
  }

  .v-card-title {
    background: linear-gradient(
      135deg,
      rgba(18, 83, 155, 0.05) 0%,
      rgba(18, 83, 155, 0.1) 100%
    );
    border-radius: 12px 12px 0 0;
  }
}

.gap-2 {
  gap: 8px;
}
</style>
