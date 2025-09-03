import express from "express";
import qs from 'qs';
import todosRouter from "./routes/todos-routes.js"
import authRouter from "./routes/auth-routes.js"
import metricsRouter from "./routes/metrics-routes.js"
import { authenticate } from "./middleware/auth-middleware.js";
import { handleSyntaxErrors } from "./middleware/error-handlers.js";
import { healthz } from "./controllers/others-controller.js"

const app = express();
const apiStr = `/api/v1`;

// settings
app.use(express.json());
// Configure express to use qs parser
app.set('query parser', (str) => qs.parse(str, {
  allowDots: true,
  arrayLimit: 100,
  depth: 5
}));

// unprotected routes
app.get('/api/v1/healthz', healthz)
app.use(apiStr, metricsRouter);
app.use(apiStr, authRouter);

//protected routes
app.use(authenticate);
app.use(`${apiStr}/todos`, todosRouter);

//errors handling
app.use(handleSyntaxErrors);

export default app;
