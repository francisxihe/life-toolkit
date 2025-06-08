import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../../src/business/users/user.controller';
import { UserService } from '../../../../src/business/users/user.service';
import { UserTestFactory } from '../utils/user.factory';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', () => {
      const createUserDto = UserTestFactory.createBasicUserDto();
      const expectedUser = UserTestFactory.createUserEntity();

      mockUserService.create.mockReturnValue(expectedUser);

      const result = controller.create(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should handle user creation with custom data', () => {
      const customUserDto = UserTestFactory.createBasicUserDto({
        username: 'customuser',
        name: '自定义用户',
      });
      const expectedUser = UserTestFactory.createUserEntity({
        username: 'customuser',
        name: '自定义用户',
      });

      mockUserService.create.mockReturnValue(expectedUser);

      const result = controller.create(customUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(customUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const expectedUsers = UserTestFactory.createUserList();

      mockUserService.findAll.mockReturnValue(expectedUsers);

      const result = controller.findAll();

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });

    it('should return empty array when no users', () => {
      mockUserService.findAll.mockReturnValue([]);

      const result = controller.findAll();

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', () => {
      const userId = 'user-1';
      const expectedUser = UserTestFactory.createUserEntity({ id: userId });

      mockUserService.findOne.mockReturnValue(expectedUser);

      const result = controller.findOne(userId);

      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should return null for non-existent user', () => {
      const userId = 'non-existent-id';

      mockUserService.findOne.mockReturnValue(null);

      const result = controller.findOne(userId);

      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update existing user', () => {
      const userId = 'user-1';
      const updateUserDto = UserTestFactory.createUpdateUserDto({
        id: userId,
        name: '更新后的名称',
      });
      const expectedUser = UserTestFactory.createUserEntity({
        id: userId,
        name: '更新后的名称',
      });

      mockUserService.update.mockReturnValue(expectedUser);

      const result = controller.update(userId, updateUserDto);

      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should return null for non-existent user', () => {
      const userId = 'non-existent-id';
      const updateUserDto = UserTestFactory.createUpdateUserDto();

      mockUserService.update.mockReturnValue(null);

      const result = controller.update(userId, updateUserDto);

      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toBeNull();
    });

    it('should update multiple fields', () => {
      const userId = 'user-1';
      const updateUserDto = UserTestFactory.createUpdateUserDto({
        id: userId,
        username: 'newusername',
        name: '新名称',
        password: 'newpassword',
      });
      const expectedUser = UserTestFactory.createUserEntity({
        id: userId,
        username: 'newusername',
        name: '新名称',
        password: 'newpassword',
      });

      mockUserService.update.mockReturnValue(expectedUser);

      const result = controller.update(userId, updateUserDto);

      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('remove', () => {
    it('should remove existing user', () => {
      const userId = 'user-1';

      mockUserService.remove.mockReturnValue(undefined);

      const result = controller.remove(userId);

      expect(mockUserService.remove).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });

    it('should handle removal of non-existent user', () => {
      const userId = 'non-existent-id';

      mockUserService.remove.mockReturnValue(undefined);

      const result = controller.remove(userId);

      expect(mockUserService.remove).toHaveBeenCalledWith(userId);
      expect(result).toBeUndefined();
    });
  });

  describe('边界测试', () => {
    it('should handle boundary test data', () => {
      const boundaryData = UserTestFactory.createBoundaryTestData();
      const expectedUser = UserTestFactory.createUserEntity();

      mockUserService.create.mockReturnValue(expectedUser);

      const minResult = controller.create(boundaryData.minLength);
      const maxResult = controller.create(boundaryData.maxLength);
      const specialResult = controller.create(boundaryData.specialChars);

      expect(mockUserService.create).toHaveBeenCalledTimes(3);
      expect(minResult).toEqual(expectedUser);
      expect(maxResult).toEqual(expectedUser);
      expect(specialResult).toEqual(expectedUser);
    });
  });

  describe('错误处理', () => {
    it('should handle service errors gracefully', () => {
      const createUserDto = UserTestFactory.createBasicUserDto();
      const error = new Error('Service error');

      mockUserService.create.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.create(createUserDto)).toThrow('Service error');
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });
}); 