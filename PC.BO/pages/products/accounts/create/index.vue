<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";

// IMPORT INTERFACE
import type {
  ProductsInterface,
  SectionTypeInterface,
  TableColumnInterface,
  TypeAttachment,
  TypeCard,
  UploadFileItem,
} from "~/interfaces/sections.interface";
import type { CategoriesInterface, NewPictureCategory } from "~/interfaces/categories.interface";

// IMPORT QUERIES
import { GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY } from "~/graphql/query/categories.query";

// IMPORT MUTATIONS
import { CREATE_PRODUCT } from "~/graphql/mutations/products.mutation";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import { mapToCreateAccordionDto, mapToCreateGalleryDto, mapToCreateGridDto, mapToCreateGridsDto } from "~/interfaceMap/dtoMapping";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "products-accounts-create-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    'detailed-image-component': DetailedImageComponent
  },
})
class ProductsAccountsCreateScreen extends Vue {
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

  // SECTIONS CARDS DEFAULT VALUES
  public product: ProductsInterface = {
    name: "",
    description: "",
    slug: "",
    category: "",
    banner: "",
    responsive: "",
    thumbnail: "",
    sections: [],
  };

  // VALID FORM
  public valid: boolean = false;

  // CATEGORIES DEFAULT VALUES
  public categories: Array<CategoriesInterface> = [];

  // LOADING DEFAULT VALUES
  public loading: boolean = false;

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setCategoriesByTargetAndParentTarget();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin",  });
  }

  ///////////////
  /// METHODS ///
  ///////////////


  // SET CATEGORIES BY TARGET AND PARENT KEY
  public async setCategoriesByTargetAndParentTarget() {
    try {
      // PAYLOAD PARENT AND TARGET DTO
      const parentAndTargetDto = {
        parentAndTargetDto: {
          parentTarget: "category::accounts",
          target: "category::products",
        },
      };

      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY,
        variables: parentAndTargetDto,
        fetchPolicy: "no-cache",
      });

      // SET CATEGORIES TO VARIABLE
      this.categories = data.findCategoryByParentAndTarget;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // CREATE PRODUCT CARD
  public async createProductAccount() {
    // SET LOADING FALSE
    this.loading = true;

    try {
      // ENCRYPT HTML TO BASE64
      this.product.sections = this.product.sections.map((section) => {
        const {_id, ...pickedSection} = section
        pickedSection.grids = mapToCreateGridsDto(section.grids)
        pickedSection.gallery = mapToCreateGalleryDto(section.gallery)
        pickedSection.accordion = mapToCreateAccordionDto(section.accordion)

        return {
          ...pickedSection,
          text: section.text ? encrypt(section.text) : '',
        }
      });

      // PAYLOAD PARENT AND TARGET DTO
      const createProductDto = {
        createProductDto: {
          ...this.product,
          status: 'publish',
        },
      };

      // CREATE PRODUCT
      await this.$apollo.mutate({
        mutation: CREATE_PRODUCT,
        variables: createProductDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO LIST
      this.$router.push("/products/accounts/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Producto creado correctamente!",
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

  // CREATE PRODUCT DRAFT
  public async createProductDraft() {
    // SET LOADING FALSE
    this.loading = true;

    try {
      // ENCRYPT HTML TO BASE64
      this.product.sections = this.product.sections.map((section) => {
        const {_id, ...pickedSection} = section
        pickedSection.grids = mapToCreateGridsDto(section.grids)
        pickedSection.gallery = mapToCreateGalleryDto(section.gallery)
        pickedSection.accordion = mapToCreateAccordionDto(section.accordion)

        return {
          ...pickedSection,
          text: section.text ? encrypt(section.text) : '',
        }
      });

      // PAYLOAD PARENT AND TARGET DTO
      const createProductDto = {
        createProductDto: {
          ...this.product,
          status: 'draft',
        },
      };

      // CREATE PRODUCT
      const { data } = await this.$apollo.mutate({
        mutation: CREATE_PRODUCT,
        variables: createProductDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      return data
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
    this.product.sections = [
      ...this.product.sections,
      {
        ...section,
        _id: section._id?? this.makeid(8),
        position: this.product.sections.length + 1,
      },
    ];
  }

  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.product.sections[section.position - 1] = section;
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
    newSections = [...this.product.sections];

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0];

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected);

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 };
    });

    // REASSIGN PRODUCT TO TRIGGER REACTIVITY
    this.product.sections = newSections;
  }

  // EMIT EVENT REMOVE SECTION
  public removeSection(position: number) {
    this.product.sections.splice(position - 1, 1);
    // REFRESH POSITION
    this.product.sections = this.product.sections.map((section, index) => {
      return {
        ...section,
        position: index + 1,
      };
    });
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number; card: TypeCard }) {
    const getSection = this.product.sections[section.position - 1];
    getSection.cards = [...getSection.cards, section.card];
  }

  // EMIT EVENT UPDATE CARD SECTION
  public updateCardSection(section: {
    position: number;
    index: number;
    card: TypeCard;
  }) {
    const getSection = this.product.sections[section.position - 1];
    getSection.cards[section.index] = { ...section.card };
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number; index: number }) {
    const getSection = this.product.sections[section.position - 1];
    getSection.cards.splice(section.index, 1);
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: {
    position: number;
    attachments: TypeAttachment[];
  }) {
    const getSection = this.product.sections[section.position - 1];
    getSection.attachments = [...getSection.attachments, ...section.attachments];
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public updateAttachmentSection(section: {
    position: number;
    index: number;
    attachment: TypeAttachment;
  }) {
    const getSection = this.product.sections[section.position - 1];
    getSection.attachments[section.index] = { ...section.attachment };
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number; index: number }) {
    const getSection = this.product.sections[section.position - 1];
    getSection.attachments.splice(section.index, 1);
  }

  // EMIT SET DATA TABLE SECTION
  public setDataTable(section: { position: number, headers: Array<string>, columns: Array<TableColumnInterface[]> }) {
    const getSection = this.product.sections[section.position - 1];
    getSection.table = {
      ...getSection.table,
      headers: section.headers,
      columns: section.columns
    }
  }

  // VALIDATE IMAGES AND FORM
  public get invalidImages(): boolean {
    return (
      !String(this.product.bannerImageDetail?.image ?? '').trim() || 
      !String(this.product.thumbnailImageDetail?.image ?? '').trim() || 
      !String(this.product.responsiveImageDetail?.image ?? '').trim()
    );
  }
     
  public updateSlug(){
    this.product.slug = toSlug(this.product.name.toLowerCase())
  }

  // GO PREVIEW
  public async goPreview() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const product = await this.createProductDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/products/accounts/update/${product.createProduct._id}`)

    // GO PREVIEW BEFORE CREATE PRODUCT
    const route = this.$router.resolve({ path: `/previews/products/item/${product.createProduct._id}` });
    window.open(route.href, '_blank');
  }

  // SAVE ITEM
  public async saveProductDraft() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const product = await this.createProductDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/products/accounts/update/${product.createProduct._id}`)
  }
}
export default ProductsAccountsCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
    <!-- BANNER THUMBNAIL IMAGE -->
    <v-col cols="3">
      <detailed-image-component color="#00a44f" rounded="xl" height="340" v-model="product.thumbnailImageDetail" :legacy-image="product.thumbnail" text="Cargar Miniatura"></detailed-image-component>
    </v-col>

    <v-col cols="7">
      <!-- BANNER LARGE IMAGE -->
      <detailed-image-component color="#00a44f" rounded="xl" height="160" v-model="product.bannerImageDetail" :legacy-image="product.banner" text="Cargar Banner" class="mt-2"></detailed-image-component>

      <!-- BANNER RESPONSIVE IMAGE -->
      <detailed-image-component color="#00a44f" rounded="xl" height="160" v-model="product.responsiveImageDetail" :legacy-image="product.responsive" text="Cargar Banner Responsive" class="mt-2"></detailed-image-component>
    </v-col>

    <!-- FORM CATEGORY -->
    <v-col cols="10">
      <v-form v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="6">
            <v-text-field v-model="product.name" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Name" @change="updateSlug"/>
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="product.slug" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Slug" />
          </v-col>
          <v-col cols="12">
            <v-select v-model="product.category" prepend-inner-icon="mdi-apps" density="compact" variant="solo"
              rounded="xl" :items="categories" item-value="_id" item-title="name" label="Category" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="product.description" prepend-inner-icon="mdi-text" density="compact" variant="solo"
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
        @changePositionSection="changePositionSection" @setDataTable="setDataTable" :sections="product.sections" />
    </v-col>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn @click="createProductAccount()"
        :disabled="!valid || !product.category || invalidImages || product.sections.length === 0" :loading="loading">
        <v-icon>
          mdi-upload
        </v-icon>
        Crear
      </v-btn>
      <v-btn @click="saveProductDraft()" :disabled="!valid || !product.category || product.sections.length === 0"
        :loading="loading">
        <v-icon>
          mdi-content-save
        </v-icon>
        Guardar
      </v-btn>
      <v-btn @click="goPreview()" :disabled="!valid || !product.category || product.sections.length === 0"
        :loading="loading">
        <v-icon>
          mdi-eye
        </v-icon>
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
</style>
