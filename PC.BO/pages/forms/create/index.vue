<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type {
  DialogCreateInputsFormsInterface,
  FormsBscInterfaces,
  InputsBscFormInterface,
} from "~/interfaces/forms.interfaces";
import type { UploadFileItem } from "~/interfaces/sections.interface";

// IMPORT MUTATIONS
import { CREATE_FORM_BSC } from "~/graphql/mutations/forms.mutation";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";

// IMPORT LODASH
import _ from "lodash";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "forms-create-screen",
  components: {
    "detailed-image-component": DetailedImageComponent,
  },
})
class FormsCreateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // CATEGORY REF
  @Ref("bannerFormImage") bannerFormImage!: any;

  // REF DOCUMENT
  @Ref("inputDocument") inputDocument!: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // UPLOAD BANNER
  public newUploadBanner: Array<UploadFileItem> = [];

  // VALID FORM
  public valid: boolean = false;

  // LOADING DEFAULT VALUES
  public loading: boolean = false;

  // DEFAULT LIST INPUTS TYPE
  public inputsTypes: Array<{ name: string; value: string }> = [
    { name: "Campo de texto", value: "formText" },
    { name: "Campo numérico", value: "formNumber" },
    { name: "Campo de rango", value: "formRange" },
    { name: "Campo de Selección", value: "formSelect" },
    { name: "Campo de Selección Círculos (Radios)", value: "formRadio" },
    { name: "Campo de Selección en cajas (Checkbox)", value: "formCheckbox" },
    { name: "Campo de fecha", value: "formDate" },
    { name: "Campo de texto grande", value: "formTextarea" },
    { name: "Campo de Correo", value: "formEmail" },
  ];

  // DIALOG CREATE INPUTS
  public dialog: DialogCreateInputsFormsInterface = {
    show: false,
    action: "create",
    position: -1,
    item: "",
    input: {
      id: "",
      value: "",
      name: "",
      label: "",
      icon: "mdi-",
      placeholder: "",
      type: "formText",
      radios: [],
      selects: [],
      checkbox: [],
    },
  };

  // IS CRM FORM
  public isFormCrm: boolean = false;

  // CRM FORM URL
  public crmUrl: string = "";

  // FORM CREATE DEFAULT
  public formBsc: FormsBscInterfaces = {
    title: "",
    slug: "",
    subtitle: "",
    crm: {
      isFormCrm: false,
      url: "",
    },
    description: "",
    banner: "",
    inputs: [],
    termsAndCondition: {
      text: "",
      accept: false,
      enabled: false,
    },
    disabled: false,
  };

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  public async createForm() {
    // SET LOADING TRUE
    this.loading = true;
    try {
      // GET NEW INPUTS
      const getInputs = [...this.formBsc.inputs];

      // CLEAN INPUTS
      const cleanInputs = getInputs.map((input) => {
        return _.omit(input, ["htmlType"]);
      });

      // PAYLOAD LOGIN DTO
      const createFormsDto = {
        createFormsDto: {
          ...this.formBsc,
          status: "publish",
          inputs: cleanInputs,
          banner: this.newUploadBanner.length > 0 ? this.newUploadBanner : [],
        },
      };

      // CREATE PROMOTION MUTATION
      await this.$apollo.mutate({
        mutation: CREATE_FORM_BSC,
        variables: createFormsDto,
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO DASHBOARD
      this.$router.push("/forms/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Formulario creado correctamente!",
        color: "success",
        timeout: 6000,
      });
    } catch (err) {
      // SET LOADING FALSE
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public async createFormDraft() {
    // SET LOADING TRUE
    this.loading = true;
    try {
      // GET NEW INPUTS
      const getInputs = [...this.formBsc.inputs];

      // CLEAN INPUTS
      const cleanInputs = getInputs.map((input) => {
        return _.omit(input, ["htmlType"]);
      });

      // PAYLOAD LOGIN DTO
      const createFormsDto = {
        createFormsDto: {
          ...this.formBsc,
          status: "draft",
          inputs: cleanInputs,
          banner: this.newUploadBanner.length > 0 ? this.newUploadBanner : [],
        },
      };

      // CREATE PROMOTION MUTATION
      const { data } = await this.$apollo.mutate({
        mutation: CREATE_FORM_BSC,
        variables: createFormsDto,
      });

      // SET LOADING FALSE
      this.loading = false;

      return data;
    } catch (err) {
      // SET LOADING FALSE
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GET IMAGE FILE AND SET IN BANNER
  public getFormsBanner(file: File) {
    if (file) {
      if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png"
      ) {
        if (file.size <= 19520000) {
          const newUploadBanner = this.newUploadBanner;
          const fr = new FileReader();
          fr.onload = (el: any) => {
            newUploadBanner.splice(0, 1, {
              img: el.target.result,
              filetype: file.type.split("/")[1],
            });
          };
          fr.readAsDataURL(file);
        } else {
          this.$bus.$emit("handleError", "El peso máximo es de 2 MB");
        }
      } else {
        this.$bus.$emit("handleError", "Solo se aceptan formato .png y .jpeg");
      }
    }
  }

  // OPEN UPLOAD IMAGE
  public selectImage() {
    // GET REFERENCE IMAGE
    const imageRefs: any = this.bannerFormImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // CLICK IMAGE
    imageRefs.click();
  }

  // OPEN DIALOG CREATE INPUT
  public openCreateInput() {
    this.dialog = {
      show: true,
      action: "create",
      position: -1,
      item: "",
      input: {
        id: "",
        value: "",
        name: "",
        label: "",
        icon: "mdi-",
        placeholder: "",
        type: "formText",
        radios: [],
        selects: [],
        checkbox: [],
      },
    };
  }

  // OPEN DIALOG UPDATE INPUT
  public openUpdateInput(input: InputsBscFormInterface, position: number) {
    this.dialog = {
      show: true,
      item: "",
      position: position,
      action: "update",
      input: input,
    };
  }

  // CLOSE DIALOG INPUT
  public closeDialogInput() {
    this.dialog = {
      show: false,
      action: "create",
      position: -1,
      item: "",
      input: {
        id: "",
        value: "",
        name: "",
        label: "",
        icon: "mdi-",
        placeholder: "",
        type: "formText",
        radios: [],
        selects: [],
        checkbox: [],
      },
    };
  }

  // ADD NEW INPUT TO FORM
  public addInput() {
    const newInput = { ...this.dialog.input };
    const formState = [...this.formBsc.inputs];

    // ADD INPUT TO FORM
    this.formBsc.inputs = [...formState, newInput];

    // CLEAN INPUT
    this.dialog = {
      show: false,
      action: "create",
      position: -1,
      item: "",
      input: {
        id: "",
        value: "",
        name: "",
        label: "",
        icon: "mdi-",
        placeholder: "",
        type: "formText",
        radios: [],
        selects: [],
        checkbox: [],
      },
    };
  }

  // REMOVE INPUT WITH FORM
  public removeInput(index: number) {
    this.formBsc.inputs.splice(index, 1);
  }

  // UPDATE INPUT WITH FORM
  public updateInput() {
    this.formBsc.inputs[this.dialog.position] = this.dialog.input;

    // CLEAN INPUT
    this.dialog = {
      show: false,
      action: "create",
      position: -1,
      item: "",
      input: {
        id: "",
        value: "",
        name: "",
        label: "",
        icon: "mdi-",
        placeholder: "",
        type: "formText",
        radios: [],
        selects: [],
        checkbox: [],
      },
    };
  }

  public newItemInput(flag: string) {
    // ADD ITEM OPTION INPUT
    this.dialog.input[flag] = [...this.dialog.input[flag], this.dialog.item];

    // CLEAN ITEM OPTIONS INPUT
    this.dialog.item = "";
  }

  public removeItemInput(flag: string, index: number) {
    this.dialog.input[flag].splice(index, 1);
  }

  public validateActionDialog() {
    this.dialog.action === "create" ? this.addInput() : this.updateInput();
  }

  public updateSlug() {
    this.formBsc.slug = toSlug(this.formBsc.title.toLowerCase());
  }

  // GO PREVIEW
  public async goPreview() {
    // FIRST CREATE BUSINESS STATUS DRAFT
    const form = await this.createFormDraft();

    // GO EDIT AFTER CREATE POST
    this.$router.push(`/forms/update/${form.createForms._id}`);

    // GO PREVIEW BEFORE CREATE PRODUCT
    const route = this.$router.resolve({
      path: `/previews/form/${form.createForms._id}`,
    });
    window.open(route.href, "_blank");
  }

  // SAVE ITEM
  public async saveFormDraft() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const form = await this.createFormDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/forms/update/${form.createForms._id}`);
  }

  public handleFileUpload(value: File | undefined) {
    if (value) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const htmlContent = e.target?.result as string;
        let parsedInputs = this.parseHtmlFormToInputs(htmlContent);

        // SET VALUES
        this.formBsc.inputs = parsedInputs;
      };

      reader.readAsText(value);
    }
  }

  // OPEN UPLOAD DOC
  public selectDocument() {
    const docRefs: any = this.inputDocument;

    // REF IMAGE RESET
    docRefs.value = null;

    // REF ON CLICK
    docRefs.click();
  }

  public parseHtmlFormToInputs(htmlContent: string): InputsBscFormInterface[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // GET FORM AND ATTRIBUTES
    const form: any = doc.querySelector("form");
    const action: any = form.getAttribute("action");

    const inputs: InputsBscFormInterface[] = [];
    const radioGroupsProcessed = new Set<string>();

    // GET URL ACTION
    if (form && action && this.formBsc.crm && this.formBsc.crm.url) {
      this.formBsc.crm.url = action;
    }

    doc
      .querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input, select, textarea")
      .forEach((node) => {
        const tagName = node.tagName.toLowerCase();
        const name = node.getAttribute("name") || "";
        const id = node.getAttribute("id") || "";
        const label = (
          doc.querySelector(`label[for="${id}"]`)?.textContent || ""
        ).trim();
        const placeholder = node.getAttribute("placeholder") || "";
        const required = node.hasAttribute("required");
        const type =
          node.getAttribute("type") ||
          (tagName === "textarea" ? "textarea" : "text");
        const value = (node as HTMLInputElement).value || "";
        const hidden = node.hidden;

        let inputObj: InputsBscFormInterface = {
          name,
          id,
          label,
          placeholder,
          type,
          value,
          required,
          hidden,
          icon: "mdi-",
          radios: [],
          selects: [],
          checkbox: [],
        };

        if (type === "hidden") {
          inputObj.type = "hidden";
        } else if (type === "date") {
          inputObj.type = "formDate";
        } else if (type === "number") {
          inputObj.type = "formNumber";
        } else if (type === "email") {
          inputObj.type = "formEmail";
        } else if (tagName === "select") {
          const selectElement = node as HTMLSelectElement;
          inputObj.type = "formSelect";
          inputObj.selects = Array.from(selectElement.options).map(
            (option) => option.value || option.textContent?.trim() || ""
          );
          inputObj.value = selectElement.value;
        } else if (
          type === "radio" &&
          name &&
          !radioGroupsProcessed.has(name)
        ) {
          inputObj.type = "formRadio";
          inputObj.radios = Array.from(
            doc.querySelectorAll(`input[type="radio"][name="${name}"]`)
          ).map((radio) => radio.getAttribute("value") || "");
          radioGroupsProcessed.add(name);
        } else if (type === "checkbox") {
          inputObj.type = "formCheckbox";
          inputObj.checkbox.push(value || name);
        } else if (type === "text") {
          inputObj.type = "formText";
        } else if (type === "textarea") {
          inputObj.type = "formTextarea";
        } else {
          return null;
        }

        inputs.push(inputObj);
      });

    // SET VALUES FORM CRM
    this.crmUrl = action;

    // SET VALUES FORM CRM INSTANCE
    this.formBsc.crm = {
      isFormCrm: true,
      url: action,
    };

    // RETURN INPUTS
    return inputs;
  }
}

export default FormsCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="12">
      <v-form v-model="valid" lazy-validation>
        <v-row justify="center">
          <v-col cols="10">
            <detailed-image-component
              color="#00a44f"
              rounded="xl"
              height="180"
              v-model="formBsc.bannerImageDetail"
              :legacy-image="formBsc.banner"
              text="Cargar Banner"
            ></detailed-image-component>
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="formBsc.title"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Titulo"
              @change="updateSlug"
            />
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="formBsc.subtitle"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Subtitulo"
            />
          </v-col>
          <v-col cols="3">
            <v-text-field
              v-model="formBsc.slug"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Slug"
            />
          </v-col>
          <v-col
            class="py-0 mx-auto text-center d-flex justify-center"
            cols="12"
          >
            <v-switch
              color="green"
              class="mx-5"
              density="compact"
              v-model="isFormCrm"
              label="Es un Formulario con CRM?"
              inset
            />
          </v-col>
          <v-col v-if="isFormCrm" class="py-0 mx-auto text-center" cols="12">
            <v-row justify="center">
              <v-col cols="10">
                <v-sheet
                  height="120"
                  cols="12"
                  class="text-center pt-5 rounded-xl"
                  color="primary"
                >
                  <v-btn
                    variant="plain"
                    color="white"
                    :ripple="false"
                    @click="selectDocument()"
                    stacked
                  >
                    <v-icon size="80" color="white"> mdi-plus </v-icon>
                    Cargar archivo html
                  </v-btn>
                </v-sheet>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="crmUrl"
                  prepend-inner-icon="mdi-text"
                  density="compact"
                  variant="solo"
                  rounded="xl"
                  label="Url Api crm"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col
            class="banner-create-forms py-0 px-5 mb-10 mx-auto text-center align-center d-flex"
            cols="12"
          >
            <p class="text-weight-bold">Crear nuevo formulario</p>
            <v-btn
              @click="openCreateInput()"
              class="ml-5"
              density="compact"
              variant="outlined"
              color="white"
              icon
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-col>

    <v-col v-if="formBsc.inputs.length > 0" cols="10" class="pb-15 mb-15">
      <v-card rounded="xl">
        <v-card-text class="pa-0">
          <v-row justify="center" no-gutters>
            <v-col
              class="banner-create-forms py-0 px-5 mb-10 align-content-center mx-auto text-center align-center d-flex flex-wrap"
              cols="12"
            >
              <div class="w-100">
                <p class="text-h5 font-weight-regular ma-0">Formulario</p>
              </div>
              <div class="w-100">
                <p class="font-weight-bold text-caption ma-0">
                  Su formulario quedara de esta manera como aparece en el
                  recuadro!
                </p>
              </div>
            </v-col>
            <template v-for="(inputForm, i) in formBsc.inputs">
              <template v-if="inputForm.type === 'formSelect'">
                <v-col
                  cols="5"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <v-select
                    :prepend-inner-icon="inputForm.icon"
                    density="compact"
                    variant="solo"
                    rounded="xl"
                    :label="inputForm.label"
                    :name="inputForm.name"
                    :placeholder="inputForm.placeholder"
                    :id="inputForm.id"
                    :items="inputForm.selects"
                    :mandatory="true"
                    :model-value="
                      inputForm.selects.length > 0 ? inputForm.selects[0] : ''
                    "
                  >
                    <template #append-inner>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-select>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'formRadio'">
                <v-col
                  cols="5"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <v-radio-group>
                    <template #label>
                      <div class="d-flex">
                        <p class="text-h5 text-primary font-weight-bold">
                          {{ inputForm.name }}
                        </p>
                        <v-btn
                          width="28"
                          height="28"
                          color="primary"
                          rounded="xl"
                          class="ml-6"
                          variant="tonal"
                          @click="openUpdateInput(inputForm, i)"
                          icon
                        >
                          <v-icon size="18">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          width="28"
                          height="28"
                          color="red"
                          rounded="xl"
                          class="ml-1"
                          variant="tonal"
                          @click="removeInput(i)"
                          icon
                        >
                          <v-icon size="18">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </template>
                    <v-radio
                      v-for="(item, i) in inputForm.radios"
                      :key="i"
                      :label="item"
                      :value="item"
                    />
                  </v-radio-group>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'formCheckbox'">
                <v-col
                  cols="5"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <div class="d-flex flex-wrap">
                    <div class="w-100 d-flex">
                      <p class="text-h5 text-primary font-weight-bold">
                        {{ inputForm.label }}
                      </p>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="ml-6"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="ml-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                    <v-checkbox
                      v-for="(item, i) in inputForm.checkbox"
                      :key="i"
                      :label="item"
                      :value="item"
                      class="w-50"
                    />
                  </div>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'hidden'">
                <v-col cols="5" class="px-2" style="display: none" :key="i">
                  <v-text-field
                    :prepend-inner-icon="inputForm.icon"
                    density="compact"
                    variant="solo"
                    rounded="xl"
                    :label="inputForm.label"
                    :placeholder="inputForm.placeholder"
                    :value="inputForm.value"
                    type="text"
                  >
                    <template #append-inner>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'formText'">
                <v-col
                  cols="5"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <v-text-field
                    :prepend-inner-icon="inputForm.icon"
                    density="compact"
                    variant="solo"
                    rounded="xl"
                    :label="inputForm.label"
                    :name="inputForm.name"
                    :value="inputForm.value"
                    :placeholder="inputForm.placeholder"
                    :id="inputForm.id"
                    type="text"
                  >
                    <template #append-inner>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'formEmail'">
                <v-col
                  cols="5"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <v-text-field
                    :prepend-inner-icon="inputForm.icon"
                    density="compact"
                    variant="solo"
                    rounded="xl"
                    :label="inputForm.label"
                    :name="inputForm.name"
                    :placeholder="inputForm.placeholder"
                    :id="inputForm.id"
                    type="email"
                  >
                    <template #append-inner>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'formTextarea'">
                <v-col
                  cols="10"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <v-textarea
                    :prepend-inner-icon="inputForm.icon"
                    density="compact"
                    variant="solo"
                    rounded="xl"
                    :label="inputForm.label"
                    :name="inputForm.name"
                    :placeholder="inputForm.placeholder"
                    :id="inputForm.id"
                    type="text"
                  >
                    <template #append-inner>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-textarea>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'formRange'">
                <v-col
                  cols="10"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <v-slider
                    density="compact"
                    variant="solo"
                    color="green"
                    rounded="xl"
                    show-ticks="always"
                    thumb-label="always"
                    step="10"
                    tick-size="3"
                    :label="inputForm.label"
                  >
                    <template #append>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-slider>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'formNumber'">
                <v-col
                  cols="5"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <v-text-field
                    :prepend-inner-icon="inputForm.icon"
                    density="compact"
                    variant="solo"
                    rounded="xl"
                    :label="inputForm.label"
                    :name="inputForm.name"
                    :placeholder="inputForm.placeholder"
                    :id="inputForm.id"
                    type="number"
                  >
                    <template #append-inner>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
              </template>
              <template v-else-if="inputForm.type === 'formDate'">
                <v-col
                  cols="5"
                  class="px-2"
                  :key="i"
                  :style="inputForm.hidden ? 'display: none' : ''"
                >
                  <v-text-field
                    :prepend-inner-icon="inputForm.icon"
                    density="compact"
                    variant="solo"
                    rounded="xl"
                    :label="inputForm.label"
                    :name="inputForm.name"
                    :placeholder="inputForm.placeholder"
                    :id="inputForm.id"
                    type="date"
                  >
                    <template #append-inner>
                      <v-btn
                        width="28"
                        height="28"
                        color="primary"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="openUpdateInput(inputForm, i)"
                        icon
                      >
                        <v-icon size="18">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        width="28"
                        height="28"
                        color="red"
                        rounded="xl"
                        class="mx-1"
                        variant="tonal"
                        @click="removeInput(i)"
                        icon
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                </v-col>
              </template>
            </template>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- DIALOG CREATE PROMOTION -->
    <v-dialog
      class="dialog-create-inputs"
      v-model="dialog.show"
      max-width="60%"
      persistent
    >
      <v-card class="pa-0" rounded="xl" min-height="400" max-height="600">
        <v-card-text class="ma-0 pa-0">
          <v-row align-content="center" justify="center">
            <v-col
              class="banner-create-forms mb-5 py-5 px-5 mt-3 mx-auto text-center align-center d-flex"
              cols="12"
            >
              <p class="text-weight-bold mr-3">Crear nuevo Input</p>
              <v-icon>mdi-form-textbox</v-icon>
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="dialog.input.name"
                prepend-inner-icon="mdi-text"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Nombre del input"
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="dialog.input.id"
                prepend-inner-icon="mdi-text"
                density="compact"
                variant="solo"
                rounded="xl"
                label="ID del input"
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="dialog.input.label"
                prepend-inner-icon="mdi-text"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Label del input"
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="dialog.input.placeholder"
                prepend-inner-icon="mdi-text"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Placeholder del input"
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="dialog.input.icon"
                prepend-inner-icon="mdi-text"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Icono del input"
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="dialog.input.value"
                prepend-inner-icon="mdi-text"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Valor del input"
              />
            </v-col>
            <v-col cols="5">
              <v-select
                v-model="dialog.input.type"
                :items="inputsTypes"
                item-title="name"
                item-value="value"
                prepend-inner-icon="mdi-text"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Tipo de input"
              />
            </v-col>
            <template v-if="dialog.input.type === 'formSelect'">
              <v-col
                class="banner-create-forms banner-green py-0 px-5 mb-5 mx-auto text-center align-center d-flex"
                cols="12"
              >
                <p class="text-weight-bold mr-3">
                  Agrega las opciones de selección
                </p>
                <v-icon>mdi-list-box</v-icon>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.item"
                  prepend-inner-icon="mdi-text"
                  density="compact"
                  variant="solo"
                  rounded="xl"
                  label="Opción del input"
                >
                  <template #append>
                    <v-btn
                      @click="newItemInput('selects')"
                      density="compact"
                      variant="outlined"
                      color="primary"
                      icon
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="1" class="text-center">
                <v-divider
                  :thickness="3"
                  opacity="0.5"
                  color="green"
                  length="100%"
                  vertical
                />
              </v-col>
              <v-col cols="5">
                <v-list lines="one" density="compact">
                  <v-list-item
                    v-for="(item, i) in dialog.input.selects"
                    :key="item"
                    :title="item"
                  >
                    <template #prepend>
                      <v-icon color="orange"> mdi-star </v-icon>
                    </template>
                    <template #append>
                      <v-btn
                        @click="removeItemInput('selects', i)"
                        density="compact"
                        color="red"
                        icon
                      >
                        <v-icon size="20">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-col>
            </template>
            <template v-else-if="dialog.input.type === 'formRadio'">
              <v-col
                class="banner-create-forms banner-green py-0 px-5 mb-5 mx-auto text-center align-center d-flex"
                cols="12"
              >
                <p class="text-weight-bold mr-3">
                  Agrega las opciones de radio
                </p>
                <v-icon>mdi-circle</v-icon>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.item"
                  prepend-inner-icon="mdi-text"
                  density="compact"
                  variant="solo"
                  rounded="xl"
                  label="Opción del input"
                >
                  <template #append>
                    <v-btn
                      @click="newItemInput('radios')"
                      density="compact"
                      variant="outlined"
                      color="primary"
                      icon
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="1" class="text-center">
                <v-divider
                  :thickness="3"
                  opacity="0.5"
                  color="green"
                  length="100%"
                  vertical
                />
              </v-col>
              <v-col cols="5">
                <v-radio-group>
                  <v-radio
                    v-for="(item, i) in dialog.input.radios"
                    :key="i"
                    :label="item"
                    :value="item"
                    class="form-input-radio"
                  >
                    <template #label="{ label }">
                      <div class="d-flex w-100">
                        <p class="ma-0" style="width: 100% !important">
                          {{ label }}
                        </p>
                        <v-btn
                          @click="removeItemInput('radios', i)"
                          density="compact"
                          class="ml-10"
                          color="red"
                          icon
                        >
                          <v-icon size="20">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </v-radio>
                </v-radio-group>
              </v-col>
            </template>
            <template v-else-if="dialog.input.type === 'formCheckbox'">
              <v-col
                class="banner-create-forms banner-green py-0 px-5 mb-5 mx-auto text-center align-center d-flex"
                cols="12"
              >
                <p class="text-weight-bold mr-3">
                  Agrega las opciones de checkbox
                </p>
                <v-icon>mdi-checkbox-marked</v-icon>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.item"
                  prepend-inner-icon="mdi-text"
                  density="compact"
                  variant="solo"
                  rounded="xl"
                  label="Opción del input"
                >
                  <template #append>
                    <v-btn
                      @click="newItemInput('checkbox')"
                      density="compact"
                      variant="outlined"
                      color="primary"
                      icon
                    >
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="1" class="text-center">
                <v-divider
                  :thickness="3"
                  opacity="0.5"
                  color="green"
                  length="100%"
                  vertical
                />
              </v-col>
              <v-col cols="5">
                <div class="d-flex flex-wrap">
                  <v-checkbox
                    v-for="(item, i) in dialog.input.checkbox"
                    :key="i"
                    :label="item"
                    :value="item"
                    class="w-50"
                  >
                    <template #append>
                      <v-btn
                        @click="removeItemInput('checkbox', i)"
                        density="compact"
                        class="ml-10"
                        color="red"
                        icon
                      >
                        <v-icon size="20">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-checkbox>
                </div>
              </v-col>
            </template>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="closeDialogInput()" color="red"> cancelar </v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="validateActionDialog()" color="green">
            {{
              dialog.action === "create" ? "agregar input" : "actualizar input"
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn
        @click="createForm()"
        :disabled="formBsc.inputs.length < 1"
        :loading="loading"
      >
        <v-icon> mdi-upload </v-icon>
        Crear Formulario
      </v-btn>
      <v-btn
        @click="saveFormDraft()"
        :disabled="formBsc.inputs.length < 1"
        :loading="loading"
      >
        <v-icon> mdi-content-save </v-icon>
        Guardar
      </v-btn>
      <v-btn
        @click="goPreview()"
        :disabled="formBsc.inputs.length < 1"
        :loading="loading"
      >
        <v-icon> mdi-eye </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->

    <!-- FORMS IMAGE -->
    <v-file-input
      ref="bannerFormImage"
      class="d-none"
      accept=".jpg, .jpeg, .png"
      @update:model-value="getFormsBanner"
    />

    <!-- FORMS HTML -->
    <v-file-input
      class="d-none"
      ref="inputDocument"
      accept=".html"
      @update:model-value="handleFileUpload"
      show-size
      clearable
    ></v-file-input>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.banner-create-forms {
  height: 80px;
  background-color: #12539b;
  color: #ffffff;
  text-align: center;
  justify-content: center;
  box-shadow: 0px 0px 10px 0px #000000;

  &.banner-green {
    background-color: #06a242;
  }
}

.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}

.dialog-create-inputs {
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
</style>
