import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

// Test fornece contexto de uso da aplicação
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import TestUtil from './../common/test/TestUtil';
import { User } from './user.entity';
import { UserService } from './user.service';

// Describe criar o bloco para agupas testes relacionados
describe('UserService', () => {
  let service: UserService;

  // Const com lista de funções de simuladas
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // CreateTestingModule simula o module
      providers: [
        UserService,
        // Simulação do repository
        {
          // Simula o @InjectReposiotry()
          provide: getRepositoryToken(User),
          // Definir o valor dele
          useValue: mockRepository,
        },
      ],
      //Inicializador de modulo, simula o main(assincrono)
    }).compile();

    // Defininfo userService inicializado
    service = module.get<UserService>(UserService);
  });

  // Limpando as funções simuladas
  beforeEach(() => {
    mockRepository.find.mockReset();
    mockRepository.findOne.mockReset();
    mockRepository.create.mockReset();
    mockRepository.save.mockReset();
    mockRepository.update.mockReset();
    mockRepository.delete.mockReset();
  });

  // Verificando se userService foi definido
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Veirificando método findAllUsers()
  describe('findAllUsers', () => {
    // Descrevendo o que quero verificar
    it('should be list all users', async () => {
      /* Preparando teste */
      const user = TestUtil.giveAMeAValidUser();
      mockRepository.find.mockReturnValue([user, user]);
      const users = await service.findAllUsers();
      /* Fim da preparação */

      // Testando
      expect(users).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  // Hierarquia de testes
  describe('findUserById', () => {
    // it e apelido para teste
    it('should find a existing user', async () => {
      const user = TestUtil.giveAMeAValidUser();
      mockRepository.findOne.mockReturnValue(user);
      const userFound = await service.findUserById('1');
      expect(userFound).toMatchObject({ name: user.name });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return a exception when does not to find a user', async () => {
      const user = TestUtil.giveAMeAValidUser();
      mockRepository.findOne.mockReturnValue(null);

      expect(service.findUserById('3')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('create user', () => {
    // it e apelido para teste
    it('should create a user', async () => {
      const user = TestUtil.giveAMeAValidUser();
      mockRepository.save.mockReturnValue(user);
      mockRepository.create.mockReturnValue(user);
      const savedUser = await service.createUser(user);
      expect(savedUser).toMatchObject(user);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return a exception when create a user', async () => {
      const user = TestUtil.giveAMeAValidUser();
      mockRepository.save.mockReturnValue(null);
      mockRepository.create.mockReturnValue(user);

      await service.createUser(user).catch(e => {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e).toMatchObject({
          message: 'Problem to create a user. Try again',
        });
      });
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('UpadateUser', () => {
    it('Should update a user', async () => {
      const user = TestUtil.giveAMeAValidUser();
      const updatedUser = { name: 'Nome Atualizado' };

      mockRepository.findOne.mockReturnValue(user);
      mockRepository.update.mockReturnValue({
        ...user,
        ...updatedUser,
      });
      mockRepository.create.mockReturnValue({
        ...user,
        ...updatedUser,
      });

      const resultUser = await service.updateUser('1', {
        ...user,
        name: 'Nome Atualizado',
      });

      expect(resultUser).toMatchObject(updatedUser);
      expect(mockRepository.create).toBeCalledTimes(1);
      expect(mockRepository.findOne).toBeCalledTimes(1);
      expect(mockRepository.update).toBeCalledTimes(1);
    });
  });

  describe('DeleteUser', () => {
    it('Should delete a existing user', async () => {
      const user = TestUtil.giveAMeAValidUser();

      mockRepository.delete.mockReturnValue(user);
      mockRepository.findOne.mockReturnValue(user);
      const deletedUser = await service.deleteUser('1');
      expect(deletedUser).toBe(true);
      expect(mockRepository.delete).toBeCalledTimes(1);
      expect(mockRepository.findOne).toBeCalledTimes(1);
    });

    it('Should not delete a inexisting user', async () => {
      const user = TestUtil.giveAMeAValidUser();

      mockRepository.delete.mockReturnValue(null);
      mockRepository.findOne.mockReturnValue(user);
      const deletedUser = await service.deleteUser('9');
      expect(deletedUser).toBe(false);
      expect(mockRepository.delete).toBeCalledTimes(1);
      expect(mockRepository.findOne).toBeCalledTimes(1);
    });
  });
});
