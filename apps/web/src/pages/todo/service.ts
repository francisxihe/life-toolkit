import { Message } from '@arco-design/web-react';
import TodoController from '@life-toolkit/api/controller/todo/todo';
import SubTodoController from '@life-toolkit/api/controller/todo/sub-todo';
import {
  TodoVO,
  CreateTodoVO,
  TodoPageVO,
  TodoListVO,
  TodoWithSubVO,
  TodoPageFiltersVO,
  TodoListFiltersVO,
} from '@life-toolkit/vo/todo/todo';
import {
  SubTodoVO,
  CreateSubTodoVO,
  SubTodoWithSubVO,
} from '@life-toolkit/vo/todo/sub-todo';

export default class TodoService {
  static async getTodoTree() {
    const todoList = (await this.getTodoList()).list;
    // 递归获取子待办
    // const getSubTodoList = async (todo: TodoVO) => {
    //   const subTodoList = await this.getSubTodoList(todo.id);
    //   return subTodoList.map(async (t) => ({
    //     ...t,
    //     subTodoList: await getSubTodoList(t),
    //   }));
    // };

    const todoTree = todoList.map(async (todo) => ({
      ...todo,
      // subTodoList: await getSubTodoList(todo),
    }));

    return todoTree;
  }

  static async getTodoSubTodoIdList(todoId: string): Promise<string[]> {
    const todoList: TodoVO[] = JSON.parse(
      localStorage.getItem('todoList') || '[]',
    );
    const todo = todoList.find((todo) => todo.id === todoId);
    if (!todo) {
      throw new Error('Todo not found');
    }

    const todoSubTodoIdList: string[] = [];

    const recursiveSub = async (todoId: string) => {
      (await this.getSubTodoList(todoId)).forEach((t) => {
        if (t.status === 'todo') {
          todoSubTodoIdList.push(t.id);
        }
        recursiveSub(t.id);
      });
    };

    await recursiveSub(todoId);

    return todoSubTodoIdList;
  }

  static async getTodoNode(todoId: string) {
    try {
      return TodoController.getTodoWithSub(todoId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getSubTodoList(todoId: string) {
    const todoList: SubTodoVO[] = JSON.parse(
      localStorage.getItem('todoList') || '[]',
    );
    return todoList.filter((todo) => todo.parentId === todoId);
  }

  static async batchDoneTodo(idList: string[]) {
    try {
      const res = TodoController.batchDoneTodo(idList);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreTodo(id: string) {
    try {
      const res = TodoController.restoreTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonTodo(id: string) {
    try {
      const res = TodoController.abandonTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async addTodo(todo: CreateTodoVO) {
    try {
      const res = TodoController.addTodo(todo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async deleteTodo(id: string) {
    try {
      const res = await TodoController.deleteTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async updateTodo(id: string, todo: Partial<CreateTodoVO>) {
    try {
      const res = TodoController.updateTodo(id, todo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTodoList(params: TodoListFiltersVO = {}) {
    try {
      return TodoController.getTodoList(params);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTodoPage(params: TodoPageFiltersVO = {}) {
    try {
      return TodoController.getTodoPage(params);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async addSubTodo(todoId: string, subTodo: CreateSubTodoVO) {
    try {
      const res = SubTodoController.addSubTodo(subTodo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getSubTodoNode(todoId: string) {
    try {
      return SubTodoController.getSubTodoWithSub(todoId);
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreSubTodo(id: string) {
    try {
      const res = SubTodoController.restoreSubTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonSubTodo(id: string) {
    try {
      const res = SubTodoController.abandonSubTodo(id);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }
}
