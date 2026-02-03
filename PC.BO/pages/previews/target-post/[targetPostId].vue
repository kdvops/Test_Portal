<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { SectionTypeInterface } from '~/interfaces/sections.interface';
import type { TargetPostInterface } from '~/interfaces/target-post.interface';

// IMPORT COMPONENTS
import AppPreviewSectionsComponent from '~/components/previews/sections/index.vue';

// IMPORT QUERY
import { GET_POST_BY_ID } from '~/graphql/query/target-post.query';

// IMPORT UTILS
import { decrypt } from '~/utils/cryptoUtils';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-target-post-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-preview-sections-component': AppPreviewSectionsComponent,
  }
})
class PreviewTargetPostScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM POST ID
  public postID = useRoute().params.targetPostId;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // POST SELECTED
  public post: TargetPostInterface = {
    _id: '',
    title: '',
    slug: '',
    subtitle: '',
    link: '',
    excerpt: '',
    description: '',
    banner: '',
    responsive: '',
    thumbnail: '',
    category: '',
    target: '',
    sections: [],
    disabled: false,
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public created() {
    this.getTargetPostById()
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET TARGET POST BY ID
  public async getTargetPostById() {
    try {
      // GET POST ID
      const targetPostId = {
        targetPostId: this.postID
      }

      const { data } = await this.$apollo.query({
        query: GET_POST_BY_ID,
        variables: targetPostId,
        fetchPolicy: 'no-cache'
      })

      // SET POST
      const post = data.findTargetPostById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = post.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : ''
        };
      });

      // SET POST TO VARIABLE
      this.post = { ...post, sections };

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // DECRYPT BASE64 TEXT TO HTML
  public decryptBaseToHtml(sections: Array<SectionTypeInterface>) {
    return sections.map((section: any) => {
      return {
        ...section,
        text: section.text ? decrypt(section.text) : ''
      };
    });
  }

}
export default PreviewTargetPostScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <v-img width="100%" height="500"
        :src="$vuetify.display.mdAndDown && post.responsive ? post.responsive : post.banner" cover />
    </v-col>

    <v-col cols="10" :md="post.link ? '5' : '8'" :lg="post.link ? '5' : '8'" class="my-10 text-center text-md-left">
      <div class="d-flex align-center mb-4">
        <v-chip
          v-if="post.category"
          :color="post.category.color || '#12539b'"
          class="text-white mr-3"
          size="small"
        >
          <v-icon start>mdi-apps</v-icon>
          {{ post.category.name }}
        </v-chip>
        <v-chip
          v-if="post.target"
          :color="post.target.color || '#12539b'"
          class="text-white"
          size="small"
        >
          <v-icon start>mdi-target</v-icon>
          {{ post.target.name }}
        </v-chip>
      </div>
      
      <h1 class="text-h3 font-weight-bold mb-4">{{ post.title }}</h1>
      <h2 class="text-h5 text-grey-darken-1 mb-4">{{ post.subtitle }}</h2>
      
      <p class="text-body-1 mb-6">{{ post.description }}</p>
      
      <div v-if="post.excerpt" class="text-body-2 text-grey-darken-2 mb-6">
        <strong>Extracto:</strong> {{ post.excerpt }}
      </div>

      <v-btn
        v-if="post.link"
        :href="post.link"
        target="_blank"
        :color="post.target?.color || '#12539b'"
        size="large"
        rounded="xl"
        class="mb-6"
      >
        <v-icon left>mdi-open-in-new</v-icon>
        Ver Enlace
      </v-btn>
    </v-col>

    <!-- SECTIONS -->
    <v-col cols="12" v-if="post.sections && post.sections.length > 0">
      <app-preview-sections-component :sections="post.sections" />
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
// Add any custom styles here if needed
</style>
