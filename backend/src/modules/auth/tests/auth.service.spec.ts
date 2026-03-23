import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('deve retornar o usuário (sem senha) se as credenciais forem válidas', async () => {
      const user = {
        id: '1',
        email: 'teste@email.com',
        password: 'hash_password',
        name: 'Teste',
        balance: 0,
      };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('teste@email.com', '123456');

      expect(usersService.findByEmail).toHaveBeenCalledWith('teste@email.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('123456', 'hash_password');
      expect(result).toEqual({
        id: '1',
        email: 'teste@email.com',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('naoexiste@email.com', '123456'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha for inválida', async () => {
      const user = {
        id: '1',
        email: 'teste@email.com',
        password: 'hash_password',
      };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('teste@email.com', 'senha_errada'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('deve retornar um token de acesso', async () => {
      const user = {
        id: '1',
        email: 'teste@email.com',
        password: 'hash_password',
      };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginDto = { email: 'teste@email.com', password: '123' };
      const token = 'jwt_token_mock';
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: token });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });
  });
});
