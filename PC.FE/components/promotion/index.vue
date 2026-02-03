<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop } from "vue-facing-decorator"

// IMPORT INTERFACES
import type { PromotionDateRangeInterface, PromotionInterface } from "~/interfaces/promotion.interface";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import CardImage from "~/components/optimized-image/CardImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-promotion-card-component',
  components: {
    CardImage,
  },
})
class AppPromotionCardComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // PROMOTION PROPS
  @Prop({
    default: {
      _id: '',
      name: '',
      percent: '',
      devolution: '',
      condition: '',
      extract: '',
      disabled: false,
      picture: '',
      date: {
        start: '',
        end: ''
      },
    }
  })
  promotion!: PromotionInterface;

  ///////////////
  // VARIABLES //
  //////////////

  // INSTANCE APP
  public $app: any

  /////////////
  // METHODS //
  /////////////

  // COUNTDOWN
  public countdown(date: Date): string {
    const countDownDate = this.$app.$moment(date).endOf('day').valueOf();

    let now = new Date().getTime();
    let distance = countDownDate - now;
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // UPDATE THE COUNTDOWN EVERY 1 SECOND
    const x: any = setInterval(() => {
      now = new Date().getTime();
      distance = countDownDate - now;
      days = Math.floor(distance / (1000 * 60 * 60 * 24));
      hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((distance % (1000 * 60)) / 1000);
    }, 1000);

    return days < 0 ? 'Finalizado' : `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // GET FORMAT DATE
  public getFormatDate(date: PromotionDateRangeInterface): string {
    const startDate = this.$app.$moment(date.start);
    const endDate = this.$app.$moment(date.end);

    let dateFinal = '';

    startDate.isSame(endDate, 'day')
      ? dateFinal = `${this.$app.$moment(date.start).format('D')} de ${this.$app.$moment(date.start).format('MMMM')} de ${this.$app.$moment(date.start).format('YYYY')}`
      : dateFinal = `Del ${this.$app.$moment(date.start).format('D')} de ${this.$app.$moment(date.start).format('MMMM')} de ${this.$app.$moment(date.start).format('YYYY')} al ${this.$app.$moment(date.end).format('D')}/${this.$app.$moment(date.end).format('MMMM')}/${this.$app.$moment(date.start).format('YYYY')}`

    return dateFinal;
  }

  public async requestShare(promotion: PromotionInterface) {
    const shareData = {
      title: promotion.name,
      text: promotion.condition,
      url: window.location.href,
      image: promotion.picture
    };

    // Web Share API (dispositivos móviles)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      // Fallback para redes sociales específicas
      const text = encodeURIComponent(`${shareData.title} - ${shareData.text}`);
      const image = encodeURIComponent(shareData.image);
      const url = encodeURIComponent(shareData.url);

      // Abre ventana emergente con opciones
      window.open(`
      https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}&picture=${image}',
      https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=compartir',
      https://pinterest.com/pin/create/button/?url=${url}&description=${text}&media=${image}
    `, '_blank');
    }

    // UPDATE META TAGS DYNAMIC
    useHead({
      meta: computed(() => {
        if (!promotion) return [];
        return [
          { property: 'og:type', content: 'website' },
          { property: 'og:title', content: promotion.name },
          { property: 'og:description', content: promotion.condition },
          { property: 'og:image', content: promotion.picture },
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:title', content: promotion.name },
          { name: 'twitter:description', content: promotion.condition },
          { name: 'twitter:image', content: promotion.picture }
        ];
      })
    })

  };

}
export default AppPromotionCardComponent
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-card width="250" height="auto" min-height="430" max-height="auto" elevation="3" rounded="xl" class="pa-0">
    <v-card-text class="pa-0">
      <v-row class="my-0" align-content="center" justify="center" no-gutters>
        <v-col cols="12">
          <div style="background: #12499b;" class="promotion-card-image pa-5">
            <CardImage v-if="promotion.picture || promotion.pictureImageDetail"
              :src="promotion.picture ?? promotion.pictureImageDetail?.image"
              :alt="promotion.pictureImageDetail?.altText ?? ''" :width="250" :height="120" loading="eager"
              container-class="promotion-image-container" />
            <p v-else>{{ promotion.name }}</p>
          </div>
        </v-col>
        <v-col cols="12" class="promotion-card-info pa-3 text-left">
          <div class="my-2 d-flex align-center">
            <v-icon class="promotion-card-icon" color="#ffffff" size="20">
              mdi-cash
            </v-icon>
            <div class="ml-2">
              <p class="my-0 text-caption font-weight-bold">Devolución</p>
              <p class="my-0 text-caption">
                RD${{ promotion.devolution }}
              </p>
            </div>
          </div>
          <div class="my-2 d-flex align-center">
            <v-icon class="promotion-card-icon" color="#ffffff" size="20">
              mdi-percent
            </v-icon>
            <div class="ml-2">
              <p class="my-0 text-caption font-weight-bold">Porcentaje</p>
              <p class="my-0 text-caption">
                {{ promotion.percent }}%
              </p>
            </div>
          </div>
          <div class="my-2 d-flex align-center">
            <v-icon class="promotion-card-icon" color="#ffffff" size="20">
              mdi-alarm
            </v-icon>
            <div class="ml-2">
              <p class="my-0 text-caption font-weight-bold">Fecha</p>
              <p class="my-0 text-caption">
                {{ getFormatDate(promotion.date) }}
              </p>
            </div>
          </div>
          <div class="promotion-card-condition my-2 align-center">
            <div class="ml-2 w-100">
              <p class="my-0 text-caption">
                <strong>Condición:</strong> {{ promotion.condition }}
              </p>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="pa-0 justify-center">
      <div class="promotion-action">
        <v-btn width="76%" class="mt-2 text-caption"
          :color="countdown(promotion.date.end) === 'Finalizado' ? 'orange' : 'green'" variant="tonal" rounded="xl">
          <v-icon size="24">
            mdi-alarm
          </v-icon>
          <span class="ml-2">{{ countdown(promotion.date.end) }}</span>
        </v-btn>
        <v-btn width="37" height="37" @click="requestShare(promotion)" class="mt-2 text-caption" color="green"
          variant="tonal" rounded="xl" icon>
          <v-icon size="20">
            mdi-share-variant
          </v-icon>
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.promotion-card-image {
  background-color: #12499b;
}

.promotion-action {
  width: 100%;
  bottom: 5px;
  left: 7px;
  position: absolute;
}

.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}
</style>
