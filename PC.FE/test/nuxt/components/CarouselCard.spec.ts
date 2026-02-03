// tests/unit/CarouselCard.methods.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { shallowMount, type VueWrapper } from "@vue/test-utils";
import CarouselCard, {
  type CarouselSlide,
} from "@/components/carousel-card/index.vue";

/**
 * Creates a deterministic set of slide objects for testing.
 */
const createSlides = (): CarouselSlide[] => [
  {
    image: "/img/slide-1.jpg",
    author: "Author 1",
    title: "Title 1",
    description: "Description 1",
    url: "/article-1",
    ctaText: "Leer más",
    type: "link",
  },
  {
    image: "/img/slide-2.jpg",
    author: "Author 2",
    title: "Title 2",
    description: "Description 2",
    url: "https://example.com/file.pdf",
    ctaText: "Descargar",
    type: "file",
  },
];

/**
 * Factory helper to mount the CarouselCard component with minimal boilerplate.
 */
const factory = (
  props: Partial<{ slides: CarouselSlide[]; height: number | string }> = {}
): VueWrapper<InstanceType<typeof CarouselCard>> =>
  shallowMount(CarouselCard, {
    props: {
      slides: createSlides(),
      height: 380,
      ...props,
    },
    global: {
      /**
       * Stub Vuetify components to avoid coupling tests
       * to the actual UI library implementation.
       */
      stubs: {
        "v-carousel": true,
        "v-carousel-item": true,
        "v-img": true,
        "v-btn": true,
      },
    },
  });

describe("CarouselCard (methods and computed properties)", () => {
  let wrapper: VueWrapper<InstanceType<typeof CarouselCard>>;

  beforeEach(() => {
    wrapper = factory();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.restoreAllMocks();
  });

  /**
   * Tests for hasSlides.
   */
  describe("hasSlides", () => {
    it("returns false when slides is an empty array", () => {
      const localWrapper = factory({ slides: [] });

      expect(localWrapper.vm.hasSlides).toBe(false);
    });

    it("returns true when slides array has elements", () => {
      expect(wrapper.vm.hasSlides).toBe(true);
    });

    it("returns false when slides is undefined", () => {
      const localWrapper = factory({
        slides: undefined as unknown as CarouselSlide[],
      });

      expect(localWrapper.vm.hasSlides).toBe(false);
    });
  });

  /**
   * Tests for normalizedHeight.
   */
  describe("normalizedHeight", () => {
    it("returns '<n>px' when height is a number", () => {
      const localWrapper = factory({ height: 420 });

      expect(localWrapper.vm.normalizedHeight).toBe("420px");
    });

    it("returns the string as-is when height is a string", () => {
      const localWrapper = factory({ height: "50vh" });

      expect(localWrapper.vm.normalizedHeight).toBe("50vh");
    });
  });

  /**
   * Tests for next().
   */
  describe("next", () => {
    it("moves to the next index when slides exist", () => {
      // Default model is 0
      expect(wrapper.vm.model).toBe(0);

      wrapper.vm.next();

      expect(wrapper.vm.model).toBe(1);
    });

    it("wraps back to 0 when called on the last index", () => {
      wrapper.vm.model = createSlides().length - 1;

      wrapper.vm.next();

      expect(wrapper.vm.model).toBe(0);
    });

    it("does nothing when there are no slides", () => {
      const localWrapper = factory({ slides: [] });

      expect(localWrapper.vm.model).toBe(0);

      localWrapper.vm.next();

      expect(localWrapper.vm.model).toBe(0);
    });
  });

  /**
   * Tests for prev().
   */
  describe("prev", () => {
    it("moves to the previous index when slides exist", () => {
      wrapper.vm.model = 1;

      wrapper.vm.prev();

      expect(wrapper.vm.model).toBe(0);
    });

    it("wraps to the last index when called on index 0", () => {
      const slides = createSlides();
      const lastIndex = slides.length - 1;

      wrapper.vm.model = 0;

      wrapper.vm.prev();

      expect(wrapper.vm.model).toBe(lastIndex);
    });

    it("does nothing when there are no slides", () => {
      const localWrapper = factory({ slides: [] });

      expect(localWrapper.vm.model).toBe(0);

      localWrapper.vm.prev();

      expect(localWrapper.vm.model).toBe(0);
    });
  });

  /**
   * Tests for goToLink().
   */
  describe("goToLink", () => {
    it("calls window.open with the provided URL and '_blank' target", () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      const link = "https://example.com/test";

      wrapper.vm.goToLink(link);

      expect(openSpy).toHaveBeenCalledTimes(1);
      expect(openSpy).toHaveBeenCalledWith(link, "_blank");
    });

    it("does not throw when called with an empty string", () => {
      const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

      expect(() => wrapper.vm.goToLink("")).not.toThrow();
      expect(openSpy).toHaveBeenCalledWith("", "_blank");
    });
  });
});
