import type { CarouselSlide } from "./index.vue";

export function hasSlides(slides: CarouselSlide[] | undefined | null): boolean {
  return Array.isArray(slides) && slides.length > 0;
}

export function normalizeHeight(height: number | string): string {
  if (height === null || height === undefined) {
    throw new Error("Height must be a number or string");
  }
  if (typeof height !== "number" && typeof height !== "string") {
    throw new Error("Height must be a number or string");
  }
  return typeof height === "number" ? `${height}px` : height;
}

export function nextIndex(current: number, slides: CarouselSlide[]): number {
  if (current < 0) {
    throw new Error("Current index cannot be negative");
  }

  if (!hasSlides(slides)) {
    return current;
  }

  if (current >= slides.length) {
    throw new Error("Current index is out of bounds");
  }

  return (current + 1) % slides.length;
}

export function prevIndex(current: number, slides: CarouselSlide[]): number {
  if (current < 0) {
    throw new Error("Current index cannot be negative");
  }

  if (!hasSlides(slides)) {
    return current;
  }

  if (current >= slides.length) {
    throw new Error("Current index is out of bounds");
  }

  return (current - 1 + slides.length) % slides.length;
}
