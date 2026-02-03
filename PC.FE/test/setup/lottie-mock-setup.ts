import { vi } from "vitest";

vi.mock("vue3-lottie", () => ({
  Vue3Lottie: {
    name: "Vue3Lottie",
    render: () => null,
  },
}));
