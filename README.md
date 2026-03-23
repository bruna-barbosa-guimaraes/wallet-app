# Wallet App – Carteira Digital

Este é o repositório da aplicação **Wallet App**, um sistema de **carteira digital completo** desenvolvido como parte de um teste técnico Fullstack.

A aplicação foi construída com foco em **backend robusto**, com autenticação segura, operações financeiras com consistência e testes automatizados, além de um frontend funcional para demonstração da experiência do usuário.

---

## Descrição

O Wallet App permite:

- **Cadastro e autenticação de usuários**
- **Depósito de valores na conta**
- **Transferência de valores entre usuários**
- **Reversão de transações**
- **Consulta de saldo**
- **Histórico de transações**

O backend foi implementado em **NestJS** com **Prisma ORM** e o frontend em **Next.js (App Router)** como interface de consumo da API.

---

## Tecnologias

- **NestJS** – Backend estruturado em módulos
- **TypeScript** – Linguagem principal
- **Prisma ORM** – Modelagem e acesso a banco de dados
- **MySQL** (via Prisma)
- **Jest** – Testes unitários e integração
- **Next.js** – Frontend (client + server rendering)
- **JWT** – Autenticação via token
- **HTTP-only Cookies** – Armazenamento seguro de sessão no frontend

---

## 📁 Estrutura do Projeto

```text
wallet-app/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── wallet/
│   │   │   ├── transactions/
│   │   ├── database/
│   │   ├── main.ts
│   ├── prisma/
│   └── test/
├── frontend/
│   ├── app/
│   │   ├── transactions/
│   └── ...
├── docker-compose.yml
└── README.md
```

---

## Funcionalidades

### 🔐 Autenticação

- Usuário pode se cadastrar (`POST /auth/register`)
- Login retorna um JWT seguro
- Cookies HTTP-only usados para autenticação no frontend

### 📊 Endpoints da API

#### 🧾 Auth

| Método | Endpoint         | Descrição           |
| :----- | :--------------- | :------------------ |
| POST   | `/auth/register` | Cadastro de usuário |
| POST   | `/auth/login`    | Login de usuário    |

#### 💰 Transações / Carteira

| Método | Endpoint                    | Descrição                           |
| :----- | :-------------------------- | :---------------------------------- |
| POST   | `/wallet/deposit`           | Depositar valor na carteira         |
| POST   | `/wallet/transfer`          | Transferir valor para outro usuário |
| GET    | `/transactions`             | Listar transações do usuário        |
| POST   | `/transactions/:id/reverse` | Reverter a transação                |
| GET    | `/wallet/balance`           | Consultar saldo atual               |

## Regras de Negócio

- Não é permitido transferir para si mesmo
- Saldo insuficiente impede transferências
- Transações são realizadas dentro de blocos atômicos (`$transaction` do Prisma)
- Ao reverter uma transação:
  - O saldo do remetente e do destinatário é ajustado corretamente
  - A transação recebe status `REVERSED`

## Modelagem (Prisma)

Entidades principais:

### User

- id (UUID)
- email
- password (hash)
- balance

### Transaction

- id (UUID)
- amount
- senderId
- receiverId
- status (COMPLETED, REVERSED)
- createdAt

## 🛠️ Como Rodar Localmente

### 🐳 Usando Docker

1. Clone o repositório

   ```bash
   git clone https://github.com/bruna-barbosa-guimaraes/wallet-app.git
   ```

2. Acesse o backend

   ```bash
   cd wallet-app/backend
   ```

3. Copie as variáveis de ambiente

   ```bash
   cp .env.example .env
   ```

4. Execute as migrations

   ```bash
   npx prisma migrate dev
   ```

5. Inicie a aplicação
   ```bash
   npm install
   npm run start:dev
   ```

A API estará disponível em: http://localhost:3000

### 📌 Frontend (Next.js)

O frontend consume os endpoints da API e usa cookies HTTP-only para autenticação:

```bash
cd wallet-app/frontend
npm install
npm run dev
```

## 🧪 Testes Automatizados

A cobertura inclui:

- Autenticação
- Depósitos
- Transferências
- Reversões
- Validações de erro

Comandos:

```bash
npm run test        # Unitários
npm run test:e2e    # Integração
```
