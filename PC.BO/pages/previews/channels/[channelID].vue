<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { ChannelInterface } from '~/interfaces/channels.interface';

// IMPORT COMPONENTS
import AppPreviewSectionsComponent from '~/components/previews/sections/index.vue';

// IMPORT GRAPHQL QUERY
import { GET_CHANNEL_BY_ID } from '~/graphql/query/channels.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'previews-channel-post-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-preview-sections-component': AppPreviewSectionsComponent,
  }
})
class PreviewsChannelPostScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE APP
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET PARAM POST ID
  public postID = useRoute().params.channelID;

  // POSTS
  public channel: ChannelInterface = {
    _id: '',
    title: '',
    slug: '',
    link: '',
    excerpt: '',
    subtitle: '',
    description: '',
    sections: [],
    banner: '',
    responsive: '',
    thumbnail: '',
    disabled: false
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // GET POSTS
    this.getChannelById()
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET FINANCIALLY BY ID
  public async getChannelById() {
    try {

      // GET POST ID
      const channelId = {
        channelId: this.postID
      }

      const { data } = await this.$apollo.query({
        query: GET_CHANNEL_BY_ID,
        variables: channelId,
        fetchPolicy: 'no-cache'
      })

      // SET FINANCIALLY
      const channel = data.findChannelById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = channel.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : ''
        };
      });

      // SET FINANCIALLY TO VARIABLE
      this.channel = { ...channel, sections };

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // GET FORMAT DATE RANGE
  public getFormatDateRange(date: string): string {
    let dateFinal = '';
    dateFinal = `${this.$app.$moment(date).format('D')} ${this.$app.$moment(date).format('MMMM')} ${this.$app.$moment(date).format('YYYY')}`
    return dateFinal;
  }
}
export default PreviewsChannelPostScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="hero-banners-container" justify="space-between" no-gutters>
    <!-- BANNER -->
    <v-col cols="12">
      <v-img width="100%" height="400"
        :src="$vuetify.display.mdAndDown? channel.responsive?? channel.responsiveImageDetail?.image?? '' : channel.banner?? channel.responsiveImageDetail?.image?? ''"
        cover />
    </v-col>

    <v-col cols="12" md="12" lg="12" class="px-2 px-md-15 py-10">
      <v-row>
        <v-col cols="12">
          <!-- SECTION COMPONENT -->
          <app-preview-sections-component :sections="channel.sections" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>