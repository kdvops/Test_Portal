<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Ref, Vue } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { FormsBscInterfaces } from "~/interfaces/forms.interfaces";

// IMPORT GRAPHQL QUERY
import { GET_FORM_BSC_BY_ID } from "~/graphql/query/forms.query";

// IMPORT LODASH
import _ from "lodash";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "preview-forms-screen",
})
class PreviewFormsScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION PROMO
  @Ref("animationSuccess") animationSuccess: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // LOADING STATE
  public loading: boolean = false;

  // GET PARAM FORM ID
  public formID = useRoute().params._id;

  // FORM BY ID
  public formBsc: FormsBscInterfaces = {
    _id: "",
    title: "",
    slug: '',
    subtitle: "",
    description: "",
    banner: "",
    inputs: [],
    termsAndCondition: {
      accept: false,
      enabled: false,
      text: "",
    },
    disabled: false,
  };

  // VALID FORM
  public formBscValid: boolean = false;

  // BUS INSTANCE FOR EMIT EVENT
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // CHECKBOX INPUT VALUES
  public valuesInputCheckbox: Array<string> = [];

  // DIALOG SUCCESS
  public dialog: boolean = false;

  // RULES INPUTS
  public rules: any = {
    inputText: [
      (v: string) => !!v || "Campo Requerido",
      (v: string) => {
        if (v?.length >= 4) return true;

        return "Debe tener al menos 4 caracteres";
      },
    ],
    inputEmail: [
      (v: string) => {
        if (v) return true;
        return "Email es requerido";
      },
      (v: string) => {
        if (/.+@.+\..+/.test(v)) return true;
        return "Email es invalido";
      },
    ],
    inputSelect: [
      (v: string) => {
        if (v) return true;
        return "Debe seleccionar una opción";
      },
    ],
    inputTextarea: [
      (v: string) => !!v || "Campo Requerido",
      (v: string) => {
        if (v?.length >= 4) return true;

        return "Debe tener al menos 10 caracteres";
      },
    ],
    inputDate: [
      (v: string) => {
        if (v) return true;
        return "Debe colocar la fecha";
      },
    ],
    inputNumeric: [
      (v: number) => {
        if (v) return true;
        return "Campo requerido";
      },
    ],
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    this.getFormById();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET FORM BY ID
  public async getFormById() {
    try {
      // GET FORM BY ID QUERY
      const { data } = await this.$apollo.query({
        query: GET_FORM_BSC_BY_ID,
        variables: {
          formsId: this.formID,
        },
      });

      this.formBsc = data.findFormsById;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

}

export default PreviewFormsScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <div>
    <v-row class="forms-home-container" justify="center" align-content="center" no-gutters>
      <!-- Banner container with full width -->
      <v-row v-if="formBsc.banner" no-gutters class="w-100">
        <v-col cols="12">
          <!-- Banner image with text overlay -->
          <img width="100%" height="600px" :src="formBsc.banner?? formBsc.bannerImageDetail?.image" class="banner-image" />
        </v-col>
      </v-row>

      <v-row class="my-15" justify="center" no-gutters>
        <v-col cols="8">
          <v-card elevation="5" rounded="xl">
            <v-card-text class="pa-0">
              <v-row :class="!formBsc.title && !formBsc.subtitle ? 'pt-10' : 'pt-0'" justify="center" no-gutters>
                <v-col v-if="formBsc.title || formBsc.subtitle"
                  class="banner-forms py-0 px-5 mb-10 align-content-center mx-auto text-center align-center d-flex flex-wrap"
                  cols="12">
                  <div class="w-100">
                    <p class="text-h5 font-weight-regular ma-0">
                      {{ formBsc.title }}
                    </p>
                  </div>
                  <div class="w-100">
                    <p class="font-weight-bold text-caption ma-0">
                      {{ formBsc.subtitle }}
                    </p>
                  </div>
                </v-col>
                <v-col cols="12">
                  <v-form v-model="formBscValid">
                    <v-row justify="center" no-gutters>
                      <template v-for="(inputForm, i) in formBsc.inputs">
                        <template v-if="inputForm.type === 'formSelect'">
                          <v-col cols="5" class="px-2" :key="i">
                            <v-select density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="rules.inputSelect" :prepend-inner-icon="inputForm.icon" :label="inputForm.name"
                              :placeholder="inputForm.placeholder" :items="inputForm.selects" />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formRadio'">
                          <v-col cols="5" class="px-2" :key="i">
                            <v-radio-group>
                              <template #label>
                                <p class="text-h5 text-primary font-weight-bold">
                                  {{ inputForm.name }}
                                </p>
                              </template>
                              <v-radio v-for="(item, i) in inputForm.radios" :key="i" :label="item" :value="item" />
                            </v-radio-group>
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formCheckbox'">
                          <v-col cols="5" class="px-2" :key="i">
                            <div class="d-flex flex-wrap">
                              <div class="w-100 d-flex">
                                <p class="text-h5 text-primary font-weight-bold">
                                  {{ inputForm.name }}
                                </p>
                              </div>
                              <v-checkbox v-for="(item, i) in inputForm.checkbox" v-model="valuesInputCheckbox" :key="i"
                                :label="item" :value="item" class="w-50" />
                            </div>
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formText'">
                          <v-col cols="5" class="px-2" :key="i">
                            <v-text-field density="compact" variant="outlined" color="primary"
                              :prepend-inner-icon="inputForm.icon" :rules="rules.inputText" :label="inputForm.name"
                              :placeholder="inputForm.placeholder" rounded="xl" type="text" />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formEmail'">
                          <v-col cols="5" class="px-2" :key="i">
                            <v-text-field density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="rules.inputEmail" :prepend-inner-icon="inputForm.icon" :label="inputForm.name"
                              :placeholder="inputForm.placeholder" type="email" />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formTextarea'">
                          <v-col cols="10" class="px-2" :key="i">
                            <v-textarea density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="rules.inputTextarea" :prepend-inner-icon="inputForm.icon" :label="inputForm.name"
                              :placeholder="inputForm.placeholder" type="text" />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formRange'">
                          <v-col cols="10" class="px-2" :key="i">
                            <v-slider density="compact" variant="outlined" color="primary" rounded="xl"
                              show-ticks="always" thumb-label="always" step="10" tick-size="3" :label="inputForm.name"
                             />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formNumber'">
                          <v-col cols="5" class="px-2" :key="i">
                            <v-text-field density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="rules.inputNumeric" :prepend-inner-icon="inputForm.icon" :label="inputForm.name"
                              :placeholder="inputForm.placeholder" type="number" />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formDate'">
                          <v-col cols="5" class="px-2" :key="i">
                            <v-text-field density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="rules.inputDate" :prepend-inner-icon="inputForm.icon" :label="inputForm.name"
                              :placeholder="inputForm.placeholder" type="date" />
                          </v-col>
                        </template>
                      </template>
                    </v-row>
                  </v-form>
                </v-col>
                <v-col class="text-center py-10">
                  <v-btn :loading="loading" :disabled="!formBscValid" color="primary" rounded="xl" class="mx-auto">
                    enviar
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-row>
  </div>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-animation {
  width: 100%;
  height: 100%;
  bottom: 0;
  position: absolute;
}

.banner-image {
  object-fit: cover;
}

.banner-forms {
  height: 80px;
  background-color: var(--bsc-primary-color);
  color: #ffffff;
  text-align: center;
  justify-content: center;

  &.banner-green {
    background-color: #06a242;
  }
}
</style>
