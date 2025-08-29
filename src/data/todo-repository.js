import db from "./db.js";

/**
 * Returns a todo for a user.
 * @param {number} user_id - The id of the user.
 * @param {number} todo_id - The id of the todo.
 */
export async function getTodo(user_id, todo_id) {
  const todo = await db.todo.findUnique({
    where: {
      id: todo_id,
      user: {
        id: user_id,
      }
    },
    include: {
      tags: {
        select: {
          tag: true,
        },
      },
    },
  });
  return todo;
}

/**
 * Returns todos based on user ID and optional filters.
 * @param {object} options - The query options.
 * @param {number} options.id - The user's ID.
 * @param {Array<string>} [options.status] - An optional list of statuses to filter by.
 * @param {Array<string>} [options.tag] - An optional list of tags to filter by.
 */
export async function getTodos({ id, status = [], tag = [] }) {
  const whereClause = {
    user: {
      id,
    },
  };

  if (status.length > 0) {
    whereClause.status = {
      in: status,
    };
  }

  if (tag.length > 0) {
    whereClause.tags = {
      some: {
        tag: {
          name: {
            in: tag,
          },
        },
      },
    };
  }

  const todos = await db.todo.findMany({
    where: whereClause,
    include: {
      tags: {
        select: {
          tag: true,
        },
      },
    },
  });

  return todos;
}

/**
 * Returns a newly created todo which has been stored in the database.
 * @param {object} options - The query options.
 * @param {number} options.userId - The user's ID.
 * @param {string} options.title - The title of the todo.
 * @param {string} options.content - The content of the todo.
 * @param {'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED'} [options.status] - The status for the todo.
 * @param {Array<string>} [options.tags] - An optional list of tags to filter by.
 */
export async function createTodo({ userId, title, content, status, tags }) {
  return await db.$transaction(async (tx) => {
    // Upsert tags
    const upsertedTags = await Promise.all(tags.map(name =>
      tx.tag.upsert({
        where: { name },
        update: { name },
        create: { name },
      })
    ));

    // Create the todo itself
    const newTodo = await tx.todo.create({
      data: {
        user: { connect: { id: userId } },
        title,
        content,
        status,
      },
    });

    // Safely create join table entries
    await Promise.all(upsertedTags.map(tag =>
      tx.tagsOnTodos.create({
        data: {
          todoId: newTodo.id,
          tagId: tag.id,
        }
      })
    ));

    // Return the todo including its tags
    const todoWithTags = await tx.todo.findUnique({
      where: { id: newTodo.id },
      include: {
        tags: { select: { tag: true } },
      },
    });

    return todoWithTags;
  });
}

/**
 * Deletes a todo and returns the deleted todo for a user.
 * @param {number} user_id - The id of the user.
 * @param {number} todo_id - The id of the todo.
 */
export async function deleteTodo(user_id, todo_id) {
  const deletedTodo = await db.todo.delete({
    where: {
      user: {
        id: user_id,
      },
      id: todo_id,
    },
    include: {
      tags: {
        select: {
          tag: true,
        },
      },
    },
  });
  return deletedTodo;
}

/**
 * Returns the updated todo which has been stored in the database.
 * @param {number} userId - The user's ID.
 * @param {number} todo_id - The todo's ID.
 * @param {object} options - The query options.
 * @param {string} options.title - The title of the todo.
 * @param {string} options.content - The content of the todo.
 * @param {'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'CANCELLED'} [options.status] - The status for the todo.
 * @param {Array<string>} [options.tags] - An optional list of tags to filter by.
 */
export async function updateTodo(userId, todo_id, { title, content, status, tags }) {
  return await db.$transaction(async (tx) => {
    const upsertedTags = await Promise.all(tags.map(name => 
      tx.tag.upsert({
        where: { name },
        update: { name },
        create: { name },
      })
    ));

    await Promise.all(upsertedTags.map(tag =>
      tx.tagsOnTodos.upsert({
        where: { todoId_tagId: { todoId: todo_id, tagId: tag.id }},
        update: {},
        create: { todoId: todo_id, tagId: tag.id }
      })
    ));

    const updatedTodo = await tx.todo.update({
      where: { id: todo_id, userId },
      data: { title, content, status },
      include: { tags: { select: { tag: true } } },
      rejectOnNotFound: true,
    });
    return updatedTodo;
  });
}
