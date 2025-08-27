import express from "express";
import { createTodoQuery, deleteTodoQuery, filterTodosQuery, singleTodoQuery, updateTodoQuery } from "../controllers/todos-controller.js";

const router = express.Router();

router.get('/', filterTodosQuery);

router.get(/\/(?<id>\d+)$/, singleTodoQuery);

router.post('/', createTodoQuery);

router.delete(/\/(?<id>\d+)$/, deleteTodoQuery);

router.patch(/\/(?<id>\d+)$/, updateTodoQuery);

export default router;
