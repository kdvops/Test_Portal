<!-- components/AuthorsComponent.vue -->
<script lang="ts">
import { Vue, Prop, Emit } from "vue-facing-decorator";
import type { AuthorInterface } from "~/interfaces/author.interface";
import type { ImageDetailInterface } from "~/interfaces/detailed-image.interface";
import DetailedImageComponent from "~/components/detailed-image/index.vue";

import xicon from "~/assets/icons/icons8-x.svg";

type Socials = {
  x?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
};

type AuthorDraft = Partial<AuthorInterface> & {
  name: string;
  position?: string;
  image?: ImageDetailInterface | undefined;
  socials?: Socials;
};

@NuxtComponent({
  name: "authors-component",
  components: { "detailed-image-component": DetailedImageComponent },
})
class AuthorsComponent extends Vue {
  @Prop() declare modelValue: AuthorInterface[] | undefined;

  public xicon = xicon;
  public draftList: AuthorDraft[] | undefined = undefined;

  public modal = {
    open: false,
    form: null as AuthorDraft | null,
    formIndex: -1 as number,
  };

  @Emit("update:modelValue")
  emitAuthors(value: AuthorInterface[] | undefined) {
    return value;
  }

  get combinedNames(): string {
    const names = (this.modelValue ?? [])
      .map((a: any) => a.name?.trim())
      .filter(Boolean) as string[];
    if (!names.length) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  }

  get combinedPositions(): string {
    const uniq = Array.from(
      new Set(
        (this.modelValue ?? [])
          .map((a: any) => a.position?.trim())
          .filter(Boolean)
      )
    ) as string[];
    if (!uniq.length) return "";
    if (uniq.length === 1) return uniq[0];
    return uniq.join(" • ");
  }

  openModal() {
    this.draftList = (
      this.modelValue
        ? (this.modelValue as any[]).map((a) => ({
            ...a,
            socials: a.socials ?? {},
          }))
        : []
    ) as AuthorDraft[];
    this.modal.open = true;
    this.modal.form = null;
    this.modal.formIndex = -1;
  }

  newAuthor() {
    this.modal.form = {
      name: "",
      position: "",
      image: undefined,
      socials: {},
    };
    this.modal.formIndex = -1;
  }

  editAuthor(index: number) {
    if (!this.draftList) return;
    const row = this.draftList[index];
    this.modal.form = {
      ...row,
      socials: { ...(row.socials ?? {}) },
    };
    this.modal.formIndex = index;
  }

  saveForm() {
    if (!this.draftList) this.draftList = [];
    const draft = this.modal.form as AuthorDraft;
    if (!draft?.name?.trim()) return;

    draft.socials = {
      x: draft.socials?.x?.trim() || undefined,
      facebook: draft.socials?.facebook?.trim() || undefined,
      linkedin: draft.socials?.linkedin?.trim() || undefined,
      instagram: draft.socials?.instagram?.trim() || undefined,
    };

    if (this.modal.formIndex === -1) this.draftList.push({ ...draft });
    else this.draftList.splice(this.modal.formIndex, 1, { ...draft });

    this.modal.form = null;
    this.modal.formIndex = -1;
  }

  cancelForm() {
    this.modal.form = null;
    this.modal.formIndex = -1;
  }

  removeAuthor(index: number) {
    if (!this.draftList) return;
    this.draftList.splice(index, 1);
  }

  moveUp(index: number) {
    if (!this.draftList || index <= 0) return;
    const tmp = this.draftList[index - 1];
    this.draftList[index - 1] = this.draftList[index];
    this.draftList[index] = tmp;
  }

  moveDown(index: number) {
    if (!this.draftList || index >= this.draftList.length - 1) return;
    const tmp = this.draftList[index + 1];
    this.draftList[index + 1] = this.draftList[index];
    this.draftList[index] = tmp;
  }

  confirm() {
    const value = (this.draftList ?? []).map((a) => ({
      ...a,
      socials: a.socials ?? {},
    })) as unknown as AuthorInterface[];
    this.emitAuthors(value.length ? value : undefined);
    this.modal.open = false;
    this.draftList = undefined;
    this.cancelForm();
  }

  cancel() {
    this.draftList = undefined;
    this.modal.open = false;
    this.cancelForm();
  }

  reset() {
    this.emitAuthors(undefined);
    this.draftList = undefined;
    this.modal.open = false;
    this.cancelForm();
  }

  hasAnySocial(row: AuthorDraft): boolean {
    const s = row.socials ?? {};
    return !!(s.x || s.facebook || s.linkedin || s.instagram);
  }
}

export default AuthorsComponent;
</script>

<template>
  <div class="w-100 d-flex flex-column ga-4">
    <v-card class="pa-0 overflow-hidden rounded-xl">
      <v-toolbar>
        <v-toolbar-title text="Autores" />
        <template #append>
          <v-btn icon="mdi-pencil" @click="openModal()" />
        </template>
      </v-toolbar>

      <v-card-text>
        <div class="bg-grey-lighten-2 rounded-xl d-flex align-center pa-4">
          <div class="d-flex align-start ga-4 w-100">
            <!-- avatar stack (leftmost on top) -->
            <div class="d-flex align-start">
              <div
                v-for="(a, i) in modelValue || []"
                :key="i"
                class="position-relative"
                :class="i > 0 ? 'ms-n6' : ''"
                :style="{ zIndex: (modelValue?.length || 1) - i }"
              >
                <v-avatar :size="56" class="elevation-2 rounded-circle">
                  <v-img
                    :src="(a as AuthorInterface)?.image?.image ?? ''"
                    :alt="(a as AuthorInterface)?.name || `Autor ${i + 1}`"
                  />
                </v-avatar>
              </div>
            </div>

            <div class="d-flex flex-column">
              <div class="d-flex align-center">
                <span
                  class="me-2 text-blue-darken-3 font-weight-bold"
                  v-if="combinedNames"
                  >Por:</span
                >
                <span class="text-blue-darken-3 font-weight-bold">{{
                  combinedNames || ""
                }}</span>
              </div>
              <div
                v-for="(author, idx) in modelValue"
                class="text-green-darken-2 text-subtitle-1 text-grey-darken-1"
                v-bind:key="idx"
              >
                {{ author.biography }}
              </div>
              <div
                class="text-green-darken-2 text-subtitle-1 font-weight-semibold"
              >
                {{ combinedPositions }}
              </div>

              <div
                class="d-flex align-center ga-2 mt-2"
                v-if="(modelValue?.length ?? 0) > 0"
              >
                <template v-for="(author, idx) in (modelValue as any)">
                  <a
                    v-if="author?.socials?.x"
                    :key="'x-' + idx"
                    :href="author.socials.x"
                    target="_blank"
                    rel="noopener"
                    class="text-decoration-none"
                  >
                    <v-icon size="18">
                      <img
                        :src="xicon"
                        alt="X icon"
                        class="v-icon__img"
                        style="
                          width: 20px;
                          height: 20px;
                          object-fit: contain;
                          display: block;
                        "
                      />
                    </v-icon>
                  </a>
                  <a
                    v-if="author?.socials?.facebook"
                    :key="'fb-' + idx"
                    :href="author.socials.facebook"
                    target="_blank"
                    rel="noopener"
                    class="text-decoration-none"
                  >
                    <v-icon size="18" color="indigo-darken-3"
                      >mdi-facebook</v-icon
                    >
                  </a>
                  <a
                    v-if="author?.socials?.linkedin"
                    :key="'in-' + idx"
                    :href="author.socials.linkedin"
                    target="_blank"
                    rel="noopener"
                    class="text-decoration-none"
                  >
                    <v-icon size="18" color="blue-darken-1"
                      >mdi-linkedin</v-icon
                    >
                  </a>
                  <a
                    v-if="author?.socials?.instagram"
                    :key="'ig-' + idx"
                    :href="author.socials.instagram"
                    target="_blank"
                    rel="noopener"
                    class="text-decoration-none"
                  >
                    <v-icon size="18" color="blue-darken-1"
                      >mdi-instagram</v-icon
                    >
                  </a>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="text-caption text-medium-emphasis">
          {{ modelValue?.length || 0 }} autor(es)
        </div>
      </v-card-text>

      <v-divider />
    </v-card>

    <teleport to="body">
      <v-dialog v-model="modal.open" width="720">
        <v-card class="w-100">
          <v-card-title class="text-h6">Autores</v-card-title>

          <v-card-text class="d-flex flex-column ga-6">
            <div
              class="d-flex flex-column ga-2"
              v-if="(draftList?.length || 0) > 0"
            >
              <v-card
                v-for="(row, idx) in draftList"
                :key="idx"
                class="px-3 py-2"
                variant="tonal"
              >
                <div class="d-flex align-center ga-3">
                  <v-avatar size="56">
                    <v-img :src="row.image?.image ?? ''" :alt="row.name" />
                  </v-avatar>

                  <div class="flex-1">
                    <div class="text-subtitle-2">
                      {{ row.name || "Sin nombre" }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ row.position || "Sin puesto" }}
                    </div>

                    <div
                      class="d-flex align-center ga-2 mt-1"
                      v-if="hasAnySocial(row)"
                    >
                      <a
                        v-if="row.socials?.x"
                        :href="row.socials.x"
                        target="_blank"
                        rel="noopener"
                        class="text-decoration-none"
                      >
                        <v-icon size="18">
                          <img
                            :src="xicon"
                            alt="X icon"
                            class="v-icon__img"
                            style="
                              width: 20px;
                              height: 20px;
                              object-fit: contain;
                              display: block;
                            "
                          />
                        </v-icon>
                      </a>
                      <a
                        v-if="row.socials?.facebook"
                        :href="row.socials.facebook"
                        target="_blank"
                        rel="noopener"
                        class="text-decoration-none"
                      >
                        <v-icon size="18" color="indigo-darken-3"
                          >mdi-facebook</v-icon
                        >
                      </a>
                      <a
                        v-if="row.socials?.linkedin"
                        :href="row.socials.linkedin"
                        target="_blank"
                        rel="noopener"
                        class="text-decoration-none"
                      >
                        <v-icon size="18" color="blue-darken-1"
                          >mdi-linkedin</v-icon
                        >
                      </a>
                      <a
                        v-if="row.socials?.instagram"
                        :href="row.socials.instagram"
                        target="_blank"
                        rel="noopener"
                        class="text-decoration-none"
                      >
                        <v-icon size="18" color="blue-darken-1"
                          >mdi-instagram</v-icon
                        >
                      </a>
                    </div>
                  </div>

                  <v-btn
                    icon="mdi-arrow-up"
                    variant="text"
                    @click="moveUp(idx)"
                  />
                  <v-btn
                    icon="mdi-arrow-down"
                    variant="text"
                    @click="moveDown(idx)"
                  />
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    @click="editAuthor(idx)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    @click="removeAuthor(idx)"
                  />
                </div>
              </v-card>
            </div>

            <v-alert v-else type="info" variant="tonal" density="compact">
              Aún no has agregado autores.
            </v-alert>

            <v-expand-transition>
              <v-card v-if="modal.form" class="pa-4" variant="flat">
                <div class="d-flex flex-column ga-4">
                  <detailed-image-component
                    v-if="modal.form"
                    color="#00a44f"
                    rounded="xl"
                    height="250"
                    v-model="modal.form.image"
                    text="Cargar Miniatura"
                    avatar
                  />

                  <div class="d-flex ga-4">
                    <v-text-field
                      v-model="modal.form.name"
                      label="Nombre"
                      class="flex-1"
                      clearable
                      density="comfortable"
                      hide-details="auto"
                      required
                    />
                    <v-text-field
                      v-model="modal.form.position"
                      label="Puesto"
                      class="flex-1"
                      clearable
                      density="comfortable"
                      hide-details="auto"
                    />
                  </div>
                  <div class="d-flex flex-column ga-3">
                    <v-textarea
                      v-model="modal.form.biography"
                      label="Biografía"
                      clearable
                      density="comfortable"
                      hide-details="auto"
                      rows="3"
                      placeholder="Escribe una breve biografía del autor"
                    ></v-textarea>
                  </div>
                  <div class="d-flex flex-column ga-3">
                    <v-text-field
                      v-model="modal.form.socials!.x"
                      label="X URL"
                      clearable
                      density="comfortable"
                      hide-details="auto"
                      type="url"
                      placeholder="https://x.com/usuario"
                    >
                      <template #prepend-inner>
                        <v-icon size="16" class="mx-1">
                          <img :src="xicon" alt="X icon" class="v-icon__img" />
                        </v-icon>
                      </template>
                    </v-text-field>
                    <v-text-field
                      v-model="modal.form.socials!.facebook"
                      label="Facebook URL"
                      prepend-inner-icon="mdi-facebook"
                      clearable
                      density="comfortable"
                      hide-details="auto"
                      type="url"
                      placeholder="https://facebook.com/usuario"
                    />
                    <v-text-field
                      v-model="modal.form.socials!.linkedin"
                      label="LinkedIn URL"
                      prepend-inner-icon="mdi-linkedin"
                      clearable
                      density="comfortable"
                      hide-details="auto"
                      type="url"
                      placeholder="https://www.linkedin.com/in/usuario"
                    />
                    <v-text-field
                      v-model="modal.form.socials!.instagram"
                      label="Instagram URL"
                      prepend-inner-icon="mdi-instagram"
                      clearable
                      density="comfortable"
                      hide-details="auto"
                      type="url"
                      placeholder="https://www.instagram.com/in/usuario"
                    />
                  </div>

                  <div class="d-flex justify-end ga-2">
                    <v-btn variant="text" @click="cancelForm()">Cancelar</v-btn>
                    <v-btn color="primary" variant="flat" @click="saveForm()"
                      >Guardar autor</v-btn
                    >
                  </div>
                </div>
              </v-card>
            </v-expand-transition>

            <div class="d-flex">
              <v-btn
                class="ms-auto"
                prepend-icon="mdi-account-plus"
                @click="newAuthor()"
                variant="elevated"
              >
                Nuevo autor
              </v-btn>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions>
            <v-btn @click="cancel()" variant="text">Cancelar</v-btn>
            <v-spacer />
            <v-btn @click="confirm()" variant="text">Aceptar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </teleport>
  </div>
</template>
