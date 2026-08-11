/**
 * swagger.setup.js
 *
 * Mounts the Swagger UI onto the Express app.
 *
 * Environment:
 * development -> enabled
 * test        -> enabled
 * production  -> disabled by default
 *
 * Set SWAGGER_ENABLED=true to enable Swagger in production.
 */

import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger.js';

const isProd = process.env.NODE_ENV === 'production';
const isEnabled = process.env.SWAGGER_ENABLED === 'true';
const shouldMount = !isProd || isEnabled;

const DOCS_PATH = process.env.SWAGGER_PATH || '/api-docs';

export const setupSwagger = (app) => {
  if (!shouldMount) {
    console.log(
      '[Swagger] Docs are disabled in production. Set SWAGGER_ENABLED=true to enable.'
    );
    return;
  }

  const serveMiddleware = Array.isArray(swaggerUi.serve)
    ? swaggerUi.serve
    : [swaggerUi.serve];

  const uiOptions = {
    customSiteTitle: 'Agro project API Docs',

    customfavIcon:
      'https://www.openapis.org/wp-content/uploads/sites/3/2016/11/favicon.png',

    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      showExtensions: true,
      showCommonExtensions: true,
      operationsSorter: 'method',
      tagsSorter: 'alpha',
      displayOperationId: false,
    },
  };

  app.use(
    DOCS_PATH,
    ...serveMiddleware,
    swaggerUi.setup(swaggerDocument, uiOptions)
  );

  app.get(`${DOCS_PATH}.json`, (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json(swaggerDocument);
  });

  const env = process.env.NODE_ENV || 'development';
  const port = process.env.PORT || 5000;

  console.log(
    `[Swagger] Docs available at http://localhost:${port}${DOCS_PATH} [${env}]`
  );

  console.log(
    `[Swagger] JSON spec at http://localhost:${port}${DOCS_PATH}.json`
  );
};