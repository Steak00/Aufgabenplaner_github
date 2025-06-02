const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:80", // Adjust to your backend/frontend app
    specPattern: "cypress/e2e/**/*.cy.js", // Where test files are located
    supportFile: false, // Optional, unless you want support
  },
});
