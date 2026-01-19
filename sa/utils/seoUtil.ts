// ~/utils/seoUtil.ts

import type { ApolloClient } from "@apollo/client/core";
import type { DocumentNode } from "graphql";
import type { NuxtApp } from "nuxt/app";
import type { Ref } from "vue";
import { useHead, useSeoMeta } from "#app";
import { GET_SEO_PAGE } from "~/graphql/seoPage.query";
import type { SeoPageInterface } from "~/interfaces/seoPage.interface";

/**
 * Join param arrays into a single string.
 *
 * Nuxt route params may be `string | string[] | undefined`. This helper
 * normalizes to a simple `string` so you can safely pass it to APIs.
 *
 * @example
 * normalizeParam("abc")          // "abc"
 * normalizeParam(["a","b","c"])  // "abc"
 * normalizeParam(undefined)      // ""
 */
export const normalizeParam = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? v.join("") : v ?? "";

/**
 * Run a function within Nuxt’s composition context.
 *
 * Useful when you need to call composables like `useHead`/`useSeoMeta` **outside**
 * of a standard `setup()` body, but still during SSR or component lifecycle.
 *
 * @param nuxtApp - Current `NuxtApp` from `useNuxtApp()`
 * @param fn - Function that calls composables (can be async)
 * @returns The value returned by `nuxtApp.runWithContext`
 */
export function withNuxtHeadContext<T>(
  nuxtApp: NuxtApp,
  fn: () => T
): ReturnType<NuxtApp["runWithContext"]> {
  // Casting keeps TS happy with possible async functions.
  return nuxtApp.runWithContext(fn as any);
}

/**
 * Register `<title>` and SEO meta tags bound to reactive refs.
 *
 * Register this **early** (before awaiting data) so tags appear near the
 * beginning of `<head>`. Later, just update `titleRef.value` / `descRef.value`
 * after your data resolves and Nuxt will update the tags in place.
 *
 * @param nuxtApp - `useNuxtApp()` result
 * @param options.titleRef - Reactive title source (ref)
 * @param options.descRef - Reactive description source (ref)
 * @param options.type - OpenGraph type (defaults to `"website"`)
 * @param options.priority - `tagPriority` for head; lower ⇒ earlier in `<head>`
 *
 * @example
 * const titleRef = ref("")
 * const descRef  = ref("")
 * registerSeoRefs(nuxtApp, { titleRef, descRef, priority: 10 })
 * // ...later:
 * titleRef.value = "My Page"
 * descRef.value  = "Description..."
 */
export function registerSeoRefs(
  nuxtApp: NuxtApp,
  {
    titleRef,
    descRef,
    type = "website",
    priority = 10,
  }: {
    titleRef: Ref<string>;
    descRef?: Ref<string>;
    type?:
      | "website"
      | "article"
      | "book"
      | "profile"
      | "music.song"
      | "music.album"
      | "music.playlist"
      | "music.radio_status"
      | "video.movie"
      | "video.episode"
      | "video.tv_show"
      | "video.other"
      | null
      | undefined;
    priority?: number | "high" | "low";
  }
) {
  return withNuxtHeadContext(nuxtApp, () => {
    const config = useRuntimeConfig().public;
    useHead({
      titleTemplate: (t) => (t ? `${t} - ${config.siteName}` : config.siteName),
    });

    useHead(() => ({ title: titleRef.value || undefined }), {
      tagPriority: priority as any,
    });
    useSeoMeta({
      ogType: type,
      ogTitle: () => titleRef.value || undefined,
      description: () => descRef?.value || undefined,
      ogDescription: () => descRef?.value || undefined,
    });
  });
}

/** Shape for `fetchByKey` options. */
export interface FetchByKeyOptions<TData, TEntity> {
  /**
   * If your API uses a single query regardless of key shape (e.g. `/byKey`),
   * provide it here and omit `byIdQuery`/`bySlugQuery`.
   */
  singleQuery?: DocumentNode;
  /**
   * Query used when the key is recognized as an ID (e.g. Mongo ObjectId).
   */
  byIdQuery?: DocumentNode;
  /**
   * Query used when the key is recognized as a slug/string.
   */
  bySlugQuery?: DocumentNode;
  /**
   * Map the raw GraphQL `data` into the desired entity.
   * Receives context flags `{ isId, single }`.
   */
  select: (data: TData, ctx: { isId: boolean; single: boolean }) => TEntity;
  /**
   * Override how to detect if `key` is an ID. Defaults to a 24-hex test.
   */
  isId?: (key: string) => boolean;
  /**
   * Variable names for queries (defaults: `"key"`, `"id"`, `"slug"`).
   */
  varNames?: { single?: string; id?: string; slug?: string };
  /**
   * Build variables object manually if you need custom shapes.
   */
  buildVars?: (
    key: string,
    ctx: { isId: boolean; single: boolean }
  ) => Record<string, any>;
}

/**
 * Fetch an entity by a single `key` (supports: one query, or id/slug split).
 *
 * @typeParam TData - GraphQL response data type
 * @typeParam TEntity - The mapped entity type returned by `select`
 *
 * @param client - Apollo client instance
 * @param key - ID or slug
 * @param options - See `FetchByKeyOptions`
 *
 * @throws If neither `singleQuery` nor `byIdQuery/bySlugQuery` are provided
 *
 * @example
 * const entity = await fetchByKey<MyData, Category>(client, key, {
 *   byIdQuery: GET_CATEGORY_BY_ID,
 *   bySlugQuery: GET_CATEGORY_BY_SLUG,
 *   varNames: { id: "categoryId", slug: "slug" },
 *   select: (data, { isId }) => isId ? data.findCategoryById : data.findCategoryBySlug
 * })
 */
export async function fetchByKey<TData, TEntity>(
  client: ApolloClient<any>,
  key: string,
  options: FetchByKeyOptions<TData, TEntity>
): Promise<TEntity> {
  const isId = (options.isId ?? ((k) => /^[a-f\d]{24}$/i.test(k)))(key);
  const single =
    !!options.singleQuery && !options.byIdQuery && !options.bySlugQuery;

  const query = single
    ? options.singleQuery!
    : (isId ? options.byIdQuery : options.bySlugQuery)!;

  if (!query) {
    throw new Error("fetchByKey: provide singleQuery OR byIdQuery+bySlugQuery");
  }

  const variables =
    options.buildVars?.(key, { isId, single }) ??
    (single
      ? { [options.varNames?.single ?? "key"]: key }
      : isId
      ? { [options.varNames?.id ?? "id"]: key }
      : { [options.varNames?.slug ?? "slug"]: key });

  const { data } = await client.query<TData>({
    query,
    variables,
    fetchPolicy: "no-cache",
  });

  return options.select(data, { isId, single });
}

/** Params for `resolveEntityAndSeo`. */
export interface ResolveEntityAndSeoParams<TEntity> {
  /** Apollo client instance. */
  client: ApolloClient<any>;
  /** Current route path, used for `GET_SEO_PAGE`. */
  currentRoute: string;
  /** Entity lookup key (id/slug/string). Optional if you only need SEO. */
  entityKey?: string;
  /** Options you’d pass to `fetchByKey` (queries, select, etc.). */
  queries?: FetchByKeyOptions<TEntity, TEntity>;
  /** How to extract a fallback title from the entity (used if SEO title missing). */
  pickTitle: (entity: TEntity | null) => string;
  /** How to extract a fallback description from the entity (used if SEO desc missing). */
  pickDescription: (entity: TEntity | null) => string;
}

/** Result of `resolveEntityAndSeo`. */
export interface ResolveEntityAndSeoResult<TEntity> {
  entity: TEntity | null;
  seo: SeoPageInterface | null;
  finalTitle: string;
  finalDescription: string;
}

/**
 * Resolve **SEO page** (by `currentRoute`) and **entity** (by `entityKey`) **in parallel**,
 * and compute the final title/description (SEO wins; entity is fallback).
 *
 * This function does **not** write to `<head>`. Use `registerSeoRefs` early and then
 * assign the returned `finalTitle`/`finalDescription` to your refs, or call another
 * utility that performs head registration.
 *
 * @example
 * const { entity, finalTitle, finalDescription } = await resolveEntityAndSeo({
 *   client, currentRoute: route.path, entityKey: key, queries,
 *   pickTitle: (e) => e?.name ?? "",
 *   pickDescription: (e) => e?.excerpt ?? ""
 * })
 */
export async function resolveEntityAndSeo<TEntity, TData>({
  client,
  currentRoute,
  entityKey,
  queries,
  pickTitle,
  pickDescription,
}: ResolveEntityAndSeoParams<TEntity>): Promise<
  ResolveEntityAndSeoResult<TEntity>
> {
  // Fire SEO + entity requests concurrently
  const seoPromise = client
    .query<{ findSeoPageByPath: SeoPageInterface | null }>({
      query: GET_SEO_PAGE,
      variables: { path: currentRoute },
      fetchPolicy: "no-cache",
    })
    .then((r) => r.data.findSeoPageByPath)
    .catch(() => null);

  const entityPromise: Promise<TEntity | null> =
    entityKey && queries
      ? fetchByKey<any, TEntity>(client, entityKey, queries).catch(() => null)
      : Promise.resolve(null);

  const [seoSettled, entitySettled] = await Promise.allSettled([
    seoPromise,
    entityPromise,
  ]);

  const seo =
    seoSettled.status === "fulfilled" ? seoSettled.value : (null as any);
  const entity =
    entitySettled.status === "fulfilled" ? entitySettled.value : (null as any);

  // Compute final values (SEO-first)
  const entityTitle = pickTitle?.(entity) ?? "";
  const entityDesc = pickDescription?.(entity) ?? "";

  const finalTitle = seo?.meta?.title?.trim()
    ? seo.meta.title
    : entityTitle || "";
  const finalDescription = seo?.meta?.description?.trim()
    ? seo.meta.description
    : entityDesc || "";

  return { entity, seo, finalTitle, finalDescription };
}

/**
 * Create a picker that returns a **single** field as a string (coercing non-strings).
 *
 * Use this for titles/descriptions where string coercion is acceptable.
 *
 * @example
 * const pickTitle = makeStringFieldPicker<MyEntity>("name")
 */
export const makeStringFieldPicker =
  <T, K extends keyof T = keyof T>(key: K) =>
  (entity: T | null): string => {
    const value = entity?.[key];
    return typeof value === "string"
      ? value
      : value != null
      ? String(value)
      : "";
  };

/**
 * Create a picker that returns a **single** field strictly as a string.
 *
 * If the field is not a string, returns `""`. Good for IDs where you don’t
 * want silent coercion (e.g., object/number → string).
 *
 * @example
 * const pickId = makeIdFieldPicker<MyEntity>("_id")
 */
export const makeIdFieldPicker =
  <T, K extends keyof T = keyof T>(key: K) =>
  (entity: T | null): string => {
    const value = entity?.[key];
    return typeof value === "string" ? value : "";
  };

/** Params for `applyEntitySeoForKey`. */
export interface ApplyEntitySeoForKeyParams<TEntity> {
  /** Apollo client instance. */
  client: ApolloClient<any>;
  /** Current route path for SEO lookup. */
  currentRoute: string;
  /** New key to load (id/slug). If empty or unchanged, this is a no-op. */
  key: string;
  /** Current key (to skip redundant loads if unchanged). */
  currentKey?: string;
  /** Queries/options you would pass to `fetchByKey`. */
  queries?: FetchByKeyOptions<TEntity, TEntity>;
  /** Entity → title fallback function. */
  pickTitle: (entity: TEntity | null) => string;
  /** Entity → description fallback function. */
  pickDescription: (entity: TEntity | null) => string;
  /** Ref that was previously registered with `registerSeoRefs`. */
  titleRef: Ref<string>;
  /** Optional ref previously registered with `registerSeoRefs`. */
  descRef?: Ref<string>;
}

/** Result for `applyEntitySeoForKey`. */
export interface ApplyEntitySeoForKeyResult<TEntity> {
  entity: TEntity | null;
  finalTitle: string;
  finalDescription: string;
  /** Whether a new request ran (false if key was empty/unchanged). */
  updated: boolean;
}

/**
 * DRY helper: load SEO + entity for a given key and **update head refs**.
 *
 * - Skips work when `key` is empty or equals `currentKey`.
 * - Returns the loaded `entity` and the final title/description.
 * - Writes `finalTitle`/`finalDescription` into your previously registered refs.
 *
 * This helper doesn’t mutate your component’s state (e.g., doesn’t assign entity ID).
 * Keep that responsibility in the component (or add your own small wrapper).
 *
 * @example
 * // Inside setup():
 * const titleRef = ref(""), descRef = ref("")
 * registerSeoRefs(nuxtApp, { titleRef, descRef, priority: 10 })
 *
 * await applyEntitySeoForKey<Category>({
 *   client, currentRoute: route.path, key, currentKey: vm.pageParam,
 *   queries, pickTitle: (e) => e?.name ?? "", pickDescription: (e) => e?.excerpt ?? "",
 *   titleRef, descRef
 * })
 */
export async function applyEntitySeoForKey<TEntity>({
  client,
  currentRoute,
  key,
  currentKey,
  queries,
  pickTitle,
  pickDescription,
  titleRef,
  descRef,
}: ApplyEntitySeoForKeyParams<TEntity>): Promise<
  ApplyEntitySeoForKeyResult<TEntity>
> {
  if (!key || (currentKey && key === currentKey)) {
    return {
      entity: null,
      finalTitle: titleRef.value,
      finalDescription: descRef?.value ?? "",
      updated: false,
    };
  }

  const { entity, finalTitle, finalDescription } = await resolveEntityAndSeo<
    TEntity,
    any
  >({
    client,
    currentRoute,
    entityKey: key,
    queries,
    pickTitle,
    pickDescription,
  });

  // Update early-registered head refs
  titleRef.value = finalTitle;
  if (descRef) descRef.value = finalDescription;

  return { entity, finalTitle, finalDescription, updated: true };
}
