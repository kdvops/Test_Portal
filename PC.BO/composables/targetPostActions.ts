import { ref } from 'vue';
import type { TargetPostInterface } from '~/interfaces/target-post.interface';

export const useTargetPostActions = () => {
  // STATE
  const loading = ref(false);
  const error = ref<string | null>(null);

  // CREATE TARGET POST
  const createTargetPost = async (
    $apollo: any,
    $bus: any,
    $router: any,
    targetPostData: TargetPostInterface,
    targetId: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { CREATE_TARGET_POST } = await import('~/graphql/mutations/target-post.mutation');
      
      const { data } = await $apollo.mutate({
        mutation: CREATE_TARGET_POST,
        variables: {
          createTargetPostDto: targetPostData,
        },
      });

      $bus.$emit('handleSuccess', 'Post creado exitosamente');
      $router.push(`/targets/${targetId}/post/list`);
      
      return data.createTargetPost;
    } catch (err: any) {
      error.value = err.message;
      $bus.$emit('handleError', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // UPDATE TARGET POST
  const updateTargetPost = async (
    $apollo: any,
    $bus: any,
    $router: any,
    targetPostData: TargetPostInterface,
    targetId: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { UPDATE_TARGET_POST } = await import('~/graphql/mutations/target-post.mutation');
      
      const { data } = await $apollo.mutate({
        mutation: UPDATE_TARGET_POST,
        variables: {
          updateTargetPostDto: targetPostData,
        },
      });

      $bus.$emit('handleSuccess', 'Post actualizado exitosamente');
      $router.push(`/targets/${targetId}/post/list`);
      
      return data.updateTargetPost;
    } catch (err: any) {
      error.value = err.message;
      $bus.$emit('handleError', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // GET TARGET POST BY ID
  const getTargetPostById = async (
    $apollo: any,
    $bus: any,
    postId: string
  ): Promise<TargetPostInterface | null> => {
    loading.value = true;
    error.value = null;

    try {
      const { GET_POST_BY_ID } = await import('~/graphql/query/target-post.query');
      
      const { data } = await $apollo.query({
        query: GET_POST_BY_ID,
        variables: {
          targetPostId: postId,
        },
        fetchPolicy: 'no-cache',
      });

      return data.findTargetPostById;
    } catch (err: any) {
      error.value = err.message;
      $bus.$emit('handleError', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // GET TARGET POSTS BY CATEGORY
  const getTargetPostsByCategory = async (
    $apollo: any,
    $bus: any,
    targetId: string
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { GET_TARGET_POST_GROUP_BY_CATEGORY } = await import('~/graphql/query/target-post.query');
      
      const { data } = await $apollo.query({
        query: GET_TARGET_POST_GROUP_BY_CATEGORY,
        variables: {
          targetId,
        },
        fetchPolicy: 'no-cache',
      });

      return data.findTargetPostGroupByCategory;
    } catch (err: any) {
      error.value = err.message;
      $bus.$emit('handleError', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  // CLONE TARGET POST
  const cloneTargetPost = async (
    $apollo: any,
    $bus: any,
    postId: string,
    callback?: () => void
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { CLONE_TARGET_POST } = await import('~/graphql/mutations/target-post.mutation');
      
      const { data } = await $apollo.mutate({
        mutation: CLONE_TARGET_POST,
        variables: {
          targetPostId: postId,
        },
      });

      $bus.$emit('handleSuccess', 'Post clonado exitosamente');
      if (callback) callback();
      
      return data.cloneTargetPost;
    } catch (err: any) {
      error.value = err.message;
      $bus.$emit('handleError', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // REMOVE TARGET POST
  const removeTargetPost = async (
    $apollo: any,
    $bus: any,
    postId: string,
    callback?: () => void
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { REMOVE_TARGET_POST } = await import('~/graphql/mutations/target-post.mutation');
      
      const { data } = await $apollo.mutate({
        mutation: REMOVE_TARGET_POST,
        variables: {
          targetPostId: postId,
        },
      });

      $bus.$emit('handleSuccess', 'Post eliminado exitosamente');
      if (callback) callback();
      
      return data.removeTargetPost;
    } catch (err: any) {
      error.value = err.message;
      $bus.$emit('handleError', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // PUBLISH TARGET POST
  const publishTargetPost = async (
    $apollo: any,
    $bus: any,
    postId: string,
    callback?: () => void
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { PUBLISH_TARGET_POST } = await import('~/graphql/mutations/target-post.mutation');
      
      const { data } = await $apollo.mutate({
        mutation: PUBLISH_TARGET_POST,
        variables: {
          targetPostId: postId,
        },
      });

      $bus.$emit('handleSuccess', 'Post publicado exitosamente');
      if (callback) callback();
      
      return data.publishTargetPost;
    } catch (err: any) {
      error.value = err.message;
      $bus.$emit('handleError', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // DRAFT TARGET POST
  const draftTargetPost = async (
    $apollo: any,
    $bus: any,
    postId: string,
    callback?: () => void
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const { DRAFT_TARGET_POST } = await import('~/graphql/mutations/target-post.mutation');
      
      const { data } = await $apollo.mutate({
        mutation: DRAFT_TARGET_POST,
        variables: {
          targetPostId: postId,
        },
      });

      $bus.$emit('handleSuccess', 'Post movido a borrador exitosamente');
      if (callback) callback();
      
      return data.draftTargetPost;
    } catch (err: any) {
      error.value = err.message;
      $bus.$emit('handleError', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // STATE
    loading,
    error,

    // METHODS
    createTargetPost,
    updateTargetPost,
    getTargetPostById,
    getTargetPostsByCategory,
    cloneTargetPost,
    removeTargetPost,
    publishTargetPost,
    draftTargetPost,
  };
};
