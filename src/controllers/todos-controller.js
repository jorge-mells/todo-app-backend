import validator from 'validator';
import { createTodo, deleteTodo, getTodo, getTodos, updateTodo } from "../data/todo-repository.js";
import logger from "../utils/logger.js";
import { errorHandler } from "../utils/error-utils.js";
import { validate, filterParamsSchema, todoSchema } from '../utils/validators.js';

/**
 * @import { Request, Response } from 'express'
 */

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const singleTodoQuery = async (req, res) => {
  const reqAttempt = {
    ip: validator.escape(req.ip || 'Unknown'),
    userAgent: validator.escape(req.get('user-agent') || 'Unknown'),
  }
  try {
    // NOTE: if the code here gets too complex, extract some of it to todos-service and use the requestHandler to simplify
    // code here
    const { id: user_id } = req.user;
    const todo_id = parseInt(req.params.id, 10);
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

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const filterTodosQuery = async (req, res) => {
  const reqAttempt = {
    ip: validator.escape(req.ip || 'Unknown'),
    userAgent: validator.escape(req.get('user-agent') || 'Unknown'),
  }
  try {
    const { id } = req.user;
    let { status, tag } = validate(filterParamsSchema, req.query); 
    const todos = await getTodos({id, status, tag});
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

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const createTodoQuery = async (req, res) => {
  const reqAttempt = {
    id: req.user,
    ip: validator.escape(req.ip || 'Unknown'),
    userAgent: validator.escape(req.get('user-agent') || 'Unknown'),
  }
  try {
    let todoParams = validate(todoSchema, req.body);
    const todo = await createTodo({ ...todoParams, userId: req.user.id });
    logger.info('todo creation: successful', reqAttempt);
    return res.status(200).json({
      message: 'todo creation: successful',
      todo,
    })
  } catch (err) {
    return errorHandler(req, res, err, 'todo creation');
  }
}

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const deleteTodoQuery = async (req, res) => {
  const reqAttempt = {
    ip: validator.escape(req.ip || 'Unknown'),
    userAgent: validator.escape(req.get('user-agent') || 'Unknown'),
  }
  try {
    // NOTE: if the code here gets too complex, extract some of it to todos-service and use the requestHandler to simplify
    // code here
    let { id: user_id } = req.user;
    const todo_id = parseInt(req.params.id, 10);
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

/**
 * Validate and authenticate the user.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 */
export const updateTodoQuery = async (req, res) => {
  const reqAttempt = {
    id: req.user,
    ip: req.ip || 'Unknown',
    userAgent: req.get('user-agent') || 'Unknown',
  }
  try {
    const todoParams = validate(todoSchema, req.body);
    const todo_id = parseInt(req.params.id, 10);
    const todo = await updateTodo(req.user.id, todo_id, todoParams);
    logger.info('todo creation: successful', reqAttempt);
    return res.status(200).json({
      message: 'todo update: successful',
      todo,
    })
  } catch (err) {
    return errorHandler(req, res, err, 'todo creation');
  }
}
