<script lang="ts">
import { Vue } from "vue-facing-decorator";
import { Prop } from "vue-facing-decorator";
import type { CategoriesInterface } from "~/interfaces/categories.interface";

@NuxtComponent({
  name: "seo-categories-component",
})
class SeoCategoriesComponent extends Vue {
  // PROPS
  @Prop({ required: true }) category!: CategoriesInterface;
  @Prop({ default: false }) expanded!: boolean;

  // REFS
  public $refs!: {
    ogImageUploader: HTMLInputElement;
    twitterImageUploader: HTMLInputElement;
  };

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // REACTIVE DATA
  public seoExpanded: boolean = this.expanded;
  public keywordInput: string = "";
  public tagInput: string = "";

  // SEO METHODS
  public addKeyword() {
    if (
      this.keywordInput.trim() &&
      !this.category.keywords?.includes(this.keywordInput.trim())
    ) {
      this.category.keywords = [
        ...(this.category.keywords || []),
        this.keywordInput.trim(),
      ];
      this.keywordInput = "";
    }
  }

  public removeKeyword(keyword: string) {
    this.category.keywords =
      this.category.keywords?.filter((k) => k !== keyword) || [];
  }

  public addTag() {
    if (
      this.tagInput.trim() &&
      !this.category.tags?.includes(this.tagInput.trim())
    ) {
      this.category.tags = [...(this.category.tags || []), this.tagInput.trim()];
      this.tagInput = "";
    }
  }

  public removeTag(tag: string) {
    this.category.tags = this.category.tags?.filter((t) => t !== tag) || [];
  }

  public uploadOgImage(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (file.type === "image/png" || file.type === "image/jpeg") {
        if (file.size <= 2000000) {
          const fr = new FileReader();
          fr.onload = (el: any) => {
            this.category.ogImage = el.target.result;
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

  public uploadTwitterImage(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      if (file.type === "image/png" || file.type === "image/jpeg") {
        if (file.size <= 2000000) {
          const fr = new FileReader();
          fr.onload = (el: any) => {
            this.category.twitterImage = el.target.result;
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

  // WATCHERS
  public watch = {
    expanded: {
      handler(newVal: boolean) {
        this.seoExpanded = newVal;
      },
      immediate: true,
    },
  };
}
export default SeoCategoriesComponent;
</script>

<!-- SEO COMPONENT FOR CATEGORIES -->
<template>
  <v-card class="seo-card mt-6" elevation="2">
    <v-card-title class="d-flex align-center justify-space-between pa-6">
      <div class="d-flex align-center">
        <v-icon color="#12539b" size="24" class="mr-3">mdi-search-web</v-icon>
        <span class="text-h6 font-weight-bold">Configuración SEO</span>
      </div>
      <v-btn
        @click="seoExpanded = !seoExpanded"
        variant="text"
        color="#12539b"
        rounded="xl"
      >
        <v-icon>{{
          seoExpanded ? "mdi-chevron-up" : "mdi-chevron-down"
        }}</v-icon>
        {{ seoExpanded ? "Ocultar" : "Expandir" }}
      </v-btn>
    </v-card-title>

    <v-expand-transition>
      <v-card-text v-show="seoExpanded" class="pa-6">
        <v-row>
          <!-- SEO BÁSICO -->
          <v-col cols="12">
            <v-divider class="mb-4"></v-divider>
            <h4 class="text-subtitle-1 font-weight-bold mb-4" style="color: #12539b">
              <v-icon color="#12539b" size="20" class="mr-2">mdi-tag</v-icon>
              SEO Básico
            </h4>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="category.metaTitle"
              label="Meta Título"
              hint="Título optimizado para SEO (máx. 60 caracteres)"
              persistent-hint
              counter="60"
              :rules="[(v) => !v || v.length <= 60 || 'Máximo 60 caracteres']"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="category.focusKeyword"
              label="Palabra Clave Principal"
              hint="Palabra clave más importante para esta categoría"
              persistent-hint
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="category.metaDescription"
              label="Meta Descripción"
              hint="Descripción optimizada para SEO (máx. 160 caracteres)"
              persistent-hint
              counter="160"
              rows="3"
              :rules="[(v) => !v || v.length <= 160 || 'Máximo 160 caracteres']"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="category.canonicalUrl"
              label="URL Canónica"
              hint="URL canónica para evitar contenido duplicado"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="category.socialTitle"
              label="Título para Redes Sociales"
              hint="Título específico para compartir en redes sociales"
              persistent-hint
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="category.socialDescription"
              label="Descripción para Redes Sociales"
              hint="Descripción específica para compartir en redes sociales"
              persistent-hint
              rows="2"
            />
          </v-col>

          <!-- PALABRAS CLAVE -->
          <v-col cols="12">
            <v-divider class="mb-4"></v-divider>
            <h4 class="text-subtitle-1 font-weight-bold mb-4" style="color: #12539b">
              <v-icon color="#12539b" size="20" class="mr-2">mdi-key</v-icon>
              Palabras Clave
            </h4>
          </v-col>

          <v-col cols="12" md="8">
            <v-text-field
              v-model="keywordInput"
              label="Agregar Palabra Clave"
              hint="Presiona Enter para agregar"
              persistent-hint
              @keyup.enter="addKeyword()"
            />
          </v-col>

          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn
              @click="addKeyword()"
              color="#12539b"
              variant="outlined"
              :disabled="!keywordInput.trim()"
            >
              <v-icon>mdi-plus</v-icon>
              Agregar
            </v-btn>
          </v-col>

          <v-col cols="12" v-if="category.keywords && category.keywords.length > 0">
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="keyword in category.keywords"
                :key="keyword"
                closable
                color="#12539b"
                variant="outlined"
                @click:close="removeKeyword(keyword)"
              >
                {{ keyword }}
              </v-chip>
            </div>
          </v-col>

          <!-- ETIQUETAS -->
          <v-col cols="12">
            <v-divider class="mb-4"></v-divider>
            <h4 class="text-subtitle-1 font-weight-bold mb-4" style="color: #12539b">
              <v-icon color="#12539b" size="20" class="mr-2">mdi-tag-multiple</v-icon>
              Etiquetas
            </h4>
          </v-col>

          <v-col cols="12" md="8">
            <v-text-field
              v-model="tagInput"
              label="Agregar Etiqueta"
              hint="Presiona Enter para agregar"
              persistent-hint
              @keyup.enter="addTag()"
            />
          </v-col>

          <v-col cols="12" md="4" class="d-flex align-center">
            <v-btn
              @click="addTag()"
              color="#12539b"
              variant="outlined"
              :disabled="!tagInput.trim()"
            >
              <v-icon>mdi-plus</v-icon>
              Agregar
            </v-btn>
          </v-col>

          <v-col cols="12" v-if="category.tags && category.tags.length > 0">
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="tag in category.tags"
                :key="tag"
                closable
                color="#12539b"
                variant="outlined"
                @click:close="removeTag(tag)"
              >
                {{ tag }}
              </v-chip>
            </div>
          </v-col>

          <!-- REDES SOCIALES -->
          <v-col cols="12">
            <v-divider class="mb-4"></v-divider>
            <h4 class="text-subtitle-1 font-weight-bold mb-4" style="color: #12539b">
              <v-icon color="#12539b" size="20" class="mr-2">mdi-share-variant</v-icon>
              Redes Sociales
            </h4>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-4 text-center" @click="$refs.ogImageUploader.click()" style="cursor: pointer">
              <v-icon size="40" color="#12539b">mdi-image</v-icon>
              <div class="text-subtitle-2 mt-2">Imagen Open Graph</div>
              <div class="text-caption text-grey">1200x630px recomendado</div>
              <v-img
                v-if="category.ogImage"
                :src="category.ogImage"
                height="100"
                class="mt-2"
                cover
              />
            </v-card>
            <input
              ref="ogImageUploader"
              type="file"
              accept="image/*"
              @change="uploadOgImage"
              style="display: none"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="pa-4 text-center" @click="$refs.twitterImageUploader.click()" style="cursor: pointer">
              <v-icon size="40" color="#12539b">mdi-twitter</v-icon>
              <div class="text-subtitle-2 mt-2">Imagen Twitter</div>
              <div class="text-caption text-grey">1200x675px recomendado</div>
              <v-img
                v-if="category.twitterImage"
                :src="category.twitterImage"
                height="100"
                class="mt-2"
                cover
              />
            </v-card>
            <input
              ref="twitterImageUploader"
              type="file"
              accept="image/*"
              @change="uploadTwitterImage"
              style="display: none"
            />
          </v-col>

          <!-- SEO TÉCNICO -->
          <v-col cols="12">
            <v-divider class="mb-4"></v-divider>
            <h4 class="text-subtitle-1 font-weight-bold mb-4" style="color: #12539b">
              <v-icon color="#12539b" size="20" class="mr-2">mdi-cog</v-icon>
              SEO Técnico
            </h4>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="category.robotsDirectives"
              label="Directivas Robots"
              :items="[
                { title: 'Indexar y seguir enlaces', value: 'index, follow' },
                { title: 'No indexar, no seguir', value: 'noindex, nofollow' },
                { title: 'Indexar, no seguir', value: 'index, nofollow' },
                { title: 'No indexar, seguir', value: 'noindex, follow' },
              ]"
              item-title="title"
              item-value="value"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="category.language"
              label="Idioma Principal"
              :items="[
                { title: 'Español', value: 'es' },
                { title: 'English', value: 'en' },
                { title: 'Français', value: 'fr' },
                { title: 'Português', value: 'pt' },
              ]"
              item-title="title"
              item-value="value"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="category.structuredType"
              label="Tipo de Schema"
              :items="[
                'Article',
                'Blog',
                'Product',
                'Service',
              ]"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="category.altText"
              label="Texto Alternativo de Imagen"
              hint="Descripción de la imagen para accesibilidad"
              persistent-hint
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="category.schemaMarkup"
              label="Schema Markup (JSON-LD)"
              hint="Código JSON-LD para datos estructurados"
              persistent-hint
              rows="4"
            />
          </v-col>

          <!-- TEXTOS ALTERNATIVOS DE IMÁGENES -->
          <v-col cols="12">
            <v-divider class="mb-4"></v-divider>
            <h4 class="text-subtitle-1 font-weight-bold mb-4" style="color: #12539b">
              <v-icon color="#12539b" size="20" class="mr-2">mdi-image-text</v-icon>
              Textos Alternativos de Imágenes
            </h4>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="category.altTextBanner"
              label="Alt Text Banner"
              hint="Texto alternativo para el banner"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="category.altTextThumbnail"
              label="Alt Text Miniatura"
              hint="Texto alternativo para la miniatura"
              persistent-hint
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="category.altTextResponsive"
              label="Alt Text Responsive"
              hint="Texto alternativo para la imagen responsive"
              persistent-hint
            />
          </v-col>

          <!-- DESTACADO -->
          <v-col cols="12">
            <v-divider class="mb-4"></v-divider>
            <h4 class="text-subtitle-1 font-weight-bold mb-4" style="color: #12539b">
              <v-icon color="#12539b" size="20" class="mr-2">mdi-star</v-icon>
              Destacado
            </h4>
          </v-col>

          <v-col cols="12">
            <v-switch
              v-model="category.isFeatured"
              label="Categoría Destacada"
              color="#12539b"
              inset
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>

<style lang="scss" scoped>
.seo-card {
  border: 1px solid rgba(18, 83, 155, 0.1);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 100px;

  .v-card-title {
    background: linear-gradient(
      135deg,
      rgba(18, 83, 155, 0.05) 0%,
      rgba(18, 83, 155, 0.1) 100%
    );
    border-radius: 12px 12px 0 0;
  }
}

.gap-2 {
  gap: 8px;
}
</style>
