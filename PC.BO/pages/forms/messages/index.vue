<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Watch } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationMessages from "~/assets/animations/messages-animation.json";

// IMPORT INTERFACE
import type {
  FormsBscInterfaces,
  InputsBscFormInterface,
} from "~/interfaces/forms.interfaces";

// IMPORT QUERY'S
import { GET_FORMS_BSC } from "~/graphql/query/forms.query";
import {
  DOWNLOAD_MESSAGES_FORM,
  GET_MESSAGES_FORMS,
} from "~/graphql/query/messages.query";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "forms-messages-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
  },
})
class FormsMessagesListScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // PAPA PARSE INSTANCE
  public $papa: any;

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // ANIMATIONS LOTTIE
  public animationMessages: any = AnimationMessages;

  // DIALOG DELETE SLIDER OPTIONS
  public dialog = {
    show: false,
    categoriesID: "",
    loading: false,
  };

  // LOADING DOWNLOAD BUTTON
  public loading: boolean = false;

  // HEADER FOR TABLE
  public headers: Array<any> = [];

  // COLUMN FOR TABLE
  public columns: Array<any> = [];

  // SLIDER DEFAULT VALUES
  public messages: Array<any> = [];

  // SLIDER DEFAULT VALUES
  public formsBsc: Array<FormsBscInterfaces> = [];

  // DEFAULT DATE START TEXT
  public dateStartText: string = "";

  // DEFAULT DATE START TEXT
  public dateEndText: string = "";

  // ARGS FILTER MESSAGES
  public argsMessages: {
    date: { start: Date | null; end: Date | null };
    formRef: string;
    search: string;
  } = {
    date: {
      start: null,
      end: null,
    },
    formRef: "",
    search: "",
  };

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    // SET MESSAGES
    this.setMessages();

    // SET FORMS
    this.setForms();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET MESSAGES
  public async setMessages() {
    try {
      const argsMessages = {
        argsMessages: {
          ...this.argsMessages,
        },
      };
      // GET ALL MESSAGES
      const { data } = await this.$apollo.query({
        query: GET_MESSAGES_FORMS,
        variables: argsMessages,
        fetchPolicy: "no-cache",
      });

      // SET CATEGORIES TO VARIABLE
      this.messages = data.findMessages;

      // SET DATA FOR TABLE
      this.prepareDataTable();
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET FORMS
  public async setForms() {
    try {
      // GET ALL FORMS
      const { data } = await this.$apollo.query({
        query: GET_FORMS_BSC,
        fetchPolicy: "no-cache",
      });

      // SET CATEGORIES TO VARIABLE
      this.formsBsc = data.findForms;

      // SET FIRST FORM ID
      this.argsMessages.formRef =
        data.findForms.length > 0 ? data.findForms[0]._id : "";
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public prepareDataTable() {
    // MAP FORMS BSC AND FIND NAMES HEADERS
    const getHeadersForTable = this.formsBsc.map((form: FormsBscInterfaces) => {
      let headers: Array<any> = [];
      if (this.argsMessages.formRef === form._id) {
        const getNames = form.inputs
          .filter((input: InputsBscFormInterface) => !input.hidden)
          .map((input: InputsBscFormInterface) => ({
            inputID: input._id,
            name: input.name,
            label: input.label,
          }));
        headers = [...getNames];
      } else {
        headers = [];
      }
      return headers;
    });

    // CLEAN HEADER ARRAY EMPTY
    const cleanHeader = getHeadersForTable
      .filter((nms: any) => nms.length > 0)
      .flat(1);

    // SET HEADER VALUES
    this.headers = cleanHeader;

    // MAP MESSAGES FORM AND FIND VALUES COLUMN
    const getColumnForTable = this.messages.map((message: any) => {
      const values = () => {
        if (message.form._id === this.argsMessages.formRef) {
          return { ...message.values, createdAt: message.createdAt };
        }
      };
      return values();
    });

    // SET COLUMNS VALUES
    this.columns = getColumnForTable;
  }

  public async downloadCsvMessages() {
    this.loading = true;
    try {
      const findFormRefName = this.formsBsc.find(
        (form: any) => form._id === this.argsMessages.formRef
      );

      const argsMessages = {
        argsMessages: this.argsMessages,
      };
      // GET ALL MESSAGES
      const { data } = await this.$apollo.query({
        query: DOWNLOAD_MESSAGES_FORM,
        variables: argsMessages,
        fetchPolicy: "no-cache",
      });

      const messagesDownload = data.findMessagesAndDownloadFile.map(
        (message: any) => {
          let valuesFormat: any = {};
          message.values.map((value: any) => {
            for (const key in value) {
              if (Object.prototype.hasOwnProperty.call(value, key)) {
                valuesFormat = {
                  ...valuesFormat,
                  [value.name]: value.valueInput,
                };
              }
            }
          });
          return valuesFormat;
        }
      );

      const csv = this.$papa.unparse(messagesDownload, {
        delimiter: ",",
      });

      this.$papa.download(
        csv,
        findFormRefName && findFormRefName.title
          ? `${findFormRefName.title} - ${this.$app
              .$moment()
              .format("YYYY-MM-DD HH:mm:ss A")}`
          : `Auditoria De Mensajes - ${this.$app
              .$moment()
              .format("YYYY-MM-DD HH:mm:ss A")}`
      );
      this.loading = false;
    } catch (err) {
      this.loading = false;
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // OPEN DIALOG ALERT REMOVE SLIDER
  public openDialogAlertRemove(categoriesID: string) {
    this.dialog.show = true;
    this.dialog.categoriesID = categoriesID;
  }

  // OPEN DIALOG ALERT REMOVE SLIDER
  public closeDialogAlertRemove() {
    this.dialog.show = false;
    this.dialog.categoriesID = "";
    this.dialog.loading = false;
  }

  public dateStartChange(date: any) {
    this.dateStartText = `${this.$app.$moment(date).format("DD")} de ${this.$app
      .$moment(date)
      .format("MMMM")} del ${this.$app.$moment(date).format("YYYY")}`;
  }

  public dateEndChange(date: any) {
    this.dateEndText = `${this.$app.$moment(date).format("DD")} de ${this.$app
      .$moment(date)
      .format("MMMM")} del ${this.$app.$moment(date).format("YYYY")}`;
  }

  public getFormatDate(date: Date) {
    return `${this.$app.$moment(date).format("DD")} ${this.$app
      .$moment(date)
      .format("MMMM")} ${this.$app.$moment(date).format("YYYY")}`;
  }

  ///////////////
  /// WATCHER ///
  ///////////////

  // WATCH FILTERSTART
  @Watch("dateStartText")
  public async watchFilterSearchStartDate() {
    if (this.dateStartText && this.dateEndText) {
      await this.setMessages();
    }
  }

  // WATCH FILTER END
  @Watch("dateEndText")
  public async watchFilterSearchEndDate() {
    if (this.dateEndText && this.dateStartText) {
      await this.setMessages();
    }
  }

  // WATCH FILTER
  @Watch("argsMessages.formRef")
  public async watchFilterSearchRef() {
    await this.setMessages();
  }
}

export default FormsMessagesListScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="11">
      <client-only>
        <v-card
          width="100%"
          height="180px"
          rounded="xl"
          class="card-principal-container pa-0 ma-0"
          color="#00a44f"
          flat
        >
          <v-card-text>
            <v-row align-content="center" justify="space-between">
              <v-col
                cols="6"
                class="card-principal-info-container text-left d-flex flex-column align-self-center"
              >
                <p
                  class="text-h5 text-uppercase text-white font-weight-bold ml-10"
                >
                  Mensajes de formularios BSC,
                </p>
                <p class="text-caption text-white font-weight-light ml-10"></p>
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="350px"
                  height="350px"
                  :loop="true"
                  :animationData="animationMessages"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5" justify="center" align-content="center">
    <v-col cols="3">
      <v-select
        v-model="argsMessages.formRef"
        class="ml-5"
        prepend-inner-icon="mdi-form-select"
        rounded="xl"
        density="compact"
        variant="solo"
        item-title="title"
        item-value="_id"
        :items="formsBsc"
        label="Seleccione formulario"
      />
    </v-col>
    <v-col cols="3">
      <v-text-field
        class="ml-5"
        rounded="xl"
        prepend-inner-icon="mdi-calendar"
        v-model="dateStartText"
        density="compact"
        variant="solo"
        label="Seleccione fecha de apertura"
      >
        <v-menu activator="parent" :close-on-content-click="false">
          <v-date-picker
            v-model="argsMessages.date.start"
            full-width
            hide-header
            color="primary"
            @update:model-value="dateStartChange"
          />
        </v-menu>
      </v-text-field>
    </v-col>
    <v-col cols="3">
      <v-text-field
        class="ml-5"
        rounded="xl"
        prepend-inner-icon="mdi-calendar"
        v-model="dateEndText"
        density="compact"
        variant="solo"
        label="Seleccione fecha de cierre"
      >
        <v-menu activator="parent" :close-on-content-click="false">
          <v-date-picker
            v-model="argsMessages.date.end"
            full-width
            hide-header
            color="primary"
            @update:model-value="dateEndChange"
          />
        </v-menu>
      </v-text-field>
    </v-col>
    <v-col cols="2">
      <v-btn
        @click="downloadCsvMessages()"
        class="text-caption"
        rounded="xl"
        color="primary"
        :disabled="
          !argsMessages.formRef ||
          !argsMessages.date.start ||
          !argsMessages.date.end ||
          !dateStartText ||
          !dateEndText ||
          messages.length === 0
        "
        :loading="loading"
      >
        Descargar csv
      </v-btn>
    </v-col>
  </v-row>
  <v-row class="px-15 pb-10" justify="center" align-content="center">
    <v-col v-if="messages.length > 0" cols="12">
      <!-- MESSAGES TABLE -->
      <v-table class="rounded-xl">
        <thead style="background: #12539b">
          <tr class="text-caption text-white">
            <th class="text-left">Fecha De Creación</th>
            <th v-for="header in headers" :key="header" class="text-left">
              {{ header.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(column, i) in columns" :key="column.inputID">
            <tr>
              <td :key="i">
                {{ getFormatDate(column.createdAt) }}
              </td>
              <td v-for="data in column" :key="data.inputID">
                {{
                  data.type === "formsCheckbox"
                    ? data.valuesInputs
                    : data.valueInput
                }}
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </v-col>
    <v-col v-else cols="9">
      <v-alert
        class="mb-3"
        rounded="xl"
        color="info"
        icon="$info"
        title="Información"
        prominent
      >
        <p class="text-body-2 my-2">
          El formulario seleccionado aun no tiene mensajes o leads
        </p>
      </v-alert>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -20px;
  }

  .card-principal-animation {
    margin-top: -80px;
    margin-right: -20px;
  }
}
</style>
