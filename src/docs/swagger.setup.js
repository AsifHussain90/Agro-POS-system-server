/**
 * swagger.setup.js
 *
 * Mounts the Swagger UI onto the Express app.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  Environment   │  Docs exposed?  │  URL                 │
 * ├─────────────────────────────────────────────────────────┤
 * │  development   │  Yes            │  /api-docs           │
 * │  test          │  Yes            │  /api-docs           │
 * │  production    │  No (default)   │  —                   │
 * │  production +  │  Yes            │  /api-docs           │
 * │  SWAGGER_ENABLED=true            │                      │
 * └─────────────────────────────────────────────────────────┘
 *
 * To expose docs in production (e.g. behind an internal VPN):
 *   Set SWAGGER_ENABLED=true in your environment.
 *
 * The docs path is configurable via SWAGGER_PATH (default: /api-docs).
 */

import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger.js";

const isProd      = process.env.NODE_ENV === "production";
const isEnabled   = process.env.SWAGGER_ENABLED === "true";
const shouldMount = !isProd || isEnabled;

const DOCS_PATH = process.env.SWAGGER_PATH || "/api-docs";

export const setupSwagger = (app) => {
  if (!shouldMount) {
    console.log("[Swagger] Docs are disabled in production. Set SWAGGER_ENABLED=true to enable.");
    return;
  }

  // Express 5 compat: swaggerUi.serve may be an array
  const serveMiddleware = Array.isArray(swaggerUi.serve)
    ? swaggerUi.serve
    : [swaggerUi.serve];

  const uiOptions = {
    // ── Branding ─────────────────────────────────────────────────────────
    customSiteTitle: "Agro project API Docs",
    customfavIcon:   "https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png",

    // ── UX ───────────────────────────────────────────────────────────────
    swaggerOptions: {
      // Persist the Bearer token across page refreshes
      persistAuthorization:  true,
      // Allow cookie-based auth in the browser
      withCredentials:       true,
      // Show how long each request took
      displayRequestDuration: true,
      // Collapse all operations by default (cleaner first look)
      docExpansion:          "list",
      // Enable the filter bar so users can search operations
      filter:                true,
      // Open "Try it out" by default so users can test immediately
      tryItOutEnabled:       true,
      // Show response status codes in the sidebar
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth:  2,
      // Show example request/response by default
      showExtensions:        true,
      showCommonExtensions:  true,
      // Sort operations by HTTP method
      operationsSorter:      "method",
      // Sort tags alphabetically
      tagsSorter:            "alpha",
      // Show the "Authorize" button on the top bar
      displayOperationId:    false,
    },
  };

  app.use(DOCS_PATH, ...serveMiddleware, swaggerUi.setup(swaggerDocument, uiOptions));

  // JSON spec endpoint — useful for code generators (e.g. openapi-generator, Postman import)
  app.get(`${DOCS_PATH}.json`, (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(swaggerDocument);
  });

  const env = process.env.NODE_ENV || "development";
  const port = process.env.PORT || 5000;
  console.log(`[Swagger] Docs available at http://localhost:${port}${DOCS_PATH}  [${env}]`);
  console.log(`[Swagger] JSON spec at      http://localhost:${port}${DOCS_PATH}.json`);
};
