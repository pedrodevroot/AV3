# Aerocode

Sistema de gerenciamento do processo de produção de aeronaves — do cadastro inicial até o relatório final de entrega.

---

## Visão Geral

O projeto é composto por três partes que trabalham juntas:

| Pasta | Descrição |
|---|---|
| `api/` | API REST — Node.js, TypeScript, Express, Prisma ORM, MySQL |
| `frontend/` | Interface web — React 19, Vite, Tailwind CSS v4 |
| `backend/` | CLI original — TypeScript (versão inicial do projeto) |

---

## Como Rodar

> ⚠️ **Importante:** antes de rodar o projeto (de qualquer forma), o **Docker precisa estar aberto e rodando**. No Windows, abra o **Docker Desktop** e aguarde ele ficar com o status verde. No Linux, certifique-se de que o serviço do Docker está ativo (`sudo systemctl start docker`). Sem o Docker rodando, o banco de dados MySQL não inicia e o projeto não funciona.

### Forma rápida

**Windows** — dê duplo clique em `iniciar.bat` nesta pasta.

**Linux** — execute nesta pasta:
```bash
sudo bash iniciar.sh
```

Os scripts fazem tudo automaticamente e abrem o sistema no navegador.

**Login:** `admin` / `admin123`

---

### Forma manual (passo a passo)

Caso prefira não usar os scripts `iniciar.bat` / `iniciar.sh`, siga os passos abaixo. Os comandos funcionam tanto no Windows (PowerShell) quanto no Linux.

**1. Suba o banco de dados MySQL (via Docker)**

> Confira se o Docker Desktop (Windows) ou o serviço do Docker (Linux) já está rodando antes deste passo.

```bash
cd api
docker compose up -d
```

**2. Configure as variáveis de ambiente da API**

Crie o arquivo `.env` a partir do exemplo:

```bash
# Windows (PowerShell)
copy .env.example .env

# Linux
cp .env.example .env
```

**3. Instale as dependências e prepare o banco (ainda na pasta `api/`)**

```bash
npm install
npm run prisma:generate   # gera o Prisma Client
npm run prisma:push       # cria as tabelas no banco
npm run prisma:seed       # cria o usuário admin / admin123
```

**4. Inicie a API**

```bash
npm run dev
```

> A API ficará disponível em http://localhost:3333. Deixe este terminal aberto.

**5. Em outro terminal, instale as dependências e inicie o Frontend**

```bash
cd frontend
npm install
npm run dev
```

> O Frontend ficará disponível em http://localhost:5173.

**6. Acesse o sistema**

Abra http://localhost:5173 no navegador e faça login com `admin` / `admin123`.

**Para parar:** pressione `Ctrl+C` em cada terminal (API e Frontend) e, na pasta `api/`, execute `docker compose down` para parar o banco de dados.

---

### Pré-requisitos

- [Node.js 22+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows) ou Docker Engine (Linux)

> O projeto utiliza Docker para garantir que o banco de dados MySQL rode de forma idêntica em qualquer sistema operacional — Windows 10+, Linux Ubuntu 24.04+ e distribuições derivadas do Ubuntu.

---

## Estrutura do Projeto

```
AV3/
├── api/                          — API REST (back-end)
│   ├── prisma/
│   │   ├── sql/
│   │   │   └── create_database.sql
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── requests/                 — Arquivos .http para testar endpoints
│   ├── scripts/
│   │   ├── load-test.ts          — Teste de carga (1, 5, 10 usuários)
│   │   └── generate-charts.ts    — Gera gráficos HTML das métricas
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── errors/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── docker-compose.yml        — MySQL 8.0 via Docker
│   ├── .env.example
│   └── package.json
│
├── frontend/                     — Interface web (React)
│   ├── public/
│   │   ├── logo-aerocode.png
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── constants/
│       ├── contexts/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── types/
│
├── backend/                      — CLI original (versão 1 do projeto)
│   └── src/
│       ├── enums/
│       ├── models/
│       └── services/
│
├── docs/                         — Documentação e relatório de qualidade
│   ├── relatorio.md
│   ├── banco-de-dados.md
│   ├── prisma-setup.md
│   ├── Home.png
│   └── telas.png
│
├── iniciar.bat                   — Inicia tudo no Windows (duplo clique)
├── iniciar.sh                    — Inicia tudo no Linux
├── parar.bat                     — Para tudo no Windows
└── parar.sh                      — Para tudo no Linux
```

---

## Funcionalidades

- Cadastro de aeronaves com código único
- Gerenciamento de peças com controle de status
- Controle de etapas de produção com fluxo PENDENTE → ANDAMENTO → CONCLUIDA
- Registro de testes elétricos, hidráulicos e aerodinâmicos
- Ordens de fabricação com controle de prioridade e status
- Cadastro de funcionários com hierarquia de permissões
- Autenticação via JWT
- Geração de relatório final de entrega
- API REST completa com validação de dados
- Métricas de qualidade: latência, tempo de processamento e tempo de resposta

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

---

## Tecnologias

**API (back-end)**
- Node.js 22+
- TypeScript 5.7
- Express.js 4.21
- Prisma ORM 6
- MySQL 8.0
- Docker
- Zod, JWT, bcrypt, morgan

**Frontend**
- React 19
- Vite 8
- TypeScript 6
- Tailwind CSS v4
- React Router DOM 7

---

## Portas

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3333 |
| MySQL | localhost:3306 |
