import express from 'express';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * @import { Request, Response } from 'express'
 */

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __projectRoot = path.resolve(__dirname, '../..');

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__projectRoot, 'docs/openapi.yaml'));

// Swagger UI options
const swaggerOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0; }
  `,
  customSiteTitle: "TODO API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
};

// Serve API documentation
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

/**
 * Validate and authenticate the user.
 * @param {Request} _req - Express request object.
 * @param {Response} res - Express response object.
 */
// Serve the raw OpenAPI spec as JSON
router.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

/**
 * Validate and authenticate the user.
 * @param {Request} _req - Express request object.
 * @param {Response} res - Express response object.
 */
// Serve the raw OpenAPI spec as YAML
router.get('/api-docs.yaml', (_req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.sendFile(path.join(__dirname, 'docs/openapi.yaml'));
});

export default router;
