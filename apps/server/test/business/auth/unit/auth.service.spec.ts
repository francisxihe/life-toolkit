import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../../src/business/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid user', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        name: '测试用户',
      };
      const expectedToken = 'jwt-token-123';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result).toEqual({
        access_token: expectedToken,
      });
    });

    it('should handle different user data', async () => {
      const user = {
        id: 'user-2',
        email: 'another@example.com',
        name: '另一个用户',
      };
      const expectedToken = 'jwt-token-456';

      mockJwtService.sign.mockReturnValue(expectedToken);

      const result = await service.login(user);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
      expect(result.access_token).toBe(expectedToken);
    });
  });

  describe('validateUser', () => {
    it('should be defined but not implemented', async () => {
      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeUndefined();
    });
  });

  describe('错误处理', () => {
    it('should handle JWT service errors', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
      };
      const error = new Error('JWT error');

      mockJwtService.sign.mockImplementation(() => {
        throw error;
      });

      await expect(service.login(user)).rejects.toThrow('JWT error');
    });
  });
}); 