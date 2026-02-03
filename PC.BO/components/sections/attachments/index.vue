<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type {
  SectionTypeInterface,
  DialogCreateNewSectionAttachments,
  TypeAttachment,
} from "~/interfaces/sections.interface";

// Local type for upload preview items
interface LocalUploadItem {
  file: string; // data URL (may be empty until FileReader loads)
  filetype: string;
  filename: string;
  name: string;
  description: string;
}

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "section-attachments-component",
})
class SectionAttachmentsComponent extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // PROFITS IMAGE REF
  @Ref("attachmentFileItem") attachmentFileItem!: any;

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
      style: "attachmentsDefault",
      type: "sectionAttachments",
      attachments: [],
    },
  })
  public section!: SectionTypeInterface;
  public drag: boolean = true;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // DIALOG CREATE CARD
  public dialog: {
    show: boolean;
    action: "create" | "update";
    index?: number;
    // used for update single attachment operations (keeps compatibility)
    attachment: DialogCreateNewSectionAttachments["attachment"];
    // new multiple upload items pre-create
    newUploadFileItems: Array<LocalUploadItem>;
  } = {
    show: false,
    action: "create",
    index: 0,
    attachment: {
      name: "",
      description: "",
      file: "",
      newUploadFileItem: [],
    },
    newUploadFileItems: [],
  };

  ///////////////
  /// METHODS ///
  ///////////////

  // GET IMAGE FILE(S) AND SET IN DIALOG NEW UPLOAD ITEMS (supports multiple for create, single for update)
  public getFileAttachmentItems(files: File | File[]) {
    let fileList: File[] = [];
    if (Array.isArray(files)) {
      fileList = files;
    } else if (files) {
      fileList = [files];
    }
    if (!fileList || fileList.length === 0) return;

    const MAX_SIZE = 70000000; // 70 MB

    // Si es modo update, solo tomar el primer archivo (selección única)
    if (this.dialog.action === "update") {
      const file = fileList[0];
      if (!file) return;
      
      if (file.type !== "application/pdf") {
        this.$bus?.$emit("handleError", "Solo se aceptan formato .pdf");
        return;
      }

      // Leer el archivo y asignarlo a dialog.attachment.newUploadFileItem
      const fr = new FileReader();
      fr.onload = (el: any) => {
        // Crear el nuevo objeto de archivo
        const newFileItem = {
          file: el.target.result,
          filetype: file.type.split("/")[1] || "pdf",
          filename: file.name,
        };
        
        // Actualizar el nombre con el nombre del archivo seleccionado (sin extensión)
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        
        // Asignar el archivo primero
        this.dialog.attachment.newUploadFileItem = [newFileItem];
        
        // Luego actualizar el nombre
        this.dialog.attachment.name = fileNameWithoutExt;
        
        // Forzar actualización de la vista si es necesario
        this.$forceUpdate();
      };
      fr.readAsDataURL(file);
      return;
    }

    // Modo create: múltiple selección
    // reset previous selection
    this.dialog.newUploadFileItems = [];

    fileList.forEach((file: File) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        this.$bus?.$emit("handleError", "Solo se aceptan formato .pdf");
        return;
      }
      if (file.size > MAX_SIZE) {
        this.$bus?.$emit("handleError", "El peso máximo es 70 MB");
        return;
      }

      // create preview item immediately with filename, name and description defaulted
      const previewItem: LocalUploadItem = {
        file: "", // will be filled after FileReader loads
        filetype: file.type.split("/")[1] || "pdf",
        filename: file.name,
        name: file.name, // default title = filename
        description: file.name, // keep description but not shown
      };

      // push preliminary item so UI can show filename instantly
      this.dialog.newUploadFileItems.push(previewItem);

      // read file content asynchronously and set data URL when ready
      const fr = new FileReader();
      fr.onload = (el: any) => {
        previewItem.file = el.target.result;
      };
      fr.readAsDataURL(file);
    });
  }

  // Remove a selected file from dialog list
  public removeNewUploadFileItem(index: number) {
    if (index >= 0 && index < this.dialog.newUploadFileItems.length) {
      this.dialog.newUploadFileItems.splice(index, 1);
    }
  }

  // OPEN UPLOAD INPUT
  public selectImage() {
    const imageRefs: any = this.attachmentFileItem;

    // REF IMAGE RESET (clears previous selection)
    if (imageRefs && imageRefs.value !== undefined) imageRefs.value = null;

    // REF IMAGE UPLOAD (open file selector)
    if (imageRefs && typeof imageRefs.click === "function") {
      imageRefs.click();
    } else if (
      imageRefs &&
      imageRefs.$el &&
      typeof imageRefs.$el.click === "function"
    ) {
      imageRefs.$el.click();
    }
  }

  // OPEN DIALOG CREATE CARD
  public openDialogCreateCard() {
    this.dialog.action = "create";
    this.dialog.show = true;
    this.dialog.newUploadFileItems = []; // reset any previous picks
  }

  // OPEN DIALOG UPDATE CARD (edit existing single attachment)
  public openDialogUpdateCard(index: number) {
    const existing = this.section.attachments[index] || {
      name: "",
      description: "",
      file: "",
      newUploadFileItem: [],
    };
    this.dialog.action = "update";
    this.dialog.show = true;
    this.dialog.index = index;
    // Copiar los datos existentes pero resetear newUploadFileItem para permitir nueva selección
    this.dialog.attachment = { 
      name: existing.name || "",
      description: existing.description || "",
      file: existing.file || "",
      newUploadFileItem: [] // Resetear para permitir seleccionar nuevo archivo
    };
    this.dialog.newUploadFileItems = []; // keep upload list empty for update mode
  }

  // CLOSE DIALOG CREATE CARD
  public closeDialog() {
    this.dialog.action = "create";
    this.dialog.show = false;
    this.dialog.attachment = {
      name: "",
      description: "",
      file: "",
      newUploadFileItem: [],
    };
    this.dialog.newUploadFileItems = [];
  }

  public validateAction() {
    if (this.dialog.action === "create") {
      this.createNewAttachmentSection();
      this.closeDialog();
    } else {
      this.updateAttachmentSection();
      this.closeDialog();
    }
  }

  // GO TO PDF
  public goToPdf(file: string) {
    window.open(file, "_blank");
  }

  ////////////////////
  /// EMIT METHODS ///
  ////////////////////

  // UPDATE SECTION
  @Emit("updateSection")
  public updateSection(): SectionTypeInterface {
    return this.section!;
  }

  // REMOVE SECTION
  @Emit("removeSection")
  public removeSection(): number {
    return this.section.position;
  }

  // CREATE ATTACHMENT ITEMS (multiple)
  @Emit("createNewAttachmentSection")
  public createNewAttachmentSection(): {
    position: number;
    attachments: TypeAttachment[];
  } {
    // map local preview items to the expected TypeAttachment shape
    const attachments: TypeAttachment[] = this.dialog.newUploadFileItems.map(
      (it: any) => ({
        name: it.name || it.filename,
        description: it.description || it.filename,
        file: it.file || "", // data URL (may be empty for a short time until FileReader finishes)
        newUploadFileItem: [
          {
            file: it.file || "",
            filetype: it.filetype || "pdf",
            filename: it.filename || "",
          },
        ],
      })
    );

    return {
      position: this.section.position,
      attachments,
    };
  }

  // UPDATE ATTACHMENT ITEM (single)
  @Emit("updateAttachmentSection")
  public updateAttachmentSection(): {
    position: number;
    index: number;
    attachment: TypeAttachment;
  } {
    // Asegurar que newUploadFileItem esté presente y tenga el formato correcto
    const attachment: TypeAttachment = {
      ...this.dialog.attachment,
      newUploadFileItem: this.dialog.attachment.newUploadFileItem || [],
    };
    
    return {
      position: this.section.position,
      index: this.dialog.index!,
      attachment,
    };
  }

  // REMOVE ATTACHMENT ITEM
  @Emit("removeAttachmentSection")
  public removeAttachmentSection(
    position: number,
    index: number
  ): { position: number; index: number } {
    return { position, index };
  }
}
export default SectionAttachmentsComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 my-5" justify="start" no-gutters>
    <v-col cols="12">
      <div
        class="text-center py-5 rounded-t-xl"
        :style="`background-color: ${
          section.color ? section.color : '#12539b'
        }; position: relative`"
      >
        <h3 class="text-h5 text-white">
          {{ section.name ? section.name : "Sección sin titulo" }}
        </h3>
        <p class="text-white text-caption">
          {{
            section.description || section.name
              ? section.description
              : "Las secciones sin titulo ni descripción no se mostrara este encabezado!!"
          }}
        </p>
        <v-btn
          class="ma-2"
          density="comfortable"
          position="absolute"
          location="end top"
          variant="text"
          icon
        >
          <v-icon size="20" color="#ffffff">mdi-dots-vertical</v-icon>
          <v-menu activator="parent" location="end" close-on-content-click>
            <v-list>
              <v-list-item @click="updateSection()" title="Editar Sección" />
              <v-list-item @click="removeSection()" title="Eliminar Sección" />
            </v-list>
          </v-menu>
        </v-btn>
      </div>
    </v-col>
    <v-col cols="12">
      <v-card rounded="b-xl" color="#ffffffbb" flat>
        <v-card-text class="pa-8">
          <v-row align-content="center" no-gutters>
            <draggable
              class="d-flex flex-wrap justify-center w-100"
              :list="section.attachments"
              @start="drag = true"
              @end="drag = false"
              item-key="_id"
              :filter="'.no-sort'"
              :prevent-on-filter="false"
            >
              <template #item="{ element, index }">
                <v-col v-if="element.status !== 'remove'" cols="4" :key="index">
                  <v-card
                    max-width="320"
                    class="pa-2"
                    rounded="lg"
                    :style="`border-bottom: ${section.color} solid 5px`"
                  >
                    <v-card-text class="pa-0" style="height: 120px">
                      <v-btn
                        class="ma-2"
                        density="comfortable"
                        position="absolute"
                        location="end top"
                        variant="text"
                        icon
                      >
                        <v-icon size="20" :color="section.color"
                          >mdi-dots-vertical</v-icon
                        >
                        <v-menu
                          activator="parent"
                          location="end"
                          close-on-content-click
                        >
                          <v-list>
                            <v-list-item
                              @click="openDialogUpdateCard(index)"
                              title="Editar Tarjeta"
                            />
                            <v-list-item
                              @click="
                                removeAttachmentSection(section.position, index)
                              "
                              title="Eliminar Tarjeta"
                            />
                          </v-list>
                        </v-menu>
                      </v-btn>
                      <v-row justify="start" no-gutters>
                        <v-col cols="12" class="text-left mt-2 px-2">
                          <div
                            class="d-flex justify-content-center align-center"
                          >
                            <v-avatar size="60" class="mr-4" color="#fbfaff">
                              <img src="~/assets/icons/Icono_informacion.svg" alt="Icono de información" />
                            </v-avatar>
                            <p class="text-h6 text-primary font-weight-bold">
                              <strong>{{ element.name }}</strong>
                            </p>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="text-center">
                      <v-spacer />
                      <v-btn
                        width="100"
                        :disabled="!element.file"
                        @click="goToPdf(element.file)"
                        class="mt-2"
                        rounded="xl"
                        color="primary"
                        variant="elevated"
                        >Ver Pdf</v-btn
                      >
                      <v-spacer />
                    </v-card-actions>
                  </v-card>
                </v-col>
              </template>
            </draggable>
            <v-col :cols="section.style === 'cardsLarge' ? '2' : '5'">
              <v-card
                width="320"
                class="pa-0 mt-5"
                @click="openDialogCreateCard()"
              >
                <v-card-text class="pa-0">
                  <v-row
                    align-content="center"
                    justify="center"
                    style="height: 150px"
                    no-gutters
                  >
                    <v-col cols="12" class="text-center">
                      <v-icon color="primary" size="50">mdi-plus</v-icon>
                      <p class="text-primary">Agregar Documento</p>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- DIALOG CREATE CARD -->
  <v-dialog v-model="dialog.show" width="800">
    <v-card
      rounded="xl"
      :color="section.color"
      :title="dialog.action === 'create' ? `Nueva Tarjeta - ${section.name}` : `Editar Tarjeta - ${section.name}`"
    >
      <v-card-text>
        <v-row justify="center" align-content="center">
          <v-col class="text-center mt-4 mb-0" cols="12">
            <v-btn width="90" height="90" @click="selectImage()" icon>
              <v-icon size="44" color="#12539b">mdi-file-plus</v-icon>
            </v-btn>
          </v-col>

          <!-- Selected files preview as small cards side-by-side (CREATE mode) -->
          <v-col
            cols="12"
            v-if="
              dialog.action === 'create' &&
              dialog.newUploadFileItems && 
              dialog.newUploadFileItems.length > 0
            "
          >
            <p class="ma-0">
              <strong
                >Archivos seleccionados ({{
                  dialog.newUploadFileItems.length
                }})</strong
              >
            </p>
            <v-divider class="my-2" />
            <v-row dense wrap>
              <v-col
                v-for="(f, idx) in dialog.newUploadFileItems"
                :key="idx"
                cols="12"
                sm="6"
                md="4"
                lg="4"
              >
                <v-card class="upload-card pa-2" elevation="1" outlined>
                  <v-row no-gutters align="center">
                    <v-col cols="3" class="d-flex align-center justify-center">
                      <v-avatar size="48" color="#f7f7f7">
                        <v-icon color="red darken-2" size="28"
                          >mdi-file-pdf-box</v-icon
                        >
                      </v-avatar>
                    </v-col>
                    <v-col cols="7">
                      <p
                        class="ma-0 text-subtitle-2 font-weight-medium"
                        style="
                          overflow: hidden;
                          text-overflow: ellipsis;
                          white-space: nowrap;
                        "
                      >
                        {{ f.filename }}
                      </p>
                      <p class="ma-0 caption grey--text">PDF</p>
                    </v-col>
                    <v-col cols="2" class="text-right">
                      <v-btn
                        icon
                        small
                        @click="removeNewUploadFileItem(idx)"
                        title="Eliminar archivo"
                      >
                        <v-icon size="18" color="grey">mdi-close</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-divider class="my-2" />

                  <!-- Sólo título editable -->
                  <v-text-field
                    v-model="f.name"
                    dense
                    hide-details
                    placeholder="Título"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Selected file preview for UPDATE mode -->
          <v-col
            cols="12"
            v-if="
              dialog.action === 'update' &&
              dialog.attachment.newUploadFileItem && 
              dialog.attachment.newUploadFileItem.length > 0
            "
          >
            <p class="ma-0">
              <strong>Archivo seleccionado para actualizar</strong>
            </p>
            <v-divider class="my-2" />
            <v-card class="upload-card pa-2" elevation="1" outlined>
              <v-row no-gutters align="center">
                <v-col cols="3" class="d-flex align-center justify-center">
                  <v-avatar size="48" color="#f7f7f7">
                    <v-icon color="red darken-2" size="28"
                      >mdi-file-pdf-box</v-icon
                    >
                  </v-avatar>
                </v-col>
                <v-col cols="9">
                  <p
                    class="ma-0 text-subtitle-2 font-weight-medium"
                    style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{ dialog.attachment.newUploadFileItem[0].filename }}
                  </p>
                  <p class="ma-0 caption grey--text">PDF</p>
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- If no files selected show helper -->
          <v-col 
            class="text-center mb-5 mt-0" 
            cols="10" 
            v-if="
              (dialog.action === 'create' && (!dialog.newUploadFileItems || dialog.newUploadFileItems.length === 0)) ||
              (dialog.action === 'update' && (!dialog.attachment.newUploadFileItem || dialog.attachment.newUploadFileItem.length === 0))
            "
          >
            <p class="text-center ma-0">
              {{ dialog.action === 'create' ? 'Seleccionar archivo(s)' : 'Seleccionar archivo para actualizar' }}
            </p>
          </v-col>

          <!-- Single title input kept for update action -->
          <v-col cols="10" v-if="dialog.action === 'update'">
            <v-text-field
              v-model="dialog.attachment.name"
              rounded="xl"
              density="compact"
              variant="solo"
              label="Titulo de la tarjeta"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="closeDialog()" variant="text"> Cancelar </v-btn>
        <v-spacer />
        <v-btn
          @click="validateAction()"
          variant="text"
          :disabled="
            (dialog.action === 'create' && (!dialog.newUploadFileItems || dialog.newUploadFileItems.length === 0)) ||
            (dialog.action === 'update' && (!dialog.attachment.newUploadFileItem || dialog.attachment.newUploadFileItem.length === 0))
          "
        >
          {{ dialog.action === "create" ? "Crear" : "Actualizar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ITEMS BANNER IMAGE -->
  <v-file-input
    ref="attachmentFileItem"
    class="d-none"
    :multiple="dialog.action === 'create'"
    accept=".pdf"
    @update:model-value="getFileAttachmentItems"
  />
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.upload-card {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
