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

### Forma rápida

**Windows** — dê duplo clique em `iniciar.bat` nesta pasta.

**Linux** — execute nesta pasta:
```bash
bash iniciar.sh
```

Os scripts fazem tudo automaticamente e abrem o sistema no navegador.

**Login:** `admin` / `admin123`

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
