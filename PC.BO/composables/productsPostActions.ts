import { useGeneralActions } from "~/composables/generalActions";
import type { ProductsPostInterface } from "~/interfaces/products-post.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import { GET_CATEGORIES_BY_TARGET_ID } from "~/graphql/query/categories.query";
import { GET_PRODUCTS_POST_GROUP_BY_CATEGORY, GET_PRODUCTS_POST_BY_ID } from "~/graphql/query/products-post.query";
import { CREATE_PRODUCTS_POST, UPDATE_PRODUCTS_POST, CLONE_PRODUCTS_POST, REMOVE_PRODUCTS_POST, PUBLISH_PRODUCTS_POST, DRAFT_PRODUCTS_POST } from "~/graphql/mutations/products-post.mutation";

export const useProductsPostActions = () => {
  const generalActions = useGeneralActions();

  // Obtener categorías de productos
  const getProductsCategories = async (apollo: any): Promise<CategoriesInterface[]> => {
    try {
      const { data } = await apollo.query({
        query: GET_CATEGORIES_BY_TARGET_ID,
        variables: {
          targetId: "categoryProducts",
        },
        fetchPolicy: "no-cache",
      });
      return data.findCategoriesByTargetId || [];
    } catch (error) {
      console.error("Error al obtener categorías de productos:", error);
      return [];
    }
  };

  // Crear post de producto
  const createProductsPost = async (
    apollo: any,
    postData: ProductsPostInterface,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    try {
      const { data } = await apollo.mutate({
        mutation: CREATE_PRODUCTS_POST,
        variables: {
          createPostDto: {
            ...postData,
            target: "categoryProducts",
            targetID: "categoryProducts",
          },
        },
      });
      
      if (onSuccess) onSuccess();
      return data.createPost;
    } catch (error) {
      console.error("Error al crear post de producto:", error);
      if (onError) onError(error);
      throw error;
    }
  };

  // Actualizar post de producto
  const updateProductsPost = async (
    apollo: any,
    postData: ProductsPostInterface,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    try {
      const { data } = await apollo.mutate({
        mutation: UPDATE_PRODUCTS_POST,
        variables: {
          updatePostDto: {
            ...postData,
            target: "categoryProducts",
            targetID: "categoryProducts",
          },
        },
      });
      
      if (onSuccess) onSuccess();
      return data.updatePost;
    } catch (error) {
      console.error("Error al actualizar post de producto:", error);
      if (onError) onError(error);
      throw error;
    }
  };

  // Obtener posts de productos agrupados por categoría
  const getProductsPostsGroupedByCategory = async (apollo: any) => {
    try {
      const { data } = await apollo.query({
        query: GET_PRODUCTS_POST_GROUP_BY_CATEGORY,
        variables: {
          targetId: "categoryProducts",
        },
        fetchPolicy: "no-cache",
      });
      return data.findPostsGroupByCategory || [];
    } catch (error) {
      console.error("Error al obtener posts de productos:", error);
      return [];
    }
  };

  // Obtener post de producto por ID
  const getProductsPostById = async (apollo: any, postId: string) => {
    try {
      const { data } = await apollo.query({
        query: GET_PRODUCTS_POST_BY_ID,
        variables: {
          postId,
        },
        fetchPolicy: "no-cache",
      });
      return data.findPostById;
    } catch (error) {
      console.error("Error al obtener post de producto:", error);
      return null;
    }
  };

  // Inicializar acciones generales para posts de productos
  const initProductsPostActions = (
    apollo: any,
    bus: any,
    router: any
  ) => {
    return generalActions.init(
      {
        CLONE_MUTATION: CLONE_PRODUCTS_POST,
        REMOVE_MUTATION: REMOVE_PRODUCTS_POST,
        PUBLISH_MUTATION: PUBLISH_PRODUCTS_POST,
        DRAFT_MUTATION: DRAFT_PRODUCTS_POST,
      },
      apollo,
      bus,
      router
    );
  };

  return {
    getProductsCategories,
    createProductsPost,
    updateProductsPost,
    getProductsPostsGroupedByCategory,
    getProductsPostById,
    initProductsPostActions,
  };
};
