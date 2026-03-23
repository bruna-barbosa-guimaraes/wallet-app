import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: typeof mockUsersRepository;

  const mockUsersRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um usuário com sucesso (com senha hash e sem retornar senha)', async () => {
      const dto = {
        name: 'Test User',
        email: 'test@email.com',
        password: 'password123',
      };
      const hashedPassword = 'hashed_password_mock';
      const createdUser = {
        ...dto,
        id: 'user-uuid',
        password: hashedPassword,
        balance: 0,
      };

      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(createdUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.create(dto);

      expect(repository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(repository.create).toHaveBeenCalledWith({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });
      expect(result).not.toHaveProperty('password');
      expect(result.id).toBe(createdUser.id);
      expect(result.email).toBe(createdUser.email);
    });

    it('deve lançar BadRequestException se o email já estiver em uso', async () => {
      const dto = {
        name: 'Test User',
        email: 'exists@email.com',
        password: 'password123',
      };
      repository.findByEmail.mockResolvedValue({ id: 'existing-id', ...dto });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('deve retornar o usuário se encontrado', async () => {
      const user = { id: '1', email: 'find@email.com', password: 'hash' };
      repository.findByEmail.mockResolvedValue(user);

      const result = await service.findByEmail('find@email.com');
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('deve retornar o usuário sem a senha se encontrado', async () => {
      const user = { id: '1', email: 'find@id.com', password: 'hash_secret' };
      repository.findById.mockResolvedValue(user);

      const result = await service.findById('1');
      expect(result).toEqual({ id: '1', email: 'find@id.com' });
      expect(result).not.toHaveProperty('password');
    });
  });
});
