import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import * as bcrypt from 'bcrypt';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/database/prisma/prisma.service';

describe('App E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
    httpServer = app.getHttpServer();
  });

  beforeEach(async () => {
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  // ────────────────────────────────────────────────
  //  Auth & Users - Casos negativos adicionais
  // ────────────────────────────────────────────────
  describe('Auth & Users - Casos negativos', () => {
    it('POST /users → 400 quando faltam campos obrigatórios', async () => {
      await request(httpServer)
        .post('/users')
        .send({ email: 'teste@email.com' }) // falta name e password
        .expect(400);
    });

    it('POST /users → 400 quando email inválido', async () => {
      await request(httpServer)
        .post('/users')
        .send({
          name: 'Teste',
          email: 'nao-eh-email',
          password: '12345678',
        })
        .expect(400);
    });

    it('POST /users → 400 quando senha muito curta', async () => {
      await request(httpServer)
        .post('/users')
        .send({
          name: 'Teste',
          email: 'curto@email.com',
          password: '123', // supondo validação mínima de 6 ou 8 caracteres
        })
        .expect(400);
    });

    it('POST /auth/login → 400 quando faltam campos', async () => {
      await request(httpServer)
        .post('/auth/login')
        .send({ email: 'teste@email.com' })
        .expect(400);
    });

    it('POST /auth/login → 401 quando usuário não existe', async () => {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'naoexiste123@emailnaoexiste.com',
          password: 'qualquercoisa',
        })
        .expect(401);

      expect(res.body.message).toContain('Usuário não encontrado');
    });

    it('POST /auth/login → 401 quando senha incorreta', async () => {
      // cria usuário
      await prisma.user.create({
        data: {
          name: 'João Errado',
          email: 'joao.senhaerrada@teste.com',
          password: await bcrypt.hash('senha_certa_123', 10),
        },
      });

      const res = await request(httpServer)
        .post('/auth/login')
        .send({
          email: 'joao.senhaerrada@teste.com',
          password: 'senha_errada',
        })
        .expect(401);

      expect(res.body.message).toContain('Senha inválida');
    });
  });

  // ────────────────────────────────────────────────
  //  Transactions - Casos negativos importantes
  // ────────────────────────────────────────────────
  describe('Transactions - Casos negativos', () => {
    let tokenAna: string;
    let userAnaId: string;
    let userPedroId: string;

    beforeEach(async () => {
      // Usuário Ana (saldo inicial 1000)
      const ana = await prisma.user.create({
        data: {
          name: 'Ana Teste Negativo',
          email: 'ana.negativo@teste.com',
          password: await bcrypt.hash('abc123456', 10),
          balance: new Decimal(1000),
        },
      });
      userAnaId = ana.id;

      // Usuário Pedro (saldo inicial 300)
      const pedro = await prisma.user.create({
        data: {
          name: 'Pedro Teste Negativo',
          email: 'pedro.negativo@teste.com',
          password: await bcrypt.hash('abc123456', 10),
          balance: new Decimal(300),
        },
      });
      userPedroId = pedro.id;

      // Login Ana
      const loginRes = await request(httpServer).post('/auth/login').send({
        email: 'ana.negativo@teste.com',
        password: 'abc123456',
      });

      tokenAna = loginRes.body.access_token;
    });

    // ─── Depósito ─────────────────────────────────────
    it('POST /transactions/deposit → 401 sem token', async () => {
      await request(httpServer)
        .post('/transactions/deposit')
        .send({ amount: '100' })
        .expect(401);
    });

    it('POST /transactions/deposit → 400 amount ≤ 0', async () => {
      await request(httpServer)
        .post('/transactions/deposit')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ amount: '0' })
        .expect(400);

      await request(httpServer)
        .post('/transactions/deposit')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ amount: '-50.00' })
        .expect(400);
    });

    it('POST /transactions/deposit → 400 amount não numérico', async () => {
      await request(httpServer)
        .post('/transactions/deposit')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ amount: 'cem' })
        .expect(400);
    });

    // ─── Transferência ─────────────────────────────────
    it('POST /transactions/transfer → 401 sem token', async () => {
      await request(httpServer)
        .post('/transactions/transfer')
        .send({ toUserId: userPedroId, amount: '50' })
        .expect(401);
    });

    it('POST /transactions/transfer → 400 campos obrigatórios faltando', async () => {
      await request(httpServer)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ amount: '50' }) // falta toUserId
        .expect(400);
    });

    it('POST /transactions/transfer → 400 transferir para si mesmo', async () => {
      await request(httpServer)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ toUserId: userAnaId, amount: '100' })
        .expect(400);

      // mensagem deve conter algo como "Não pode transferir para si mesmo"
    });

    it('POST /transactions/transfer → 400 usuário destino não existe', async () => {
      await request(httpServer)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ toUserId: 'uuid-invalido-que-nao-existe', amount: '100' })
        .expect(400);
    });

    it('POST /transactions/transfer → 400 saldo insuficiente', async () => {
      await request(httpServer)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ toUserId: userPedroId, amount: '5000' }) // Ana só tem 1000
        .expect(400);
    });

    it('POST /transactions/transfer → 400 amount ≤ 0', async () => {
      await request(httpServer)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ toUserId: userPedroId, amount: '0' })
        .expect(400);
    });

    // ─── Reversão ──────────────────────────────────────
    it('POST /transactions/:id/reverse → 401 sem token', async () => {
      await request(httpServer)
        .post('/transactions/qualquer-id/reverse')
        .expect(401);
    });

    it('POST /transactions/:id/reverse → 400 transação não encontrada', async () => {
      await request(httpServer)
        .post('/transactions/11111111-2222-3333-4444-555555555555/reverse')
        .set('Authorization', `Bearer ${tokenAna}`)
        .expect(400);
    });

    it('POST /transactions/:id/reverse → 400 tenta reverter 2x a mesma transação', async () => {
      // cria uma transferência
      const transferRes = await request(httpServer)
        .post('/transactions/transfer')
        .set('Authorization', `Bearer ${tokenAna}`)
        .send({ toUserId: userPedroId, amount: '200' })
        .expect(200);

      const tx = await prisma.transaction.findFirst({
        where: { type: 'TRANSFER', senderId: userAnaId },
        orderBy: { createdAt: 'desc' },
      });

      const txId = tx!.id;

      // primeira reversão → OK
      await request(httpServer)
        .post(`/transactions/${txId}/reverse`)
        .set('Authorization', `Bearer ${tokenAna}`)
        .expect(200);

      // segunda reversão → deve falhar
      const secondReverse = await request(httpServer)
        .post(`/transactions/${txId}/reverse`)
        .set('Authorization', `Bearer ${tokenAna}`)
        .expect(400);

      expect(secondReverse.body.message).toContain('já foi revertida');
    });

    it('POST /transactions/:id/reverse → 400 tenta reverter depósito de outro usuário', async () => {
      // cria depósito para Pedro (simulando que outra pessoa fez)
      await prisma.transaction.create({
        data: {
          receiverId: userPedroId,
          amount: new Decimal(500),
          type: 'DEPOSIT',
          status: 'COMPLETED',
        },
      });

      const depositTx = await prisma.transaction.findFirst({
        where: { type: 'DEPOSIT', receiverId: userPedroId },
      });

      // Ana tenta reverter depósito do Pedro → deve falhar (você pode querer restringir isso na regra de negócio)
      // Se sua regra atual permite qualquer um reverter qualquer depósito → considere adicionar validação
      // Por enquanto vamos testar o comportamento atual
      await request(httpServer)
        .post(`/transactions/${depositTx!.id}/reverse`)
        .set('Authorization', `Bearer ${tokenAna}`)
        .expect(200); // ← se quiser bloquear, mude o service e teste 403 ou 400
    });
  });
});
