import db from "./db.js";

export async function getAllTodos(user_id) {
  const todos = await db.todo.findMany({
    where: {
      user: {
        id: user_id,
      }
    }
  });
  return todos;
}

export async function getTodo(user_id, todo_id) {
  const todo = await db.todo.findUnique({
    where: {
      id: todo_id,
      user: {
        id: user_id,
      }
    }
  });
  return todo;
}

export async function getTodosByTags(user_id, tags) {
  const todos = await db.todo.findMany({
    where: {
      tags: {
        some: {
          tag: {
            name: {
              in: tags,
            }
          }
        }
      },
      user: {
        id : user_id,
      }
    }
  });
  return todos;
}

export async function getTodosByStatus(user_id, statuses) {
  const todos = await db.todo.findMany({
    where: {
      status: {
        in: statuses,
      },
      user: {
        id : user_id,
      }
    }
  });
  return todos;
}

export async function getTodosByTagsOrStatus(user_id, statuses, tags) {
  const todos = await db.todo.findMany({
    where: {
      status: {
        in: statuses,
      },
      tags: {
        some: {
          tag: {
            name: {
              in: tags,
            }
          }
        }
      },
      user: {
        id : user_id,
      }
    }
  });
  return todos;
}

export async function createTodo({ userId, title, content, status, tags }) {
  return await db.$transaction(async (tx) => {
    const upsertedTags = await Promise.all(tags.map(name => 
      tx.tag.upsert({
        where: { name },
        update: { name },
        create: { name },
      })
    ));

    const tagIds = upsertedTags.map(tag => ({
      tag: {
        connect: { id: tag.id }
      }
    }));

    const newTodo = tx.todo.create({
      data: {
        user: {
          connect: { id: userId },
        },
        title,
        content,
        status,
        tags: {
          create: tagIds,
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
    return newTodo;
  });
}

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

// NOTE: there's serious code duplication here. You can extract part of the transaction into a method
// since both updateTodo and createTodo use the same thing
export async function updateTodo(userId, todo_id, { title, content, status, tags }) {
  return await db.$transaction(async (tx) => {
    const upsertedTags = await Promise.all(tags.map(name => 
      tx.tag.upsert({
        where: { name },
        update: { name },
        create: { name },
      })
    ));

    const tagIds = upsertedTags.map(tag => ({
      tag: {
        connect: { id: tag.id },
      }
    }));

    const updatedTodo = await tx.todo.update({
      where: {
        userId: userId,
        id: todo_id,
      },
      data: {
        title,
        content,
        status,
        tags: {
          create: tagIds,
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
    return updatedTodo;
  });
}
