<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator"

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";

// IMPORT INTERFACE
import type { 
  AccordionConfigurationInterface,
  GalleryConfigurationInterface,
  GridConfigurationInterface,
  GridElementCreationInterface, 
  GridElementUpdateInterface, 
  GridInterface, 
  GridLayoutInterface, 
  SectionElementDeletionInterface, 
  SectionTypeInterface, 
  TableColumnInterface, 
  TypeAttachment, 
  TypeCard, 
  UploadFileItem 
} from "~/interfaces/sections.interface";
import type { ChannelInterface, NewPictureChannel } from "~/interfaces/channels.interface";

// IMPORT MUTATIONS
import { CREATE_CHANNEL } from "~/graphql/mutations/channels.mutation";
import { GET_UNIQUE_SLUG } from "~/graphql/query/channels.query"

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";
import { mapToCreateAccordionDto, mapToCreateGalleryDto, mapToCreateGridDto, mapToCreateGridsDto } from "~/interfaceMap/dtoMapping";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'channels-create-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'section-component': SectionComponent,
    'detailed-image-component': DetailedImageComponent
  }
})
class ChannelCreateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // CATEGORY REF
  @Ref('bannerChannelImage') bannerChannelImage!: any;

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
  public newUploadBannerResponsive: Array<NewPictureChannel> = [];

  // NEW PICTURE FOR BANNER 
  public newUploadBanner: Array<NewPictureChannel> = [];

  // NEW THUMBNAIL FOR THUMBNAIL
  public newUploadThumbnail: Array<NewPictureChannel> = [];

  // SECTIONS CARDS DEFAULT VALUES
  public channel: ChannelInterface = {
    title: '',
    slug: '',
    excerpt: '',
    link: '',
    subtitle: '',
    description: '',
    sections: [],
    banner: '',
    responsive: '',
    thumbnail: '',
    disabled: false,
  }
  
  // VALID FORM
  public valid: boolean = false;

  // LOADING DEFAULT VALUES
  public loading: boolean = false;

  ///////////////
  /// METHODS ///
  ///////////////

  public created() {
    // DEFINE PAGE META
    definePageMeta({ layout: 'admin',  })

  }

  // OPEN UPLOAD IMAGE
  public selectImage(targetImage: string) {
    // SET TARGET IMAGE
    this.targetImage = targetImage;

    // GET REFERENCE IMAGE
    const imageRefs: any = this.bannerChannelImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // CLICK IMAGE
    imageRefs.click()
  }

  // GET IMAGE FILE AND SET IN BANNER OR THUMBNAIL
  public getChannelImage(file: File) {
    if (file) {
      if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png"
      ) {
        if (file.size <= 19520000) {
          const channelImage =
            this.targetImage === "banner"
              ? this.newUploadBanner
              : this.targetImage === "thumbnail"
                ? this.newUploadThumbnail
                : this.newUploadBannerResponsive;
          const fr = new FileReader();
          fr.onload = (el: any) => {
            channelImage.splice(0, 1, {
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

  // CREATE CHANNELS CARD
  public async createChannel() {
    // SET LOADING FALSE
    this.loading = true

    try {
      // PAYLOAD PARENT AND TARGET DTO
      const createChannelDto = {
        createChannelDto: {
          ...this.channel,
          status: 'publish'
        }
      }

      // ENCRYPT HTML TO BASE64
      createChannelDto.createChannelDto.sections = this.channel.sections.map((section) => {
        const {_id, ...pickedSection} = section
        pickedSection.grids = mapToCreateGridsDto(section.grids)
        pickedSection.gallery = mapToCreateGalleryDto(section.gallery)
        pickedSection.accordion = mapToCreateAccordionDto(section.accordion)

        return {
          ...pickedSection,
          text: section.text ? encrypt(section.text) : '',
        }
      })

      // CREATE CHANNELS
      await this.$apollo.mutate({
        mutation: CREATE_CHANNEL,
        variables: createChannelDto,
        fetchPolicy: 'no-cache'
      })

      // SET LOADING FALSE
      this.loading = false

      // REDIRECT TO LIST
      this.$router.push('/channels/list')

      // SHOW SNACKBAR
      this.$bus.$emit('showSnackbar', {
        text: 'Post creado correctamente!',
        color: 'success',
        timeout: 6000
      })

    } catch (err) {
      // SET LOADING FALSE
      this.loading = false

      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // CREATE CHANNELS CARD
  public async createChannelDraft() {
    // SET LOADING FALSE
    this.loading = true

    try {

      // PAYLOAD PARENT AND TARGET DTO
      const createChannelDto = {
        createChannelDto: {
          ...this.channel,
          status: 'draft'
        }
      }

      // ENCRYPT HTML TO BASE64
      createChannelDto.createChannelDto.sections = this.channel.sections.map((section) => {
        const {_id, ...pickedSection} = section
        pickedSection.grids = mapToCreateGridsDto(section.grids)
        pickedSection.gallery = mapToCreateGalleryDto(section.gallery)
        pickedSection.accordion = mapToCreateAccordionDto(section.accordion)

        return {
          ...pickedSection,
          text: section.text ? encrypt(section.text) : '',
        }
      })

      // CREATE CHANNEL
      const {data} = await this.$apollo.mutate({
        mutation: CREATE_CHANNEL,
        variables: createChannelDto,
        fetchPolicy: 'no-cache'
      })

      // SET LOADING FALSE
      this.loading = false

      return data;
    } catch (err) {
      // SET LOADING FALSE
      this.loading = false

      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  // EMIT EVENT NEW SECTION
  public newSection(section: SectionTypeInterface) {
    this.channel.sections = [
      ...this.channel.sections,
      {
        ...section,
        _id: section._id?? this.makeid(8),
        position: this.channel.sections.length + 1
      }
    ];
  }

  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.channel.sections[section.position - 1] = section;
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
    newSections = [...this.channel.sections]

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0]

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected)

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 }
    })

    // REASSIGN CHANNELS TO TRIGGER REACTIVITY
    this.channel.sections = newSections;
  }

  // EMIT EVENT REMOVE SECTION
  public removeSection(position: number) {
    this.channel.sections.splice(position - 1, 1);
    // REFRESH POSITION
    this.channel.sections = this.channel.sections.map((section, index) => {
      return {
        ...section,
        position: index + 1
      }
    });
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number, card: TypeCard }) {
    const getSection = this.channel.sections[section.position - 1];
    getSection.cards = [
      ...getSection.cards,
      section.card
    ];
  }

  // EMIT EVENT UPDATE CARD SECTION
  public updateCardSection(section: { position: number, index: number, card: TypeCard }) {
    const getSection = this.channel.sections[section.position - 1];
    getSection.cards[section.index] = { ...section.card }
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number, index: number }) {
    const getSection = this.channel.sections[section.position - 1];
    getSection.cards.splice(section.index, 1);
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: { position: number, attachments: TypeAttachment[] }) {
    const getSection = this.channel.sections[section.position - 1];
    getSection.attachments = [
      ...getSection.attachments,
      ...section.attachments
    ];
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public updateAttachmentSection(section: { position: number, index: number, attachment: TypeAttachment }) {
    const getSection = this.channel.sections[section.position - 1];
    getSection.attachments[section.index] = { ...section.attachment }
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number, index: number }) {
    const getSection = this.channel.sections[section.position - 1];
    getSection.attachments.splice(section.index, 1);
  }
  
  public makeid(length:number) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
  }
  
  public configuredGallery(sectionEvent : GalleryConfigurationInterface){
    const section = this.channel.sections[sectionEvent.position - 1];
    section.gallery = {...sectionEvent.gallery, items: section.gallery?.items || []}
  }

  public configuredAccordion(sectionEvent : AccordionConfigurationInterface) {    
    const section = this.channel.sections[sectionEvent.position - 1];
    section.accordion = {...sectionEvent.accordion, items: section.accordion?.items || []}
  }
  
  public updatedSection(sectionEvent: { position: number, element: SectionTypeInterface }){
    this.channel.sections[sectionEvent.position - 1] = sectionEvent.element
  }
  // EMIT SET DATA TABLE SECTION
  public setDataTable(section: { position: number, headers: Array<string>, columns: Array<TableColumnInterface[]> }) {
    const getSection = this.channel.sections[section.position - 1];
    getSection.table = {
      ...getSection.table,
      headers: section.headers,
      columns: section.columns
    }
  }

  ////////////
  /// GETS ///
  ///////////

  // VALID CREATE POST
  public get validCreatePost(): boolean {
    return this.channel.title === '' ||
      this.channel.excerpt === '' ||
      this.channel.subtitle === '' ||
      this.channel.description === '' ||
      !String(this.channel.bannerImageDetail?.image ?? '').trim()
  }

  public get invalidImages(): boolean {
    return (
      !String(this.channel.bannerImageDetail?.image ?? '').trim() || 
      !String(this.channel.thumbnailImageDetail?.image ?? '').trim() || 
      !String(this.channel.responsiveImageDetail?.image ?? '').trim()
    );
  }
  
  // GET UNIQUE SLUG
  public async getUniqueSlug(slug: string) {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_UNIQUE_SLUG,
        variables: {
          slug
        },
        fetchPolicy: 'no-cache'
      })

      // SET CATEGORIES TO VARIABLE
      return await data.findUniqueChannelSlug

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
    return slug
  }

  public async updateSlug(value:string|undefined) {
    if(value) this.channel.slug = await this.getUniqueSlug(toSlug(value.toLowerCase()));
  }

  // GO PREVIEW
  public async goPreview() {
    // FIRST CREATE BUSINESS STATUS DRAFT
    const post = await this.createChannelDraft();

    // GO EDIT AFTER CREATE POST
    this.$router.push(`/channels/update/${post.createChannel._id}`);

    // GO PREVIEW
    const route = this.$router.resolve({ path: `/previews/channels/${post.createChannel._id}` });
    window.open(route.href, '_blank');
  }

  // SAVE ITEM
  public async saveChannelDraft() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const post = await this.createChannelDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/channels/update/${post.createChannel._id}`)
  }
}
export default ChannelCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
     <!-- BANNER THUMBNAIL IMAGE -->
    <v-col cols="3">
      <detailed-image-component color="#00a44f" rounded="xl" height="340" v-model="channel.thumbnailImageDetail" :legacy-image="channel.thumbnail" text="Cargar Miniatura"></detailed-image-component>
    </v-col>

    <v-col cols="7">
      <!-- BANNER LARGE IMAGE -->
      <detailed-image-component color="#00a44f" rounded="xl" height="160" v-model="channel.bannerImageDetail" :legacy-image="channel.banner" text="Cargar Banner" class="mt-2"></detailed-image-component>

      <!-- BANNER RESPONSIVE IMAGE -->
      <detailed-image-component color="#00a44f" rounded="xl" height="160" v-model="channel.responsiveImageDetail" :legacy-image="channel.responsive" text="Cargar Banner Responsive" class="mt-2"></detailed-image-component>
    </v-col>

    <!-- FORM CATEGORY -->
    <v-col cols="10">
      <v-form v-model="valid" lazy-validation>
        <v-row justify="center">
          <v-col cols="4">
            <v-text-field v-model="channel.title" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Titulo" @change="updateSlug(channel.title)"/>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="channel.slug" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Slug" @blur="updateSlug(channel.slug)"/>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="channel.subtitle" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Subtitulo" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="channel.link" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Link de solicitud" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="channel.excerpt" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Extracto" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="channel.description" prepend-inner-icon="mdi-text" density="compact" variant="solo"
              rounded="xl" label="Description" />
          </v-col>
        </v-row>
      </v-form>
    </v-col>
    <v-col cols="12" class="pb-15 mb-15">
      <!--@removeGridSection="removeGridSection" @updateGridSection="updateGridSection" @createNewGridSection="createNewGridSection"-->
      <section-component @removeCardSection="removeCardSection" @updateCardSection="updateCardSection"
        @createNewCardSection="createNewCardSection" @newSection="newSection" @editSection="editSection"
        @removeSection="removeSection" @createNewAttachmentSection="createNewAttachmentSection"
        @updateAttachmentSection="updateAttachmentSection" @removeAttachmentSection="removeAttachmentSection"        
        @changePositionSection="changePositionSection" @setDataTable="setDataTable" 
        @updateSection="updatedSection"
        @configureGrid="configuredGrid"
        @configureGallery="configuredGallery"
        @configureAccordion="configuredAccordion"
        :sections="channel.sections" />
    </v-col>
 
    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn @click="createChannel()" :disabled="validCreatePost || invalidImages" :loading="loading">
        <v-icon>
          mdi-upload
        </v-icon>
        Crear Post
      </v-btn>
      <v-btn @click="saveChannelDraft()" :disabled="validCreatePost" :loading="loading">
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
  <v-file-input ref="bannerChannelImage" class="d-none" accept=".jpg, .jpeg, .png"
    @update:model-value="getChannelImage" />
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