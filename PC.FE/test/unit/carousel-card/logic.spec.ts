// test/unit/carousel-card/logic.spec.ts
import { describe, it, expect } from "vitest";
import {
  hasSlides,
  normalizeHeight,
  nextIndex,
  prevIndex,
} from "../../../components/carousel-card/logic";
import type { CarouselSlide } from "~/components/carousel-card/index.vue";

/**
 * Creates an array of mock slides with the given length.
 * Only the array length is relevant for these tests.
 */
const createSlides = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => ({ id: i + 1 } as unknown as CarouselSlide)
  );

describe("carousel-card logic helpers", () => {
  /**
   * Tests for hasSlides.
   */
  describe("hasSlides", () => {
    it("returns false when slides is undefined", () => {
      expect(hasSlides(undefined as any)).toBe(false);
    });

    it("returns false when slides is null", () => {
      expect(hasSlides(null as any)).toBe(false);
    });

    it("returns false when slides is an empty array", () => {
      expect(hasSlides([])).toBe(false);
    });

    it("returns true when slides has at least one element", () => {
      const slides = createSlides(1);
      expect(hasSlides(slides)).toBe(true);
    });

    it("returns true when slides has multiple elements", () => {
      const slides = createSlides(3);
      expect(hasSlides(slides)).toBe(true);
    });

    it("returns false when slides is not an array", () => {
      expect(hasSlides({} as any)).toBe(false);
      expect(hasSlides(123 as any)).toBe(false);
      expect(hasSlides("not-an-array" as any)).toBe(false);
    });
  });

  /**
   * Tests for normalizeHeight.
   */
  describe("normalizeHeight", () => {
    it("returns '<n>px' when height is a number", () => {
      expect(normalizeHeight(380)).toBe("380px");
      expect(normalizeHeight(0)).toBe("0px");
      expect(normalizeHeight(420)).toBe("420px");
    });

    it("returns the same string when height is already a string", () => {
      expect(normalizeHeight("50vh")).toBe("50vh");
      expect(normalizeHeight("100%")).toBe("100%");
      expect(normalizeHeight("380px")).toBe("380px");
    });

    it("throws when height is null or undefined", () => {
      expect(() => normalizeHeight(null as any)).toThrowError(
        "Height must be a number or string"
      );
      expect(() => normalizeHeight(undefined as any)).toThrowError(
        "Height must be a number or string"
      );
    });

    it("throws when height is not a number or string", () => {
      expect(() => normalizeHeight({} as any)).toThrowError(
        "Height must be a number or string"
      );
      expect(() => normalizeHeight([] as any)).toThrowError(
        "Height must be a number or string"
      );
      expect(() => normalizeHeight(true as any)).toThrowError(
        "Height must be a number or string"
      );
    });
  });

  /**
   * Tests for nextIndex.
   */
  describe("nextIndex", () => {
    it("advances to the next index when slides exist", () => {
      const slides = createSlides(3);

      expect(nextIndex(0, slides)).toBe(1);
      expect(nextIndex(1, slides)).toBe(2);
    });

    it("wraps around to 0 when called on the last index", () => {
      const slides = createSlides(3);

      expect(nextIndex(2, slides)).toBe(0);
    });

    it("returns the same index when there are no slides", () => {
      const slides: any[] = [];

      expect(nextIndex(0, slides as any)).toBe(0);
      expect(nextIndex(5, slides as any)).toBe(5);
    });

    it("throws when current index is negative", () => {
      const slides = createSlides(3);

      expect(() => nextIndex(-1, slides)).toThrowError(
        "Current index cannot be negative"
      );
    });

    it("throws when current index is out of bounds", () => {
      const slides = createSlides(3);

      expect(() => nextIndex(3, slides)).toThrowError(
        "Current index is out of bounds"
      );
      expect(() => nextIndex(10, slides)).toThrowError(
        "Current index is out of bounds"
      );
    });
  });

  /**
   * Tests for prevIndex.
   */
  describe("prevIndex", () => {
    it("moves to the previous index when slides exist", () => {
      const slides = createSlides(3);

      expect(prevIndex(2, slides)).toBe(1);
      expect(prevIndex(1, slides)).toBe(0);
    });

    it("wraps to the last index when called on 0", () => {
      const slides = createSlides(3);

      expect(prevIndex(0, slides)).toBe(2);
    });

    it("returns the same index when there are no slides", () => {
      const slides: any[] = [];

      expect(prevIndex(0, slides)).toBe(0);
      expect(prevIndex(3, slides)).toBe(3);
    });

    it("throws when current index is negative", () => {
      const slides = createSlides(3);

      expect(() => prevIndex(-1, slides)).toThrowError(
        "Current index cannot be negative"
      );
    });

    it("throws when current index is out of bounds", () => {
      const slides = createSlides(3);

      expect(() => prevIndex(3, slides)).toThrowError(
        "Current index is out of bounds"
      );
      expect(() => prevIndex(10, slides)).toThrowError(
        "Current index is out of bounds"
      );
    });
  });
});
