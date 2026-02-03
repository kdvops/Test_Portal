<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";
import SeoPostsComponent from "~/components/seo/posts/index.vue";
import DetailedImageComponent from "~/components/detailed-image/index.vue";

// IMPORT INTERFACE
import type { TargetPostInterface } from "~/interfaces/target-post.interface";
import type {
  SectionTypeInterface,
  TableColumnInterface,
  TypeAttachment,
  TypeCard,
} from "~/interfaces/sections.interface";
import type {
  CategoriesInterface,
  NewPictureCategory,
} from "~/interfaces/categories.interface";

// IMPORT MUTATIONS
import { CREATE_TARGET_POST } from "~/graphql/mutations/target-post.mutation";

// IMPORT QUERY'S
import {
  GET_CATEGORIES_BY_TARGET_ID,
  GET_CATEGORIES_BY_TARGET,
} from "~/graphql/query/categories.query";

// IMPORT COMPOSABLES
import { useTargetManager, targetStatic } from "~/composables/useTargetManager";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import {
  mapToCreateAccordionDto,
  mapToCreateGalleryDto,
  mapToCreateGridDto,
  mapToCreateGridsDto,
} from "~/interfaceMap/dtoMapping";

// IMPORT CRYPTO UTILS
import { encrypt } from "~/utils/cryptoUtils";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "target-post-create-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    "seo-posts-component": SeoPostsComponent,
    "detailed-image-component": DetailedImageComponent,
  },
})
class TargetPostCreateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // CATEGORY REF
  @Ref("bannerPostImage") bannerPostImage!: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // TARGET PARAM
  public targetParam: any = useRoute().params.target;

  // ROUTE INSTANCE
  public route: any = useRoute();

  // APOLLO INSTANCE
  public override $apollo: any;

  // TARGET MANAGER
  public targetManager = useTargetManager();

  // TARGET IMAGE
  public targetImage: string = "banner";

  // NEW PICTURE FOR BANNER RESPONSIVE
  public newUploadBannerResponsive: Array<NewPictureCategory> = [];

  // NEW PICTURE FOR BANNER
  public newUploadBanner: Array<NewPictureCategory> = [];

  // NEW THUMBNAIL FOR THUMBNAIL
  public newUploadThumbnail: Array<NewPictureCategory> = [];

  // SECTIONS CARDS DEFAULT VALUES
  public post: TargetPostInterface = {
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
    structuredType: "Article",
    schemaMarkup: "",
    isFeatured: false,
  };

  // CATEGORIES BY TARGET
  public categories: Array<CategoriesInterface> = [];

  // VALID FORM
  public valid: boolean = false;

  // LOADING DEFAULT VALUES
  public loading: boolean = false;

  // FLAG TO PREVENT MULTIPLE PRE-SELECTION ATTEMPTS
  private categoryPreSelected: boolean = false;

  ///////////////
  /// METHODS ///
  ///////////////

  public created() {
    // SET CATEGORIES
    this.setCategoriesByTargetId();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  // PRE-SELECT CATEGORY FROM QUERY PARAMETER
  public async preSelectCategoryFromQuery() {
    // PREVENT MULTIPLE EXECUTIONS
    if (this.categoryPreSelected) {
      return;
    }

    try {
      const categoryIdFromQuery = this.route.query.categoryId as string;

      if (!categoryIdFromQuery) {
        return;
      }

      // WAIT FOR CATEGORIES TO BE LOADED (MAX 5 RETRIES)
      let retries = 0;
      while (this.categories.length === 0 && retries < 5) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        retries++;
      }

      if (this.categories.length === 0) {
        console.warn("Categories not loaded after retries");
        return;
      }

      // NORMALIZE QUERY ID
      const normalizedQueryId = String(categoryIdFromQuery).trim();

      // FIND CATEGORY IN THE LIST
      const foundCategory = this.categories.find((cat: any) => {
        if (!cat || !cat._id) return false;
        const categoryId = String(cat._id).trim();
        return categoryId === normalizedQueryId;
      });

      if (foundCategory && foundCategory._id) {
        // MARK AS PRE-SELECTED
        this.categoryPreSelected = true;

        // SET CATEGORY
        this.post.category = foundCategory._id;

        // WAIT FOR REACTIVITY
        await this.$nextTick();

        // VERIFY IT WAS SET CORRECTLY
        if (
          String(this.post.category).trim() !== String(foundCategory._id).trim()
        ) {
          this.post.category = foundCategory._id;
          await this.$nextTick();
        }

        // SHOW SNACKBAR TO CONFIRM
        this.$bus.$emit("showSnackbar", {
          text: `Categoría "${foundCategory.name}" pre-seleccionada`,
          color: "info",
          timeout: 3000,
        });
      } else {
        // IF CATEGORY NOT FOUND IN LIST, STILL ASSIGN IT (FOR GLOBAL CATEGORIES)
        // VALIDATE IT'S A VALID OBJECTID
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(normalizedQueryId);
        if (isValidObjectId) {
          this.categoryPreSelected = true;
          this.post.category = normalizedQueryId;

          // WAIT FOR REACTIVITY
          await this.$nextTick();

          // SHOW SNACKBAR TO CONFIRM
          this.$bus.$emit("showSnackbar", {
            text: "Categoría global pre-seleccionada",
            color: "info",
            timeout: 3000,
          });
        } else {
          console.warn("Category not found in list and invalid ObjectId:", {
            categoryIdFromQuery: normalizedQueryId,
            categoriesCount: this.categories.length,
            categoryIds: this.categories.map((cat: any) =>
              String(cat._id || "").trim()
            ),
          });
        }
      }
    } catch (err) {
      console.error("Error pre-selecting category:", err);
    }
  }

  // SET CATEGORIES
  public async setCategoriesByTargetId() {
    try {
      let categoriesData: any[] = [];

      // CHECK IF TARGET IS STATIC OR DYNAMIC
      const isStaticTarget = Object.keys(targetStatic).some(
        (key) =>
          targetStatic[key] === this.targetParam || key === this.targetParam
      );

      if (isStaticTarget) {
        // USE STATIC TARGET QUERY
        const targetValue = targetStatic[this.targetParam] || this.targetParam;
        const { data } = await this.$apollo.query({
          query: GET_CATEGORIES_BY_TARGET,
          variables: {
            target: targetValue,
          },
          fetchPolicy: "no-cache",
        });
        categoriesData = data.findCategoryByTarget || [];
      } else {
        // USE DYNAMIC TARGET ID QUERY (ONLY IF IT'S A VALID OBJECTID)
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(this.targetParam);
        if (isValidObjectId) {
          const { data } = await this.$apollo.query({
            query: GET_CATEGORIES_BY_TARGET_ID,
            variables: {
              targetId: this.targetParam,
            },
            fetchPolicy: "no-cache",
          });
          categoriesData = data.findCategoriesByTargetId || [];
        } else {
          // TRY TO GET CATEGORIES USING TARGET MANAGER
          categoriesData = await this.targetManager.getCategoriesForTarget(
            this.$apollo,
            this.targetParam
          );
        }
      }

      // SET CATEGORIES TO VARIABLE
      this.categories = categoriesData;

      // WAIT FOR NEXT TICK TO ENSURE CATEGORIES ARE REACTIVE
      await this.$nextTick();

      // PRE-SELECT CATEGORY FROM QUERY PARAMETER
      await this.preSelectCategoryFromQuery();
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
    const imageRefs: any = this.bannerPostImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // CLICK IMAGE
    imageRefs.click();
  }

  // GET IMAGE FILE AND SET IN BANNER OR THUMBNAIL
  public getPostImage(file: File) {
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
  public async createPost() {
    // SET LOADING FALSE
    this.loading = true;

    try {
      // VALIDATE CATEGORY
      const categoryId = String(this.post.category || "").trim();
      if (!categoryId) {
        // TRY TO GET FROM QUERY PARAMETER
        const categoryIdFromQuery = String(
          this.route.query.categoryId || ""
        ).trim();
        if (categoryIdFromQuery) {
          this.post.category = categoryIdFromQuery;
        } else {
          throw new Error("Debe seleccionar una categoría para el post");
        }
      }

      // VALIDATE OBJECTID FORMAT
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(
        String(this.post.category).trim()
      );
      if (!isValidObjectId) {
        throw new Error("La categoría seleccionada no es válida");
      }

      // PAYLOAD PARENT AND TARGET DTO
      const createPostDto = {
        createPostDto: {
          ...this.post,
          category: String(this.post.category).trim(),
          status: "publish",
          banner: this.newUploadBanner,
          thumbnail: this.newUploadThumbnail,
          responsive: this.newUploadBannerResponsive,
        },
      };

      // ENCRYPT HTML TO BASE64
      createPostDto.createPostDto.sections = this.post.sections.map(
        (section) => {
          const { _id, ...pickedSection } = section;
          pickedSection.grids = mapToCreateGridsDto(section.grids);
          pickedSection.gallery = mapToCreateGalleryDto(section.gallery);
          pickedSection.accordion = mapToCreateAccordionDto(section.accordion);

          return {
            ...pickedSection,
            text: section.text ? encrypt(section.text) : "",
          };
        }
      );

      // CREATE BUSINESS
      await this.$apollo.mutate({
        mutation: CREATE_TARGET_POST,
        variables: createPostDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO LIST
      this.$router.push(`/targets/${this.targetParam}/post/list`);

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
  public async createPostDraft() {
    // SET LOADING FALSE
    this.loading = true;

    try {
      // VALIDATE CATEGORY
      const categoryId = String(this.post.category || "").trim();
      if (!categoryId) {
        // TRY TO GET FROM QUERY PARAMETER
        const categoryIdFromQuery = String(
          this.route.query.categoryId || ""
        ).trim();
        if (categoryIdFromQuery) {
          this.post.category = categoryIdFromQuery;
        } else {
          throw new Error("Debe seleccionar una categoría para el post");
        }
      }

      // VALIDATE OBJECTID FORMAT
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(
        String(this.post.category).trim()
      );
      if (!isValidObjectId) {
        throw new Error("La categoría seleccionada no es válida");
      }

      // PAYLOAD PARENT AND TARGET DTO
      const createPostDto = {
        createPostDto: {
          ...this.post,
          category: String(this.post.category).trim(),
          status: "draft",
          banner: this.newUploadBanner,
          thumbnail: this.newUploadThumbnail,
          responsive: this.newUploadBannerResponsive,
        },
      };

      // ENCRYPT HTML TO BASE64
      createPostDto.createPostDto.sections = this.post.sections.map(
        (section) => {
          const { _id, ...pickedSection } = section;
          pickedSection.grids = mapToCreateGridsDto(section.grids);
          pickedSection.gallery = mapToCreateGalleryDto(section.gallery);
          pickedSection.accordion = mapToCreateAccordionDto(section.accordion);

          return {
            ...pickedSection,
            text: section.text ? encrypt(section.text) : "",
          };
        }
      );

      // CREATE BUSINESS
      const { data } = await this.$apollo.mutate({
        mutation: CREATE_TARGET_POST,
        variables: createPostDto,
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
    this.post.sections = [
      ...this.post.sections,
      {
        ...section,
        _id: section._id ?? this.makeid(8),
        position: this.post.sections.length + 1,
      },
    ];
  }

  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.post.sections[section.position - 1] = section;
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
    newSections = [...this.post.sections];

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0];

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected);

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 };
    });

    // REASSIGN BUSINESS TO TRIGGER REACTIVITY
    this.post.sections = newSections;
  }

  // EMIT EVENT REMOVE SECTION
  public removeSection(position: number) {
    this.post.sections.splice(position - 1, 1);
    // REFRESH POSITION
    this.post.sections = this.post.sections.map((section, index) => {
      return {
        ...section,
        position: index + 1,
      };
    });
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number; card: TypeCard }) {
    const getSection = this.post.sections[section.position - 1];
    getSection.cards = [...getSection.cards, section.card];
  }

  // EMIT EVENT UPDATE CARD SECTION
  public updateCardSection(section: {
    position: number;
    index: number;
    card: TypeCard;
  }) {
    const getSection = this.post.sections[section.position - 1];
    getSection.cards[section.index] = { ...section.card };
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number; index: number }) {
    const getSection = this.post.sections[section.position - 1];
    getSection.cards.splice(section.index, 1);
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: {
    position: number;
    attachments: TypeAttachment[];
  }) {
    const getSection = this.post.sections[section.position - 1];
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
    const getSection = this.post.sections[section.position - 1];
    getSection.attachments[section.index] = { ...section.attachment };
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number; index: number }) {
    const getSection = this.post.sections[section.position - 1];
    getSection.attachments.splice(section.index, 1);
  }

  // EMIT SET DATA TABLE SECTION
  public setDataTable(section: {
    position: number;
    headers: Array<string>;
    columns: Array<TableColumnInterface[]>;
  }) {
    const getSection = this.post.sections[section.position - 1];
    getSection.table = {
      ...getSection.table,
      headers: section.headers,
      columns: section.columns,
    };
  }

  ////////////
  /// GETS ///
  ///////////

  // VALIDATE IMAGES AND FORM
  public get validImages(): boolean {
    return (
      this.newUploadBanner.length > 0 &&
      this.newUploadThumbnail.length > 0 &&
      this.newUploadBannerResponsive.length > 0
    );
  }

  // VALID CREATE POST
  public get validCreatePost(): boolean {
    return (
      this.post.title === "" ||
      this.post.excerpt === "" ||
      this.post.subtitle === "" ||
      this.post.description === "" ||
      this.newUploadBanner.length === 0
    );
  }

  public updateSlug() {
    this.post.slug = toSlug(this.post.title.toLowerCase());
  }

  // GO PREVIEW
  public async goPreview() {
    // FIRST CREATE BUSINESS STATUS DRAFT
    const post = await this.createPostDraft();

    // GO EDIT AFTER CREATE POST
    this.$router.push(
      `/targets/${this.targetParam}/post/update/${post.createPost._id}`
    );

    // GO PREVIEW BEFORE CREATE PRODUCT
    const route = this.$router.resolve({
      path: "/previews/post",
      query: {
        postID: post.createPost._id,
        postType: "target_post",
      },
    });
    window.open(route.href, "_blank");
  }

  // SAVE ITEM
  public async savePostDraft() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const post = await this.createPostDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(
      `/targets/${this.targetParam}/post/update/${post.createPost._id}`
    );
  }
}
export default TargetPostCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
    <!-- BANNER IMAGE CATEGORY -->
    <v-col cols="3">
      <!-- HOVER IMAGE -->
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="340"
        v-model="post.thumbnailImageDetail"
        :legacy-image="post.thumbnail"
        text="Cargar Miniatura"
      ></detailed-image-component>
    </v-col>

    <v-col cols="7">
      <detailed-image-component
        rounded="xl"
        height="160"
        v-model="post.bannerImageDetail"
        :legacy-image="post.banner"
        text="Cargar Banner"
        class="mt-2"
      ></detailed-image-component>
      <detailed-image-component
        rounded="xl"
        height="160"
        v-model="post.responsiveImageDetail"
        :legacy-image="post.responsive"
        text="Cargar Banner Responsive"
        class="mt-2"
      ></detailed-image-component>
    </v-col>

    <!-- FORM CATEGORY -->
    <v-col cols="10">
      <v-form v-model="valid" lazy-validation>
        <v-row justify="center">
          <v-col cols="4">
            <v-text-field
              v-model="post.title"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Titulo"
              @change="updateSlug"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="post.slug"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Slug"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="post.subtitle"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Subtitulo"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="post.link"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Link"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="post.publishedAt"
              prepend-inner-icon="mdi-apps"
              density="compact"
              variant="solo"
              rounded="xl"
              type="date"
              label="Fecha de publicación"
            />
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="post.category"
              prepend-inner-icon="mdi-apps"
              density="compact"
              variant="solo"
              rounded="xl"
              :items="categories"
              item-value="_id"
              item-title="name"
              label="Categoría"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="post.excerpt"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Extracto"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="post.description"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Description"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-col>

    <!-- SEO SECTION -->
    <v-col cols="10" class="pa-3">
      <seo-posts-component :post="post" />
    </v-col>

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
        :sections="post.sections"
      />
    </v-col>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <!-- :disabled="validCreatePost || !validImages" -->
      <v-btn @click="createPost()" :loading="loading">
        <v-icon> mdi-upload </v-icon>
        Crear Post
      </v-btn>
      <!-- :disabled="validCreatePost" -->
      <v-btn @click="savePostDraft()" :loading="loading">
        <v-icon> mdi-content-save </v-icon>
        Guardar
      </v-btn>
      <!-- :disabled="validCreatePost" -->
      <v-btn @click="goPreview()" :loading="loading">
        <v-icon> mdi-eye </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->
  </v-row>

  <!-- UPLOAD IMAGE -->
  <v-file-input
    ref="bannerPostImage"
    class="d-none"
    accept=".jpg, .jpeg, .png"
    @update:model-value="getPostImage"
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
