# Wallet App

![Node.js](https://img.shields.io/badge/Node.js-18.17.1-green)
![NestJS](https://img.shields.io/badge/NestJS-10.3.2-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Jest](https://img.shields.io/badge/Jest-29.7.0-red)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)

## Descrição

Sistema de **carteira digital** desenvolvido como teste técnico fullstack.

Permite:

- Cadastro e autenticação de usuários
- Depósitos e transferências
- Reversão de transações
- Consulta de saldo
- Histórico de transações

Tecnologias: **NestJS**, **Prisma ORM**, **MySQL**, **Jest**.

---

## Funcionalidades da API

Auth:
POST /auth/login – Login do usuário
POST /auth/register – Cadastro de novo usuário
Wallet / Transações:
POST /wallet/deposit – Depositar valor
POST /wallet/transfer – Transferir para outro usuário
POST /wallet/reverse/:transactionId – Reverter transação
GET /wallet/balance – Consultar saldo
GET /wallet/transactions – Histórico de transações

Regras de negócio:

Transferência não permite enviar para si mesmo
Reversão atualiza saldo do remetente e receptor corretamente
Valida saldo insuficiente
Transações atômicas usando $transaction do Prisma
Banco de Dados (Prisma)

Entidades principais:

User: login, email, saldo
Transaction: histórico de transações (depósito, transferência, reversão)
Wallet: saldo atualizado em cada operação
Rodando Localmente

Clone o repositório, instale dependências, configure o banco e rode a aplicação:

git clone https://github.com/seu-usuario/wallet-app.git
cd wallet-app/backend
npm install
cp .env.example .env # Configure variáveis de ambiente
npx prisma migrate dev # Cria e aplica migrations
npm run start:dev # Inicia servidor em dev

A API estará disponível em http://localhost:3000
Swagger disponível em http://localhost:3000/api

Testes

Testes unitários e integração cobrem:

Autenticação
Depósitos, transferências e reversão
Validações de erros (saldo insuficiente, UUID inválido, etc.)

Executar:

npm run test # Testes unitários
npm run test:e2e # Testes de integração

Cobertura completa de cenários de sucesso e falha.

Documentação da API

Swagger exibe endpoints, parâmetros e respostas:

http://localhost:3000/api
