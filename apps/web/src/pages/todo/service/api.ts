import dayjs from 'dayjs';
import {
  Todo,
  SubTodo,
  TodoNode,
  SubTodoNode,
  GetTodoListParams,
} from './types';
import { get, post, put, remove } from '@/service/axios';
import { Message } from '@arco-design/web-react';

export default class TodoService {
  static async getTodoTree() {
    const todoList = await this.getTodoList();
    // 递归获取子待办
    const getSubTodoList = async (todo: Todo | SubTodo) => {
      const subTodoList = await this.getSubTodoList(todo.id);
      return subTodoList.map(async (t) => ({
        ...t,
        subTodoList: await getSubTodoList(t),
      }));
    };

    const todoTree = todoList.map(async (todo) => ({
      ...todo,
      subTodoList: await getSubTodoList(todo),
    }));

    return todoTree;
  }

  static async getTodoSubTodoIdList(todoId: string): Promise<string[]> {
    const todoList: Todo[] = JSON.parse(
      localStorage.getItem('todoList') || '[]'
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

  static async getTodoNode(todoId: string): Promise<TodoNode> {
    try {
      const res = await get<TodoNode>(`/todo/todo-with-sub/${todoId}`);
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getSubTodoList(todoId: string): Promise<SubTodo[]> {
    const todoList: SubTodo[] = JSON.parse(
      localStorage.getItem('todoList') || '[]'
    );
    return todoList.filter((todo) => todo.parentId === todoId);
  }

  static async batchDoneTodo(idList: string[]) {
    try {
      const res = await put<Todo[]>(`/todo/batch-done`, { idList });
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreTodo(id: string) {
    try {
      const res = await put(`/todo/restore/${id}`);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonTodo(id: string) {
    try {
      const res = await put(`/todo/abandon/${id}`);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async addTodo(todo: Omit<Todo, 'id' | 'status' | 'createdAt'>) {
    try {
      const res = await post('/todo/create', todo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async deleteTodo(id: string) {
    try {
      const res = await remove(`/todo/delete/${id}`);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async updateTodo(id: string, todo: Partial<Todo>) {
    try {
      const res = await put<Todo>(`/todo/update/${id}`, todo);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTodoList(params: GetTodoListParams = {}): Promise<Todo[]> {
    try {
      const res = await get<Todo[]>('/todo/list', params);
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getTodoPage(params: GetTodoListParams = {}): Promise<{
    records: Todo[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    try {
      const res = await get<{
        records: Todo[];
        total: number;
        pageNum: number;
        pageSize: number;
      }>('/todo/page', params);
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async addSubTodo(
    todoId: string,
    subTodo: Omit<SubTodo, 'id' | 'status' | 'createdAt' | 'parentId'>
  ) {
    try {
      const res = await post('/sub-todo/create', {
        ...subTodo,
        parentId: todoId,
      });
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async getSubTodoNode(todoId: string): Promise<TodoNode> {
    try {
      const res = await get<TodoNode>(`/sub-todo/sub-todo-with-sub/${todoId}`);
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async restoreSubTodo(id: string) {
    try {
      const res = await put(`/sub-todo/restore/${id}`);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

  static async abandonSubTodo(id: string) {
    try {
      const res = await put(`/sub-todo/abandon/${id}`);
      Message.success('操作成功');
      return res;
    } catch (error) {
      Message.error(error.message);
    }
  }

}
