// test/e2e/financially/index.spec.ts
import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountNuxtWithMocks } from "../../utils/mount-nuxt-with-mocks";

import FinanciallyScreen from "~/pages/financieramente/index.vue";
import { GET_SLIDERS_BY_TARGET } from "~/graphql/slider.query";
import { GET_FINANCIALLY_PAGINATED } from "~/graphql/financially.query";
import type { FinanciallyInterface } from "~/interfaces/financially.interface";
import type { PaginationInterface } from "~/interfaces/pagination.interface";

/**
 * Creates a minimal FinanciallyInterface instance for tests.
 */
function createPost(
  overrides: Partial<FinanciallyInterface> = {}
): FinanciallyInterface {
  return {
    _id: overrides._id ?? "p1",
    title: overrides.title ?? "Post title",
    description: overrides.description ?? "Post description",
    slug: overrides.slug ?? "post-slug",
    type: overrides.type ?? "post::article",
    authors: overrides.authors ?? [
      {
        name: "Author One",
      },
    ],
    pinnedAt: overrides.pinnedAt ?? null,
    bannerImageDetail: overrides.bannerImageDetail ?? {
      image: "/img/banner.jpg",
    },
    responsiveImageDetail: overrides.responsiveImageDetail ?? null,
    thumbnailImageDetail: overrides.thumbnailImageDetail ?? null,
  } as FinanciallyInterface;
}

/**
 * Creates a paginated response wrapper for posts.
 */
function createPaginated(
  items: FinanciallyInterface[],
  overrides: Partial<PaginationInterface<FinanciallyInterface>> = {}
): PaginationInterface<FinanciallyInterface> {
  const totalItems = overrides.totalItems ?? items.length;
  const itemsPerPage = overrides.itemsPerPage ?? 12;

  return {
    currentPage: overrides.currentPage ?? 1,
    items,
    totalItems,
    itemsPerPage,
  };
}

/**
 * Creates an Apollo mock that responds to the slider and financially queries.
 */
function createApolloMock(
  slidersData: any[],
  financiallyPaginatedData: PaginationInterface<FinanciallyInterface>
) {
  return {
    query: vi.fn().mockImplementation(({ query }) => {
      if (query === GET_SLIDERS_BY_TARGET) {
        return Promise.resolve({
          data: {
            findSliderByTarget: slidersData,
          },
        });
      }

      if (query === GET_FINANCIALLY_PAGINATED) {
        return Promise.resolve({
          data: {
            getFinanciallyPaginated: financiallyPaginatedData,
          },
        });
      }

      return Promise.resolve({ data: {} });
    }),
    mutate: vi.fn(),
  };
}

/**
 * Common stubs for child components used by FinanciallyScreen.
 */
const baseStubs = {
  "app-carousel-component": { template: "<div class='app-carousel-stub' />" },
  "app-financially-card-component": {
    template: "<div class='financially-card-stub' />",
  },
  "carousel-card": {
    name: "carousel-card",
    template: "<div class='carousel-card-stub' />",
  },
  "v-row": { template: "<div class='v-row-stub'><slot /></div>" },
  "v-col": { template: "<div class='v-col-stub'><slot /></div>" },
  "v-card": { template: "<div class='v-card-stub'><slot /></div>" },
  "v-text-field": { template: "<input class='v-text-field-stub' />" },
  "v-btn": { template: "<button class='v-btn-stub'><slot /></button>" },
  "v-img": { template: "<div class='v-img-stub'><slot /></div>" },
  "v-carousel": { template: "<div class='v-carousel-stub'><slot /></div>" },
  "v-carousel-item": {
    template: "<div class='v-carousel-item-stub'><slot /></div>",
  },
};

/**
 * Stub NuxtLink to behave like an anchor and forward click events.
 */
const NuxtLinkStub = {
  name: "NuxtLink",
  props: ["to"],
  template: `<a :data-to="to" @click="$emit('click', $event)"><slot /></a>`,
};

describe("FinanciallyScreen – E2E-like behavior", () => {
  it("mounts without crashing", async () => {
    const apolloMock = createApolloMock([], createPaginated([]));

    const wrapper = mountNuxtWithMocks(FinanciallyScreen, {
      route: {
        params: { type: "articulos", page: "1" },
        fullPath: "/financieramente/articulos/1",
        name: "financially-screen",
      },
      global: {
        mocks: { $apollo: apolloMock },
        stubs: {
          ...baseStubs,
          NuxtLink: NuxtLinkStub,
          "v-pagination": {
            name: "v-pagination",
            props: ["modelValue", "length"],
            emits: ["update:modelValue"],
            template: "<nav class='v-pagination-stub' />",
          },
        },
      },
    });

    await flushPromises();
    expect(wrapper.exists()).toBe(true);
  });

  it("calls Apollo queries on mount", async () => {
    const apolloMock = createApolloMock([], createPaginated([]));

    const wrapper = mountNuxtWithMocks(FinanciallyScreen, {
      route: {
        params: { type: "articulos", page: "1" },
        fullPath: "/financieramente/articulos/1",
        name: "financially-screen",
      },
      global: {
        mocks: { $apollo: apolloMock },
        stubs: {
          ...baseStubs,
          NuxtLink: NuxtLinkStub,
          "v-pagination": {
            name: "v-pagination",
            props: ["modelValue", "length"],
            emits: ["update:modelValue"],
            template: "<nav class='v-pagination-stub' />",
          },
        },
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    // Sliders + paginated financially
    expect(apolloMock.query).toHaveBeenCalledTimes(2);
  });

  it("renders carousel-card when pinned posts exist on page 1", async () => {
    const pinned = createPost({ _id: "pinned-1", pinnedAt: "2025-01-01" });
    const regular = createPost({ _id: "reg-1" });

    const apolloMock = createApolloMock(
      [{ id: "s1", image: "/img/s1.jpg" }],
      createPaginated([pinned, regular])
    );

    const wrapper = mountNuxtWithMocks(FinanciallyScreen, {
      route: {
        params: { type: "articulos", page: "1" },
        fullPath: "/financieramente/articulos/1",
        name: "financially-screen",
      },
      global: {
        mocks: { $apollo: apolloMock },
        stubs: {
          ...baseStubs,
          NuxtLink: NuxtLinkStub,
          "v-pagination": {
            name: "v-pagination",
            props: ["modelValue", "length"],
            emits: ["update:modelValue"],
            template: "<nav class='v-pagination-stub' />",
          },
        },
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const carousel = wrapper.findComponent({ name: "carousel-card" });
    expect(carousel.exists()).toBe(true);
  });

  it("does not render carousel-card when pageParam is greater than 1 even with pinned posts", async () => {
    const pinned = createPost({ pinnedAt: "2025-01-01" });

    const apolloMock = createApolloMock([], createPaginated([pinned]));

    const wrapper = mountNuxtWithMocks(FinanciallyScreen, {
      route: {
        params: { type: "articulos", page: "2" },
        fullPath: "/financieramente/articulos/2",
        name: "financially-screen",
      },
      global: {
        mocks: { $apollo: apolloMock },
        stubs: {
          ...baseStubs,
          NuxtLink: NuxtLinkStub,
          "v-pagination": {
            name: "v-pagination",
            props: ["modelValue", "length"],
            emits: ["update:modelValue"],
            template: "<nav class='v-pagination-stub' />",
          },
        },
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const carousel = wrapper.findComponent({ name: "carousel-card" });
    expect(carousel.exists()).toBe(false);
  });

  it("toggles search field when clicking 'Buscar'", async () => {
    const apolloMock = createApolloMock([], createPaginated([]));

    const wrapper = mountNuxtWithMocks(FinanciallyScreen, {
      route: {
        params: { type: "articulos", page: "1" },
        fullPath: "/financieramente/articulos/1",
        name: "financially-screen",
      },
      global: {
        mocks: { $apollo: apolloMock },
        stubs: {
          ...baseStubs,
          NuxtLink: NuxtLinkStub,
          "v-pagination": {
            name: "v-pagination",
            props: ["modelValue", "length"],
            emits: ["update:modelValue"],
            template: "<nav class='v-pagination-stub' />",
          },
        },
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const links = wrapper.findAll("a");
    const buscar = links.find((a) => a.text().includes("Buscar"));
    expect(buscar).toBeDefined();

    await buscar!.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.isSearching).toBe(true);
    expect(wrapper.vm.showSearchField).toBe(true);

    const searchField = wrapper.find(".v-text-field-stub");
    expect(searchField.exists()).toBe(true);
  });

  it("navigates using onPaginate", async () => {
    const posts = [createPost({ _id: "1" }), createPost({ _id: "2" })];
    const paginated = createPaginated(posts, {
      totalItems: 24,
      itemsPerPage: 12,
      currentPage: 1,
    });

    const apolloMock = createApolloMock([], paginated);
    const routerPush = vi.fn();

    const wrapper = mountNuxtWithMocks(FinanciallyScreen, {
      route: {
        params: { type: "articulos", page: "1" },
        fullPath: "/financieramente/articulos/1",
        name: "financially-screen",
      },
      global: {
        mocks: {
          $apollo: apolloMock,
          $router: {
            push: routerPush,
          },
        },
        stubs: {
          ...baseStubs,
          NuxtLink: NuxtLinkStub,
          "v-pagination": {
            name: "v-pagination",
            props: ["modelValue", "length"],
            emits: ["update:modelValue"],
            template: "<nav class='v-pagination-stub' />",
          },
        },
      },
    });

    await flushPromises();
    await wrapper.vm.$nextTick();

    const pagination = wrapper.findComponent({ name: "v-pagination" });
    expect(pagination.exists()).toBe(true);

    pagination.vm.$emit("update:modelValue", 2);

    expect(routerPush).toHaveBeenCalledWith({
      path: "/financieramente/articulos/2",
    });
  });
});
