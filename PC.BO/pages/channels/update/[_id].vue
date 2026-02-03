<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";

// IMPORT INTERFACE
import type { ChannelInterface } from "~/interfaces/channels.interface";
import type {
  AccordionConfigurationInterface,
  GalleryConfigurationInterface,
  GridElementCreationInterface,
  GridElementUpdateInterface,
  GridInterface,
  GridLayoutInterface,
  SectionElementDeletionInterface,
  SectionTypeInterface,
  TableColumnInterface,
  TypeAttachment,
  TypeCard,
  UploadFileItem,
} from "~/interfaces/sections.interface";

// IMPORT QUERIES
import {
  GET_CATEGORIES_BY_TARGET,
  GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY,
} from "~/graphql/query/categories.query";
import {
  GET_CHANNEL_BY_ID,
  GET_UNIQUE_SLUG,
} from "~/graphql/query/channels.query";

// IMPORT MUTATIONS
import { UPDATE_CHANNEL } from "~/graphql/mutations/channels.mutation";

// IMPORT LODASH
import _ from "lodash";
import type {
  CategoriesInterface,
  NewPictureCategory,
} from "~/interfaces/categories.interface";

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
  name: "channels-update-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    "detailed-image-component": DetailedImageComponent,
  },
})
class ChannelsUpdateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // CATEGORY REF
  @Ref("bannerChannelImage") bannerChannelImage!: any;

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

  // GET PARAM CHANNEL ID
  public channelID = useRoute().params._id;

  // TARGET IMAGE
  public targetImage: string = "banner";

  // NEW PICTURE FOR BANNER RESPONSIVE CATEGORY PROFIT
  public newUploadBannerResponsive: Array<NewPictureCategory> = [];

  // NEW PICTURE FOR BANNER CATEGORY PROFIT
  public newUploadBanner: Array<NewPictureCategory> = [];

  // NEW THUMBNAIL FOR CATEGORY PROFIT
  public newUploadThumbnail: Array<NewPictureCategory> = [];

  // SECTIONS CARDS DEFAULT VALUES
  public channel: ChannelInterface = {
    title: "",
    slug: "",
    excerpt: "",
    subtitle: "",
    link: "",
    description: "",
    sections: [],
    banner: "",
    responsive: "",
    thumbnail: "",
    disabled: false,
  };
  public inmutableChannel: ChannelInterface | undefined;

  // VALID FORM
  public valid: boolean = false;

  // LOADING
  public loading: boolean = false;

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    // SET CHANNEL BY ID
    this.setChannelById();

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
    const imageRefs: any = this.bannerChannelImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // CLICK IMAGE
    imageRefs.click();
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

  // SET CHANNEL BY ID
  public async setChannelById() {
    try {
      // PAYLOAD BY ID
      const channelIdDto = {
        channelId: this.channelID,
      };

      // GET CHANNEL BY ID
      const { data } = await this.$apollo.query({
        query: GET_CHANNEL_BY_ID,
        variables: channelIdDto,
        fetchPolicy: "no-cache",
      });

      // SET CHANNEL
      const channel = data.findChannelById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = channel.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : "",
        };
      });

      // SET CHANNEL TO VARIABLE
      this.channel = { ...channel, sections };
      this.inmutableChannel = { ...this.channel };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE CHANNEL CARD
  public async updateChannel() {
    // SET LOADING
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const channelClean = _.omit(this.channel, [
        "_id",
        "__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanChannelClean = channelClean.sections?.map(
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

      // CHANNEL FINAL
      const channelFinal = {
        ...channelClean,
        status: "publish",
        sections: sectionCleanChannelClean,
      };

      // PAYLOAD UPDATE CHANNEL
      const updateChannelDto = {
        updateChannelDto: {
          channelID: this.channelID,
          channel: channelFinal,
          newUploadBanner: this.newUploadBanner,
          newUploadResponsive: this.newUploadBannerResponsive,
          newUploadThumbnail: this.newUploadThumbnail,
        },
      };

      await this.$apollo.mutate({
        mutation: UPDATE_CHANNEL,
        variables: updateChannelDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING
      this.loading = false;

      // GO TO LIST
      this.$router.push("/channels/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Canal actualizado correctamente!",
        color: "success",
        timeout: 6000,
      });
    } catch (err) {
      this.loading = false;

      console.log("ErrorOnUpdate", err);
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE CHANNEL DRAFT
  public async updateChannelDraft() {
    // SET LOADING
    this.loading = true;

    try {
      // OMIT FIELDS NOT NECESSARY
      const channelClean = _.omit(this.channel, [
        "_id",
        "__typename",
        "sections.__typename",
        "sections.cards.__typename",
        "sections.attachments.__typename",
      ]);

      // OMIT FIELDS NOT NECESSARY IN SECTION
      const sectionCleanChannelClean = channelClean.sections?.map(
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

      // CHANNEL FINAL
      const channelFinal = {
        ...channelClean,
        status: "draft",
        sections: sectionCleanChannelClean,
      };

      // PAYLOAD UPDATE CHANNEL
      const updateChannelDto = {
        updateChannelDto: {
          channelID: this.channelID,
          channel: channelFinal,
          newUploadBanner: this.newUploadBanner,
          newUploadResponsive: this.newUploadBannerResponsive,
          newUploadThumbnail: this.newUploadThumbnail,
        },
      };

      await this.$apollo.mutate({
        mutation: UPDATE_CHANNEL,
        variables: updateChannelDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING
      this.loading = false;

      // GO TO LIST
      this.$router.push("/channels/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Canal actualizado correctamente!",
        color: "success",
        timeout: 6000,
      });
    } catch (err) {
      console.log("Error", "error on update channel");
      this.loading = false;
      // SHOW ERROR
      console.log("ErrorOnUpdate", err);
      this.$bus.$emit("handleError", err);
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
        _id: section._id ?? this.makeid(8),
        position: this.channel.sections.length + 1,
      },
    ];
  }

  // EMIT EVENT EDIT SECTION
  public editSection(section: SectionTypeInterface) {
    this.channel.sections[section.position - 1] = section;
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
    newSections = [...this.channel.sections];

    // ROW SELECTED
    const rowSelected = newSections.splice(oldIndex, 1)[0];

    // INSERT ROW SELECTED
    newSections.splice(newIndex, 0, rowSelected);

    // RESET POSITION SECTION
    newSections = newSections.map((section, index) => {
      return { ...section, position: index + 1 };
    });

    // REASSIGN CHANNEL TO TRIGGER REACTIVITY
    this.channel.sections = newSections;
  }

  // EMIT EVENT REMOVE SECTION
  public removeSection(position: number) {
    this.channel.sections.splice(position - 1, 1);
    // REFRESH POSITION
    this.channel.sections = this.channel.sections.map((section, index) => {
      return {
        ...section,
        position: index + 1,
      };
    });
  }

  // EMIT EVENT CREATE NEW CARD SECTION
  public createNewCardSection(section: { position: number; card: TypeCard }) {
    const getSection = this.channel.sections[section.position - 1];
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
    const getSection = this.channel.sections[section.position - 1];
    getSection.cards[section.index] = {
      ...section.card,
      status: section.card._id ? "update" : "create",
    };
  }

  // EMIT EVENT UPDATE CARD SECTION
  public removeCardSection(section: { position: number; index: number }) {
    const getSection = this.channel.sections[section.position - 1];
    const getCard = getSection.cards[section.index];

    // VALIDATE IF CARD IS NEW
    if (getCard.status === "create") {
      getSection.cards.splice(section.index, 1);
    } else {
      getSection.cards[section.index] = { ...getCard, status: "remove" };
    }
  }

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

  public configuredGallery(sectionEvent: GalleryConfigurationInterface) {
    const section = this.channel.sections[sectionEvent.position - 1];
    section.gallery = {
      ...sectionEvent.gallery,
      items: section.gallery?.items || [],
    };
  }

  public configuredAccordion(sectionEvent: AccordionConfigurationInterface) {
    const section = this.channel.sections[sectionEvent.position - 1];
    section.accordion = {
      ...sectionEvent.accordion,
      items: section.accordion?.items || [],
    };
  }

  // EMIT EVENT CREATE NEW ATTACHMENT SECTION
  public createNewAttachmentSection(section: {
    position: number;
    attachments: TypeAttachment[];
  }) {
    const getSection = this.channel.sections[section.position - 1];
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
    const getSection = this.channel.sections[section.position - 1];
    getSection.attachments[section.index] = {
      ...section.attachment,
      status: section.attachment._id ? "update" : "create",
    };
  }

  // EMIT EVENT UPDATE ATTACHMENT SECTION
  public removeAttachmentSection(section: { position: number; index: number }) {
    const getSection = this.channel.sections[section.position - 1];
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
    const getSection = this.channel.sections[section.position - 1];
    getSection.table = {
      ...getSection.table,
      headers: section.headers,
      columns: section.columns,
    };
  }

  // GET UNIQUE SLUG
  public async getUniqueSlug(slug: string) {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_UNIQUE_SLUG,
        variables: {
          slug,
        },
        fetchPolicy: "no-cache",
      });

      // SET CATEGORIES TO VARIABLE
      return await data.findUniqueChannelSlug;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
    return slug;
  }

  public async updateSlug(value: string | undefined) {
    if (value) {
      if (this.inmutableChannel?.slug === value) return;

      this.channel.slug = await this.getUniqueSlug(toSlug(value.toLowerCase()));
    }
  }

  // SAVE ITEM
  public async saveChannelDraft() {
    // FIRST UPDATE PRODUCT STATUS DRAFT
    await this.updateChannelDraft();

    // REFRESH ROUTE
    window.location.reload();
  }

  public async goPreview() {
    // UPDATE ALL CHANGE
    await this.updateChannelDraft();

    // GO PREVIEW CATEGORY
    this.$router.push(`/channels/update/${this.channelID}`);

    // GO PREVIEW
    const route = this.$router.resolve({
      path: `/previews/channels/${this.channelID}`,
    });
    window.open(route.href, "_blank");

    // REFRESH ROUTE
    window.location.reload();
  }
}
export default ChannelsUpdateScreen;
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
        v-model="channel.thumbnailImageDetail"
        :legacy-image="channel.thumbnail"
        text="Cargar Miniatura"
      ></detailed-image-component>
    </v-col>

    <v-col cols="7">
      <!-- BANNER LARGE IMAGE -->
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="160"
        v-model="channel.bannerImageDetail"
        :legacy-image="channel.banner"
        text="Cargar Banner"
        class="mt-2"
      ></detailed-image-component>

      <!-- BANNER RESPONSIVE IMAGE -->
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="160"
        v-model="channel.responsiveImageDetail"
        :legacy-image="channel.responsive"
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
              v-model="channel.title"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Titulo"
              @change="updateSlug(channel.title)"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="channel.slug"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Slug"
              @blur="updateSlug(channel.slug)"
            >
              <template #prepend-inner>
                <v-tooltip
                  :text="`Original: ${inmutableChannel?.slug}`"
                  :disabled="
                    !inmutableChannel?.slug ||
                    inmutableChannel?.slug === channel.slug
                  "
                >
                  <template #activator="{ props }">
                    <v-icon
                      v-if="
                        inmutableChannel?.slug &&
                        inmutableChannel?.slug !== channel.slug
                      "
                      v-bind="props"
                      icon="mdi-alert-outline"
                      color="warning"
                    />
                    <v-icon v-else v-bind="props" icon="mdi-text" />
                  </template>
                </v-tooltip>
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="channel.subtitle"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Subtitulo"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="channel.link"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Link de solicitud"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="channel.excerpt"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Extracto"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="channel.description"
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
        @configureGallery="configuredGallery"
        @configureAccordion="configuredAccordion"
        @changePositionSection="changePositionSection"
        @setDataTable="setDataTable"
        :sections="channel.sections"
      />
    </v-col>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn
        position="absolute"
        rounded="xl"
        :base-color="
          channel.status && channel.status === 'draft' ? 'orange' : 'green'
        "
        style="height: 30px; top: 15px; left: 10px"
        variant="tonal"
        readonly
      >
        {{
          channel.status && channel.status === "draft"
            ? "Borrador"
            : "Publicado"
        }}
      </v-btn>
      <v-btn @click="updateChannel()" :loading="loading">
        <v-icon> mdi-upload </v-icon>
        Actualizar y publicar
      </v-btn>
      <v-btn @click="saveChannelDraft()" :loading="loading">
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
    ref="bannerChannelImage"
    class="d-none"
    accept=".jpg, .jpeg, .png"
    @update:model-value="getChannelImage"
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
