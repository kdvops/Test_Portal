type GeneralMutationsType = {
  CLONE_MUTATION: any,
  REMOVE_MUTATION: any,
  PUBLISH_MUTATION: any,
  DRAFT_MUTATION: any,
}

export  const useGeneralActions = () => {
  let $apollo: any
  let $bus: any
  let $router: any
  let MUTATIONS: any
  let REMOVE_MUTATION: any
  let PUBLISH_MUTATION: any
  let DRAFT_MUTATION: any

  const init = (
    _MUTATIONS: GeneralMutationsType,
    $_apollo: any, 
    $_bus: any, 
    $_router?: any
  ) => {    
    MUTATIONS = _MUTATIONS;
    $apollo = $_apollo;
    $bus = $_bus;
    $router = $_router;
  }

  const cloneItem = async (variables: { [key: string]: string }, callback: () => any) => {
    try {
      // REMOVE SLIDER
      await $apollo.mutate({
        mutation: MUTATIONS.CLONE_MUTATION,
        variables
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
  const removeItem = async (variables: { [key: string]: string }, callback: () => any) => {
    try {
      // REMOVE SLIDER
      await $apollo.mutate({
        mutation: MUTATIONS.REMOVE_MUTATION,
        variables
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

  const switchStatus = async (variables: { [key: string]: string }, action: string, callback: () => any) => {
    try {
      // REMOVE SLIDER
      await $apollo.mutate({
        mutation: action === 'publish'? MUTATIONS.PUBLISH_MUTATION:MUTATIONS.DRAFT_MUTATION,
        variables
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