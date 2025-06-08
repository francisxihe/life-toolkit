import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../../src/business/users/user.service';
import { UserTestFactory } from '../utils/user.factory';
import { CreateUserDto } from '../../../../src/business/users/dto/create-user.dto';
import { UpdateUserDto } from '../../../../src/business/users/dto/update-user.dto';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    // 清理服务中的用户数据
    (service as any).users = [];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', () => {
      const createUserDto = UserTestFactory.createBasicUserDto();
      const result = service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result?.username).toBe(createUserDto.username);
      expect(result?.name).toBe(createUserDto.name);
      expect(result?.id).toBeDefined();
      expect(result?.createdAt).toBeDefined();
      expect(result?.updatedAt).toBeDefined();
    });

    it('should create user with custom data', () => {
      const customUserDto = UserTestFactory.createBasicUserDto({
        username: 'customuser',
        name: '自定义用户',
      });
      const result = service.create(customUserDto);

      expect(result?.username).toBe('customuser');
      expect(result?.name).toBe('自定义用户');
    });

    it('should create multiple users', () => {
      const user1 = UserTestFactory.createBasicUserDto({ username: 'user1' });
      const user2 = UserTestFactory.createBasicUserDto({ username: 'user2' });

      const result1 = service.create(user1);
      const result2 = service.create(user2);

      expect(result1?.id).not.toBe(result2?.id);
      expect(service.findAll()).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return empty array when no users', () => {
      const result = service.findAll();
      expect(result).toEqual([]);
    });

    it('should return all users', () => {
      const user1 = UserTestFactory.createBasicUserDto({ username: 'user1' });
      const user2 = UserTestFactory.createBasicUserDto({ username: 'user2' });

      service.create(user1);
      service.create(user2);

      const result = service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('user1');
      expect(result[1].username).toBe('user2');
    });
  });

  describe('findOne', () => {
    it('should return user by id', () => {
      const createUserDto = UserTestFactory.createBasicUserDto();
      const createdUser = service.create(createUserDto);
      
      const result = service.findOne(createdUser!.id);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(createdUser!.id);
      expect(result?.username).toBe(createUserDto.username);
    });

    it('should return null for non-existent user', () => {
      const result = service.findOne('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing user', () => {
      const createUserDto = UserTestFactory.createBasicUserDto();
      const createdUser = service.create(createUserDto);
      
      const updateUserDto = UserTestFactory.createUpdateUserDto({
        id: createdUser!.id,
        name: '更新后的名称',
      });
      
      const result = service.update(createdUser!.id, updateUserDto);
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('更新后的名称');
      expect(result?.username).toBe(createUserDto.username); // 未更新的字段保持不变
    });

    it('should return null for non-existent user', () => {
      const updateUserDto = UserTestFactory.createUpdateUserDto();
      const result = service.update('non-existent-id', updateUserDto);
      
      expect(result).toBeNull();
    });

    it('should update multiple fields', () => {
      const createUserDto = UserTestFactory.createBasicUserDto();
      const createdUser = service.create(createUserDto);
      
      const updateUserDto: UpdateUserDto = {
        id: createdUser!.id,
        username: 'newusername',
        name: '新名称',
        password: 'newpassword',
      };
      
      const result = service.update(createdUser!.id, updateUserDto);
      
      expect(result?.username).toBe('newusername');
      expect(result?.name).toBe('新名称');
      expect(result?.password).toBe('newpassword');
    });
  });

  describe('remove', () => {
    it('should remove existing user', () => {
      const createUserDto = UserTestFactory.createBasicUserDto();
      const createdUser = service.create(createUserDto);
      
      expect(service.findAll()).toHaveLength(1);
      
      service.remove(createdUser!.id);
      
      expect(service.findAll()).toHaveLength(0);
      expect(service.findOne(createdUser!.id)).toBeNull();
    });

    it('should not throw error when removing non-existent user', () => {
      expect(() => service.remove('non-existent-id')).not.toThrow();
      expect(service.findAll()).toHaveLength(0);
    });

    it('should remove only specified user', () => {
      const user1 = service.create(UserTestFactory.createBasicUserDto({ username: 'user1' }));
      const user2 = service.create(UserTestFactory.createBasicUserDto({ username: 'user2' }));
      
      expect(service.findAll()).toHaveLength(2);
      
      service.remove(user1!.id);
      
      expect(service.findAll()).toHaveLength(1);
      expect(service.findOne(user1!.id)).toBeNull();
      expect(service.findOne(user2!.id)).toBeDefined();
    });
  });

  describe('边界测试', () => {
    it('should handle boundary test data', () => {
      const boundaryData = UserTestFactory.createBoundaryTestData();
      
      const minResult = service.create(boundaryData.minLength);
      const maxResult = service.create(boundaryData.maxLength);
      const specialResult = service.create(boundaryData.specialChars);
      
      expect(minResult).toBeDefined();
      expect(maxResult).toBeDefined();
      expect(specialResult).toBeDefined();
      expect(service.findAll()).toHaveLength(3);
    });
  });

  describe('性能测试', () => {
    it('should handle large number of users efficiently', () => {
      const startTime = Date.now();
      const userCount = 1000;
      
      for (let i = 0; i < userCount; i++) {
        const userDto = UserTestFactory.createRandomUser();
        service.create(userDto);
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      expect(service.findAll()).toHaveLength(userCount);
      expect(executionTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
}); 