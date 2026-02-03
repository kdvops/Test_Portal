<script lang="ts">
import { Vue } from "vue-facing-decorator"
import { GET_PROUSER_DOCUMENT_VALIDATION } from "~/graphql/prouser.query";
import type { DocumentValidatePersonInterface } from "~/interfaces/prouser.interface";

@NuxtComponent({
  name: "document-validator-screen",
})
export default class DocumentValidatorScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // INPUT DEFAULT DOCUMENT
  public inputDocument: string = "";

  // STATES RESPONSE
  public isLoading: boolean = false
  public isSuccess: boolean = false
  public isError: boolean = false

  // PROUSER PERSON 
  public prouserPerson: DocumentValidatePersonInterface = {
    TIPO_IDENTIFICACION: '',
    APELLIDO: '',
    CODIGO_TIPO_IDENTIFICACION: '',
    CODIGO_VALIDACION: '',
    DESCRIPCION: '',
    FECHA: '',
    HORA: '',
    NOMBRE: '',
    NOMBRE_DESTINATARIO: '',
    NUMERO_IDENTIFICACION: '',
    PERSONA_FIRMA: '',
  }

  /////////////
  // METHODS //
  /////////////

  public cleanFetch() {
    this.prouserPerson = {
      TIPO_IDENTIFICACION: '',
      APELLIDO: '',
      CODIGO_TIPO_IDENTIFICACION: '',
      CODIGO_VALIDACION: '',
      DESCRIPCION: '',
      FECHA: '',
      HORA: '',
      NOMBRE: '',
      NOMBRE_DESTINATARIO: '',
      NUMERO_IDENTIFICACION: '',
      PERSONA_FIRMA: '',
    }
  }

  public async validateDocumentFetch() {
    this.isLoading = true
    this.cleanFetch()
    try {
      const { data } = await this.$apollo.query({
        query: GET_PROUSER_DOCUMENT_VALIDATION,
        variables: {
          documentNumber: this.inputDocument
        },
        fetchPolicy: 'no-cache'
      })

      // SET CATEGORIES
      this.prouserPerson = data.findProuserValidationDocument;
      this.isLoading = false

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
      this.isLoading = false
    }

  }

  // APPLY SEO METADATA
  public applySEOMetadata() {
    const seoData = this.robustSEO.applyRobustSEO();
    this.pageSEO.applySEO();
  }
}
</script>

<template>
  <v-container class="my-0 mx-auto">
    <v-row justify="center">
      <v-col cols="6">
        <v-card class="mx-auto my-6 rounded-xl" elevation="16" min-width="344">
          <v-toolbar color="primary" dark>
            <v-toolbar-title>Validación Documental</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-row class="pa-2" justify="center" align-content="center" no-gutters>
              <v-col cols="12">
                <p class="font-weight-bold text-grey">Ingresa el código de validación del documento</p>
                <v-text-field v-model="inputDocument" rounded="xl" density="compact" variant="outlined" class="mt-5"
                  @keydown.enter="validateDocumentFetch">
                  <template #append>
                    <v-btn :loading="isLoading" :disabled="!inputDocument" class="rounded-xl" color="primary"
                      @click="validateDocumentFetch">
                      Buscar
                    </v-btn>
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-row>
            <v-col v-if="isError">
              <v-sheet class="ma-5 pa-4 text-center mx-auto" width="100%">
                <p class="mb-5 text-medium-emphasis text-body-2">
                  Lo sentimos, no se encontraron registros coincidentes, por
                  favor intente con otro código
                </p>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="prouserPerson.NUMERO_IDENTIFICACION && !isLoading">
      <v-col>
        <v-card elevation="0">
          <v-card-item>
            <v-card-text>
              <v-row class="pa-2">
                <v-col cols="12" sm="4">
                  <v-row justify="start" class="border-thin rounded-lg">
                    <v-sheet class="pa-2 w-100 h-100 bg-primary text-white font-weight-black rounded-lg">
                      ID
                    </v-sheet>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-row justify="center" class="ml-sm-2 border-thin rounded-lg">
                    <v-sheet color="#FAF9FF" class="pa-2 w-100 h-100 rounded-lg">
                      {{ prouserPerson.CODIGO_TIPO_IDENTIFICACION }}
                    </v-sheet>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="pa-2">
                <v-col cols="12" sm="4">
                  <v-row justify="start" class="border-thin rounded-lg">
                    <v-sheet class="pa-2 w-100 h-100 bg-primary text-white font-weight-black rounded-lg">
                      Tipo de documento
                    </v-sheet>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-row justify="center" class="ml-sm-2 border-thin rounded-lg">
                    <v-sheet color="#FAF9FF" class="pa-2 w-100 h-100 rounded-lg">
                      {{ prouserPerson.TIPO_IDENTIFICACION }}
                    </v-sheet>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="pa-2">
                <v-col cols="12" sm="4">
                  <v-row justify="start" class="border-thin rounded-lg">
                    <v-sheet class="pa-2 w-100 h-100 bg-primary text-white font-weight-black rounded-lg">
                      Tipo de Carta
                    </v-sheet>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-row justify="center" class="ml-sm-2 border-thin rounded-lg">
                    <v-sheet color="#FAF9FF" class="pa-2 w-100 h-100 rounded-lg">
                      {{ prouserPerson.DESCRIPCION }}
                    </v-sheet>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="pa-2">
                <v-col cols="12" sm="4">
                  <v-row justify="start" class="border-thin rounded-lg">
                    <v-sheet class="pa-2 w-100 h-100 bg-primary text-white font-weight-black rounded-lg">
                      Nombre
                    </v-sheet>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-row justify="center" class="ml-sm-2 border-thin rounded-lg">
                    <v-sheet color="#FAF9FF" class="pa-2 w-100 h-100 rounded-lg"> {{ prouserPerson.NOMBRE }} </v-sheet>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="pa-2">
                <v-col cols="12" sm="4">
                  <v-row justify="start" class="border-thin rounded-lg">
                    <v-sheet class="pa-2 w-100 h-100 bg-primary text-white font-weight-black rounded-lg">
                      Apellido
                    </v-sheet>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-row justify="center" class="ml-sm-2 border-thin rounded-lg">
                    <v-sheet color="#FAF9FF" class="pa-2 w-100 h-100 rounded-lg">
                      {{ prouserPerson.APELLIDO }}
                    </v-sheet>
                  </v-row>
                </v-col>
              </v-row>
              <v-row class="pa-2">
                <v-col cols="12" sm="4">
                  <v-row justify="start" class="border-thin rounded-lg">
                    <v-sheet class="pa-2 w-100 h-100 bg-primary text-white font-weight-black rounded-lg">
                      Fecha de Generación
                    </v-sheet>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-row justify="center" class="ml-sm-2 border-thin rounded-lg">
                    <v-sheet color="#FAF9FF" class="pa-2 w-100 h-100 rounded-lg"> {{ prouserPerson.FECHA }} </v-sheet>
                  </v-row>
                </v-col>
              </v-row>

              <v-row class="pa-2">
                <v-col cols="12" sm="4">
                  <v-row justify="start" class="border-thin rounded-lg">
                    <v-sheet class="pa-2 w-100 h-100 bg-primary text-white font-weight-black rounded-lg">
                      Representante del Banco 
                    </v-sheet>
                  </v-row>
                </v-col>
                <v-col cols="12" sm="8">
                  <v-row justify="center" class="ml-sm-2 border-thin rounded-lg">
                    <v-sheet color="#FAF9FF" class="pa-2 w-100 h-100 rounded-lg">
                      {{ prouserPerson.PERSONA_FIRMA }}
                    </v-sheet>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
