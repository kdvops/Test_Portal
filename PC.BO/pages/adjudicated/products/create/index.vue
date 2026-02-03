<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT COMPONENTS
import SectionComponent from "~/components/sections/index.vue";
import { VTreeview } from 'vuetify/components'

// IMPORT INTERFACE
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { ProductAdjudicatedInterface, TypeStatusAdjudicated } from "~/interfaces/adjudicated.interface";

// IMPORT QUERIES
import { GET_CATEGORIES_BY_TARGET } from "~/graphql/query/categories.query";

// IMPORT MUTATIONS
import { CREATE_PRODUCT_ADJUDICATED } from "~/graphql/mutations/adjudicated.mutation";

// IMPORT UTILS GEO JSON PROVINCE
import { provinces } from '~/utils/geojson'

import DetailedImagesComponent from "~/components/detailed-images/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "adjudicated-product-create-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "section-component": SectionComponent,
    "v-treeview": VTreeview,
    'detailed-images-component': DetailedImagesComponent
  },
})
class AdjudicatedProductCreateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // CATEGORY REF
  @Ref("bannerProductImage") bannerProductImage!: any;

  // RICH TEXT EDITOR REF
  @Ref('descriptionEditor') descriptionEditor!: any;

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

  // PARENT CATEGORY SELECTED
  public parentCategorySelected: string | CategoriesInterface = ''

  // SECTIONS CARDS DEFAULT VALUES
  public product: ProductAdjudicatedInterface = {
    category: '',
    status: 'available',
    name: '',
    province: '',
    excerpt: '',
    description: '',
    pictures: [],
    picturesImageDetail: [],
    price: 0,
    link: '',
    address: '',
    phone: '',
    disabled: false,
  };

  // VALID FORM
  public valid: boolean = false;

  // CATEGORIES DEFAULT VALUES
  public categories: Array<CategoriesInterface> = [];

  // PROVINCE LIST
  public provincesList: Array<{ id: number, name: string }> = provinces;

  // STATUS PRODUCT LIST
  public statusList: Array<{ name: string, value: TypeStatusAdjudicated }> = [
    {
      name: 'próximamente',
      value: 'soon'
    },
    {
      name: 'disponible',
      value: 'available'
    },
    {
      name: 'no disponible',
      value: 'unavailable'
    }
  ];

  // LOADING DEFAULT VALUES
  public loading: boolean = false;

  // TREEVIEW LIST ACTIVE
  public active: any = []

  // TREEVIEW LIST OPEN
  public open: any = []

  // RULES FORMS
  public rules: any = {
    name: [
      (v: string) => !!v || 'El nombre es requerido',
    ],
    excerpt: [
      (v: string) => !!v || 'El extracto es requerido',
    ],
    address: [
      (v: string) => !!v || 'La dirección es requerido',
    ],
    price: [
      (v: string) => !!v || 'El precio es requerido',
    ],
    description: [
      (v: string) => !!v || 'La descripción es requerida',
    ]
  }

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setCategories();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin",  });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // OPEN UPLOAD IMAGE
  public selectImage() {
    // GET REFERENCE IMAGE
    const imageRefs: any = this.bannerProductImage;

    // REF IMAGE RESET
    imageRefs.value = null;
    
    // CLICK IMAGE
    imageRefs.click();
  }

  public setCategorySelected(category: any) {
    // FIND CATEGORY BY SUBCATEGORY ID VALIDATE
    const findCategoryBySubcategoryId = this.categories.find((cat: any) => cat.subcategories.find((sub: any) => sub._id === category[0]))

    // GET SUBCATEGORY BY CATEGORY VALIDATE
    const findSubcategory = findCategoryBySubcategoryId && findCategoryBySubcategoryId.subcategories && findCategoryBySubcategoryId.subcategories.find((sub: any) => sub._id === category[0])

    // GET CATEGORY 
    const findCategory = this.categories.find((cat: any) => cat._id === category[0]);

    if (category.length > 0
      && !findCategoryBySubcategoryId
      && findCategory
      && findCategory.parentID === null
      && findCategory.subcategories?.length === 0) {

      // CATEGORY SELECTED
      this.parentCategorySelected = findCategory || ''
      this.product.category = findCategory._id || null

    } else if (category.length > 0
      && findCategoryBySubcategoryId
      && findSubcategory
      && String(findSubcategory.parentID) === String(findCategoryBySubcategoryId._id)) {
      // SUBCATEGORY SELECTED
      this.parentCategorySelected = findSubcategory || ''
      this.product.category = findSubcategory._id || null

    } else {
      this.parentCategorySelected = findSubcategory || ''
      this.product.category = null
    }
  }

  // REMOVE IMAGE PRODUCT
  public removeImage(index: number) {
    this.product.pictures.splice(index, 1)
  }

  // SELECT IMAGE PRODUCT COVER
  public selectImageCover(index: number) {
    // SET FALSE ALL IMAGES
    this.product.picturesImageDetail.map((picture) => {
      picture.isCover = false
    })

    // SET COVER IMAGE
    this.product.picturesImageDetail[index].isCover = true
  }

  // GET IMAGE FILE AND SET IN BANNER
  public getProductImage(files: Array<File>) {
    if (files && files.length > 0) {
      files.forEach((file: File) => {
        if (
          file.type === "image/jpeg" ||
          file.type === "image/jpg" ||
          file.type === "image/png"
        ) {
          if (file.size <= 19520000) {
            const newUploadsPictures = this.product.pictures;
            const fr = new FileReader();
            fr.onload = (el: any) => {
              newUploadsPictures.push({
                image: [
                  {
                    img: el.target.result,
                    filetype: file.type.split("/")[1],
                  }
                ],
                isCover: false
              });
            };
            fr.readAsDataURL(file);
          } else {
            this.$bus.$emit("handleError", "El peso máximo es de 2 MB");
          }
        } else {
          this.$bus.$emit("handleError", "Solo se aceptan formato .png y .jpeg");
        }
      })
    }
  }

  // SET CATEGORIES
  public async setCategories() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: 'category::adjudicated',
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

  // CREATE PRODUCT ADJUDICATED
  public async createAdjudicatedProduct() {
    // SET LOADING FALSE
    this.loading = true;
    try {
      // PAYLOAD PARENT AND TARGET DTO
      const createAdjudicatedDto = {
        createAdjudicatedDto: {
          ...this.product,
          item_status: 'publish',
          price: Number(this.product.price),
          description: this.product.description ? encrypt(this.product.description) : "",
        }
      };

      // CREATE PRODUCT
      await this.$apollo.mutate({
        mutation: CREATE_PRODUCT_ADJUDICATED,
        variables: createAdjudicatedDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO LIST
      this.$router.push("/adjudicated/products/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Producto creado correctamente!",
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

  // CREATE PRODUCT ADJUDICATED DRAFT
  public async createAdjudicatedProductDraft() {
    // SET LOADING FALSE
    this.loading = true;
    try {
      // PAYLOAD PARENT AND TARGET DTO
      const createAdjudicatedDto = {
        createAdjudicatedDto: {
          ...this.product,
          item_status: 'draft',
          price: Number(this.product.price),
          description: this.product.description ? encrypt(this.product.description) : "",
        }
      };

      // CREATE PRODUCT
      const { data } = await this.$apollo.mutate({
        mutation: CREATE_PRODUCT_ADJUDICATED,
        variables: createAdjudicatedDto,
        fetchPolicy: "no-cache",
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

  // GET HTML EDITOR TEXT
  public async getHtmlEditor() {
    this.product.description = this.descriptionEditor.getHTML();
  }

   // GO PREVIEW
   public async goPreview() {
    // FIRST CREATE BUSINESS STATUS DRAFT
    const product = await this.createAdjudicatedProductDraft();

    // GO EDIT AFTER CREATE POST
    this.$router.push(`/adjudicated/products/update/${product.createAdjudicated._id}`);

    // GO PREVIEW BEFORE CREATE PRODUCT
    const route = this.$router.resolve({ path: `/previews/category/adjudicated/${product.createAdjudicated.category}` });
    window.open(route.href, '_blank');
  }

  // SAVE ITEM
  public async saveBusinessDraft() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const product = await this.createAdjudicatedProductDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/adjudicated/products/update/${product.createAdjudicated._id}`);
  }

  public itemUpdated(index: number){
    this.product.picturesImageDetail[index].updatedAt = new Date;
  }

  public itemDeleted(index: number){
    if(this.product.picturesImageDetail[index]._id){
      this.product.picturesImageDetail[index].deletedAt = new Date;
    }
    else{
      const arr = this.product.picturesImageDetail
      if (index < 0 || index >= arr.length) return
      this.product.picturesImageDetail = arr.filter((_, i) => i !== index)
    }
  }
}

export default AdjudicatedProductCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-0 pt-10" justify="center" align-content="center">
    <v-col cols="10">
      <v-alert class="mb-3" rounded="xl" color="success" icon="$success" title="Creación de producto" prominent>
        <p class="text-body-2 my-2">
          Los productos o artículos creados, <br />
          Deben tener una categoría hija o padre,
          <br />
          una vez agregado productos en una categoría <br />
          hija la categoría no puede ser movida a otra
        </p>
      </v-alert>
    </v-col>
    <v-col cols="10">
      <v-form v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="4">
            <v-text-field v-model="product.name" :rules="rules.name" prepend-inner-icon="mdi-text" density="compact"
              variant="solo" rounded="xl" label="Nombre del producto" />
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="product.phone" prepend-inner-icon="mdi-phone" density="compact" variant="solo"
              rounded="xl" label="Teléfono de contacto" />
          </v-col>
          <v-col cols="4">
            <v-select v-model="product.status" :items="statusList" item-title="name" item-value="value"
              prepend-inner-icon="mdi-map" density="compact" variant="solo" rounded="xl" label="Estado del producto">
              <template #prepend-inner>
                <v-icon :color="product.status === 'available'
                  ? 'green'
                  : product.status === 'unavailable'
                    ? 'red'
                    : 'orange'">
                  mdi-circle
                </v-icon>
              </template>
            </v-select>
          </v-col>
          <v-col cols="4">
            <v-text-field v-model="product.address" :rules="rules.address" prepend-inner-icon="mdi-city"
              density="compact" variant="solo" rounded="xl" label="Dirección del producto" />
          </v-col>
          <v-col cols="4">
            <v-select v-model="product.province" :items="provincesList" item-title="name" item-value="name"
              prepend-inner-icon="mdi-map" density="compact" variant="solo" rounded="xl" label="Provincia" />
          </v-col>
          <v-col cols="4">
            <v-text-field type="number" v-model="product.price" :rules="rules.price" prepend-inner-icon="mdi-cash"
              density="compact" variant="solo" rounded="xl" label="Precio del producto" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="product.link" prepend-inner-icon="mdi-text"
              density="compact" variant="solo" rounded="xl" label="Link para adquirir" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="product.excerpt" :rules="rules.excerpt" prepend-inner-icon="mdi-text"
              density="compact" variant="solo" rounded="xl" label="Extracto del producto" />
          </v-col>
          <v-col cols="12">
            <v-card width="100%" height="250" class="card-editor-description" rounded="xl">
              <app-editor-text ref="descriptionEditor" theme="snow" @textChange="getHtmlEditor" />
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-col>
    <v-col class="mb-5 mx-auto text-center" cols="10">
      <v-expansion-panels>
        <v-expansion-panel class="rounded-xl">
          <v-expansion-panel-title>
            {{ typeof parentCategorySelected !== 'string'
              ? parentCategorySelected.name
              : 'Seleccione una categoría'
            }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-treeview v-model:activated="active" v-model:opened="open" :items="categories"
              @update:activated="setCategorySelected" color="primary" density="compact" item-title="name"
              item-value="_id" item-children="subcategories" activatable transition>
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
    <v-col cols="10" class="pb-15 mb-15">
      <detailed-images-component 
        color="#00a44f" 
        rounded="xl" 
        height="180" 
        width="200" 
        class="mx-2" 
        elevation="5"
        v-model="this.product.picturesImageDetail"
        v-slot="{ items, openDialog, removeItem, editItem }"
        @itemUpdate="itemUpdated"
        @itemDelete="itemDeleted">
        <v-slide-group class="pa-5 mx-auto" show-arrows style="background: #12539b; border-radius: 15px">
          <v-slide-group-item v-for="(picture, i) in items" :key="i">          
            <v-hover v-if="picture">
              <template v-slot:default="{ isHovering, props }">
                <v-card :color="picture.isCover ? 'green' : 'white'" height="180" width="200" class="mx-2" elevation="5"
                  rounded="lg" v-bind="props">
                  <v-img height="180" :src="picture.image?? ''" contain>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" variant="text" v-bind="{...props}"></v-btn>
                      </template>
                      <v-list>
                        <v-list-item link @click="editItem(i)">
                          <v-list-item-title>Modificar</v-list-item-title>
                        </v-list-item>
                        <v-list-item link @click="selectImageCover(i)" v-if="!picture.isCover">
                          <v-list-item-title>Marcar como portada</v-list-item-title>
                        </v-list-item>
                        <v-list-item link @click="removeItem(i)">   
                          <v-list-item-title>Eliminar</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-img>
                </v-card>
              </template>
            </v-hover>
          </v-slide-group-item>
          <v-card color="#00a44f" height="180" width="200" class="mx-2" elevation="5" rounded="lg"
            @click="openDialog()">
            <v-container class=" banner-container-image" fluid>
              <v-row class="banner-row-image" align-content="center">
                <v-col cols="12" class="text-center">
                  <v-icon size="50" color="white"> mdi-plus </v-icon>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-slide-group>
      </detailed-images-component>
    </v-col>

    <!-- NEW BUTTONS SAVE ITEMS -->
    <v-bottom-navigation bg-color="#12539b">
      <v-btn @click="createAdjudicatedProduct()" :disabled="!valid || !product.category || product.picturesImageDetail.length === 0" :loading="loading">
        <v-icon>
          mdi-upload
        </v-icon>
        Crear
      </v-btn>
      <v-btn @click="saveBusinessDraft()" :disabled="!valid || !product.category || product.picturesImageDetail.length === 0" :loading="loading">
        <v-icon>
          mdi-content-save
        </v-icon>
        Guardar
      </v-btn>
      <v-btn @click="goPreview()" :disabled="!valid || !product.category || product.picturesImageDetail.length === 0" :loading="loading">
        <v-icon>
          mdi-eye
        </v-icon>
        Ver Vista Previa
      </v-btn>
    </v-bottom-navigation>
    <!-- NEW BUTTONS SAVE ITEMS -->
  </v-row>
  <v-file-input ref="bannerProductImage" class="d-none" accept=".jpg, .jpeg, .png" @update:model-value="getProductImage"
    multiple />
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}
</style>
