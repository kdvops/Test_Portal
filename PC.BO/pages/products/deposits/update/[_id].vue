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
import { GET_PRODUCT_BY_ID } from "~/graphql/query/products.query";

// IMPORT MUTATIONS
import { UPDATE_PRODUCT } from "~/graphql/mutations/products.mutation";

// IMPORT LODASH
import _ from "lodash";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import { mapToUpdateAccordionDto, mapToUpdateGalleryDto, mapToUpdateGridDto, mapToUpdateGridsDto } from "~/interfaceMap/dtoMapping";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "products-deposits-update-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    'detailed-image-component': DetailedImageComponent
  },
})
class ProductsDepositsUpdateScreen extends Vue {
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

  // GET PARAM CATEGORY ID
  public productID = useRoute().params._id;

  // VALID FORM
  public valid: boolean = false;

  // LOADING
  public loading: boolean = false;

  // CATEGORIES DEFAULT VALUES
  public categories: Array<CategoriesInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setCategoriesByTargetAndParentTarget();
    this.setProductCardById();

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
          parentTarget: "category::deposits",
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

  // SET PRODUCT CARD BY ID
  public async setProductCardById() {
    try {
      // PAYLOAD BY ID
      const productID = {
        productId: this.productID,
      };

      // GET PRODUCT BY ID
      const { data } = await this.$apollo.query({
        query: GET_PRODUCT_BY_ID,
        variables: productID,
        fetchPolicy: "no-cache",
      });

      // SET PRODUCT
      const product = data.findProductById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = product.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : "",
        };
      });

      // SET PRODUCT TO VARIABLE
      this.product = { ...product, sections };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE PRODUCT CARD
  public async updateProductDeposit() {
    // SET LOADING
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const productClean = _.omit(this.product, [
        "_id",
        "__typename",
        "category.__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanProduct = productClean.sections.map((section: any) => {
        let cleanSection = _.omit(section, [
          "__typename",
          "image.__typename",
          "cards.__typename",
          "attachments.__typename",
          "banner.__typename",
          "banner.button.__typename",
          "banner.title.__typename",
          "banner.description.__typename",
          'table.__typename'
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
        cleanSection._id = section._id? section._id.length >= 9? section._id:null: null,
        cleanSection.grids = mapToUpdateGridsDto(section.grids)
        cleanSection.gallery = mapToUpdateGalleryDto(section.gallery)
        cleanSection.accordion = mapToUpdateAccordionDto(section.accordion)
        return cleanSection;
      });

      // PRODUCT FINAL
      const productFinal = {
        ...productClean,
        status: 'publish',
        category: productClean.category._id,
        sections: sectionCleanProduct,
      };

      // PAYLOAD UPDATE PRODUCT
      const updateProductDto = {
        updateProductDto: {
          productID: this.productID,
          product: productFinal
        },
      };

      await this.$apollo.mutate({
        mutation: UPDATE_PRODUCT,
        variables: updateProductDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING
      this.loading = false;

      // GO TO LIST
      this.$router.push("/products/deposits/list");

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

  // UPDATE PRODUCT CARD
  public async updateProductDraft() {
    // SET LOADING
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const productClean = _.omit(this.product, [
        "_id",
        "__typename",
        "category.__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanProduct = productClean.sections.map((section: any) => {
        let cleanSection = _.omit(section, [
          "__typename",
          "image.__typename",
          "cards.__typename",
          "attachments.__typename",
          "banner.__typename",
          "banner.button.__typename",
          "banner.title.__typename",
          "banner.description.__typename",
          'table.__typename'
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
        cleanSection._id = section._id? section._id.length >= 9? section._id:null: null,
        cleanSection.grids = mapToUpdateGridsDto(section.grids)
        cleanSection.gallery = mapToUpdateGalleryDto(section.gallery)
        cleanSection.accordion = mapToUpdateAccordionDto(section.accordion)
        return cleanSection;
      });

      // PRODUCT FINAL
      const productFinal = {
        ...productClean,
        status: 'draft',
        category: productClean.category._id,
        sections: sectionCleanProduct,
      };

      // PAYLOAD UPDATE PRODUCT
      const updateProductDto = {
        updateProductDto: {
          productID: this.productID,
          product: productFinal
        },
      };

      const { data } = await this.$apollo.mutate({
        mutation: UPDATE_PRODUCT,
        variables: updateProductDto,
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
    const getSection = this.product.sections[section.position - 1];
    getSection.cards[section.index] = { ...section.card, status: section.card._id ? 'update' : 'create' }
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number; index: number }) {
    const getSection = this.product.sections[section.position - 1];
    const getCard = getSection.cards[section.index];

    // VALIDATE IF CARD IS NEW
    if (getCard.status === "create") {
      getSection.cards.splice(section.index, 1);
    } else {
      getSection.cards[section.index] = { ...getCard, status: "remove" };
    }
  }

   // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: { position: number, attachments: TypeAttachment[] }) {
    const getSection = this.product.sections[section.position - 1];
    const attachmentsCreateMap: TypeAttachment[] = section.attachments.map(attachment => ({
      ...attachment,
      status: 'create'
    }));

    // ADD NEW ATTACHMENTS
    getSection.attachments = [
      ...getSection.attachments,
      ...attachmentsCreateMap
    ];
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public updateAttachmentSection(section: {
    position: number;
    index: number;
    attachment: TypeAttachment;
  }) {
    const getSection = this.product.sections[section.position - 1];
    getSection.attachments[section.index] = {
      ...section.attachment,
      status: section.attachment._id ? 'update' : 'create',
    };
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number; index: number }) {
    const getSection = this.product.sections[section.position - 1];
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
  
  public updateSlug(){
    this.product.slug = toSlug(this.product.name.toLowerCase())
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

  // SAVE ITEM
  public async saveProductDraft() {
    // FIRST UPDATE PRODUCT STATUS DRAFT
    await this.updateProductDraft();

    // REFRESH ROUTE
    window.location.reload();
  }

  public async goPreview() {
    // UPDATE ALL CHANGE
    await this.updateProductDraft()

    // GO PREVIEW CATEGORY
    const route = this.$router.resolve({ path: `/previews/products/item/${this.productID}` });
    window.open(route.href, '_blank');

    // REFRESH ROUTE
    window.location.reload();
  }
}
export default ProductsDepositsUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
    <!-- BANNER IMAGE CATEGORY -->
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
          <v-col cols="12">
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
      <v-btn position="absolute" rounded="xl"
        :base-color="product.status && product.status === 'draft' ? 'orange' : 'green'"
        style="height: 30px; top: 15px; left: 10px" variant="tonal" readonly>
        {{ product.status && product.status === 'draft' ? 'Borrador' : 'Publicado' }}
      </v-btn>
      <v-btn @click="updateProductDeposit()" :disabled="!valid || product.sections.length === 0" :loading="loading">
        <v-icon>
          mdi-upload
        </v-icon>
        Actualizar y publicar
      </v-btn>
      <v-btn @click="saveProductDraft()" :disabled="!valid" :loading="loading">
        <v-icon>
          mdi-content-save
        </v-icon>
        Guardar borrador
      </v-btn>
      <v-btn @click="goPreview()" :disabled="loading">
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
