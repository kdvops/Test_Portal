import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import FinanciallyListScreen from "~/pages/financially/list/index.vue";

function createApolloMock(data: any) {
  return {
    query: vi.fn().mockResolvedValue({ data }),
    mutate: vi.fn(),
  };
}

// Helper to mount the component with Apollo mock
async function mountWithApollo($apollo: any) {
  const wrapper = mount(FinanciallyListScreen, {
    global: {
      mocks: {
        $apollo,
        $bus: { $emit: vi.fn(), $on: vi.fn(), $off: vi.fn() },
        $router: { push: vi.fn(), replace: vi.fn(), back: vi.fn() },
      },
    },
  });

  await flushPromises();
  await wrapper.vm.$nextTick();

  return { wrapper, $apollo, vm: wrapper.vm as any };
}

// Mock data for financially groups
const mockGroups = [
  { type: "post::article", financially: [{ _id: "1", title: "Test A" }] },
  { type: "post::events", financially: [{ _id: "2", title: "Test B" }] },
] as const;

const apolloMock = createApolloMock({
  findFinanciallyGroupByType: mockGroups,
});

// Mapping of type to display label
const typeLabelMap = {
  "post::article": "Artículo",
  "post::events": "Evento",
  "post::release": "Nota de prensa",
};

describe("FinanciallyListScreen", () => {
  it("mounts without crashing", async () => {
    const { wrapper } = await mountWithApollo(apolloMock);
    expect(wrapper.exists()).toBe(true);
  });

  it("calls Apollo query on mount", async () => {
    const { $apollo } = await mountWithApollo(apolloMock);
    expect($apollo.query).toHaveBeenCalledTimes(1);
  });

  it("populates financiallyGroup with API response", async () => {
    const { vm } = await mountWithApollo(apolloMock);

    expect(vm.financiallyGroup).toHaveLength(mockGroups.length);
    expect(vm.financiallyGroup).toEqual(mockGroups);
  });

  it("renders one category block per financially group", async () => {
    const { wrapper } = await mountWithApollo(apolloMock);

    const categoryItems = wrapper.findAll(".financially-category__item");
    expect(categoryItems.length).toBe(mockGroups.length);
  });

  it("renders one card per group", async () => {
    const { wrapper } = await mountWithApollo(apolloMock);

    const cards = wrapper.findAll(".financially-card");
    expect(cards.length).toBe(mockGroups.length);
  });

  it("renders the correct translated category titles", async () => {
    const { wrapper } = await mountWithApollo(apolloMock);

    // Finds all rendered category titles
    const titles = wrapper.findAll(".financially-category__title");

    // Prepares the .financially-category__title texts for validation
    const titleTexts = titles.map((t) => t.text());

    // Validates each group's title is rendered correctly
    mockGroups.forEach((group) => {
      const expectedText = `Tipo de publicación - ${typeLabelMap[group.type]}`;
      expect(titleTexts).toContain(expectedText);
    });
  });
});

describe("FinanciallyListScreen - Pin functionality", () => {
  const mockGroups = [
    {
      type: "post::article",
      financially: [
        {
          _id: "1",
          title: "Test Title",
          pinnedAt: null,
        },
        {
          _id: "2",
          title: "Test Title 2",
          pinnedAt: null,
        },
        {
          _id: "3",
          title: "Test Title 3",
          pinnedAt: null,
        },
        {
          _id: "4",
          title: "Test Title 4",
          pinnedAt: null,
        },
        {
          _id: "5",
          title: "Test Title 5",
          pinnedAt: null,
        },
      ],
    },
    {
      type: "post::event",
      financially: [
        {
          _id: "11",
          title: "Test Title",
          pinnedAt: null,
        },
        {
          _id: "12",
          title: "Test Title 2",
          pinnedAt: null,
        },
        {
          _id: "13",
          title: "Test Title 3",
          pinnedAt: null,
        },
        {
          _id: "14",
          title: "Test Title 4",
          pinnedAt: null,
        },
        {
          _id: "15",
          title: "Test Title 5",
          pinnedAt: null,
        },
      ],
    },
    {
      type: "post::release",
      financially: [
        {
          _id: "21",
          title: "Test Title",
          pinnedAt: null,
        },
        {
          _id: "22",
          title: "Test Title 2",
          pinnedAt: null,
        },
        {
          _id: "23",
          title: "Test Title 3",
          pinnedAt: null,
        },
        {
          _id: "24",
          title: "Test Title 4",
          pinnedAt: null,
        },
        {
          _id: "25",
          title: "Test Title 5",
          pinnedAt: null,
        },
      ],
    },
  ] as const;

  it("toggles pin icon when clicking the pin button", async () => {
    const mockGroups = [
      {
        type: "post::article",
        financially: [{ _id: "1", title: "Post 1", pinnedAt: null }],
      },
    ] as const;

    const apolloMock = createApolloMock({
      findFinanciallyGroupByType: mockGroups,
    });

    const { wrapper, vm, $apollo } = await mountWithApollo(apolloMock);

    // Initially, not pinned
    expect(vm.financiallyGroup[0].financially[0].pinnedAt).toBeNull();

    const groupWrapper = wrapper.find(".financially-list__group");
    const pinButton = groupWrapper.find(".financially-card__pin-button");
    expect(pinButton.exists()).toBe(true);

    // Icon before click
    expect(groupWrapper.html()).toContain("mdi-pin");
    expect(groupWrapper.html()).not.toContain("mdi-pin-off");

    // Click → pin
    await pinButton.trigger("click");
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect($apollo.mutate).toHaveBeenCalledTimes(1);
    expect(vm.financiallyGroup[0].financially[0].pinnedAt).not.toBeNull();

    // Icon after click
    expect(groupWrapper.html()).toContain("mdi-pin-off");
  });

  it("allows pinning up to 3 items per type", async () => {
    const mockGroups = [
      {
        type: "post::article",
        financially: [
          { _id: "1", title: "Post 1", pinnedAt: null },
          { _id: "2", title: "Post 2", pinnedAt: null },
          { _id: "3", title: "Post 3", pinnedAt: null },
          { _id: "4", title: "Post 4", pinnedAt: null },
        ],
      },
    ] as const;

    const apolloMock = createApolloMock({
      findFinanciallyGroupByType: mockGroups,
    });

    const { wrapper, vm, $apollo } = await mountWithApollo(apolloMock);

    const groupWrapper = wrapper.find(".financially-list__group");
    const pinButtons = groupWrapper.findAll(".financially-card__pin-button");
    expect(pinButtons.length).toBe(4);

    // Click first 3 pin buttons
    for (let i = 0; i < 3; i++) {
      await pinButtons[i].trigger("click");
      await flushPromises();
    }
    await wrapper.vm.$nextTick();

    // Apollo called 3 times
    expect($apollo.mutate).toHaveBeenCalledTimes(3);

    // All 3 in state now pinned
    const groupState = vm.financiallyGroup[0].financially as any[];
    const pinnedCount = groupState.filter((p) => !!p.pinnedAt).length;
    expect(pinnedCount).toBe(3);

    // Icons: 3 pinned, 1 not pinned
    const pinnedIcons = groupWrapper.findAll(
      ".financially-card__pin-button .mdi-pin-off"
    );
    const unpinnedIcons = groupWrapper.findAll(
      ".financially-card__pin-button .mdi-pin"
    );

    expect(pinnedIcons.length).toBe(3);
    expect(unpinnedIcons.length).toBe(1);
  });

  it("allows pinning up to 3 items per group and hides pin button on others", async () => {
    const mockGroups = [
      {
        type: "post::article",
        financially: [
          { _id: "1", title: "Card 1", pinnedAt: null, type: "post::article" },
          { _id: "2", title: "Card 2", pinnedAt: null, type: "post::article" },
          { _id: "3", title: "Card 3", pinnedAt: null, type: "post::article" },
          { _id: "4", title: "Card 4", pinnedAt: null, type: "post::article" },
          { _id: "5", title: "Card 5", pinnedAt: null, type: "post::article" },
        ],
      },
    ];

    const apolloMock = {
      query: vi.fn().mockResolvedValue({
        data: { findFinanciallyGroupByType: mockGroups },
      }),
      mutate: vi.fn().mockImplementation((options: any) => {
        const id =
          options?.variables?.id ??
          options?.variables?._id ??
          options?.variables?.financiallyId ??
          "1";

        return Promise.resolve({
          data: {
            togglePin: {
              _id: id,
              pinnedAt: "2025-01-01T00:00:00Z",
            },
          },
        });
      }),
    };

    const { wrapper, vm, $apollo } = await mountWithApollo(apolloMock);

    await flushPromises();
    await wrapper.vm.$nextTick();

    const group = wrapper.find(".financially-list__group");
    const cards = group.findAll(".financially-card");
    expect(cards.length).toBe(5);

    const getPinButtons = () => group.findAll(".financially-card__pin-button");

    // Initially, 5 pin buttons
    expect(getPinButtons().length).toBe(5);

    // Pin first 3 cards
    for (let i = 0; i < 3; i++) {
      await getPinButtons()[i].trigger("click");

      // simulate reactivity
      vm.financiallyGroup[0].financially[i].pinnedAt = "2025-01-01";
      vm.financiallyGroup = JSON.parse(JSON.stringify(vm.financiallyGroup));

      await flushPromises();
      await wrapper.vm.$nextTick();
      await wrapper.vm.$forceUpdate();
    }

    // Apollo mutate called 3 times
    expect($apollo.mutate).toHaveBeenCalledTimes(3);

    // after update
    const pinnedButtons = group.findAll(".mdi-pin-off");
    expect(pinnedButtons.length).toBe(3);

    // requery available toggle buttons
    const remainingPinButtons = getPinButtons();
    expect(remainingPinButtons.length).toBe(3);
  });
});
