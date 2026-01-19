import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

export default defineConfig({
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/{e2e,unit}/**/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      await defineVitestProject({
        test: {
          name: "components",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "nuxt",
          setupFiles: ["./test/setup/vuetify-test-setup.ts"],
        },
      }),
      await defineVitestProject({
        test: {
          name: "e2e",
          include: ["test/e2e/**/*.{test,spec}.ts"],
          environment: "nuxt",
          setupFiles: [
            "./test/setup/vuetify-test-setup.ts",
            "./test/setup/lottie-mock-setup.ts",
            "./test/setup/global-hooks-setup.ts",
          ],
          testTimeout: 30000,
        },
      }),
    ],
  },
});
