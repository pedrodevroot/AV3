-- ============================================================
--  AEROCODE — Script de criação do banco de dados
--  MySQL 8.0+
--  Executar como root ou usuário com privilégios de criação
-- ============================================================

-- Cria banco com charset adequado para caracteres especiais
CREATE DATABASE IF NOT EXISTS aerocode
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aerocode;

-- ============================================================
--  ENUMS (implementados via VARCHAR + CHECK no MySQL 8)
-- ============================================================

-- ============================================================
--  Tabela: funcionarios
-- ============================================================
CREATE TABLE IF NOT EXISTS funcionarios (
  id              VARCHAR(36)  NOT NULL PRIMARY KEY,
  nome            VARCHAR(200) NOT NULL,
  telefone        VARCHAR(20)  NOT NULL,
  endereco        VARCHAR(500) NOT NULL,
  usuario         VARCHAR(60)  NOT NULL UNIQUE,
  senha_hash      VARCHAR(255) NOT NULL,
  nivel_permissao ENUM('ADMINISTRADOR','ENGENHEIRO','OPERADOR') NOT NULL,
  criado_em       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  atualizado_em   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX idx_funcionarios_nivel (nivel_permissao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Tabela: aeronaves
-- ============================================================
CREATE TABLE IF NOT EXISTS aeronaves (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  codigo        VARCHAR(30)  NOT NULL UNIQUE,
  modelo        VARCHAR(120) NOT NULL,
  tipo          ENUM('COMERCIAL','MILITAR') NOT NULL,
  capacidade    INT UNSIGNED NOT NULL,
  alcance       DOUBLE       NOT NULL,
  criado_em     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  atualizado_em DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX idx_aeronaves_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Tabela: pecas
-- ============================================================
CREATE TABLE IF NOT EXISTS pecas (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  aeronave_id   VARCHAR(36)  NOT NULL,
  nome          VARCHAR(120) NOT NULL,
  tipo          ENUM('NACIONAL','IMPORTADA') NOT NULL,
  fornecedor    VARCHAR(120) NOT NULL,
  status        ENUM('EM_PRODUCAO','EM_TRANSPORTE','PRONTA') NOT NULL,
  criado_em     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  atualizado_em DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX idx_pecas_aeronave (aeronave_id),
  INDEX idx_pecas_status   (status),

  CONSTRAINT fk_pecas_aeronave
    FOREIGN KEY (aeronave_id) REFERENCES aeronaves(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Tabela: etapas
-- ============================================================
CREATE TABLE IF NOT EXISTS etapas (
  id            VARCHAR(36)  NOT NULL PRIMARY KEY,
  aeronave_id   VARCHAR(36)  NOT NULL,
  nome          VARCHAR(120) NOT NULL,
  prazo         DATETIME(3)  NOT NULL,
  status        ENUM('PENDENTE','ANDAMENTO','CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
  criado_em     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  atualizado_em DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  INDEX idx_etapas_aeronave (aeronave_id),
  INDEX idx_etapas_status   (status),

  CONSTRAINT fk_etapas_aeronave
    FOREIGN KEY (aeronave_id) REFERENCES aeronaves(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Tabela: etapa_funcionarios  (N:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS etapa_funcionarios (
  etapa_id       VARCHAR(36) NOT NULL,
  funcionario_id VARCHAR(36) NOT NULL,

  PRIMARY KEY (etapa_id, funcionario_id),

  CONSTRAINT fk_etapafunc_etapa
    FOREIGN KEY (etapa_id) REFERENCES etapas(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_etapafunc_funcionario
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Tabela: testes
-- ============================================================
CREATE TABLE IF NOT EXISTS testes (
  id          VARCHAR(36) NOT NULL PRIMARY KEY,
  aeronave_id VARCHAR(36) NOT NULL,
  tipo        ENUM('ELETRICO','HIDRAULICO','AERODINAMICO') NOT NULL,
  resultado   ENUM('APROVADO','REPROVADO') NOT NULL,
  criado_em   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX idx_testes_aeronave  (aeronave_id),
  INDEX idx_testes_resultado (resultado),

  CONSTRAINT fk_testes_aeronave
    FOREIGN KEY (aeronave_id) REFERENCES aeronaves(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Tabela: relatorios
-- ============================================================
CREATE TABLE IF NOT EXISTS relatorios (
  id           VARCHAR(36)  NOT NULL PRIMARY KEY,
  aeronave_id  VARCHAR(36)  NOT NULL,
  cliente      VARCHAR(200) NOT NULL,
  data_entrega DATETIME(3)  NOT NULL,
  conteudo     LONGTEXT     NOT NULL,
  criado_em    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX idx_relatorios_aeronave (aeronave_id),

  CONSTRAINT fk_relatorios_aeronave
    FOREIGN KEY (aeronave_id) REFERENCES aeronaves(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Tabela: ordens_fabricacao
-- ============================================================
CREATE TABLE IF NOT EXISTS ordens_fabricacao (
  id             VARCHAR(36)  NOT NULL PRIMARY KEY,
  codigo         VARCHAR(30)  NOT NULL UNIQUE,
  descricao      TEXT         NOT NULL,
  status         ENUM('ABERTA','EM_ANDAMENTO','CONCLUIDA','CANCELADA') NOT NULL DEFAULT 'ABERTA',
  prioridade     ENUM('BAIXA','MEDIA','ALTA','CRITICA') NOT NULL DEFAULT 'MEDIA',
  data_abertura  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  data_fechamento DATETIME(3) NULL,
  aeronave_id    VARCHAR(36)  NOT NULL,
  responsavel_id VARCHAR(36)  NOT NULL,
  criado_em      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  atualizado_em  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

  -- Regra: data_fechamento só pode existir em ordens concluídas ou canceladas
  CONSTRAINT chk_data_fechamento
    CHECK (
      data_fechamento IS NULL
      OR status IN ('CONCLUIDA', 'CANCELADA')
    ),

  INDEX idx_ordens_aeronave    (aeronave_id),
  INDEX idx_ordens_responsavel (responsavel_id),
  INDEX idx_ordens_status      (status),
  INDEX idx_ordens_prioridade  (prioridade),

  CONSTRAINT fk_ordens_aeronave
    FOREIGN KEY (aeronave_id) REFERENCES aeronaves(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_ordens_responsavel
    FOREIGN KEY (responsavel_id) REFERENCES funcionarios(id)
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  Tabela: ordem_pecas  (N:N com quantidade)
-- ============================================================
CREATE TABLE IF NOT EXISTS ordem_pecas (
  id         VARCHAR(36)  NOT NULL PRIMARY KEY,
  ordem_id   VARCHAR(36)  NOT NULL,
  peca_id    VARCHAR(36)  NOT NULL,
  quantidade INT UNSIGNED NOT NULL DEFAULT 1,

  UNIQUE KEY uq_ordem_peca (ordem_id, peca_id),
  INDEX idx_ordem_pecas_peca (peca_id),

  CONSTRAINT fk_ordempeca_ordem
    FOREIGN KEY (ordem_id) REFERENCES ordens_fabricacao(id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  CONSTRAINT fk_ordempeca_peca
    FOREIGN KEY (peca_id) REFERENCES pecas(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
