import type { ItemActionType } from '~/components/item-action/item-action.vue'
import { CLONE_CATEGORY, PUBLISH_CATEGORY, DRAFT_CATEGORY, REMOVE_CATEGORY } from '~/graphql/mutations/categories.mutation'

export  const useCategoryActions = () => {
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
        mutation: CLONE_CATEGORY,
        variables: {
          categoryId: itemID
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

  const removeItem = async (itemID: string, callback: () => any) => {
    try {
      await $apollo.mutate({
        mutation: REMOVE_CATEGORY,
        variables: { categoryId: itemID }
      })

      $bus.$emit('showSnackbar', {
        text: 'Item eliminado correctamente!',
        color: 'success',
        timeout: 6000
      })

      callback()
    } catch (err) {
      $bus.$emit('handleError', err)
    }
  }
  
  const switchStatus = async (itemID: string, action: string, callback: () => any) => {
    try {
      // REMOVE SLIDER
      await $apollo.mutate({
        mutation: action === 'publish'? PUBLISH_CATEGORY:DRAFT_CATEGORY,
        variables: {
          categoryId: itemID
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
    switchStatus,
    removeItem
  }
}