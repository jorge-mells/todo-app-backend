import { getAllTodos, getTodosByStatus, getTodosByTags, getTodosByTagsOrStatus, createTodo, updateTodo } from "../data/todo-repository.js";
import { HttpError } from "../utils/error-utils.js";
import { makeArray, isValidStatus } from "../utils/helpers.js";

function areValidStatuses(statuses) {
  for (let status of statuses) {
    if (!isValidStatus(status)) return false;
  }
  return true;
}

export async function filterTodos(id, statuses, tags) {
  statuses = makeArray(statuses).map(status => status.toUpperCase());
  if (!areValidStatuses(statuses)) {
    throw new HttpError('invalid statuses', 400);
  }
  tags = makeArray(tags);
  let statusesExist = statuses.length > 0;
  let tagsExist = tags.length > 0;
  if (statusesExist && tagsExist) {
    return await getTodosByTagsOrStatus(id, statuses, tags);
  } else if (statusesExist) {
    return await getTodosByStatus(id, statuses);
  } else if (tagsExist) {
    return await getTodosByTags(id, tags);
  } else {
    return await getAllTodos(id);
  }
}

export async function validateTodoArgsAndCreateTodo(req) {
  let { title, content, status, tags } = req.body;
  if (!title) {
    throw new HttpError('please add a title', 400);
  } else if (!content) {
    throw new HttpError('please add some content', 400);
  }
  status = status || '';
  if (!isValidStatus(status)) {
    status = 'PENDING';
  }
  return await createTodo({ userId: req.user.id, title, content, status, tags: makeArray(tags) });
}

export async function validateTodoArgsAndUpdateTodo(req) {
  let { title, content, status, tags } = req.body;
  let id = parseInt(req.params.id, 10);
  if (!title) {
    title = undefined;
  } else if (!content) {
    content = undefined;
  }
  status = status || '';
  if (!isValidStatus(status)) {
    status = undefined
  }
  tags = makeArray(tags);
  return await updateTodo(req.user.id, id, { title, content, status, tags });
}
