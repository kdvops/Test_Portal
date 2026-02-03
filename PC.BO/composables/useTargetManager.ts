import { ref, computed } from "vue";
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT REQUIRED QUERIES
import { GET_ALL_TARGETS } from "~/graphql/query/targets.query";
import {
  GET_CATEGORIES_BY_TARGET,
  GET_CATEGORIES_BY_TARGET_ID,
} from "~/graphql/query/categories.query";
import {
  GET_SLIDERS_BY_TARGET,
  GET_SLIDERS_BY_TARGET_ID,
} from "~/graphql/query/slider.query";

export const targetStatic: Record<string, string> = {
  categoryProfits: "categoryProfits",
  categoryPodcast: "categoryPodcast",
  categoryProducts: "categoryProducts",
  categoryAboutUs: "categoryAboutUs",
  categoryBusiness: "categoryBusiness",
  categoryEnterprise: "categoryEnterprise",
  categoryChannels: "categoryChannels",
  categoryInsurance: "categoryInsurance",
  categoryProuser: "categoryProuser",
  categoryAdjudicated: "categoryAdjudicated",
};

// TRANSLATIONS FOR STATIC TARGETS - Nombres descriptivos para el selector
export const targetStaticTranslations: Record<string, string> = {
  categoryProfits: "Beneficios",
  categoryPodcast: "Podcast",
  categoryProducts: "Para tí",
  categoryAboutUs: "Nosotros",
  categoryBusiness: "Mi negocio",
  categoryEnterprise: "Empresa",
  categoryChannels: "Canales",
  categoryInsurance: "Seguros",
  categoryProuser: "Prouser",
  categoryAdjudicated: "Adjudicados",
};

export const useTargetManager = () => {
  // DYNAMIC TARGETS FROM DATABASE
  const dynamicTargets = ref<Array<TargetInterface>>([]);

  // CURRENTLY SELECTED TARGET
  const selectedTarget = ref<string>("");

  // LOADING STATE
  const loading = ref(false);

  // COMPUTED THAT COMBINES STATIC AND DYNAMIC TARGETS
  const allTargets = computed(() => {
    const staticTargets = Object.entries(targetStatic).map(([key, value]) => ({
      _id: key,
      name:
        targetStaticTranslations[key] ||
        key
          .replace("category", "")
          .replace(/([A-Z])/g, " $1")
          .trim(),
      slug: value.replace("category::", ""),
      icon: "mdi-folder",
      color: "#12539b",
      description:
        targetStaticTranslations[key] ||
        `Categorías para ${key
          .replace("category", "")
          .replace(/([A-Z])/g, " $1")
          .trim()}`,
      sections: [],
      status: "enabled" as const,
      isStatic: true,
    }));

    const dynamicTargetsFormatted = dynamicTargets.value.map((target) => ({
      ...target,
      name: target.name
        ? `${target.name} - Target Dinámico`
        : `Target Dinámico - ${target._id}`,
      isStatic: false,
    }));

    return [...staticTargets, ...dynamicTargetsFormatted];
  });

  // GET TARGET VALUE FOR SEARCHES (category::target or category::id)
  const getTargetValueForSearch = (targetKey: string): string => {
    const targetValue = targetStatic[targetKey];
    const key =
      targetValue && targetValue.replace("category", "").toLowerCase();

    // SPECIAL SLUG NORMALIZATION FOR STATIC TARGETS
    const specialSlugMap: Record<string, string> = {
      aboutus: "about-us",
    };

    // NORMALIZE KEY
    const normalizedKey = key ? specialSlugMap[key] ?? key : "";

    // IF IT'S A STATIC TARGET, RETURN category::target
    if (normalizedKey) {
      return `category::${normalizedKey}`;
    }

    // IF IT'S A DYNAMIC TARGET, RETURN category::id
    const dynamicTarget = dynamicTargets.value.find(
      (target) => target._id === targetKey
    );
    if (dynamicTarget) {
      return `category::${dynamicTarget._id}`;
    }

    // FALLBACK: USE TARGETKEY DIRECTLY
    return targetKey;
  };

  // GET TARGET VALUE FOR SAVING (categoryTargetStatic or categoryTargetId)
  const getTargetValueForSave = (targetKey: string): string => {
    // IF IT'S A STATIC TARGET, RETURN ITS VALUE DIRECTLY
    if (targetStatic[targetKey]) {
      return targetStatic[targetKey];
    }

    // IF IT'S A DYNAMIC TARGET, RETURN THE ID
    const dynamicTarget = dynamicTargets.value.find(
      (target) => target._id === targetKey
    );
    if (dynamicTarget) {
      return dynamicTarget._id || targetKey;
    }

    // FALLBACK: USE TARGETKEY DIRECTLY
    return targetKey;
  };

  // GET TARGET KEY FROM VALUE
  const getTargetKey = (targetValue: string): string => {
    // SEARCH IN STATIC TARGETS
    const staticEntry = Object.entries(targetStatic).find(
      ([_, value]) => value === targetValue
    );
    if (staticEntry) {
      return staticEntry[0];
    }

    // IF IT'S A DYNAMIC TARGET WITH FORMAT category::id
    if (targetValue.startsWith("category::")) {
      const staticKey = Object.keys(targetStatic).find(
        (key) => getTargetValueForSearch(key) === targetValue
      );
      if (staticKey) {
        return staticKey;
      }

      const targetId = targetValue.replace("category::", "");
      // CHECK IF IT'S A VALID DYNAMIC TARGET ID
      const dynamicTarget = dynamicTargets.value.find(
        (target) => target._id === targetId
      );
      if (dynamicTarget) {
        return dynamicTarget._id || targetId;
      }
      // IF NOT FOUND IN CURRENT DYNAMIC TARGETS, RETURN THE ID AS IS
      return targetId;
    }

    // FALLBACK: USE VALUE DIRECTLY
    return targetValue;
  };

  // CHECK IF A TARGET IS STATIC
  const isStaticTarget = (targetKey: string): boolean => {
    return targetKey in targetStatic;
  };

  // GET TARGET INFORMATION
  const getTargetInfo = (targetKey: string) => {
    return allTargets.value.find(
      (target) => target._id === targetKey || target.slug === targetKey
    );
  };

  // LOAD DYNAMIC TARGETS FROM DATABASE
  const loadDynamicTargets = async ($apollo: any) => {
    loading.value = true;
    try {
      const { data } = await $apollo.query({
        query: GET_ALL_TARGETS,
        fetchPolicy: "no-cache",
      });

      dynamicTargets.value = data.findAllTargets || [];
    } catch (error) {
      console.error("Error loading dynamic targets:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // SELECT A TARGET
  const selectTarget = (targetKey: string) => {
    selectedTarget.value = targetKey;
  };

  // GET SLIDERS FOR SELECTED TARGET
  const getSlidersForTarget = async ($apollo: any, targetKey: string) => {
    const searchValue = getTargetValueForSearch(targetKey);

    try {
      // IF IT'S A STATIC TARGET, USE THE ORIGINAL QUERY
      if (isStaticTarget(targetKey)) {
        const { data } = await $apollo.query({
          query: GET_SLIDERS_BY_TARGET,
          variables: {
            target: searchValue,
          },
          fetchPolicy: "no-cache",
        });
        return data.findSlidersByTarget || [];
      }

      // IF IT'S A DYNAMIC TARGET, USE THE TARGET ID QUERY
      const dynamicTarget = dynamicTargets.value.find(
        (target) => target._id === targetKey
      );
      if (dynamicTarget) {
        const { data } = await $apollo.query({
          query: GET_SLIDERS_BY_TARGET_ID,
          variables: {
            targetId: dynamicTarget._id,
          },
          fetchPolicy: "no-cache",
        });
        return data.findSliderByTargetId || [];
      }

      // FALLBACK: EMPTY ARRAY
      return [];
    } catch (error) {
      console.error("Error loading sliders for target:", error);
      throw error;
    }
  };

  // GET CATEGORIES FOR SELECTED TARGET
  const getCategoriesForTarget = async ($apollo: any, targetKey: string) => {
    const searchValue = getTargetValueForSearch(targetKey);

    console.log("searchValue", searchValue);
    console.log("targetKey", targetKey);
    console.log("targetStatic", targetStatic);
    console.log("dynamicTargets", dynamicTargets.value);
    console.log("allTargets", allTargets.value);
    console.log("selectedTarget", selectedTarget.value);
    console.log("loading", loading.value);
    console.log("dynamicTargets", dynamicTargets.value);
    console.log("dynamicTargets", dynamicTargets.value);

    try {
      // IF IT'S A STATIC TARGET, USE THE ORIGINAL QUERY
      if (targetStatic[targetKey]) {
        const { data } = await $apollo.query({
          query: GET_CATEGORIES_BY_TARGET,
          variables: {
            target: searchValue,
          },
          fetchPolicy: "no-cache",
        });
        return data.findCategoryByTarget || [];
      }

      // IF IT'S A DYNAMIC TARGET, USE THE TARGET ID QUERY
      const dynamicTarget = dynamicTargets.value.find(
        (target) => target._id === targetKey
      );
      if (dynamicTarget) {
        const { data } = await $apollo.query({
          query: GET_CATEGORIES_BY_TARGET_ID,
          variables: {
            targetId: dynamicTarget._id,
          },
          fetchPolicy: "no-cache",
        });
        return data.findCategoriesByTargetId || [];
      }

      // FALLBACK: EMPTY ARRAY
      return [];
    } catch (error) {
      console.error("Error loading categories for target:", error);
      throw error;
    }
  };

  return {
    // STATE
    dynamicTargets,
    selectedTarget,
    loading,

    // COMPUTED
    allTargets,

    // METHODS
    getTargetValueForSearch,
    getTargetValueForSave,
    getTargetKey,
    isStaticTarget,
    getTargetInfo,
    loadDynamicTargets,
    selectTarget,
    getCategoriesForTarget,
    getSlidersForTarget,

    // CONSTANTS
    targetStatic,
    targetStaticTranslations,
  };
};
