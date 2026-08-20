import { BaseRepository } from '../db/base.repository.impl';
import { User } from './user.entity';
import { AppDataSource } from '../db/database.config';

type UserFilter = { username?: string; name?: string; keyword?: string };

export class UserService extends BaseRepository<User, UserFilter> {
  constructor() {
    super(AppDataSource.getRepository(User), () => this.repo.createQueryBuilder('user'));
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.repo.findOne({
      where: { username },
    });
  }

  async createUser(userData: { username: string; password: string; name?: string }): Promise<User> {
    return await this.create(Object.assign(new User(), userData));
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    await this.update(Object.assign(new User(), { id, password: newPassword }));
  }

  async isUsernameExists(username: string): Promise<boolean> {
    const count = await this.repo.count({
      where: { username },
    });
    return count > 0;
  }

  async list(filter?: { username?: string; name?: string; keyword?: string }): Promise<User[]> {
    if (!filter) {
      return await this.findByFilter({});
    }

    const queryBuilder = this.repo.createQueryBuilder('user');

    if (filter.username) {
      queryBuilder.andWhere('user.username LIKE :username', { username: `%${filter.username}%` });
    }

    if (filter.name) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${filter.name}%` });
    }

    if (filter.keyword) {
      queryBuilder.andWhere('(user.username LIKE :keyword OR user.name LIKE :keyword)', {
        keyword: `%${filter.keyword}%`,
      });
    }

    return await queryBuilder.orderBy('user.createdAt', 'DESC').getMany();
  }

  async findWithRelations(id: string): Promise<User> {
    return this.find(id);
  }

  async findByFilter(filter: UserFilter = {}): Promise<User[]> {
    return this.list(filter);
  }
}

export const userService = new UserService();
