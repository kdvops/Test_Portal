// plugins/seo.ts
import { useApolloClient } from "@vue/apollo-composable";
import { GET_SEO_PAGE } from "~/graphql/seoPage.query";
import type { SeoPageInterface } from "~/interfaces/seoPage.interface";

type SeoApiResponse = {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  locale?: string;
};

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig().public;
  const route = useRoute();
  let lastSeoPath = route.fullPath;

  const toAbs = (maybeUrl?: string) => {
    if (!maybeUrl) return `${config.siteUrl}${config.defaultImage}`;
    if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
    return `${config.siteUrl}${maybeUrl.startsWith("/") ? "" : "/"}${maybeUrl}`;
  };

  const isManual = () =>
    route.matched.some((r) => r.meta && (r.meta as any).seoManual === true);

  const applySeo = (seo: SeoApiResponse | null) => {
    if (isManual()) return;

    const title = seo?.title ?? config.siteName;
    const description = seo?.description ?? config.defaultDescription;
    const canonical = (
      seo?.canonical ?? `${config.siteUrl}${route.fullPath}`
    ).replace(/\/+$/, "");
    const ogImage = toAbs(seo?.image);

    useHead({
      titleTemplate: (t) => (t ? `${t} - ${config.siteName}` : config.siteName),
    });

    useSeoMeta({
      title,
      ogTitle: title,
      description,
      ogDescription: description,
      ogImage,
      ogType: "website",
      ogUrl: canonical,
    });

    useHead({
      link: [{ rel: "canonical", href: canonical }],
      meta: [
        {
          name: "robots",
          content: seo?.noindex ? "noindex, nofollow" : "index, follow",
        },
      ],
    });
  };

  const fetchSeo = async (path: string): Promise<SeoApiResponse | null> => {
    try {
      const result = await nuxtApp.runWithContext(async () => {
        const { client } = useApolloClient();
        const { data } = await client.query<{
          findSeoPageByPath: SeoPageInterface | null;
        }>({
          query: GET_SEO_PAGE,
          variables: { path },
          fetchPolicy: "no-cache",
        });
        return data.findSeoPageByPath;
      });

      if (!result) return null;

      const m = result.meta ?? ({} as any);
      return {
        title: m.title,
        description: m.description,
        image: m.image,
        canonical: (result as any).canonical,
        noindex: (result as any).noindex,
        locale: (result as any).locale,
      };
    } catch (_e) {
      return null;
    }
  };

  // SSR initial: block render until SEO is resolved
  if (process.server) {
    const startMs = Date.now();
    const initialSeo = await fetchSeo(route.fullPath);
    const elapsedMs = Date.now() - startMs;
    console.info(`[seo] SSR fetchSeo(${route.fullPath}) ${elapsedMs}ms`);
    applySeo(initialSeo);
  }

  // Navegaciones en cliente
  nuxtApp.hook("page:finish", async () => {
    if (isManual()) return;
    const path = useRoute().fullPath;
    if (path === lastSeoPath) return;
    lastSeoPath = path;
    const data = await fetchSeo(path);
    applySeo(data);
  });
});
