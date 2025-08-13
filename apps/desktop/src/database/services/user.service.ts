import { Repository } from "typeorm";
import { BaseService } from "./base.service";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../database.config";

export class UserService extends BaseService<User> {
  constructor() {
    super(AppDataSource.getRepository(User));
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { username },
    });
  }

  async createUser(userData: {
    username: string;
    password: string;
    name?: string;
  }): Promise<User> {
    return await this.create(userData);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.update(id, { password: newPassword });
  }

  async isUsernameExists(username: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { username },
    });
    return count > 0;
  }

  async page(pageNum: number, pageSize: number): Promise<{
    data: User[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const [data, total] = await this.repository.findAndCount({
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      pageNum,
      pageSize,
    };
  }

  async list(): Promise<User[]> {
    return await this.findAll();
  }
}

export const userService = new UserService();