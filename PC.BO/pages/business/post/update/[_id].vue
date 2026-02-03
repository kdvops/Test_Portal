<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator"

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";

// IMPORT INTERFACE
import type { BusinessInterface } from "~/interfaces/business.interface";
import type { SectionTypeInterface, TableColumnInterface, TypeAttachment, TypeCard, UploadFileItem } from "~/interfaces/sections.interface";
import type { CategoriesInterface, NewPictureCategory } from "~/interfaces/categories.interface";

// IMPORT QUERIES
import { GET_CATEGORIES_BY_TARGET, GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY } from "~/graphql/query/categories.query";
import { GET_BUSINESS_BY_ID } from "~/graphql/query/business.query";

// IMPORT MUTATIONS
import { UPDATE_BUSINESS } from "~/graphql/mutations/business.mutation";

// IMPORT LODASH
import _ from "lodash";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import { mapToUpdateAccordionDto, mapToUpdateGalleryDto, mapToUpdateGridDto, mapToUpdateGridsDto } from "~/interfaceMap/dtoMapping";
import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'business-update-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'section-component': SectionComponent,
    'detailed-image-component': DetailedImageComponent
  }
})
class BusinessUpdateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // CATEGORY REF
  @Ref('bannerBusinessImage') bannerBusinessImage!: any;

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

  // GET PARAM BUSINESS ID
  public businessID = useRoute().params._id;

  // TARGET IMAGE
  public targetImage: string = 'banner'

  // NEW PICTURE FOR BANNER RESPONSIVE CATEGORY PROFIT
  public newUploadBannerResponsive: Array<NewPictureCategory> = []

  // NEW PICTURE FOR BANNER CATEGORY PROFIT
  public newUploadBanner: Array<NewPictureCategory> = []

  // NEW THUMBNAIL FOR CATEGORY PROFIT
  public newUploadThumbnail: Array<NewPictureCategory> = []

  // SECTIONS CARDS DEFAULT VALUES
  public business: BusinessInterface = {
    title: '',
    excerpt: '',
    subtitle: '',
    link: '',
    description: '',
    category: {
      _id: '',
      name: '',
      excerpt: '',
      description: '',
      pictures: {
        banner: '',
        responsive: '',
        thumbnail: '',
      },
      disabled: false,
      target: 'category::business',
    },
    sections: [],
    banner: '',
    responsive: '',
    thumbnail: '',
    disabled: false,
  }

  // VALID FORM
  public valid: boolean = false;

  // LOADING
  public loading: boolean = false;

  // CATEGORIES BY TARGET
  public categories: Array<CategoriesInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    // SET BUSINESS BY ID
    this.setBusinessById();

    // SET CATEGORIES
    this.setCategories();

    // DEFINE PAGE META
    definePageMeta({ layout: 'admin',  })
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET CATEGORIES
  public async setCategories() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: 'category::business',
        },
        fetchPolicy: 'no-cache'
      })

      // SET CATEGORIES TO VARIABLE
      this.categories = data.findCategoryByTarget

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // OPEN UPLOAD IMAGE
  public selectImage(targetImage: string) {
    // SET TARGET IMAGE
    this.targetImage = targetImage

    // GET REFERENCE IMAGE
    const imageRefs: any = this.bannerBusinessImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // CLICK IMAGE
    imageRefs.click()
  }

  // GET IMAGE FILE AND SET IN BANNER OR THUMBNAIL
  public getBusinessImage(file: File) {
    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
        if (file.size <= 19520000) {
          const categoryImage = this.targetImage === 'banner'
            ? this.newUploadBanner
            : this.targetImage === 'thumbnail'
              ? this.newUploadThumbnail
              : this.newUploadBannerResponsive
          const fr = new FileReader()
          fr.onload = (el: any) => {
            categoryImage.splice(0, 1, {
              img: el.target.result,
              filetype: file.type.split('/')[1]
            })
          }
          fr.readAsDataURL(file)
        } else {
          this.$bus.$emit('handleError', 'El peso máximo es de 2 MB')
        }
      } else {
        this.$bus.$emit('handleError', 'Solo se aceptan formato .png y .jpeg')
      }
    }
  }

  // SET BUSINESS BY ID
  public async setBusinessById() {
    try {

      // PAYLOAD BY ID
      const businessIdDto = {
        businessId: this.businessID
      }

      // GET BUSINESS BY ID
      const { data } = await this.$apollo.query({
        query: GET_BUSINESS_BY_ID,
        variables: businessIdDto,
        fetchPolicy: 'no-cache'
      })

      // SET BUSINESS
      const business = data.findBusinessById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = business.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : ''
        };
      });

      // SET BUSINESS TO VARIABLE
      this.business = { ...business, sections };

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // UPDATE BUSINESS CARD
  public async updateBusiness() {
    // SET LOADING
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const businessClean = _.omit(this.business, [
        '_id',
        '__typename',
        'sections.__typename',
        'sections.cards.__typename',
        'sections.attachments.__typename'
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION 
      const sectionCleanBusinessClean = businessClean.sections?.map((section: any) => {
        let cleanSection = _.omit(section, [
          '__typename',
          'image.__typename',
          'cards.__typename',
          'attachments.__typename',
          'banner.__typename',
          'banner.button.__typename',
          'grid.__typename',
          'banner.title.__typename',
          'banner.description.__typename',
          'table.__typename'
        ]);
        cleanSection.cards = section.cards.map((card: any) => {
          let clean = _.omit(card, [
            '__typename',
          ]);
          return clean;
        });
        cleanSection.attachments = section.attachments.map((attachment: any) => {
          let clean = _.omit(attachment, [
            '__typename',
          ]);
          return clean;
        });
        cleanSection.text = section.text ? encrypt(section.text) : '';

        cleanSection._id = section._id ? section._id.length >= 9 ? section._id : null : null,
          cleanSection.grids = mapToUpdateGridsDto(section.grids)
        cleanSection.gallery = mapToUpdateGalleryDto(section.gallery)
        cleanSection.accordion = mapToUpdateAccordionDto(section.accordion)

        return cleanSection;
      });

      // BUSINESS FINAL
      const businessFinal = {
        ...businessClean,
        status: 'publish',
        category: typeof this.business.category === 'string' ? this.business.category : this.business.category._id,
        sections: sectionCleanBusinessClean
      }

      // PAYLOAD UPDATE BUSINESS
      const updateBusinessDto = {
        updateBusinessDto: {
          businessID: this.businessID,
          business: businessFinal,
          newUploadBanner: this.newUploadBanner,
          newUploadResponsive: this.newUploadBannerResponsive,
          newUploadThumbnail: this.newUploadThumbnail,
        }
      }

      await this.$apollo.mutate({
        mutation: UPDATE_BUSINESS,
        variables: updateBusinessDto,
        fetchPolicy: 'no-cache'
      })

      // SET LOADING
      this.loading = false;

      // GO TO LIST
      this.$router.push('/business/post/list')

      // SHOW SNACKBAR
      this.$bus.$emit('showSnackbar', {
        text: 'Negocio actualizado correctamente!',
        color: 'success',
        timeout: 6000
      })

    } catch (err) {
      this.loading = false;
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // UPDATE BUSINESS DRAFT
  public async updateBusinessDraft() {
    // SET LOADING
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const businessClean = _.omit(this.business, [
        '_id',
        '__typename',
        'sections.__typename',
        'sections.cards.__typename',
        'sections.attachments.__typename'
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION 
      const sectionCleanBusinessClean = businessClean.sections?.map((section: any) => {
        let cleanSection = _.omit(section, [
          '__typename',
          'image.__typename',
          'cards.__typename',
          'attachments.__typename',
          'banner.__typename',
          'banner.button.__typename',
          'grid.__typename',
          'banner.title.__typename',
          'banner.description.__typename',
          'table.__typename'
        ]);
        cleanSection.cards = section.cards.map((card: any) => {
          let clean = _.omit(card, [
            '__typename',
          ]);
          return clean;
        });
        cleanSection.attachments = section.attachments.map((attachment: any) => {
          let clean = _.omit(attachment, [
            '__typename',
          ]);
          return clean;
        });
        cleanSection.text = section.text ? encrypt(section.text) : '';
        cleanSection._id = section._id ? section._id.length >= 9 ? section._id : null : null,
          cleanSection.grids = mapToUpdateGridsDto(section.grids)
        cleanSection.gallery = mapToUpdateGalleryDto(section.gallery)
        cleanSection.accordion = mapToUpdateAccordionDto(section.accordion)
        return cleanSection;
      });

      // BUSINESS FINAL
      const businessFinal = {
        ...businessClean,
        status: 'draft',
        category: typeof this.business.category === 'string' ? this.business.category : this.business.category._id,
        sections: sectionCleanBusinessClean
      }

      // PAYLOAD UPDATE BUSINESS
      const updateBusinessDto = {
        updateBusinessDto: {
          businessID: this.businessID,
          business: businessFinal,
          newUploadBanner: this.newUploadBanner,
          newUploadResponsive: this.newUploadBannerResponsive,
          newUploadThumbnail: this.newUploadThumbnail,
        }
      }

      const { data } = await this.$apollo.mutate({
        mutation: UPDATE_BUSINESS,
        variables: updateBusinessDto,
        fetchPolicy: 'no-cache'
      })

      // SET LOADING
      this.loading = false;

      return data;
    } catch (err) {
      this.loading = false;
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  public makeid(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
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
        _id: section._id ?? this.makeid(8),
        position: this.business.sections.length + 1
      }
    ];
  }

  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.business.sections[section.position - 1] = section;
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
    newSections = [...this.business.sections]

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0]

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected)

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 }
    })

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
        position: index + 1
      }
    });
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number, card: TypeCard }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.cards = [
      ...getSection.cards,
      { ...section.card, status: 'create' }
    ];
  }

  // EMIT EVENT UPDATE CARD SECTION
  public updateCardSection(section: { position: number, index: number, card: TypeCard }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.cards[section.index] = { ...section.card, status: section.card._id ? 'update' : 'create' }
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number, index: number }) {
    const getSection = this.business.sections[section.position - 1];
    const getCard = getSection.cards[section.index];

    // VALIDATE IF CARD IS NEW
    if (getCard.status === 'create') {
      getSection.cards.splice(section.index, 1);
    } else {
      getSection.cards[section.index] = { ...getCard, status: 'remove' }
    }
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: { position: number, attachments: TypeAttachment[] }) {
    const getSection = this.business.sections[section.position - 1];
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
  public updateAttachmentSection(section: { position: number, index: number, attachment: TypeAttachment }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.attachments[section.index] = { ...section.attachment, status: section.attachment._id ? 'update' : 'create', }
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number, index: number }) {
    const getSection = this.business.sections[section.position - 1];
    const getAttachment = getSection.attachments[section.index];

    // VALIDATE IF ATTACHMENT IS NEW
    if (getAttachment.status === 'create') {
      getSection.attachments.splice(section.index, 1);
    } else {
      getSection.attachments[section.index] = { ...getAttachment, status: 'remove' }
    }
  }

  // EMIT EVENT SET DATA TABLE SECTION
  public setDataTable(section: { position: number, headers: Array<string>, columns: Array<TableColumnInterface[]> }) {
    const getSection = this.business.sections[section.position - 1];
    getSection.table = {
      ...getSection.table,
      headers: section.headers,
      columns: section.columns
    }
  }

  public updateSlug() {
    this.business.slug = toSlug(this.business.title.toLowerCase())
  }

  // SAVE ITEM
  public async saveBusinessDraft() {
    // FIRST UPDATE PRODUCT STATUS DRAFT
    await this.updateBusinessDraft();

    // REFRESH ROUTE
    window.location.reload();
  }

  public async goPreview() {
    // UPDATE ALL CHANGE
    await this.updateBusinessDraft()

    // GO PREVIEW CATEGORY
    const route = this.$router.resolve({
      path: '/previews/post',
      query: {
        postID: this.businessID,
        postType: 'business'
      }
    });
    window.open(route.href, '_blank');

    // REFRESH ROUTE
    window.location.reload();
  }
}
export default BusinessUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
    <!-- BANNER IMAGE CATEGORY -->
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
      <v-btn position="absolute" rounded="xl"
        :base-color="business.status && business.status === 'draft' ? 'orange' : 'green'"
        style="height: 30px; top: 15px; left: 10px" variant="tonal" readonly>
        {{ business.status && business.status === 'draft' ? 'Borrador' : 'Publicado' }}
      </v-btn>
      <v-btn @click="updateBusiness()" :loading="loading">
        <v-icon>
          mdi-upload
        </v-icon>
        Actualizar y publicar
      </v-btn>
      <v-btn @click="saveBusinessDraft()" :loading="loading">
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