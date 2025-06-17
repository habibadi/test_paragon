const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://recruitment-staging.queenbee.paradev.io',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
