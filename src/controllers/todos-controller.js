import { deleteTodo, getTodo } from "../data/todo-repository.js";
import logger from "../utils/logger.js";
import { errorHandler, HttpError } from "../utils/error-utils.js";
import { filterTodos, validateTodoArgsAndCreateTodo, validateTodoArgsAndUpdateTodo } from "../services/todos-service.js";

export const singleTodoQuery = async (req, res) => {
  const reqAttempt = {
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  }
  const { id: user_id } = req.user;
  const todo_id = parseInt(req.params.id, 10);
  try {
    // NOTE: if the code here gets too complex, extract some of it to todos-service and use the requestHandler to simplify
    // code here
    const todo = await getTodo(user_id, todo_id);
    reqAttempt.id = user_id;
    logger.info(`todo get query: successful`);
    return res.status(200).json({
      todo,
			message: `todo get query: successful`,
    })
  } catch (err) {
    return errorHandler(req, res, err, `todo ${todo_id} query`);
  }
};

export const filterTodosQuery = async (req, res) => {
  const reqAttempt = {
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  }
  const { id } = req.user;
	let { status: statuses, tag: tags } = req.query; 
	try {
    const todos = await filterTodos(id, statuses, tags);
    reqAttempt.id = id;
    logger.info('todos get query: successful', reqAttempt);
    return res.status(200).json({
      todos,
			message: 'todos get query: successful',
    });
  } catch (err) {
    return errorHandler(req, res, err, 'todo query');
  }
}

export const createTodoQuery = async (req, res) => {
  const reqAttempt = {
    id: req.user,
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  }
  try {
    const todo = await validateTodoArgsAndCreateTodo(req);
    logger.info('todo creation: successful', reqAttempt);
    return res.status(200).json({
      message: 'todo creation: successful',
			todo,
    })
  } catch (err) {
    return errorHandler(req, res, err, 'todo creation');
  }
}

export const deleteTodoQuery = async (req, res) => {
  const reqAttempt = {
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  }
  let { id: user_id } = req.user;
  const todo_id = parseInt(req.params.id, 10);
  try {
    // NOTE: if the code here gets too complex, extract some of it to todos-service and use the requestHandler to simplify
    // code here
    await deleteTodo(user_id, todo_id);
    reqAttempt.id = user_id;
    logger.info(`todo query deletion: successful`);
    return res.status(200).json({
			message: `todo query deletion: successful`,
    })
  } catch (err) {
		if (err?.code === 'P2025') {
			return res.status(200).json({
				message: 'todo query deletion: successful',
			})
		}
    return errorHandler(req, res, err, `todo ${todo_id} query deletion`);
  }
};

export const updateTodoQuery = async (req, res) => {
  const reqAttempt = {
    id: req.user,
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  }
  try {
    const todo = await validateTodoArgsAndUpdateTodo(req);
    logger.info('todo creation: successful', reqAttempt);
    return res.status(200).json({
      message: 'todo update: successful',
			todo,
    })
  } catch (err) {
    return errorHandler(req, res, err, 'todo creation');
  }
}
