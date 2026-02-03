<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { GalleryItemInterface, SectionTypeInterface } from "~/interfaces/sections.interface";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import IconImage from "~/components/optimized-image/IconImage.vue";
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-gallery-component',
  components: {
    IconImage,
  },
})
export default class SectionGalleryComponent extends Vue {
  public noimage = '/assets/images/noimage.jpeg';
  ///////////////
  //// PROPS ////
  ///////////////

  // PROPS CARDS SECTION
  @Prop({
    default: {
      name: "",
      description: "",
      color: "",
      position: 0,
      style: "imageLarge",
      type: "sectionGallery",
      text: "",
    },
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////
  public dialog: { show: boolean; video: GalleryItemInterface } = {
    show: false,
    video: {
      image: "",
      icon: "",
      title: "",
      video: "",
    },
  };
  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  public mounted() {
    const head = document.head;

    // Helper to check if a script or link already exists
    const exists = (
      tag: "script" | "link",
      attr: "src" | "href",
      value: string
    ) => !!document.querySelector(`${tag}[${attr}="${value}"]`);

    const cssHref =
      "https://cdn.jsdelivr.net/npm/uikit@3.16.26/dist/css/uikit.min.css";
    if (!exists("link", "href", cssHref)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      head.appendChild(link);
    }

    const jsSrc1 =
      "https://cdn.jsdelivr.net/npm/uikit@3.16.26/dist/js/uikit.min.js";
    if (!exists("script", "src", jsSrc1)) {
      const script = document.createElement("script");
      script.src = jsSrc1;
      head.appendChild(script);
    }

    const jsSrc2 =
      "https://cdn.jsdelivr.net/npm/uikit@3.16.26/dist/js/uikit-icons.min.js";
    if (!exists("script", "src", jsSrc2)) {
      const script = document.createElement("script");
      script.src = jsSrc2;
      head.appendChild(script);
    }
  }

  // OPEN DIALOG EPISODE
  public openDialog(video: GalleryItemInterface) {
    if (!video.video) return;
    // SET DIALOG VIDEO OPTIONS
    this.dialog.show = true;
    this.dialog.video = video;
  }

  public closeDialog() {
    // SET DIALOG VIDEO OPTIONS
    this.dialog.show = false;
    this.dialog.video = {
      image: "",
      icon: "",
      title: "",
      video: "",
    };
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-col 
  class="ma-0 pa-0" 
  justify="center" 
  :style="`background-color: ${section.color ? section.color : 'var(--bsc-primary-color)'};`"
  no-gutters 
  :cols="12">
    <v-toolbar v-if="section.name" :color="section.color? section.color: section.name? 'var(--bsc-primary-color)':'transparent'" height="130" class="mt-1 d-flex justify-center">
      <v-container class="d-flex justify-center">
        <div class="d-flex flex-column align-center">
          <span class="text-h5 text-white">{{section.name}}</span>
          <span class="text-body-2 text-caption text-white">{{ section.description }}</span>
        </div>
      </v-container>
    </v-toolbar>
    <v-row class="ma-0 pa-0" no-gutters>
      <v-container fluid class="pa-0">
          <div uk-slider class="multivideos-slider-container">
            <ul :class="`uk-slider-items uk-child-width-1-${(section.gallery?.items.length || 0) < 6? section.gallery?.items.length:5}@s uk-child-width-1-${(section.gallery?.items.length || 0) < 6? section.gallery?.items.length:5}@`">
              <li v-for="item in section.gallery?.items" @click="openDialog(item)">
                <div class="multivideos-slider-background-container uk-flex uk-flex-center uk-background-cover"
                  :data-src="item.image ?? noimage" uk-img="loading: eager">
                  <div uk-grid class="multivideos-slider-info-container">
                    <div class="multivideos-slider-btn-container" v-if="item.video">
                      <v-icon size="64" color="white">mdi-play-circle</v-icon>
                    </div>
                    <div v-if="item.icon || item.title" class="multivideos-slider-title-container">
                      <IconImage 
                        v-if="item.icon || item.iconImageDetail"
                        :src="item.icon ?? item.iconImageDetail?.image ?? noimage"
                        :alt="item.iconImageDetail?.altText ?? ''"
                        :width="32"
                        :height="32"
                        container-class="icon-slider-title"
                      />
                      <p 
                        v-if="item.title"
                        class="multivideos-slider-title">{{ item.title }}</p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
      </v-container>
    </v-row>
  </v-col>

  <!-- DIALOG VIDEO -->
  <v-dialog
    v-model="dialog.show"
    max-width="800"
    height="80%"
    class="dialog-episode-video"
    persistent
  >
    <v-card width="100%" height="100%" rounded="xl">
      <v-card-title
        class="text-h6 font-weight-bold text-white py-5"
        style="background-color: var(--bsc-primary-color)"
      >
        {{ dialog.video.title }}
        <v-btn
          class="mt-5 mr-5"
          color="red"
          density="compact"
          position="absolute"
          location="end top"
          @click="closeDialog()"
          icon
        >
          <v-icon size="16" color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-0">
        <iframe
          width="100%"
          height="600"
          :src="`https://www.youtube.com/embed/${dialog.video.video}`"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        ></iframe>

        <div class="pt-5 pb-10 px-10">
          <h3>{{ dialog.video.title }}</h3>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
  <!-- DIALOG VIDEO -->
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.uk-grid,
.uk-grid > * {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.navs-container {
  width: 80%;
  border-radius: 30px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 25px;
  margin-top: 20px;
  padding: 0;
  background-color: #fafffb;
  display: flex;
  justify-content: center;
  align-items: center;
}

.nav-container {
  width: 100%;
  margin: 0;
  overflow: hidden;
  border: none;
  flex-wrap: nowrap;
}

.nav-container::before {
  border-bottom: 0;
}

/* .item-nav {} */

.item-nav.uk-active a {
  font-weight: 700;
  color: #000000;
  border-bottom: #12b041 solid;
  animation: all ease-in-out 0.3s;
}

.item-nav a {
  font-weight: 400;
  color: #3f4443;
  font-size: 12px !important;
  text-transform: capitalize !important;
  padding: 10px 0;
}

.item-nav.item-nav-page-name {
  padding-right: 10px;
  padding-left: 10px;
  background-color: var(--bsc-primary-color);
}

.item-nav.item-nav-page-name a {
  color: #ffffff !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  text-transform: uppercase !important;
}

.btn-action-nav-container {
  height: 50px;
  position: relative;
}

.btn-action-nav {
  width: 30px;
  height: 30px;
  top: 10px;
  left: 15px;
  position: absolute;
  background-color: #d9efe2;
  color: #12b041;
}

.multivideos-container {
  width: 100%;
  padding: 0;
  margin: 0;
}

.multivideos-slider-background-container:hover {
  transform: scale(1.1);
}

.multivideos-slider-background-container:hover
  .multivideos-slider-btn-container {
  opacity: 1;
}

.multivideos-title {
  font-weight: 700;
  font-size: 35px;
  color: #0e64bb;
  text-align: center;
}

.multivideos-sliders-container {
  width: 100%;
  position: relative;
}

.multivideos-slider-container {
  width: 100%;
  height: 55vh;
  position: relative;
  cursor: pointer;
  margin-top: 0 !important;
}

.multivideos-slider-container ul {
  width: 100%;
  height: 100%;
}

.multivideos-slider-background-container {
  transition: all 0.3s ease-in-out;
  background-position: center;
  height: 100%;
}

.multivideos-slider-info-container {
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: end;
}

.multivideos-slider-btn-container {
  width: 100%;
  margin-top: 60px;
  text-align: center;
  opacity: 0;
  transition: all ease-in-out 0.3s;
}

.multivideos-slider-btn {
  width: 60px;
  height: 60px;
}

.multivideos-slider-title-container {
  width: 100%;
  height: 100px;
  display: flex;
  text-align: left;
  align-items: center;
  justify-content: center;
  margin-top: 0 !important;
  margin-bottom: 0px;
  background: #00000050;
  padding: 0 10px !important;
}

.icon-slider-title {
  width: 50px;
  height: 50px;
}

.multivideos-slider-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0 15px;
}

@media (max-width: 768px) {
  .page-one-requirement-one-container,
  .page-one-requirement-two-container,
  .page-two-requirement-one-container,
  .page-two-requirement-two-container,
  .page-three-requirement-one-container,
  .page-three-requirement-two-container,
  .page-four-requirement-one-container,
  .page-four-requirement-two-container {
    width: 100%;
  }

  .page-one-info-one-title,
  .page-one-info-one-description,
  .page-two-info-one-title,
  .page-two-info-one-description,
  .page-three-info-one-title,
  .page-three-info-one-description,
  .page-four-info-one-title,
  .page-four-info-one-description {
    padding: 0 50px 20px 50px !important;
  }

  .card-info-two-container {
    width: 90%;
    padding: 0 20px;
  }

  .page-two-contacts-info-container,
  .page-two-contacts-cards-container {
    width: 90%;
    text-align: center;
    justify-content: center;
    padding-left: 0;
    margin: 10px auto !important;
  }

  .page-two-contacts-info-tel-container {
    flex: auto;
    text-align: center;
    justify-content: center;
  }

  .page-one-info-two-text-one-container {
    display: none;
  }

  .page-five-banner-info {
    margin-bottom: 20px;
  }

  .page-one-card-info.card-large-w-features {
    margin-left: auto !important;
    width: 200px;
    height: auto;
  }

  .page-one-card-info.card-large-h-features {
    height: auto;
  }

  .page-one-card-info {
    height: auto;
  }

  .page-seven-info-two-container {
    width: 100%;
    text-align: center;
    margin: 40px 0 0 0 !important;
    justify-content: center;

    p {
      padding: 0 35px !important;
    }
  }

  .page-seven-contacts-info-container {
    text-align: center;
    justify-content: center;
  }

  .page-seven-card-one-redirect-container,
  .page-seven-card-two-redirect-container,
  .page-seven-card-redirect-small,
  .page-seven-card-redirect-large {
    width: 100%;
    height: auto;
  }

  .page-seven-card-redirect-large {
    flex-wrap: wrap;

    .page-seven-redirect-text-container {
      width: 100%;
      text-align: center;

      h2,
      p {
        text-align: center;
        margin-bottom: 10px;
      }
    }
  }

  .page-one-cards-one-container,
  .page-one-cards-two-container {
    width: 100%;
  }

  .page-nine-card-info-large-container {
    width: 100%;
    height: auto;
    border-radius: none;

    .page-nine-card-image-container[data-v-edc782f3] {
      width: 100%;
    }

    .page-nine-card-info-container {
      width: 100%;
      margin-bottom: 20px;
      order: -1;
    }
  }

  .page-seven-card-redirect-small {
    margin: 0;
  }

  .page-seven-card-redirect-small.card-redirect-gray {
    justify-content: center;
    text-align: center;

    h2 {
      text-align: center;
      margin: 20px 0;
    }
  }

  .navs-container {
    width: 100% !important;
    border-radius: 0 !important;
    margin-bottom: 0;
  }

  .nav-container {
    width: 100% !important;
    overflow-x: scroll !important;
    margin: 10px 0;
    padding: 0 20px;
  }
}
</style>
