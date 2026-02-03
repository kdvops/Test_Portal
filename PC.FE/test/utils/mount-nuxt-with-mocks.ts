// test/utils/mount-nuxt-with-mocks.ts
import { mount, type MountingOptions } from "@vue/test-utils";
import { vi } from "vitest";

export interface MockRoute {
  fullPath: string;
  name?: string;
  params: Record<string, any>;
  query: Record<string, any>;
}

/**
 * Shared mock route object returned as $route and used by $router.currentRoute.
 * Tests can influence this via the `route` option passed to mountNuxtWithMocks.
 */
export const mockRoute: MockRoute = {
  fullPath: "/",
  name: "index",
  params: {},
  query: {},
};

/**
 * Mounts a Nuxt page/component supplying mocks for $apollo, $router, $route, $bus.
 *
 * Usage:
 *   mountNuxtWithMocks(Component, {
 *     route: { params: { type: "articulos", page: "1" } },
 *     global: { mocks: { $apollo: myApolloMock }, stubs: { ... } }
 *   })
 */
export function mountNuxtWithMocks<T>(
  component: any,
  options: MountingOptions<T> & { route?: Partial<MockRoute> } = {}
) {
  // Apply route overrides to the shared mockRoute
  if (options.route) {
    const r = options.route;
    mockRoute.fullPath = r.fullPath ?? "/"; // default root
    mockRoute.name = r.name ?? "index";
    mockRoute.params = r.params ?? {};
    mockRoute.query = r.query ?? {};
  } else {
    // Reset to defaults if no route is provided
    mockRoute.fullPath = "/";
    mockRoute.name = "index";
    mockRoute.params = {};
    mockRoute.query = {};
  }

  const userGlobal = options.global ?? {};
  const userMocks = userGlobal.mocks ?? {};
  const userStubs = userGlobal.stubs ?? {};

  const defaultApolloMock = {
    query: vi.fn().mockResolvedValue({ data: {} }),
    mutate: vi.fn().mockResolvedValue({ data: {} }),
  };

  const apolloMock = userMocks.$apollo ?? defaultApolloMock;

  return mount(component, {
    ...options,
    global: {
      ...userGlobal,
      mocks: {
        // Default mocks
        $apollo: apolloMock,
        $bus: {
          $emit: vi.fn(),
          $on: vi.fn(),
          $off: vi.fn(),
        },
        $route: mockRoute,
        $router: {
          push: vi.fn(),
          replace: vi.fn(),
          back: vi.fn(),
          currentRoute: mockRoute,
          ...(userMocks.$router ?? {}),
        },
        // User mocks override or extend defaults
        ...userMocks,
      },
      stubs: {
        // Common global stubs
        "client-only": { template: "<div><slot/></div>" },
        "app-lottie": { template: "<div />" },
        "item-action-component": {
          template: "<div class='item-action-stub'/>",
        },
        // User stubs override or extend defaults
        ...userStubs,
      },
    },
  });
}
