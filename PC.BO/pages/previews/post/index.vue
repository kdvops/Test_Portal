<!-- SCRIPT TEMPLATE -->
<script lang="ts">

import { Vue } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { SectionTypeInterface } from '~/interfaces/sections.interface';

// IMPORT COMPONENTS
import AppPreviewSectionsComponent from '~/components/previews/sections/index.vue';

// IMPORT QUERY
import { GET_BUSINESS_BY_ID } from '~/graphql/query/business.query';
import { GET_ENTERPRISE_BY_ID } from '~/graphql/query/enterprise.query';
import { GET_INSURANCE_BY_ID } from '~/graphql/query/insurance.query';
import { GET_REGULATORY_BY_ID } from '~/graphql/query/regulatory.query';
import { GET_PROUSER_BY_ID } from '~/graphql/query/prouser.query';
import { GET_POST_BY_ID } from '~/graphql/query/target-post.query';

// GRAPHQL
import { type DocumentNode } from 'graphql';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-post-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-preview-sections-component': AppPreviewSectionsComponent,
  }
})
class PreviewPostScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM ID
  public postID = useRoute().query.postID;

  // GET PARAM ID
  public postType = useRoute().query.postType;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // POST SELECTED
  public post: any = {
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
    disabled: false,
    sections: [],
  };


  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public created() {
    this.getPostsById()
  }

  ///////////////
  /// METHODS ///
  ///////////////


  // GET POSTS BY CATEGORY
  public async getPostsById() {
    // EXAMPLE --- Word
    const wordCamelCase = `${String(this.postType).charAt(0).toUpperCase()}${String(this.postType).slice(1)}`

    // EXAMPLE --- WORD
    const wordUppercase = String(this.postType).toUpperCase()

    // EXAMPLE --- word
    const wordLowercase = String(this.postType).toLowerCase()

    // GET QUERY`S PARAMS
    const queryMap: Record<any, DocumentNode> = {
      GET_BUSINESS_BY_ID,
      GET_ENTERPRISE_BY_ID,
      GET_INSURANCE_BY_ID,
      GET_REGULATORY_BY_ID,
      GET_PROUSER_BY_ID,
      GET_POST_BY_ID,
    };

    try {
      // ARGS FILTER DTO
      const findByIdDto = {
        [`${wordLowercase}Id`]: this.postID
      }

      console.log(findByIdDto);
      console.log(queryMap[`GET_${wordUppercase}_BY_ID`]);

      const { data } = await this.$apollo.query({
        query: queryMap[`GET_${wordUppercase}_BY_ID`],
        variables: findByIdDto,
        fetchPolicy: 'no-cache'
      })

      // SET POST
      const post = data[`find${wordCamelCase}ById`];

      // DECRYPT BASE64 TEXT TO HTML
      const sections = post.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : ''
        };
      });

      // SET PRODUCT TO VARIABLE
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
export default PreviewPostScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <v-img width="100%" height="500"
        :src="$vuetify.display.mdAndDown? post.responsive?? post.responsiveImageDetail?.image?? '' : post.banner?? post.bannerImageDetail?.image?? ''" 
        cover />
    </v-col>

    <v-col cols="10" :md="post.link ? '5' : '8'" :lg="post.link ? '5' : '8'" class="my-10 text-center text-md-left">
      <p class="title-business-post text-center text-md-left font-weight-bold">
        <span> {{ post.description }} </span>
      </p>
    </v-col>

    <v-col class="text-center" v-if="post.link" cols="10" md="4" lg="4">
      <v-btn height="45" q class="mt-0 mt-md-10 mb-10" rounded="xl" color="green">
        Aplica Ahora
      </v-btn>
    </v-col>

    <v-col class="business-sections-container" cols="12">
      <!-- SECTION COMPONENT -->
      <app-preview-sections-component :sections="post.sections" />
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.menu-categories {
  margin-top: -25px;
}

.title-business-post {
  color: #42595f;

  span {
    font-weight: 200;
    font-size: 13px;
  }
}
</style>