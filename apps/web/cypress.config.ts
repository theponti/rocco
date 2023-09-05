import { defineConfig } from "cypress";

export default defineConfig({
  fileServerFolder: "build",
  fixturesFolder: false,
  e2e: {
    // eslint-disable-next-line
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  projectId: process.env.CYPRESS_PROJECT_ID,
});