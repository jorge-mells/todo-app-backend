import express from "express";
import todosRouter from "./routes/todos-routes.js"
import authRouter from "./routes/auth-routes.js"
import metricsRouter from "./routes/metrics-routes.js"
import docsRouter from "./routes/docs-routes.js"
import { authenticate } from "./middleware/auth-middleware.js";
import { handleSyntaxErrors } from "./middleware/error-handlers.js";
import { healthz } from "./controllers/others-controller.js"
import { parserHelper } from "./utils/helpers.js";

const app = express();
const apiStr = `/api/v1`;

// settings
app.use(express.json());
// Configure express to use qs parser
app.set('query parser', parserHelper);

// unprotected routes
app.get('/api/v1/healthz', healthz)
app.use(apiStr, docsRouter);
app.use(apiStr, metricsRouter);
app.use(apiStr, authRouter);

//protected routes
app.use(authenticate);
app.use(`${apiStr}/todos`, todosRouter);

//errors handling
app.use(handleSyntaxErrors);

export default app;
