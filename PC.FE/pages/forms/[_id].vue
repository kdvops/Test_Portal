<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Ref, Vue } from "vue-facing-decorator";
// IMPORT LOTTIE
import { defineAsyncComponent } from 'vue';
const Vue3Lottie = defineAsyncComponent(() => import('vue3-lottie'));

// IMPORT INTERFACES
import type { FormsBscInterfaces } from "~/interfaces/forms.interfaces";

// IMPORT GRAPHQL QUERY
import { GET_FORM_BSC_BY_SLUG, GET_FORM_BSC_BY_ID } from "~/graphql/forms.query";

// IMPORT GRAPHQL MUTATIONS
import { CREATE_MESSAGES_FORM } from "~/graphql/messages.query";

// IMPORT ANIMATIONS LOTTIE
import AnimationFormSuccess from "~/assets/animations/success-animation.json";

// IMPORT UTILS
import { isObjectId } from '~/utils/objectIdUtils'

// IMPORT COMPOSABLES
import { useForm } from '~/composables/useForm';

// IMPORT COMPONENTS
import HeroImage from '~/components/optimized-image/HeroImage.vue';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "forms-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": Vue3Lottie,
    HeroImage,
  },
})
export default class FormsScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION PROMO
  @Ref("animationSuccess") animationSuccess: any;

  // FORM CRM
  @Ref("hiddenFormRefCrm") hiddenFormRefCrm: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // LOADING STATE
  public loading: boolean = false;

  // GET PARAM FORM ID
  public pageParam = useRoute().params._id;
  public formID = '';

  // FORM BY ID
  public formBsc: FormsBscInterfaces = {
    _id: "",
    title: "",
    subtitle: "",
    description: "",
    banner: "",
    inputs: [],
    crm: {
      url: '',
      isFormCrm: false,
    },
    termsAndCondition: {
      accept: false,
      enabled: false,
      text: "",
    },
    disabled: false,
  };

  // FORM HTML
  public formHtml: any;

  // MESSAGE
  public message: any = [];

  // ANIMATIONS LOTTIE
  public animationFormSuccess: any = AnimationFormSuccess;

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

  // FORM DATA
  public formData = reactive<{ [key: string]: any }>({});

  // FIELDS
  public fields = computed(() => []);

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
    this.getFormId().then((formId) => {
      this.formID = formId
      // GET FORMS BY ID
      this.getFormById();
    }, (error) => {
      this.$router.push('/')
    })
  }

  ///////////////
  /// METHODS ///
  ///////////////
  private async getFormId(): Promise<string> {
    try {
      var param = typeof this.pageParam == 'string' ? this.pageParam : this.pageParam.join("")

      // Check if it is an object id
      if (isObjectId(param)) {
        return Promise.resolve(param)
      } else {
        // PAYLOAD BY ID
        const pageParam = { slug: this.pageParam }

        // GET ALL CATEGORIES
        const { data } = await this.$apollo.query({
          query: GET_FORM_BSC_BY_SLUG,
          variables: pageParam,
          fetchPolicy: 'no-cache'
        })

        const result = await data.findFormsBySlug
        return Promise.resolve(result._id)
      }
    }
    catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError form id', err)
      return Promise.reject(err)
    }
  }

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

      // Initialize formData with default values for each input
      this.formBsc.inputs.forEach(input => {
        this.formData[input.name] = input.value || ''; // Set initial value, or empty string
      });
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // CREATE MESSAGE
  public async createMessage() {
    // SET LOADING TRUE
    this.loading = true;
    try {
      // PAYLOAD LOGIN DTO
      const createMessagesDto = {
        createMessagesDto: {
          createdAt: this.$app.$moment().toDate(),
          form: this.formBsc._id,
          values: this.message,
        },
      };

      // CREATE PROMOTION MUTATION
      await this.$apollo.mutate({
        mutation: CREATE_MESSAGES_FORM,
        variables: createMessagesDto,
      });

      // SHOW DIALOG SUCCESS MESSAGE
      this.dialog = true;

      // SET LOADING FALSE
      this.loading = false;

      // SEND MESSAGE CRM
      if (this.formBsc.crm && this.formBsc.crm.isFormCrm) {
        this.hiddenFormRefCrm.submit();
      }

    } catch (err) {

      console.log(err)
      // SET LOADING FALSE
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // CONSTRUCT DTO MESSAGES
  public constructNewMessage($event: string, input: any) {
    // Update formData with the new value
    this.formData[input.name] = $event;

    const findInputValue = this.message.findIndex(
      (inputValue: any) => inputValue.inputID === input._id
    );

    if (findInputValue === -1) {
      this.message = [
        ...this.message,
        {
          name: input.name,
          inputID: input._id,
          valueInput: String($event),
          valuesInput: [String($event)],
          type: input.type,
        },
      ];
    } else {
      this.message[findInputValue] = {
        name: input.name,
        inputID: input._id,
        valueInput: String($event),
        valuesInput: this.valuesInputCheckbox,
        type: input.type,
      };
    }
  }

}
</script>

<!-- HTML TEMPLATE -->
<template>
  <div>
    <v-row class="forms-home-container" justify="center" align-content="center" no-gutters>
      <!-- Banner container with full width -->
      <v-row v-if="formBsc.banner" no-gutters class="w-100">
        <v-col cols="12">
          <!-- Banner image with text overlay -->
          <HeroImage
            :src="formBsc.banner?? formBsc.bannerImageDetail?.image" 
            :alt="formBsc.bannerImageDetail?.altText?? ''"
            :width="1920"
            :height="600"
            loading="eager"
            class="banner-image"
          />
        </v-col>
      </v-row>

      <template v-if="formBsc.crm && formBsc.crm.isFormCrm && formBsc.crm.url && formBsc.inputs">
        <!-- Target hidden -->
        <iframe name="formTarget" style="display: none;"></iframe>

        <!-- Form crm -->
        <form ref="hiddenFormRefCrm" :action="formBsc.crm.url" method="POST" class="d-none" target="formTarget">
          <input v-for="(inputForm, i) in formBsc.inputs" :key="`hidden-${i}`"
            :type="inputForm.type === 'formNumber' ? 'number' : inputForm.type === 'formEmail' ? 'email' : 'text'"
            :name="inputForm.name" :value="formData[inputForm.name]" />
        </form>
      </template>

      <v-row class="my-15" justify="center" no-gutters>
        <v-col cols="11" xs="11" md="8">
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
                          <v-col cols="11" xs="11" md="5" :class="inputForm.hidden ? 'd-none' : ''" class="px-2"
                            :key="i">
                            <v-select density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="!inputForm.hidden ? rules.inputSelect : []" :label="inputForm.label"
                              :name="inputForm.name" :placeholder="inputForm.placeholder" :id="inputForm.id"
                              :item-value="inputForm.selects[0]" :items="inputForm.selects" @update:model-value="
                                constructNewMessage($event, inputForm)
                                " mandatory />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formRadio'">
                          <v-col cols="11" xs="11" md="5" :class="inputForm.hidden ? 'd-none' : ''" class="px-2"
                            :key="i">
                            <v-radio-group @update:model-value="
                              constructNewMessage($event, inputForm)
                              ">
                              <template #label>
                                <p class="text-h5 text-primary font-weight-bold">
                                  {{ inputForm.label }}
                                </p>
                              </template>
                              <v-radio v-for="(item, i) in inputForm.radios" :key="i" :name="item" :id="item"
                                :label="item" :value="item" />
                            </v-radio-group>
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formCheckbox'">
                          <v-col cols="11" xs="11" md="5" :class="inputForm.hidden ? 'd-none' : ''" class="px-2"
                            :key="i">
                            <div class="d-flex flex-wrap">
                              <div class="w-100 d-flex">
                                <p class="text-h5 text-primary font-weight-bold">
                                  {{ inputForm.name }}
                                </p>
                              </div>
                              <v-checkbox v-for="(item, i) in inputForm.checkbox" v-model="valuesInputCheckbox" :key="i"
                                :label="item" :id="item" :name="item" :value="item" class="w-50" @update:model-value="
                                  constructNewMessage($event, inputForm)
                                  " />
                            </div>
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'hidden'">
                          <v-col cols="5" :class="inputForm.hidden ? 'd-none' : ''" class="px-2" :key="i">
                            <v-text-field :prepend-inner-icon="inputForm.icon" density="compact" variant="solo"
                              rounded="xl" :id="inputForm.id" :value="inputForm.value" :label="inputForm.label"
                              :placeholder="inputForm.placeholder" type="text">
                            </v-text-field>
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formText'">
                          <v-col cols="11" xs="11" md="5" :class="inputForm.hidden ? 'd-none' : ''" class="px-2"
                            :key="i">
                            <v-text-field density="compact" variant="outlined" color="primary"
                              :prepend-inner-icon="inputForm.icon" :rules="!inputForm.hidden ? rules.inputText : []"
                              :label="inputForm.label" :name="inputForm.name" :placeholder="inputForm.placeholder"
                              :id="inputForm.id" rounded="xl" type="text" @update:model-value="
                                constructNewMessage($event, inputForm)
                                " />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formEmail'">
                          <v-col cols="11" xs="11" md="5" :class="inputForm.hidden ? 'd-none' : ''" class="px-2"
                            :key="i">
                            <v-text-field density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="!inputForm.hidden ? rules.inputEmail : []" :prepend-inner-icon="inputForm.icon"
                              :label="inputForm.label" :name="inputForm.name" :placeholder="inputForm.placeholder"
                              :id="inputForm.id" type="email" @update:model-value="
                                constructNewMessage($event, inputForm)
                                " />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formTextarea'">
                          <v-col cols="10" class="px-2" :class="inputForm.hidden ? 'd-none' : ''" :key="i">
                            <v-textarea density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="!inputForm.hidden ? rules.inputTextarea : []" :prepend-inner-icon="inputForm.icon"
                              :label="inputForm.label" :name="inputForm.name" :placeholder="inputForm.placeholder"
                              :id="inputForm.id" type="text" @update:model-value="
                                constructNewMessage($event, inputForm)
                                " />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formRange'">
                          <v-col cols="10" class="px-2" :class="inputForm.hidden ? 'd-none' : ''" :key="i">
                            <v-slider density="compact" variant="outlined" color="primary" rounded="xl"
                              show-ticks="always" thumb-label="always" step="10" tick-size="3" :label="inputForm.label"
                              :name="inputForm.name" :id="inputForm.id" @update:model-value="
                                constructNewMessage($event, inputForm)
                                " />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formNumber'">
                          <v-col cols="11" xs="11" md="5" :class="inputForm.hidden ? 'd-none' : ''" class="px-2"
                            :key="i">
                            <v-text-field density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="!inputForm.hidden ? rules.inputNumeric : []" :prepend-inner-icon="inputForm.icon"
                              :label="inputForm.label" :name="inputForm.name" :placeholder="inputForm.placeholder"
                              :id="inputForm.id" type="number" @update:model-value="
                                constructNewMessage($event, inputForm)
                                " />
                          </v-col>
                        </template>
                        <template v-else-if="inputForm.type === 'formDate'">
                          <v-col cols="11" xs="11" md="5" :class="inputForm.hidden ? 'd-none' : ''" class="px-2"
                            :key="i">
                            <v-text-field density="compact" variant="outlined" color="primary" rounded="xl"
                              :rules="!inputForm.hidden ? rules.inputDate : []" :prepend-inner-icon="inputForm.icon"
                              :label="inputForm.label" :name="inputForm.name" :placeholder="inputForm.placeholder"
                              :id="inputForm.id" type="date" @update:model-value="
                                constructNewMessage($event, inputForm)
                                " />
                          </v-col>
                        </template>
                      </template>
                    </v-row>
                  </v-form>
                </v-col>
                <v-col class="text-center py-10">
                  <v-btn :loading="loading" :disabled="!formBscValid" color="primary" rounded="xl" class="mx-auto"
                    @click="createMessage()">
                    enviar
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-dialog width="50%" location="center" v-model="dialog">
        <v-card width="70%" height="580px" class="mx-auto" rounded="xl">
          <v-card-text>
            <v-row class="position-relative" justify="center" align-content="center" style="height: 500px">
              <ClientOnly>
                <template #placeholder>
                  <v-col cols="12" class="card-principal-animation">
                    <div class="text-center">Cargando...</div>
                  </v-col>
                </template>
                <v-col cols="12" class="card-principal-animation">
                  <app-lottie width="100%" height="490px" ref="animationSuccess" :loop="true"
                    :animationData="animationFormSuccess" />
                </v-col>
              </ClientOnly>
              <v-col class="text-center" cols="12">
                <v-icon color="green" size="180"> mdi-check-circle </v-icon>
              </v-col>
              <v-col class="text-center mx-auto" cols="10">
                <h1 class="text-h5 text-grey">¡Formulario enviado con éxito!</h1>
                <p class="text-body-2 mt-2">
                  Tu información ha sido recibida. Pronto nos pondremos en contacto contigo para validar tu solicitud.
                  ¡Gracias!.
                </p>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="tonal" rounded="xl" to="/" block>
              Ir al home
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
  background-color: #12499b;
  color: #ffffff;
  text-align: center;
  justify-content: center;

  &.banner-green {
    background-color: #06a242;
  }
}
</style>
