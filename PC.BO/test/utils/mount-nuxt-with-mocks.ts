// test/utils/mount-nuxt-with-mocks.ts
import { mount } from "@vue/test-utils";
import { vi } from "vitest";

/**
 * Mounts a Nuxt page/component supplying mocks for $apollo, $router, $bus
 * @param component - Vue component (page or component)
 * @param options - Vue Test Utils mount options
 * @param apolloMock - optional Apollo mock to use for $apollo
 */
export function mountNuxtWithMocks(component: any, options: any = {}) {
  const defaultApolloMock = {
    query: vi.fn().mockResolvedValue({ data: {} }),
    mutate: vi.fn().mockResolvedValue({ data: {} }),
  };

  const merged = mount(component, {
    ...options,
    global: {
      ...options.global,
      mocks: {
        $bus: {
          $emit: vi.fn(),
          $on: vi.fn(),
          $off: vi.fn(),
        },
        $router: {
          push: vi.fn(),
          replace: vi.fn(),
          back: vi.fn(),
          currentRoute: {
            fullPath: "/",
            name: "index",
            params: {},
            query: {},
          },
        },
        ...(options.global?.mocks ?? {}),
      },
      stubs: {
        "client-only": { template: "<div><slot/></div>" },
        "app-lottie": { template: "<div />" },
        "item-action-component": {
          template: "<div class='item-action-stub'/>",
        },
        ...(options.global?.stubs ?? {}),
      },
    },
  });

  return merged;
}
