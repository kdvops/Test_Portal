<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";
import SeoTargetsComponent from "~/components/seo/targets/index.vue";

// IMPORT INTERFACE
import type {
  SectionTypeInterface,
  TableColumnInterface,
  TypeAttachment,
  TypeCard,
} from "~/interfaces/sections.interface";
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT QUERIES
// import { GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY } from "~/graphql/query/categories.query";

// IMPORT MUTATIONS
import { CREATE_TARGET } from "~/graphql/mutations/targets.mutation";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import {
  mapToCreateAccordionDto,
  mapToCreateGalleryDto,
  mapToCreateGridsDto,
} from "~/interfaceMap/dtoMapping";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "targets-create-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    "seo-targets-component": SeoTargetsComponent,
  },
})
class TargetsCreateScreen extends Vue {
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
  public override $apollo: any;

  // SECTIONS CARDS DEFAULT VALUES
  public target: TargetInterface = {
    name: "",
    slug: "",
    icon: "mdi-folder",
    color: "#12539b",
    featured: "hidden",
    description: "",
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

  // VALID FORM
  public valid: boolean = false;

  // LOADING DEFAULT VALUES
  public loading: boolean = false;

  // SEO STATE
  public seoExpanded: boolean = false;
  public keywordInput: string = "";
  public tagInput: string = "";

  // UPLOAD FILES
  public newUploadPictureOgImage: Array<any> = [];
  public newUploadPictureTwitterImage: Array<any> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // CREATE TARGET CARD
  public async createTarget() {
    // SET LOADING FALSE
    this.loading = true;

    try {
      // ENCRYPT HTML TO BASE64
      this.target.sections = this.target.sections.map((section) => {
        const { _id, ...pickedSection } = section;
        pickedSection.grids = mapToCreateGridsDto(section.grids);
        pickedSection.gallery = mapToCreateGalleryDto(section.gallery);
        pickedSection.accordion = mapToCreateAccordionDto(section.accordion);

        return {
          ...pickedSection,
          text: section.text ? encrypt(section.text) : "",
        };
      });

      // PAYLOAD PARENT AND TARGET DTO
      const createTargetDto = {
        createTargetDto: {
          ...this.target,
          status: "publish",
        },
      };

      // CREATE TARGET
      await this.$apollo.mutate({
        mutation: CREATE_TARGET,
        variables: createTargetDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO LIST
      this.$router.push("/targets/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Targeto creado correctamente!",
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

  // CREATE TARGET DRAFT
  public async createTargetDraft() {
    // SET LOADING FALSE
    this.loading = true;

    try {
      // ENCRYPT HTML TO BASE64
      this.target.sections = this.target.sections.map((section) => {
        const { _id, ...pickedSection } = section;
        pickedSection.grids = mapToCreateGridsDto(section.grids);
        pickedSection.gallery = mapToCreateGalleryDto(section.gallery);
        pickedSection.accordion = mapToCreateAccordionDto(section.accordion);

        return {
          ...pickedSection,
          text: section.text ? encrypt(section.text) : "",
        };
      });

      // PAYLOAD PARENT AND TARGET DTO
      const createTargetDto = {
        createTargetDto: {
          ...this.target,
          status: "draft",
        },
      };

      // CREATE TARGET
      const { data } = await this.$apollo.mutate({
        mutation: CREATE_TARGET,
        variables: createTargetDto,
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
        position: this.target.sections.length + 1,
      },
    ];
  }

  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.target.sections[section.position - 1] = section;
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
    newSections = [...this.target.sections];

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0];

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected);

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 };
    });

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
        position: index + 1,
      };
    });
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number; card: TypeCard }) {
    const getSection = this.target.sections[section.position - 1];
    getSection.cards = [...getSection.cards, section.card];
  }

  // EMIT EVENT UPDATE CARD SECTION
  public updateCardSection(section: {
    position: number;
    index: number;
    card: TypeCard;
  }) {
    const getSection = this.target.sections[section.position - 1];
    getSection.cards[section.index] = { ...section.card };
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number; index: number }) {
    const getSection = this.target.sections[section.position - 1];
    getSection.cards.splice(section.index, 1);
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: {
    position: number;
    attachments: TypeAttachment[];
  }) {
    const getSection = this.target.sections[section.position - 1];
    getSection.attachments = [
      ...getSection.attachments,
      ...section.attachments,
    ];
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public updateAttachmentSection(section: {
    position: number;
    index: number;
    attachment: TypeAttachment;
  }) {
    const getSection = this.target.sections[section.position - 1];
    getSection.attachments[section.index] = { ...section.attachment };
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number; index: number }) {
    const getSection = this.target.sections[section.position - 1];
    getSection.attachments.splice(section.index, 1);
  }

  // EMIT SET DATA TABLE SECTION
  public setDataTable(section: {
    position: number;
    headers: Array<string>;
    columns: Array<TableColumnInterface[]>;
  }) {
    const getSection = this.target.sections[section.position - 1];
    getSection.table = {
      ...getSection.table,
      headers: section.headers,
      columns: section.columns,
    };
  }

  public updateSlug() {
    this.target.slug = toSlug(this.target.name.toLowerCase());
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
      this.newUploadPictureOgImage = files;
      this.target.ogImage = files[0]?.url || "";
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  public uploadTwitterImage(files: Array<any>) {
    try {
      this.newUploadPictureTwitterImage = files;
      this.target.twitterImage = files[0]?.url || "";
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // GO PREVIEW
  public async goPreview() {
    // FIRST CREATE TARGET STATUS DRAFT
    const target = await this.createTargetDraft();

    // GO EDIT AFTER CREATE TARGET
    this.$router.push(`/targets/update/${target.createTarget._id}`);

    // GO PREVIEW BEFORE CREATE TARGET
    const route = this.$router.resolve({
      path: `/previews/targets/item/${target.createTarget._id}`,
    });
    window.open(route.href, "_blank");
  }

  // SAVE ITEM
  public async saveTargetDraft() {
    // FIRST CREATE TARGET STATUS DRAFT
    const target = await this.createTargetDraft();

    // GO EDIT AFTER CREATE TARGET
    this.$router.push(`/targets/update/${target.createTarget._id}`);
  }
}
export default TargetsCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
    <!-- FORM TARGET -->
    <v-col cols="10">
      <v-form v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="target.name"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Name"
              @change="updateSlug"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="target.slug"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Slug"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="target.icon"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Icon"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="target.featured"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Posicionado o Destacado de la sección"
              :items="['hidden', 'menu', 'menu-expanded']"
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
          <v-col cols="12">
            <v-textarea
              v-model="target.description"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Description"
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
        :sections="target.sections"
      />
    </v-col>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn
        @click="createTarget()"
        :disabled="!valid || target.sections.length === 0"
        :loading="loading"
      >
        <v-icon> mdi-upload </v-icon>
        Crear
      </v-btn>
      <v-btn
        @click="saveTargetDraft()"
        :disabled="!valid || target.sections.length === 0"
        :loading="loading"
      >
        <v-icon> mdi-content-save </v-icon>
        Guardar
      </v-btn>
      <v-btn
        @click="goPreview()"
        :disabled="!valid || target.sections.length === 0"
        :loading="loading"
      >
        <v-icon> mdi-eye </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->
  </v-row>
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
