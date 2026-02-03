<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { NewPictureProfit, ProfitInterface, DialogCreateProfitInterface, ProfitDateRangeInterface } from "~/interfaces/profits.interface"
import type { CategoriesInterface } from "~/interfaces/categories.interface";

// MUTATIONS
import { UPDATE_PROFITS } from '~/graphql/mutations/profits.mutation'

// QUERIES
import { GET_CATEGORIES_BY_TARGET } from "~/graphql/query/categories.query";
import { GET_PROFITS_BY_CATEGORY } from "~/graphql/query/profits.query";

// UTILS
import { encrypt, decrypt } from '~/utils/cryptoUtils'

// IMPORT LODASH
import _ from "lodash";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'profit-item-create-screen',
  components:{    
    'detailed-image-component': DetailedImageComponent
  }
})
class ProfitItemsUpdateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // PROFITS IMAGE REF
  @Ref('profitImage') profitImage!: any;

  // RICH TEXT EDITOR REF (Description)
  @Ref('descriptionEditor') descriptionEditor!: any;

  // RICH TEXT EDITOR REF (Condition)
  @Ref('conditionEditor') conditionEditor!: any;

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

  // CATEGORIES PROFITS
  public categories: Array<CategoriesInterface> = []

  // PROFITS DEFAULT VALUES
  public profits: Array<ProfitInterface> = []

  // GET PARAM CATEGORY ID
  public categoryID = useRoute().params._id;

  // PROFITS LARGE DESCRIPTION
  public isChangeColor: boolean = false

  // ACTION CREATE OR UPDATE
  public action: string = 'create'

  // DIALOG CREATE PROFITS OPTIONS
  public dialog: DialogCreateProfitInterface = {
    show: false,
    position: -1,
    profit: {
      _id: '',
      name: 'Marca de ejemplo',
      picture: '',
      condition: '',
      category: '',
      date: {
        start: new Date(),
        end: new Date()
      },
      color: '#12539b',
      devolution: '3345',

      // SET PICTURE PROFITS TO NEW UPLOAD PICTURE
      newPictureProfit: [],

      description: {
        text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium vel, quod maxime voluptate porro molestiae repellendus temporibus',
        enabled: false
      },
      percent: '15',
      disabled: false
    }
  }

  // LOADING
  public loading: boolean = false

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setProfitsByCategory();
    this.setCategories();

    // DEFINE PAGE META
    definePageMeta({ layout: 'admin',  })

  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET IMAGE FILE AND SET IN PROFITS
  public getProfitImage(file: File) {

    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
        if (file.size <= 19520000) {
          const profitImage = this.dialog.profit.newPictureProfit!;
          const fr = new FileReader()
          fr.onload = (el: any) => {
            profitImage.splice(0, 1, {
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

  // OPEN UPLOAD IMAGE
  public selectImage() {
    const imageRefs: any = this.profitImage

    // REF IMAGE RESET
    imageRefs.value = null;

    // REF ON CLICK
    imageRefs.click()
  }

  // SET PROFITS BY CATEGORY
  public async setProfitsByCategory() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_PROFITS_BY_CATEGORY,
        variables: {
          categoryId: this.categoryID,
        },
        fetchPolicy: 'no-cache'
      })

      const profits: Array<ProfitInterface> = this.decryptHTML(data.findProfitsByCategory);

      // SET CATEGORIES TO VARIABLE
      this.profits = profits

    } catch (err) {

      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // SET CATEGORIES
  public async setCategories() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: 'category::profits',
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

  // UPDATE PROFITS
  public async updateProfits() {
    // SET LOADING TRUE
    this.loading = true
    try {

      // CLEAN PROFITS
      const profits = this.profits.map((profit: ProfitInterface) => {
        const descriptionText = encrypt(profit.description.text)
        const conditionText = encrypt(profit.condition)
        const profitClean = _.omit(profit, [
          'date.__typename',
          'description.__typename',
          '__typename',
        ])
        return {
          ...profitClean,
          status: 'publish',
          condition: conditionText,
          description: {
            enabled: profit.description.enabled,
            text: descriptionText
          }
        }
      })

      // PAYLOAD LOGIN DTO
      const updateProfitsDto = {
        updateProfitsDto: {
          profits: profits
        }
      }

      // UPDATE PROFITS MUTATION
      await this.$apollo.mutate({
        mutation: UPDATE_PROFITS,
        variables: updateProfitsDto
      })

      // SET LOADING FALSE
      this.loading = false

      // REDIRECT TO DASHBOARD
      this.$router.push('/profits/items/list')

      // SHOW SNACKBAR
      this.$bus.$emit('showSnackbar', {
        text: 'Beneficios actualizados correctamente!',
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

  // UPDATE PROFITS
  public async updateProfitsDraft() {
    // SET LOADING TRUE
    this.loading = true
    try {

      // CLEAN PROFITS
      const profits = this.profits.map((profit: ProfitInterface) => {
        const descriptionText = encrypt(profit.description.text)
        const conditionText = encrypt(profit.condition)
        const profitClean = _.omit(profit, [
          'date.__typename',
          'description.__typename',
          '__typename',
        ])
        return {
          ...profitClean,
          status: 'draft',
          condition: conditionText,
          description: {
            enabled: profit.description.enabled,
            text: descriptionText
          }
        }
      })

      // PAYLOAD LOGIN DTO
      const updateProfitsDto = {
        updateProfitsDto: {
          profits: profits
        }
      }

      // UPDATE PROFITS MUTATION
      const { data } = await this.$apollo.mutate({
        mutation: UPDATE_PROFITS,
        variables: updateProfitsDto
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
  public openUpdateProfit(profit: ProfitInterface, index: number) {
    this.action = 'update'

    this.dialog = {
      show: true,
      position: index,
      profit: {
        _id: profit._id,
        name: profit.name,
        picture: profit.picture,
        pictureImageDetail: profit.pictureImageDetail,
        condition: profit.condition,
        category: profit.category,

        // SET PICTURE PROFITS TO NEW UPLOAD PICTURE
        newPictureProfit: profit.newPictureProfit && profit.newPictureProfit.length > 0 ? profit.newPictureProfit : [],

        date: profit.date,
        color: profit.color,
        devolution: profit.devolution,
        description: profit.description,
        percent: profit.percent,
        disabled: false
      }
    }

    // SET DESCRIPTION HTML EDITOR
    profit.description.enabled && this.setHtmlEditor(profit.description.text, 'description');
    
    // SET CONDITION HTML EDITO
    this.setHtmlEditor(profit.condition, 'condition');
  };

  // CLOSE DIALOG
  public closeDialog() {
    this.dialog = {
      show: false,
      position: -1,
      profit: {
        _id: '',
        name: '',
        picture: '',
        condition: '',
        category: '',
        date: {
          start: this.$app.$moment(),
          end: this.$app.$moment()
        },
        description: {
          text: '',
          enabled: false
        },

        // SET PICTURE PROFITS TO NEW UPLOAD PICTURE
        newPictureProfit: [],

        color: '#12539b',
        devolution: '',
        percent: '',
        disabled: false
      }
    }
  }

  // ADD PROFITS
  public addProfit() {

    // PUSH PROFITS IN PROFITS
    this.profits.unshift({
      ...this.dialog.profit,
      date: {
        start: this.$app.$moment(this.dialog.profit.date.start).toDate(),
        end: this.$app.$moment(this.dialog.profit.date.end).toDate()
      }
    })

    // CLEAN DIALOG
    this.dialog = {
      show: false,
      position: -1,
      profit: {
        _id: '',
        name: '',
        picture: '',
        condition: '',
        category: '',
        date: {
          start: new Date(),
          end: new Date()
        },
        description: {
          text: '',
          enabled: false
        },

        // SET PICTURE PROFITS TO NEW UPLOAD PICTURE
        newPictureProfit: [],

        color: '#12539b',
        devolution: '',
        percent: '',
        disabled: false
      }
    }
  }

  // ADD PROFITS
  public updateProfit() {
    // SET PROFITS
    this.profits[this.dialog.position] = {
      ...this.dialog.profit,
      date: {
        start: this.$app.$moment(this.dialog.profit.date.start).toDate(),
        end: this.$app.$moment(this.dialog.profit.date.end).toDate()
      }
    }

    // CLEAN DIALOG
    this.dialog = {
      show: false,
      position: -1,
      profit: {
        _id: '',
        name: '',
        picture: '',
        condition: '',
        category: '',
        date: {
          start: new Date(),
          end: new Date()
        },
        description: {
          text: '',
          enabled: false
        },

        // SET PICTURE PROFITS TO NEW UPLOAD PICTURE
        newPictureProfit: [],

        color: '#12539b',
        devolution: '',
        percent: '',
        disabled: false
      }
    }
  }

  // REMOVE PROFITS
  public removeProfit() {
    this.profits = this.profits.splice(this.dialog.position, 1);
  }

  // GET FORMAT DATE
  public getFormatDate(date: ProfitDateRangeInterface): string {
    const monthStart = this.$app.$moment(date.start).month();
    const monthEnd = this.$app.$moment(date.end).month();

    let dateFinal = '';

    monthStart === monthEnd
      ? dateFinal = `Del ${this.$app.$moment(date.start).format('D')} al ${this.$app.$moment(date.end).format('D')} de ${this.$app.$moment(date.end).format('MMMM')}`
      : dateFinal = `Del ${this.$app.$moment(date.start).format('D')} de ${this.$app.$moment(date.start).format('MMMM')} al ${this.$app.$moment(date.end).format('D')} de ${this.$app.$moment(date.end).format('MMMM')}`

    return dateFinal;
  }

  // GET HTML EDITOR 
  public async getHtmlEditor(target: string) {
    if (target === 'description') {
      this.dialog.profit.description.text = this.descriptionEditor.getHTML();
    } else {
      this.dialog.profit.condition = this.conditionEditor.getHTML();
    }
  }

  // SET HTML EDITOR
  public setHtmlEditor(html: string, target: string) {
    setTimeout(() => {
      if (target === 'description') {
        this.descriptionEditor.setHTML(html);
      } else {
        this.conditionEditor.setHTML(html);
      }
    }, 200);
  }

  // DECRYPT HTML
  public decryptHTML(profits: Array<ProfitInterface>) {
    return profits.map((profit: ProfitInterface) => {
      const descriptionText = decrypt(profit.description.text)
      const conditionText = decrypt(profit.condition)
      return {
        ...profit,
        condition: conditionText,
        description: {
          enabled: profit.description.enabled,
          text: descriptionText
        }
      }
    })
  }

  // VALIDATE PICTURE PROFIT
  public validatePictureProfit(profit: ProfitInterface) {
    console.log(profit);

    return profit.newPictureProfit
      && profit.newPictureProfit.length > 0
      && profit.newPictureProfit[0].img
      ? profit.newPictureProfit[0].img
      : profit.picture
        ? profit.picture
        : '';
  }

  // SAVE ITEM
  public async saveProfitsDraft() {
    // FIRST UPDATE PRODUCT STATUS DRAFT
    await this.updateProfitsDraft();

    // REFRESH ROUTE
    window.location.reload();
  }

  public async goPreview() {
    // FIRST CREATE STATUS DRAFT
    await this.updateProfitsDraft();

    // GO PREVIEW BEFORE CREATE PRODUCT
    const route = this.$router.resolve({ path: `/previews/category/profits/${this.categoryID}` });
    window.open(route.href, '_blank');

    // REFRESH ROUTE
    window.location.reload();
  }

}

export default ProfitItemsUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="pa-5" justify="center">
    <!-- PROFITS IMAGE -->
    <v-col cols="6">
      <v-alert class="mb-3" rounded="xl" color="info" icon="$info" title="Información" prominent>
        <p class="text-body-2 my-2">Puedes gestionar tus beneficios de manera continua he ir agregando todas las
          que
          necesites, <br> se le debe colocar a cada beneficio su respectiva categoría y su fecha de apertura y
          cierre
        </p>
      </v-alert>
    </v-col>
    <v-col cols="6">
      <v-alert class="mb-3" rounded="xl" color="success" icon="$success" title="Importante" prominent>
        <p class="text-body-2 my-2">Las Beneficios trabajan de manera independiente, <br> es decir que cada una
          tiene su
          categoría <br> de manera automática en la vista de beneficios BSC</p>
      </v-alert>
    </v-col>

    <!-- FORM PROFITS -->
    <v-col cols="12">
      <v-row class="mb-15 pb-15" align-content="center" justify="center">
        <!-- INPUTS COMPONENT -->
        <v-col class="banner-create-card py-0 px-5 mt-5 mx-auto text-center align-center d-flex" cols="12">
          <p class="text-weight-bold">
            Crear nueva tarjeta de beneficio
          </p>
          <v-btn @click="openDialog()" class="ml-5" density="compact" variant="outlined" color="white" icon>
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
        <v-col v-for="(profit, i) in profits" cols="3">
          <v-card width="250" height="380" :key="profit.name" rounded="xl" class="pa-0">
            <v-card-text class="pa-0">
              <v-row class="my-0" align-content="center" justify="center" no-gutters>
                <v-col cols="12">
                  <div class="profit-card-image pa-5" :style="`background-color: ${profit.color}`">
                    <v-img
                      v-if="profit.picture?.length > 0 || profit.pictureImageDetail?.image"
                      width="100%"
                      height="100%"
                      :src="profit.picture?.[0]?.img?? profit.pictureImageDetail?.image"
                      contain
                    />
                    <p v-else>{{ profit.name }}</p>
                    <!--<v-img v-if="validatePictureProfit(profit) !== ''" width="100%" height="100%"
                      :src="validatePictureProfit(profit)" contain />
                    <p v-else>{{ profit.name }}</p>-->
                  </div>
                </v-col>
                <v-col cols="12" class="profit-card-info pa-3 text-left">
                  <div class="my-2 d-flex align-center">
                    <v-icon class="profit-card-icon" :style="`background-color: ${profit.color}`" color="#ffffff"
                      size="20">
                      mdi-cash
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Devolución</p>
                      <p class="my-0 text-caption">
                        RD$ {{ profit.devolution.substring(0, 20) }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon class="profit-card-icon" :style="`background-color: ${profit.color}`" color="#ffffff"
                      size="20">
                      mdi-percent
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Porcentaje</p>
                      <p class="my-0 text-caption">
                        {{ profit.percent }}%
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon class="profit-card-icon" :style="`background-color: ${profit.color}`" color="#ffffff"
                      size="20">
                      mdi-alarm
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Fecha</p>
                      <p class="my-0 text-caption">
                        {{ getFormatDate(profit.date) }}
                      </p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="pa-0 justify-end">
              <v-btn @click="openUpdateProfit(profit, i)" width="120" position="absolute" class="mt-2 text-caption"
                color="green" variant="tonal" rounded="shaped" style="bottom: 0">
                Editar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <!-- DIALOG CREATE PROFIT -->
    <v-dialog class="dialog-create-profit" v-model="dialog.show" max-width="60%" persistent>
      <v-card class="pa-0" rounded="xl" :color="dialog.profit.color">
        <v-card-text>
          <v-row align-content="center" justify="center">
            <v-col cols="12" class="text-center">
              <detailed-image-component color="#00a44f" rounded="xl" height="340" v-model="dialog.profit.pictureImageDetail" :legacy-image="dialog.profit.picture" text="Cargar Miniatura"></detailed-image-component>
            </v-col>

            <v-col cols="6" class="text-center mt-2">
              <v-row no-gutter>
                <v-col cols="12" class="text-center">
                  <v-text-field prepend-inner-icon="mdi-card" density="compact" variant="outlined" rounded="xl"
                    v-model="dialog.profit.name" label="Nombre o Marca" required clearable />
                </v-col>
                <v-col cols="12" class="text-center">
                  <v-text-field prepend-inner-icon="mdi-calendar" type="date" density="compact" variant="outlined"
                    rounded="xl" v-model="dialog.profit.date.start" label="Fecha de apertura" required clearable />
                </v-col>
                <v-col cols="12" class="text-center">
                  <v-select prepend-inner-icon="mdi-apps" :items="categories" item-title="name" item-value="_id"
                    density="compact" variant="outlined" rounded="xl" v-model="dialog.profit.category" label="Categoría"
                    required />
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="6" class="text-center mt-2">
              <v-row no-gutter>
                <v-col cols="12" class="text-center">
                  <v-text-field prepend-inn r-icon="mdi-cash" density="compact" variant="outlined" rounded="xl"
                    v-model="dialog.profit.devolution" label="Devolución" required clearable />
                </v-col>
                <v-col cols="12" class="text-center">
                  <v-text-field prepend-inner-icon="mdi-calendar" type="date" density="compact" variant="outlined"
                    rounded="xl" v-model="dialog.profit.date.end" label="Fecha de cierre" required clearable />
                </v-col>
                <v-col cols="12" class="text-center">
                  <v-text-field prepend-inner-icon="mdi-percent" density="compact" variant="outlined" rounded="xl"
                    v-model="dialog.profit.percent" label="Porcentaje" required clearable />
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" class="text-center">
              <v-card width="100%" height="250" class="card-editor-description" rounded="xl">
                <app-editor-text ref="conditionEditor" theme="snow" @textChange="getHtmlEditor('condition')" />
              </v-card>
            </v-col>
            <v-col class="py-0 mx-auto text-center d-flex justify-center" cols="12">
              <v-switch color="green" class="mx-5" density="compact" v-model="dialog.profit.description.enabled"
                label="¿Habilitar Descripción Detallada?" inset />
              <v-switch color="green" class="mx-5" density="compact" v-model="isChangeColor"
                label="¿Cambiar Color de Fondo?" inset />
            </v-col>
            <v-col v-if="isChangeColor" cols="12" class="text-center">
              <v-color-picker width="100%" mode="hexa" density="compact" rounded="xl" v-model="dialog.profit.color" />
            </v-col>
            <v-col v-if="dialog.profit.description.enabled" cols="12" class="text-center">
              <v-card width="100%" height="250" class="card-editor-description" rounded="xl">
                <app-editor-text ref="descriptionEditor" theme="snow" @textChange="getHtmlEditor('description')" />
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <template v-slot:actions>
          <v-btn @click="closeDialog()">
            cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn :disabled="!dialog.profit.category || !dialog.profit.name"
            @click="action === 'create' ? addProfit() : updateProfit()">
            {{ action === 'create' ? 'agregar' : 'actualizar' }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn @click="updateProfits()" :disabled="profits.length < 1" :loading="loading">
        <v-icon>
          mdi-upload
        </v-icon>
        Actualizar y publicar
      </v-btn>
      <v-btn @click="saveProfitsDraft()" :disabled="profits.length < 1" :loading="loading">
        <v-icon>
          mdi-content-save
        </v-icon>
        Guardar borrador
      </v-btn>
      <v-btn @click="goPreview()" :disabled="profits.length < 1" :loading="loading">
        <v-icon>
          mdi-eye
        </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->

    <!-- PROFITS IMAGE -->
    <v-file-input ref="profitImage" class="d-none" accept=".jpg, .jpeg, .png" @update:model-value="getProfitImage" />
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

.dialog-create-profit {
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

.profit-card-image {
  width: 95%;
  height: 120px;
  margin: 5px auto 0 auto;
  border-radius: 20px;
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

.profit-card-info {
  background-color: #ffffff;
  color: #535353;

  .profit-card-condition {
    height: 100px;
    overflow: hidden;
  }

  .profit-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }
}

.card-editor-description {
  .ql-editor {
    overflow-y: auto;
    height: 100%;
    caret-color: #12539b;
  }
}
</style>