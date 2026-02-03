<script lang="ts">
import { Vue, Prop } from "vue-facing-decorator";
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { CreateCategoryRules } from "~/interfaces/rules.interface";
import DetailedImageComponent from "~/components/detailed-image/index.vue";
import { VTreeview } from "vuetify/components";

@NuxtComponent({
  name: "category-form-page",
  components: {
    "detailed-image-component": DetailedImageComponent,
    "v-treeview": VTreeview,
  },
})
class CategoryFormPage extends Vue {
  @Prop({ required: true }) public category!: CategoriesInterface;
  @Prop({ required: true }) public categories!: Array<CategoriesInterface>;
  @Prop({ required: true }) public parentCategorySelected!: string | CategoriesInterface;
  @Prop({ required: true }) public rules!: CreateCategoryRules;
  @Prop({ required: true }) public targetManager!: any;
  @Prop({ required: true }) public formValid!: boolean;
  @Prop({ required: true }) public loading!: boolean;
  @Prop({ required: true }) public showInfoDialog!: boolean;
  @Prop({ required: true }) public active!: any;
  @Prop({ required: true }) public open!: any;
  @Prop({ default: undefined }) public targetName?: string;
  @Prop({ default: false }) public targetSelectClearable!: boolean;
  @Prop({ default: false }) public targetSelectDisabled!: boolean;

  public get formValidProxy() {
    return this.formValid;
  }

  public set formValidProxy(value: boolean) {
    this.$emit("update:formValid", value);
  }

  public get showInfoDialogProxy() {
    return this.showInfoDialog;
  }

  public set showInfoDialogProxy(value: boolean) {
    this.$emit("update:showInfoDialog", value);
  }

  public get activeProxy() {
    return this.active;
  }

  public set activeProxy(value: any) {
    this.$emit("update:active", value);
  }

  public get openProxy() {
    return this.open;
  }

  public set openProxy(value: any) {
    this.$emit("update:open", value);
  }

  public get nameLabel() {
    return this.targetName
      ? `Nombre de categoría de ${this.targetName}`
      : "Nombre de categoría";
  }

  public get excerptLabel() {
    return this.targetName
      ? `Extracto de categoría de ${this.targetName}`
      : "Extracto de categoría";
  }

  public get descriptionLabel() {
    return this.targetName
      ? `Descripción de categoría de ${this.targetName}`
      : "Descripción de categoría";
  }

  public get tagsLabel() {
    return this.targetName
      ? `Tags de categoría de ${this.targetName}`
      : "Tags de categoría";
  }

  public emitTargetChange(value: any) {
    this.$emit("target-change", value);
  }

  public emitCategorySelected(value: any) {
    this.$emit("category-selected", value);
  }

  public emitUpdateSlug() {
    this.$emit("update-slug");
  }
}

export default CategoryFormPage;
</script>

<template>
  <v-row class="pa-5" justify="center">
    <v-col cols="3">
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="340"
        v-model="category.pictures.thumbnailImageDetail"
        :legacy-image="category.pictures.thumbnail"
        text="Cargar Miniatura"
      />
    </v-col>

    <v-col cols="7">
      <detailed-image-component
        rounded="xl"
        height="160"
        v-model="category.pictures.bannerImageDetail"
        :legacy-image="category.pictures.banner"
        text="Cargar Banner"
        class="mt-2"
      />
      <detailed-image-component
        rounded="xl"
        height="160"
        v-model="category.pictures.responsiveImageDetail"
        :legacy-image="category.pictures.responsive"
        text="Cargar Banner Responsive"
        class="mt-2"
      />
    </v-col>

    <v-col cols="10" class="mb-0 mr-2">
      <div class="d-flex justify-end">
        <v-btn
          variant="outlined"
          color="primary"
          size="small"
          rounded="xl"
          prepend-icon="mdi-information"
          @click="showInfoDialogProxy = !showInfoDialogProxy"
          class="info-btn"
        >
          Guia de Uso
        </v-btn>
      </div>
    </v-col>

    <v-col cols="10" :class="category.parentID ? 'pb-15 mb-15' : ''">
      <v-form v-model="formValidProxy">
        <v-row align-content="center" justify="center">
          <v-col class="py-0 mt-5 mx-auto text-center" cols="12">
            <v-select
              v-model="targetManager.selectedTarget"
              :items="targetManager.allTargets"
              item-title="name"
              item-value="_id"
              label="Seleccionar Target"
              prepend-inner-icon="mdi-target"
              density="compact"
              variant="solo"
              rounded="xl"
              :clearable="!!targetSelectClearable"
              :disabled="!!targetSelectDisabled"
              @update:model-value="emitTargetChange"
            />
          </v-col>

          <v-col class="py-0 mt-5 mx-auto text-center" cols="6">
            <v-text-field
              :rules="rules.name"
              prepend-inner-icon="mdi-apps"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="category.name"
              :label="nameLabel"
              required
              clearable
              @change="emitUpdateSlug"
            />
          </v-col>
          <v-col class="py-0 mt-5 mx-auto text-center" cols="6">
            <v-text-field
              :rules="rules.slug"
              prepend-inner-icon="mdi-apps"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="category.slug"
              label="Slug"
              required
              clearable
            />
          </v-col>
          <v-col class="py-0 mt-5 mx-auto text-center" cols="12">
            <v-text-field
              :rules="rules.excerpt"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="category.excerpt"
              :label="excerptLabel"
              required
              clearable
            />
          </v-col>
          <v-col class="py-0 mx-auto text-center" cols="12">
            <v-textarea
              :rules="rules.description"
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="category.description"
              :label="descriptionLabel"
              required
              clearable
            />
          </v-col>
          <v-col class="mb-5 mx-auto text-center" cols="12">
            <v-expansion-panels>
              <v-expansion-panel class="rounded-xl">
                <v-expansion-panel-title>
                  {{
                    typeof parentCategorySelected !== "string"
                      ? parentCategorySelected.name
                      : "Seleccione una categoría"
                  }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-treeview
                    v-model:activated="activeProxy"
                    v-model:opened="openProxy"
                    :items="categories"
                    @update:activated="emitCategorySelected"
                    color="primary"
                    density="compact"
                    item-title="name"
                    item-value="_id"
                    activatable
                    open-on-click
                    transition
                  >
                    <template v-slot:prepend="{ item }">
                      <div class="w-100">
                        <v-avatar size="50" color="primary">
                          <v-img width="100%" :src="item.pictures.responsive" cover />
                        </v-avatar>
                      </div>
                    </template>
                  </v-treeview>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
          <v-col class="py-0 mx-auto text-center" cols="12">
            <v-combobox
              :rules="rules.tags"
              chips
              multiple
              prepend-inner-icon="mdi-tag"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="category.tags"
              :label="tagsLabel"
              required
              clearable
            />
          </v-col>
          <v-col class="py-0 mx-auto text-center d-flex justify-center" cols="12">
            <v-switch
              color="green"
              class="mx-5"
              density="compact"
              v-model="category.disabled"
              label="Deshabilitar"
              inset
            />
          </v-col>
        </v-row>
      </v-form>
    </v-col>

    <slot name="extra-sections" />

    <slot name="actions" />

    <v-dialog v-model="showInfoDialogProxy" max-width="800" scrollable>
      <slot name="info-dialog">
        <v-card class="info-dialog">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-information</v-icon>
            <span class="text-h5 font-weight-bold">Guia de Uso</span>
          </v-card-title>
          <v-card-text class="pa-6">
            <p class="text-body-1 mb-0">
              Usa esta pantalla para crear o editar categorias y sus detalles.
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="tonal" @click="showInfoDialogProxy = false">
              Entendido
            </v-btn>
          </v-card-actions>
        </v-card>
      </slot>
    </v-dialog>
  </v-row>
</template>

<style lang="scss">
.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}

.banner-categories-by-parent {
  height: 80px;
  background-color: #00a44f;
  color: #ffffff;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
}

.info-btn {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.info-dialog {
  .v-card-title {
    background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
    border-bottom: 1px solid #e0e7ff;
  }

  .v-card {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .v-list-item {
    border-radius: 8px;
    margin-bottom: 4px;

    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}
</style>
