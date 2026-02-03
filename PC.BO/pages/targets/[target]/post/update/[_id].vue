<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";
import SeoPostsComponent from "~/components/seo/posts/index.vue";

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
import { UPDATE_TARGET_POST } from "~/graphql/mutations/target-post.mutation";

// IMPORT QUERY'S
import { GET_CATEGORIES_BY_TARGET_ID } from "~/graphql/query/categories.query";
import { GET_POST_BY_ID } from "~/graphql/query/target-post.query";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import {
  mapToCreateAccordionDto,
  mapToCreateGalleryDto,
  mapToCreateGridDto,
  mapToCreateGridsDto,
  mapToUpdateAccordionDto,
  mapToUpdateGalleryDto,
  mapToUpdateGridsDto,
} from "~/interfaceMap/dtoMapping";
import _ from "lodash";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "target-post-update-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    "seo-posts-component": SeoPostsComponent,
    "detailed-image-component": DetailedImageComponent,
  },
})
class TargetPostUpdateScreen extends Vue {
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

  // POST ID PARAM
  public postId: any = useRoute().params._id;

  // APOLLO INSTANCE
  public override $apollo: any;

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

  ///////////////
  /// METHODS ///
  ///////////////

  public async created() {
    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });

    // SET CATEGORIES
    this.setCategoriesByTargetId();

    // LOAD POST DATA
    await this.setPostById();
  }

  // SET CATEGORIES
  public async setCategoriesByTargetId() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET_ID,
        variables: {
          targetId: this.targetParam,
        },
        fetchPolicy: "no-cache",
      });

      // SET CATEGORIES TO VARIABLE
      this.categories = data.findCategoriesByTargetId;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET POST BY ID
  public async setPostById() {
    try {
      // GET POST BY ID
      const { data } = await this.$apollo.query({
        query: GET_POST_BY_ID,
        variables: {
          postId: this.postId,
        },
        fetchPolicy: "no-cache",
      });

      // SET POST DATA
      const postData = data.findPostById;
      this.post = {
        ...postData,
        category: postData.category._id,
        sections: postData.sections.map((section: any) => ({
          ...section,
          text: section.text ? decrypt(section.text) : "",
        })),
      };
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

  // UPDATE POST
  public async updatePost() {
    // SET LOADING TRUE
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const postClean = _.omit(this.post, [
        "_id",
        "__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanPostClean = postClean.sections?.map((section: any) => {
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
      });

      // UPDATE POST
      await this.$apollo.mutate({
        mutation: UPDATE_TARGET_POST,
        variables: {
          updatePostDto: {
            postID: this.postId,
            post: {
              ...postClean,
              status: "publish",
              sections: sectionCleanPostClean,
            },
            newUploadBanner: this.newUploadBanner,
            newUploadThumbnail: this.newUploadThumbnail,
            newUploadResponsive: this.newUploadBannerResponsive,
          },
        },
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO LIST
      this.$router.push(`/targets/${this.targetParam}/post/list`);

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Post actualizado correctamente!",
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

  // UPDATE POST DRAFT
  public async updatePostDraft() {
    // SET LOADING TRUE
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const postClean = _.omit(this.post, [
        "_id",
        "__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanPostClean = postClean.sections?.map((section: any) => {
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
      });

      // UPDATE POST
      const { data } = await this.$apollo.mutate({
        mutation: UPDATE_TARGET_POST,
        variables: {
          updatePostDto: {
            postID: this.postId,
            post: {
              ...postClean,
              status: "draft",
              sections: sectionCleanPostClean,
            },
            newUploadBanner: this.newUploadBanner,
            newUploadThumbnail: this.newUploadThumbnail,
            newUploadResponsive: this.newUploadBannerResponsive,
          },
        },
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
      (this.newUploadBanner.length > 0 || this.post.banner) &&
      (this.newUploadThumbnail.length > 0 || this.post.thumbnail) &&
      (this.newUploadBannerResponsive.length > 0 || this.post.responsive)
    );
  }

  // VALID UPDATE POST
  public get validCreatePost(): boolean {
    return (
      this.post.title === "" ||
      this.post.excerpt === "" ||
      this.post.subtitle === "" ||
      this.post.description === "" ||
      (this.newUploadBanner.length === 0 && !this.post.banner)
    );
  }

  public updateSlug() {
    this.post.slug = toSlug(this.post.title.toLowerCase());
  }

  // GO PREVIEW
  public async goPreview() {
    // FIRST UPDATE POST STATUS DRAFT
    await this.updatePostDraft();

    // GO PREVIEW
    const route = this.$router.resolve({
      path: "/previews/post",
      query: {
        postID: this.postId,
        postType: "post",
      },
    });
    window.open(route.href, "_blank");
  }

  // SAVE ITEM
  public async savePostDraft() {
    // UPDATE POST STATUS DRAFT
    await this.updatePostDraft();

    // SHOW SNACKBAR
    this.$bus.$emit("showSnackbar", {
      text: "Post guardado correctamente!",
      color: "success",
      timeout: 6000,
    });
  }
}
export default TargetPostUpdateScreen;
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
    <!-- :disabled="validCreatePost || !validImages" -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn @click="updatePost()" :loading="loading">
        <v-icon> mdi-upload </v-icon>
        Actualizar Post
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
