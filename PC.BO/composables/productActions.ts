import type { ItemActionType } from '~/components/item-action/item-action.vue'
import { CLONE_PRODUCT, PUBLISH_PRODUCT, DRAFT_PRODUCT, REMOVE_PRODUCT } from "~/graphql/mutations/products.mutation";

export  const useProductActions = () => {
  let $apollo: any
  let $bus: any
  let $router: any

  const init = ($_apollo: any, $_bus: any, $_router?: any) => {
    $apollo = $_apollo;
    $bus = $_bus;
    $router = $_router;
  }

  const cloneItem = async (itemID: string, callback: () => any) => {
    try {
      // REMOVE SLIDER
      await $apollo.mutate({
        mutation: CLONE_PRODUCT,
        variables: {
          productId: itemID
        }
      })

      // SHOW MESSAGE SUCCESS SNACKBAR
      $bus.$emit('showSnackbar', {
        text: 'Item clonado correctamente!',
        color: 'success',
        timeout: 6000
      })

      callback()
    } catch (err) {
      $bus.$emit('handleError', err)
    }
  }
  
  // REMOVE ITEM
  const removeItem = async (itemID: string, callback: () => any) => {
    try {
      // REMOVE SLIDER
      await $apollo.mutate({
        mutation: REMOVE_PRODUCT,
        variables: {
          productId: itemID
        }
      })

      // SHOW MESSAGE SUCCESS SNACKBAR
      $bus.$emit('showSnackbar', {
        text: 'Item eliminado correctamente!',
        color: 'success',
        timeout: 6000
      })

      callback()
    } catch (err){
      $bus.$emit('handleError', err)
    }
  }

  const switchStatus = async (itemID: string, action: string, callback: () => any) => {
    try {
      // REMOVE SLIDER
      await $apollo.mutate({
        mutation: action === 'publish'? PUBLISH_PRODUCT:DRAFT_PRODUCT,
        variables: {
          productId: itemID
        }
      })

      // SHOW MESSAGE SUCCESS SNACKBAR
      $bus.$emit('showSnackbar', {
        text: 'El estado del item cambió correctamente!',
        color: 'success',
        timeout: 6000
      })

      callback()
    } catch (err) {
      $bus.$emit('handleError', err)
    }
  }

  return {
    init,
    cloneItem,
    removeItem,
    switchStatus
  }
}