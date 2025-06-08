import { CreateUserDto } from '../../../../src/business/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../../src/business/users/dto/update-user.dto';
import { User } from '../../../../src/business/users/entities/user.entity';

/**
 * 用户测试数据工厂
 */
export class UserTestFactory {
  /**
   * 创建基础用户DTO
   */
  static createBasicUserDto(overrides?: Partial<CreateUserDto>): CreateUserDto {
    return {
      username: 'testuser',
      password: 'password123',
      name: '测试用户',
      ...overrides,
    };
  }

  /**
   * 创建用户实体
   */
  static createUserEntity(overrides?: Partial<User>): User {
    return {
      id: 'user-1',
      username: 'testuser',
      password: 'password123',
      name: '测试用户',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      ...overrides,
    };
  }

  /**
   * 创建更新用户DTO
   */
  static createUpdateUserDto(overrides?: Partial<UpdateUserDto>): UpdateUserDto {
    return {
      id: 'user-1',
      name: '更新后的用户名',
      ...overrides,
    };
  }

  /**
   * 创建多个用户
   */
  static createMultipleUsers(count: number): User[] {
    return Array.from({ length: count }, (_, index) =>
      this.createUserEntity({
        id: `user-${index + 1}`,
        username: `user${index + 1}`,
        name: `用户${index + 1}`,
      })
    );
  }

  /**
   * 创建用户列表用于测试
   */
  static createUserList(): User[] {
    return [
      this.createUserEntity({
        id: 'user-1',
        username: 'admin',
        name: '管理员',
      }),
      this.createUserEntity({
        id: 'user-2',
        username: 'user1',
        name: '普通用户1',
      }),
      this.createUserEntity({
        id: 'user-3',
        username: 'user2',
        name: '普通用户2',
      }),
    ];
  }

  /**
   * 创建无效的用户数据
   */
  static createInvalidUserDto(): Partial<CreateUserDto> {
    return {
      username: '', // 无效的用户名
      password: '', // 无效的密码
    };
  }

  /**
   * 创建边界值测试数据
   */
  static createBoundaryTestData() {
    return {
      minLength: this.createBasicUserDto({
        username: 'a',
        password: '1',
        name: '用',
      }),
      maxLength: this.createBasicUserDto({
        username: 'a'.repeat(50),
        password: '1'.repeat(100),
        name: '用'.repeat(50),
      }),
      specialChars: this.createBasicUserDto({
        username: 'user@test.com',
        password: 'P@ssw0rd!',
        name: '测试用户-特殊字符',
      }),
    };
  }

  /**
   * 创建随机用户数据
   */
  static createRandomUser(): CreateUserDto {
    const randomId = Math.random().toString(36).substring(7);
    return this.createBasicUserDto({
      username: `user_${randomId}`,
      password: `pass_${randomId}`,
      name: `随机用户_${randomId}`,
    });
  }
} 