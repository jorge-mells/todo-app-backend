import express from "express";
import todosRouter from "./routes/todos-routes.js"
import authRouter from "./routes/auth-routes.js"
import metricsRouter from "./routes/metrics-routes.js"
import { authenticate } from "./middleware/auth-middleware.js";
import { handleSyntaxErrors } from "./middleware/error-handlers.js";

const app = express();
const apiStr = `/api/v1`;

// settings
app.use(express.json());

// unprotected routes
app.use(apiStr, metricsRouter);
app.use(apiStr, authRouter);

//protected routes
app.use(authenticate);
app.use(`${apiStr}/todos`, todosRouter);

//errors handling
app.use(handleSyntaxErrors);

export default app;
