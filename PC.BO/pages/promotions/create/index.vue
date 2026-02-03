<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { PromotionInterface, DialogCreatePromotionInterface, PromotionDateRangeInterface } from "~/interfaces/promotion.interface"

// IMPORT COMPONENTS
import AppDropdownComponent from '~/components/dropdown/index.vue'

// MUTATIONS
import { CREATE_PROMOTION } from '~/graphql/mutations/promotion.mutation'

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'promotion-create-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-dropdown-component': AppDropdownComponent,
    'detailed-image-component': DetailedImageComponent
  }
})
class PromotionCreateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // PROMOTION DEFAULT VALUES
  @Ref('promotionImage') promotionImage!: any;

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

  // PROMOTION DEFAULT VALUES
  public promotions: Array<PromotionInterface> = []

  // ACTION CREATE OR UPDATE
  public action: string = 'create'

  // DIALOG CREATE PROMOTION OPTIONS
  public dialog: DialogCreatePromotionInterface = {
    show: false,
    position: -1,
    promotion: {
      name: 'Marca de ejemplo',
      picture: [],
      condition: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium vel, quod maxime voluptate porro molestiae repellendus temporibus',
      date: {
        start: new Date(),
        end: new Date()
      },
      devolution: '3345',
      extract: '',
      percent: '15',
      disabled: false
    }
  }

  // LOADING
  public loading: boolean = false

  ///////////////
  /// METHODS ///
  ///////////////

  public created() {
    // DEFINE PAGE META
    definePageMeta({ layout: 'admin', })

  }

  // OPEN UPLOAD IMAGE
  public selectImage() {
    const imageRefs: any = this.promotionImage

    // REF IMAGE RESET
    imageRefs.value = null;

    // REF ON CLICK
    imageRefs.click()
  }

  // CREATE PROMOTION
  public async createPromotion() {
    // SET LOADING TRUE
    this.loading = true
    try {

      // CHANGE STATUS DRAFT
      const finalPromotions = this.promotions.map((promotion: PromotionInterface) => ({ ...promotion, status: 'publish' }))

      // PAYLOAD LOGIN DTO
      const createPromotionDto = {
        createPromotionDto: {
          promotions: finalPromotions
        }
      }

      // CREATE PROMOTION MUTATION
      await this.$apollo.mutate({
        mutation: CREATE_PROMOTION,
        variables: createPromotionDto
      })

      // SET LOADING FALSE
      this.loading = false

      // REDIRECT TO DASHBOARD
      this.$router.push('/promotions/list')

      // SHOW SNACKBAR
      this.$bus.$emit('showSnackbar', {
        text: 'Promociones creadas correctamente!',
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

  // CREATE PROMOTION DRAFT
  public async createPromotionDraft() {
    // SET LOADING TRUE
    this.loading = true
    try {

      // CHANGE STATUS DRAFT
      const finalPromotions = this.promotions.map((promotion: PromotionInterface) => ({ ...promotion, status: 'draft' }))

      // PAYLOAD LOGIN DTO
      const createPromotionDto = {
        createPromotionDto: {
          promotions: finalPromotions
        }
      }

      // CREATE PROMOTION MUTATION
      const { data } = await this.$apollo.mutate({
        mutation: CREATE_PROMOTION,
        variables: createPromotionDto
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

  // OPEN DIALOG CREATE
  public openDialog() {
    this.dialog.show = true
    this.action = 'create'
  }

  // OPEN DIALOG UPDATE 
  public openUpdatePromotion(promotion: PromotionInterface, index: number) {
    this.action = 'update'
    this.dialog = {
      show: true,
      position: index,
      promotion: {
        name: promotion.name,
        picture: promotion.picture,
        condition: promotion.condition,
        date: promotion.date,
        devolution: promotion.devolution,
        extract: promotion.extract,
        percent: promotion.percent,
        disabled: false
      }
    }
  }

  // CLOSE DIALOG
  public closeDialog() {
    this.dialog = {
      show: false,
      position: -1,
      promotion: {
        name: '',
        picture: '',
        condition: '',
        date: {
          start: new Date(),
          end: new Date()
        },
        devolution: '',
        extract: '',
        percent: '',
        disabled: false
      }
    }
  }

  // ADD PROMOTION
  public addPromotion() {

    // PUSH PROMOTION IN PROMOTIONS
    this.promotions.unshift({
      ...this.dialog.promotion,
      date: {
        start: this.$app.$moment(this.dialog.promotion.date.start).toDate(),
        end: this.$app.$moment(this.dialog.promotion.date.end).toDate()
      },
    })

    // CLEAN DIALOG
    this.dialog = {
      show: false,
      position: -1,
      promotion: {
        name: '',
        picture: '',
        condition: '',
        date: {
          start: new Date(),
          end: new Date()
        },
        devolution: '',
        extract: '',
        percent: '',
        disabled: false
      }
    }
  }

  // ADD PROMOTION
  public updatePromotion() {
    // SET PROMOTION
    this.promotions[this.dialog.position] = {
      ...this.dialog.promotion,
      date: {
        start: this.$app.$moment(this.dialog.promotion.date.start).toDate(),
        end: this.$app.$moment(this.dialog.promotion.date.end).toDate()
      },
    }

    // CLEAN DIALOG
    this.dialog = {
      show: false,
      position: -1,
      promotion: {
        name: '',
        picture: '',
        condition: '',
        date: {
          start: new Date(),
          end: new Date()
        },
        devolution: '',
        extract: '',
        percent: '',
        disabled: false
      }
    }
  }

  // REMOVE PROMOTION
  public removePromotion() {
    this.promotions = this.promotions.splice(this.dialog.position, 1);
  }

  // GET FORMAT DATE
  public getFormatDate(date: PromotionDateRangeInterface): string {
    const monthStart = this.$app.$moment(date.start).month();
    const monthEnd = this.$app.$moment(date.end).month();

    let dateFinal = '';

    monthStart === monthEnd
      ? dateFinal = `Del ${this.$app.$moment(date.start).format('D')} al ${this.$app.$moment(date.end).format('D')} de ${this.$app.$moment(date.end).format('MMMM')}`
      : dateFinal = `Del ${this.$app.$moment(date.start).format('D')} de ${this.$app.$moment(date.start).format('MMMM')} al ${this.$app.$moment(date.end).format('D')} de ${this.$app.$moment(date.end).format('MMMM')}`

    return dateFinal;
  }

  // GO PREVIEW
  public async goPreview() {
    // FIRST CREATE BUSINESS STATUS DRAFT
    await this.createPromotionDraft();

    // CREATE DATE
    const createDate = this.$app.$moment().format('YYYY-MM');

    // GO EDIT AFTER CREATE POST
    this.$router.push(`/promotions/update/${createDate}`);

    // GO PREVIEW BEFORE CREATE PRODUCT
    const route = this.$router.resolve({
      path: '/previews/promotions',
      query: {
        start: this.$app.$moment().startOf('month').format("YYYY-MM-DD"),
        end: this.$app.$moment().endOf('month').format("YYYY-MM-DD")
      }
    });
    window.open(route.href, '_blank');
  }

  // SAVE ITEM
  public async savePromotionDraft() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    await this.createPromotionDraft();

    // CREATE DATE
    const createDate = this.$app.$moment().format('YYYYY-MM');

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/promotions/update/${createDate}`)
  }

}

export default PromotionCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="pa-5" justify="center">
    <!-- PROMOTION IMAGE -->
    <v-col cols="6">
      <v-alert class="mb-3" rounded="xl" color="info" icon="$info" title="Información" prominent>
        <p class="text-body-2 my-2">Puedes gestionar tus promociones de manera continua he ir agregando todas las que
          necesites, <br> se le debe colocar a cada promoción su respectiva fecha de apertura y cierre</p>
      </v-alert>
    </v-col>
    <v-col cols="6">
      <v-alert class="mb-3" rounded="xl" color="warning" icon="$warning" title="Importante" prominent>
        <p class="text-body-2 my-2">Las Promociones trabajan de manera independiente, es decir que cada una tiene su
          fecha para ser filtrada <br> de manera automática en la vista de promociones BSC, con el fin de poder ser
          reutilizadas en el futuro</p>
      </v-alert>
    </v-col>

    <!-- FORM PROMOTION -->
    <v-col cols="12" class="pb-15 mb-15">
      <v-row align-content="center" justify="center">
        <!-- INPUTS COMPONENT -->
        <v-col class="banner-create-card py-0 px-5 mt-5 mx-auto text-center align-center d-flex" cols="12">
          <p class="text-weight-bold">
            Crear nueva tarjeta de promoción
          </p>
          <v-btn @click="openDialog()" class="ml-5" density="compact" variant="outlined" color="white" icon>
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
        <v-col v-for="(promotion, i) in promotions" cols="3">
          <v-card width="250" height="470" :key="promotion.name" rounded="xl" class="pa-0">
            <v-card-text class="pa-0">
              <v-row class="my-0" align-content="center" justify="center" no-gutters>
                <v-col cols="12">
                  <div class="promotion-card-image pa-5">
                    <v-img v-if="promotion.picture.length > 0 || promotion.pictureImageDetail?.image" width="100%"
                      height="100%"
                      :src="promotion.picture?.length > 0 ? promotion.picture[0]?.img : promotion.pictureImageDetail?.image"
                      contain />
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
                  <div class="promotion-card-condition my-2 d-flex align-center">
                    <div class="ml-2 w-100">
                      <p class="my-0 text-caption font-weight-bold">
                        Condición
                      </p>
                      <p class="my-0 text-caption">
                        {{ promotion.condition }}
                      </p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="pa-0 justify-end">
              <v-btn @click="openUpdatePromotion(promotion, i)" width="120" class="mt-2 text-caption" color="green"
                variant="tonal" rounded="shaped">
                Editar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <!-- DIALOG CREATE PROMOTION -->
    <v-dialog class="dialog-create-promotion" v-model="dialog.show" max-width="500" persistent>
      <v-card class="pa-0" rounded="xl" color="primary">
        <v-card-text v-if="dialog.promotion">
          <v-row align-content="center" justify="center" no-gutters>
            <v-col cols="12" class="text-center">
              <detailed-image-component color="#00a44f" rounded="xl" height="340"
                v-model="dialog.promotion.pictureImageDetail" :legacy-image="dialog.promotion.picture"
                text="Cargar Banner"></detailed-image-component>
            </v-col>
            <v-col cols="12" class="text-center mt-5">
              <v-text-field prepend-inner-icon="mdi-card" density="compact" variant="outlined" rounded="xl"
                v-model="dialog.promotion.name" label="Nombre o Marca" required clearable />
            </v-col>
            <v-col cols="6" class="text-center pr-2">
              <v-text-field prepend-inner-icon="mdi-cash" density="compact" variant="outlined" rounded="xl"
                v-model="dialog.promotion.devolution" label="Devolución" required clearable />
            </v-col>
            <v-col cols="6" class="text-center pl-2">
              <v-text-field prepend-inner-icon="mdi-percent" density="compact" variant="outlined" rounded="xl"
                v-model="dialog.promotion.percent" label="Porcentaje" required clearable />
            </v-col>
            <v-col cols="12" class="text-center">
              <v-text-field prepend-inner-icon="mdi-text" density="compact" variant="outlined" rounded="xl"
                v-model="dialog.promotion.extract" label="Extracto" required clearable />
            </v-col>
            <v-col cols="6" class="text-center pr-2">
              <v-text-field prepend-inner-icon="mdi-calendar" type="date" density="compact" variant="outlined"
                rounded="xl" v-model="dialog.promotion.date.start" label="Fecha de apertura" required clearable />
            </v-col>
            <v-col cols="6" class="text-center pl-2">
              <v-text-field prepend-inner-icon="mdi-calendar" type="date" density="compact" variant="outlined"
                rounded="xl" v-model="dialog.promotion.date.end" label="Fecha de cierre" required clearable />
            </v-col>
            <v-col cols="12" class="text-center">
              <v-textarea prepend-inner-icon="mdi-text" density="compact" variant="outlined" rounded="xl"
                v-model="dialog.promotion.condition" label="Condición" required clearable />
            </v-col>
          </v-row>
        </v-card-text>
        <template v-slot:actions>
          <v-btn @click="closeDialog()">
            cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="action === 'create' ? addPromotion() : updatePromotion()">
            {{ action === 'create' ? 'agregar' : 'actualizar' }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>


    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn @click="createPromotion()" :disabled="promotions.length < 1" :loading="loading">
        <v-icon>
          mdi-upload
        </v-icon>
        Crear Post
      </v-btn>
      <v-btn @click="savePromotionDraft()" :disabled="promotions.length < 1" :loading="loading">
        <v-icon>
          mdi-content-save
        </v-icon>
        Guardar
      </v-btn>
      <v-btn @click="goPreview()" :disabled="promotions.length < 1" :loading="loading">
        <v-icon>
          mdi-eye
        </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}

.banner-create-card {
  height: 80px;
  background-color: #12539b;
  color: #ffffff;
  text-align: center;
  justify-content: center;
  box-shadow: 0px 0px 10px 0px #0000001a;
}

.dialog-create-promotion {
  .v-overlay__content {
    .v-card {
      &::-webkit-scrollbar {
        display: none !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    }
  }
}

.promotion-card-image {
  width: 95%;
  height: 120px;
  margin: 5px auto 0 auto;
  border-radius: 20px;
  background: #12539b;
  color: #ffffff;
  align-items: center;
  text-align: center;

  p {
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 30px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.promotion-card-info {
  background-color: #ffffff;
  color: #535353;

  .promotion-card-condition {}

  .promotion-card-icon {
    width: 30px !important;
    height: 30px !important;
    background-color: #00a44f;
    border-radius: 100px;
  }
}
</style>