# Aerocode API

API REST para o sistema de gerenciamento de produção de aeronaves **Aerocode**.

---

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 22+ | Plataforma de execução |
| TypeScript | 5.7 | Tipagem estática |
| Express.js | 4.21 | Framework HTTP |
| Prisma ORM | 6 | Acesso ao banco de dados |
| MySQL | 8.0 | Banco de dados relacional |
| Docker | 29+ | Containerização do MySQL |
| Zod | 3 | Validação de dados |
| JWT | 9 | Autenticação |
| bcrypt | 5 | Criptografia de senhas |
| morgan | 1.11 | Logging de requisições HTTP |
| autocannon | 8 | Teste de carga |

---

## Por que Docker?

O projeto utiliza Docker para garantir que o banco de dados MySQL rode de forma idêntica em qualquer sistema operacional, conforme exigido nos requisitos do trabalho. Sem Docker, o comportamento do MySQL varia entre Windows e Linux — senhas padrão diferentes, caminhos diferentes, versões diferentes. Com Docker, o ambiente é sempre MySQL 8.0 com as mesmas credenciais, independente do sistema.

**Plataformas suportadas:** Windows 10+, Linux Ubuntu 24.04+ e distribuições derivadas do Ubuntu.

---

## Pré-requisitos

- [Node.js 22+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows) ou Docker Engine (Linux)

---

## Estrutura do Projeto

```
api/
├── prisma/
│   ├── sql/
│   │   └── create_database.sql     — Script SQL manual alternativo
│   ├── schema.prisma               — Modelos, enums e relacionamentos
│   └── seed.ts                     — Cria o usuário admin padrão
│
├── requests/                       — Arquivos .http para testar os endpoints
│   ├── 00_health.http
│   ├── 01_auth.http
│   ├── 02_funcionarios.http
│   ├── 03_aeronaves.http
│   ├── 04_pecas.http
│   ├── 05_etapas.http
│   ├── 06_testes.http
│   ├── 07_relatorios.http
│   └── 08_ordens.http
│
├── scripts/
│   ├── load-test.ts                — Teste de carga (1, 5, 10 usuários)
│   └── generate-charts.ts          — Gera relatório HTML com gráficos
│
├── src/
│   ├── config/
│   │   └── env.ts                  — Variáveis de ambiente validadas com Zod
│   │
│   ├── controllers/
│   │   ├── aeronave.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── etapa.controller.ts
│   │   ├── funcionario.controller.ts
│   │   ├── metrics.controller.ts
│   │   ├── ordem.controller.ts
│   │   ├── peca.controller.ts
│   │   ├── relatorio.controller.ts
│   │   └── teste.controller.ts
│   │
│   ├── errors/
│   │   └── AppError.ts             — Classe de erro operacional padronizada
│   │
│   ├── middlewares/
│   │   ├── authenticate.ts         — Verifica token JWT
│   │   ├── authorize.ts            — Verifica nível de permissão
│   │   ├── errorHandler.ts         — Handler global de erros
│   │   ├── metrics.ts              — Coleta tempo de processamento por requisição
│   │   ├── requestLogger.ts        — Log HTTP via morgan
│   │   └── validate.ts             — Validação de body/params/query com Zod
│   │
│   ├── repositories/
│   │   ├── aeronave.repository.ts
│   │   ├── etapa.repository.ts
│   │   ├── funcionario.repository.ts
│   │   ├── ordem.repository.ts
│   │   ├── peca.repository.ts
│   │   ├── prisma.ts               — Singleton do PrismaClient
│   │   ├── relatorio.repository.ts
│   │   └── teste.repository.ts
│   │
│   ├── routes/
│   │   ├── aeronave.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── etapa.routes.ts
│   │   ├── funcionario.routes.ts
│   │   ├── index.ts                — Agrega todas as rotas em /api/v1
│   │   ├── metrics.routes.ts
│   │   ├── ordem.routes.ts
│   │   ├── peca.routes.ts
│   │   ├── relatorio.routes.ts
│   │   └── teste.routes.ts
│   │
│   ├── schemas/
│   │   ├── aeronave.schema.ts
│   │   ├── auth.schema.ts
│   │   ├── etapa.schema.ts
│   │   ├── funcionario.schema.ts
│   │   ├── ordem.schema.ts
│   │   ├── peca.schema.ts
│   │   ├── relatorio.schema.ts
│   │   └── teste.schema.ts
│   │
│   ├── services/
│   │   ├── aeronave.service.ts
│   │   ├── auth.service.ts
│   │   ├── etapa.service.ts
│   │   ├── funcionario.service.ts
│   │   ├── ordem.service.ts
│   │   ├── peca.service.ts
│   │   ├── relatorio.service.ts
│   │   └── teste.service.ts
│   │
│   ├── types/
│   │   ├── express.d.ts            — Extensão do Request com req.user
│   │   └── prisma.ts               — Tipos inferidos do Prisma Client
│   │
│   ├── utils/
│   │   ├── asyncHandler.ts         — Elimina try/catch nos controllers
│   │   ├── pagination.ts           — Helpers de paginação com Prisma
│   │   └── response.ts             — Funções ok(), created(), noContent()
│   │
│   ├── app.ts                      — Configuração do Express e middlewares
│   └── server.ts                   — Ponto de entrada com graceful shutdown
│
├── docker-compose.yml              — MySQL 8.0 via Docker
├── prisma.config.ts                — Configuração do Prisma CLI
├── tsconfig.json
├── .env.example                    — Modelo de variáveis de ambiente
└── package.json
```

---

## Como Executar

### Forma rápida

**Windows** — dê duplo clique em `iniciar.bat` na raiz do projeto (`AV3/`).

**Linux** — execute na raiz do projeto:
```bash
bash iniciar.sh
```

Os scripts instalam dependências, sobem o MySQL, criam as tabelas, criam o admin e abrem a API e o Frontend automaticamente.

---

### Forma manual (passo a passo)

**1. Instalar dependências**
```bash
npm install
```

**2. Configurar variáveis de ambiente**
```bash
# Windows
Copy-Item .env.example .env

# Linux
cp .env.example .env
```

Edite o `.env`:
```env
DATABASE_URL="mysql://aerocode_user:aerocode123@localhost:3306/aerocode"
PORT=3333
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

**3. Subir o MySQL com Docker**
```bash
docker compose up -d
```

**4. Criar as tabelas**
```bash
npx prisma db push
```

**5. Criar o usuário admin**
```bash
npm run prisma:seed
```

Login: `admin` / `admin123`

**6. Iniciar o servidor**
```bash
npm run dev
```

Servidor em `http://localhost:3333`

---

## Hierarquia de Permissões

`OPERADOR` < `ENGENHEIRO` < `ADMINISTRADOR`

| Ação | Nível mínimo |
|---|---|
| Cadastrar aeronave | ADMINISTRADOR |
| Adicionar / atualizar peça | OPERADOR |
| Adicionar / iniciar / finalizar etapa | ENGENHEIRO |
| Associar funcionário a etapa | ADMINISTRADOR |
| Adicionar teste | ENGENHEIRO |
| Gerar relatório final | ENGENHEIRO |
| Cadastrar / listar funcionários | ADMINISTRADOR |
| Criar ordem de fabricação | ENGENHEIRO |
| Remover ordem de fabricação | ADMINISTRADOR |

---

## Endpoints

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login — retorna JWT |
| `GET` | `/api/v1/auth/me` | Dados do usuário logado |

### Funcionários

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/api/v1/funcionarios` | ADMINISTRADOR |
| `GET` | `/api/v1/funcionarios/:id` | ADMINISTRADOR |
| `POST` | `/api/v1/funcionarios` | ADMINISTRADOR |
| `PUT` | `/api/v1/funcionarios/:id` | ADMINISTRADOR |
| `DELETE` | `/api/v1/funcionarios/:id` | ADMINISTRADOR |

### Aeronaves

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/api/v1/aeronaves` | Autenticado |
| `GET` | `/api/v1/aeronaves/:codigo` | Autenticado |
| `POST` | `/api/v1/aeronaves` | ADMINISTRADOR |
| `PUT` | `/api/v1/aeronaves/:codigo` | ADMINISTRADOR |
| `DELETE` | `/api/v1/aeronaves/:codigo` | ADMINISTRADOR |

### Peças

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/api/v1/aeronaves/:codigo/pecas` | Autenticado |
| `GET` | `/api/v1/aeronaves/:codigo/pecas/:id` | Autenticado |
| `POST` | `/api/v1/aeronaves/:codigo/pecas` | OPERADOR |
| `PUT` | `/api/v1/aeronaves/:codigo/pecas/:id` | OPERADOR |
| `DELETE` | `/api/v1/aeronaves/:codigo/pecas/:id` | OPERADOR |

### Etapas

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/api/v1/aeronaves/:codigo/etapas` | Autenticado |
| `GET` | `/api/v1/aeronaves/:codigo/etapas/:id` | Autenticado |
| `POST` | `/api/v1/aeronaves/:codigo/etapas` | ENGENHEIRO |
| `PUT` | `/api/v1/aeronaves/:codigo/etapas/:id` | ENGENHEIRO |
| `PATCH` | `/api/v1/aeronaves/:codigo/etapas/:id/iniciar` | ENGENHEIRO |
| `PATCH` | `/api/v1/aeronaves/:codigo/etapas/:id/finalizar` | ENGENHEIRO |
| `POST` | `/api/v1/aeronaves/:codigo/etapas/:id/funcionarios` | ADMINISTRADOR |
| `DELETE` | `/api/v1/aeronaves/:codigo/etapas/:id/funcionarios/:fid` | ADMINISTRADOR |
| `DELETE` | `/api/v1/aeronaves/:codigo/etapas/:id` | ENGENHEIRO |

### Testes

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/api/v1/aeronaves/:codigo/testes` | Autenticado |
| `POST` | `/api/v1/aeronaves/:codigo/testes` | ENGENHEIRO |
| `DELETE` | `/api/v1/aeronaves/:codigo/testes/:id` | ENGENHEIRO |

### Relatórios

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/api/v1/aeronaves/:codigo/relatorios` | ENGENHEIRO |
| `GET` | `/api/v1/aeronaves/:codigo/relatorios/:id` | ENGENHEIRO |
| `POST` | `/api/v1/aeronaves/:codigo/relatorios` | ENGENHEIRO |

### Ordens de Fabricação

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/api/v1/ordens` | Autenticado |
| `GET` | `/api/v1/ordens/:id` | Autenticado |
| `POST` | `/api/v1/ordens` | ENGENHEIRO |
| `PUT` | `/api/v1/ordens/:id` | ENGENHEIRO |
| `DELETE` | `/api/v1/ordens/:id` | ADMINISTRADOR |
| `POST` | `/api/v1/ordens/:id/pecas` | ENGENHEIRO |
| `PATCH` | `/api/v1/ordens/:id/pecas/:pecaId` | ENGENHEIRO |
| `DELETE` | `/api/v1/ordens/:id/pecas/:pecaId` | ENGENHEIRO |

### Métricas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/metrics` | Resumo do tempo de processamento |
| `POST` | `/api/v1/metrics/clear` | Zera as métricas coletadas |

---

## Enums

| Enum | Valores |
|---|---|
| `TipoAeronave` | `COMERCIAL`, `MILITAR` |
| `TipoPeca` | `NACIONAL`, `IMPORTADA` |
| `StatusPeca` | `EM_PRODUCAO`, `EM_TRANSPORTE`, `PRONTA` |
| `StatusEtapa` | `PENDENTE`, `ANDAMENTO`, `CONCLUIDA` |
| `TipoTeste` | `ELETRICO`, `HIDRAULICO`, `AERODINAMICO` |
| `ResultadoTeste` | `APROVADO`, `REPROVADO` |
| `NivelPermissao` | `OPERADOR`, `ENGENHEIRO`, `ADMINISTRADOR` |
| `StatusOrdem` | `ABERTA`, `EM_ANDAMENTO`, `CONCLUIDA`, `CANCELADA` |
| `PrioridadeOrdem` | `BAIXA`, `MEDIA`, `ALTA`, `CRITICA` |

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor com hot-reload |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Inicia a versão compilada |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Cria e aplica migrations |
| `npm run prisma:seed` | Cria o admin padrão |
| `npm run prisma:studio` | Abre o Prisma Studio |
| `npm run prisma:reset` | Reseta o banco (apaga todos os dados) |
| `npm run test:metrics` | Teste de carga com 1, 5 e 10 usuários |
| `npm run charts` | Gera relatório HTML com gráficos das métricas |

---

## Métricas de Qualidade

```bash
# Terminal 1 — servidor rodando
npm run dev

# Terminal 2 — coleta métricas (~30 segundos)
npm run test:metrics

# Gera relatório HTML com os 3 gráficos
npm run charts
```

O relatório é salvo em `metrics/resultado_..._graficos.html`.
Abra no navegador e use `Ctrl+P` para salvar como PDF.

---

## Parar o Ambiente

```bash
docker compose down        # Para o MySQL
docker compose down -v     # Para o MySQL e apaga os dados
```
