<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";

// IMPORT INTERFACE
import type { BusinessInterface } from "~/interfaces/business.interface";
import type {
  SectionTypeInterface,
  TableColumnInterface,
  TypeAttachment,
  TypeCard,
} from "~/interfaces/sections.interface";
import type { CategoriesInterface, NewPictureCategory } from "~/interfaces/categories.interface";

// IMPORT MUTATIONS
import { CREATE_BUSINESS } from "~/graphql/mutations/business.mutation";

// IMPORT QUERY'S
import { GET_CATEGORIES_BY_TARGET } from "~/graphql/query/categories.query";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import { mapToCreateAccordionDto, mapToCreateGalleryDto, mapToCreateGridDto, mapToCreateGridsDto } from "~/interfaceMap/dtoMapping";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "business-create-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    'detailed-image-component': DetailedImageComponent
  },
})
class BusinessCreateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // CATEGORY REF
  @Ref("bannerBusinessImage") bannerBusinessImage!: any;

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

  // TARGET IMAGE
  public targetImage: string = "banner";

  // NEW PICTURE FOR BANNER RESPONSIVE 
  public newUploadBannerResponsive: Array<NewPictureCategory> = [];

  // NEW PICTURE FOR BANNER 
  public newUploadBanner: Array<NewPictureCategory> = [];

  // NEW THUMBNAIL FOR THUMBNAIL
  public newUploadThumbnail: Array<NewPictureCategory> = [];

  // SECTIONS CARDS DEFAULT VALUES
  public business: BusinessInterface = {
    title: "",
    slug: "",
    excerpt: "",
    subtitle: "",
    description: "",
    link: "",
    category: "",
    sections: [],
    banner: "",
    responsive: "",
    thumbnail: "",
    disabled: false,
  };

  // CATEGORIES BY TARGET
  public categories: Array<CategoriesInterface> = [];

  // VALID FORM
  public valid: boolean = false;

  // LOADING DEFAULT VALUES
  public loading: boolean = false;

  ///////////////
  /// METHODS ///
  ///////////////

  public created() {
    // SET CATEGORIES
    this.setCategories();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin",  });
  }

  // SET CATEGORIES
  public async setCategories() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: "category::business",
        },
        fetchPolicy: "no-cache",
      });

      // SET CATEGORIES TO VARIABLE
      this.categories = data.findCategoryByTarget;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // OPEN UPLOAD IMAGE
  public selectImage(targetImage: string) {
    // SET TARGET IMAGE
    this.targetImage = targetImage;

    // GET REFERENCE IMAGE
    const imageRefs: any = this.bannerBusinessImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // CLICK IMAGE
    imageRefs.click();
  }

  // GET IMAGE FILE AND SET IN BANNER OR THUMBNAIL
  public getBusinessImage(file: File) {
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

  // CREATE BUSINESS
  public async createBusiness() {
    // SET LOADING FALSE
    this.loading = true;

    try {
      // PAYLOAD PARENT AND TARGET DTO
      const createBusinessDto = {
        createBusinessDto: {
          ...this.business,
          status: 'publish'
        },
      };

      // ENCRYPT HTML TO BASE64
      createBusinessDto.createBusinessDto.sections = this.business.sections.map(
        (section) => {
        const {_id, ...pickedSection} = section
        pickedSection.grids = mapToCreateGridsDto(section.grids)
        pickedSection.gallery = mapToCreateGalleryDto(section.gallery)
        pickedSection.accordion = mapToCreateAccordionDto(section.accordion)

        return {
          ...pickedSection,
            text: section.text ? encrypt(section.text) : "",
          };
        }
      );

      // CREATE BUSINESS
      await this.$apollo.mutate({
        mutation: CREATE_BUSINESS,
        variables: createBusinessDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO LIST
      this.$router.push("/business/post/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Post creado correctamente!",
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

  // CREATE BUSINESS DRAFT
  public async createBusinessDraft() {
    // SET LOADING FALSE
    this.loading = true;

    try {
      // PAYLOAD PARENT AND TARGET DTO
      const createBusinessDto = {
        createBusinessDto: {
          ...this.business,
          status: 'draft'
        },
      };

      // ENCRYPT HTML TO BASE64
      createBusinessDto.createBusinessDto.sections = this.business.sections.map(
        (section) => {
          const {_id, ...pickedSection} = section
          pickedSection.grids = mapToCreateGridsDto(section.grids)
          pickedSection.gallery = mapToCreateGalleryDto(section.gallery)
          pickedSection.accordion = mapToCreateAccordionDto(section.accordion)

          return {
            ...pickedSection,
            text: section.text ? encrypt(section.text) : '',
          }
        }
      );

      // CREATE BUSINESS
      const { data } = await this.$apollo.mutate({
        mutation: CREATE_BUSINESS,
        variables: createBusinessDto,
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
    
  public makeid(length:number) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
  }
  
  // EMIT EVENT NEW SECTION
  public newSection(section: SectionTypeInterface) {
    this.business.sections = [
      ...this.business.sections,
      {
        ...section,
        _id: section._id?? this.makeid(8),
        position: this.business.sections.length + 1,
      },
    ];
  }

  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.business.sections[section.position - 1] = section;
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
    newSections = [...this.business.sections];

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0];

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected);

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 };
    });

    // REASSIGN BUSINESS TO TRIGGER REACTIVITY
    this.business.sections = newSections;
  }

  // EMIT EVENT REMOVE SECTION
  public removeSection(position: number) {
    this.business.sections.splice(position - 1, 1);
    // REFRESH POSITION
    this.business.sections = this.business.sections.map((section, index) => {
      return {
        ...section,
        position: index + 1,
      };
    });
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number; card: TypeCard }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.cards = [...getSection.cards, section.card];
  }

  // EMIT EVENT UPDATE CARD SECTION
  public updateCardSection(section: {
    position: number;
    index: number;
    card: TypeCard;
  }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.cards[section.index] = { ...section.card };
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number; index: number }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.cards.splice(section.index, 1);
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: {
    position: number;
    attachments: TypeAttachment[];
  }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.attachments = [...getSection.attachments, ...section.attachments];
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public updateAttachmentSection(section: {
    position: number;
    index: number;
    attachment: TypeAttachment;
  }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.attachments[section.index] = { ...section.attachment };
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number; index: number }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.attachments.splice(section.index, 1);
  }

  // EMIT SET DATA TABLE SECTION
  public setDataTable(section: { position: number, headers: Array<string>, columns: Array<TableColumnInterface[]> }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.table = {
      ...getSection.table,
      headers: section.headers,
      columns: section.columns
    }
  }

  ////////////
  /// GETS ///
  ///////////

  // VALIDATE IMAGES AND FORM
  public get invalidImages(): boolean {
    return (
      !String(this.business.bannerImageDetail?.image ?? '').trim() || 
      !String(this.business.thumbnailImageDetail?.image ?? '').trim() || 
      !String(this.business.responsiveImageDetail?.image ?? '').trim()
    );
  }

  // VALID CREATE POST
  public get validCreatePost(): boolean {
    return (
      this.business.title === "" ||
      this.business.excerpt === "" ||
      this.business.subtitle === "" ||
      this.business.description === "" ||
      !String(this.business.bannerImageDetail?.image ?? '').trim()
    );
  }

  public updateSlug() {
    this.business.slug = toSlug(this.business.title.toLowerCase());
  }

  // GO PREVIEW
  public async goPreview() {
    // FIRST CREATE BUSINESS STATUS DRAFT
    const post = await this.createBusinessDraft();

    // GO EDIT AFTER CREATE POST
    this.$router.push(`/business/post/update/${post.createBusiness._id}`);

    // GO PREVIEW BEFORE CREATE PRODUCT
    const route = this.$router.resolve({
      path: '/previews/post',
      query: {
        postID: post.createBusiness._id,
        postType: 'business'
      }
    });
    window.open(route.href, '_blank');
  }

  // SAVE ITEM
  public async saveBusinessDraft() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const post = await this.createBusinessDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/business/post/update/${post.createBusiness._id}`)
  }
}
export default BusinessCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
    <!-- BANNER THUMBNAIL IMAGE -->
    <v-col cols="3">
      <detailed-image-component color="#00a44f" rounded="xl" height="340" v-model="business.thumbnailImageDetail" :legacy-image="business.thumbnail" text="Cargar Miniatura"></detailed-image-component>
    </v-col>

    <v-col cols="7">
      <!-- BANNER LARGE IMAGE -->
      <detailed-image-component color="#00a44f" rounded="xl" height="160" v-model="business.bannerImageDetail" :legacy-image="business.banner" text="Cargar Banner" class="mt-2"></detailed-image-component>

      <!-- BANNER RESPONSIVE IMAGE -->
      <detailed-image-component color="#00a44f" rounded="xl" height="160" v-model="business.responsiveImageDetail" :legacy-image="business.responsive" text="Cargar Banner Responsive" class="mt-2"></detailed-image-component>
    </v-col>

    <!-- FORM CATEGORY -->
    <v-col cols="10">
      <v-form v-model="valid" lazy-validation>
        <v-row justify="center">
          <v-col cols="4">
            <v-text-field v-model="business.title" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Titulo" @change="updateSlug" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="business.slug" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Slug" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="business.subtitle" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Subtitulo" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="business.link" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Link" />
          </v-col>
          <v-col cols="6">
            <v-select v-model="business.category" prepend-inner-icon="mdi-apps" density="compact" variant="solo"
              rounded="xl" :items="categories" item-value="_id" item-title="name" label="Categoría" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="business.excerpt" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Extracto" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="business.description" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Description" />
          </v-col>
        </v-row>
      </v-form>
    </v-col>
    <v-col cols="12" class="pb-15 mb-15">
      <section-component @removeCardSection="removeCardSection" @updateCardSection="updateCardSection"
        @createNewCardSection="createNewCardSection" @newSection="newSection" @editSection="editSection"
        @removeSection="removeSection" @createNewAttachmentSection="createNewAttachmentSection"
        @updateAttachmentSection="updateAttachmentSection" @removeAttachmentSection="removeAttachmentSection"
        @changePositionSection="changePositionSection" @setDataTable="setDataTable" :sections="business.sections" />
    </v-col>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn @click="createBusiness()" :disabled="validCreatePost || validImages" :loading="loading">
        <v-icon>
          mdi-upload
        </v-icon>
        Crear Post
      </v-btn>
      <v-btn @click="saveBusinessDraft()" :disabled="validCreatePost" :loading="loading">
        <v-icon>
          mdi-content-save
        </v-icon>
        Guardar
      </v-btn>
      <v-btn @click="goPreview()" :disabled="validCreatePost" :loading="loading">
        <v-icon>
          mdi-eye
        </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->

  </v-row>

  <!-- UPLOAD IMAGE -->
  <v-file-input ref="bannerBusinessImage" class="d-none" accept=".jpg, .jpeg, .png"
    @update:model-value="getBusinessImage" />
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
