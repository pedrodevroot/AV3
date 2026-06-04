import { StatusOrdem, PrioridadeOrdem } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { ordemRepository } from '../repositories/ordem.repository';
import { aeronaveRepository } from '../repositories/aeronave.repository';
import { pecaRepository } from '../repositories/peca.repository';
import { funcionarioRepository } from '../repositories/funcionario.repository';
import prisma from '../repositories/prisma';

interface CreateInput {
  codigo: string;
  descricao: string;
  prioridade: PrioridadeOrdem;
  aeronaveId: string;
  responsavelId: string;
}

interface UpdateInput {
  descricao?: string;
  prioridade?: PrioridadeOrdem;
  status?: StatusOrdem;
  dataFechamento?: string;
}

interface Filters {
  status?: StatusOrdem;
  prioridade?: PrioridadeOrdem;
}

const TRANSICOES_VALIDAS: Partial<Record<StatusOrdem, StatusOrdem[]>> = {
  [StatusOrdem.ABERTA]: [StatusOrdem.EM_ANDAMENTO, StatusOrdem.CANCELADA],
  [StatusOrdem.EM_ANDAMENTO]: [StatusOrdem.CONCLUIDA, StatusOrdem.CANCELADA],
};

async function resolverAeronaveId(aeronaveId: string): Promise<string> {
  // Aceita tanto o código da aeronave quanto o ID interno
  const porCodigo = await aeronaveRepository.findByCodigo(aeronaveId);
  if (porCodigo) return porCodigo.id;

  const porId = await prisma.aeronave.findUnique({ where: { id: aeronaveId } });
  if (!porId) throw new AppError('Aeronave não encontrada', 404);

  return porId.id;
}

export const ordemService = {
  async listar(filters?: Filters) {
    return ordemRepository.findAll(filters);
  },

  async buscarPorId(id: string) {
    const ordem = await ordemRepository.findById(id);
    if (!ordem) throw new AppError('Ordem de fabricação não encontrada', 404);
    return ordem;
  },

  async criar(data: CreateInput, responsavelId: string) {
    const existente = await ordemRepository.findByCodigo(data.codigo);
    if (existente) throw new AppError(`Código "${data.codigo}" já está em uso`, 409);

    const aeronaveInternalId = await resolverAeronaveId(data.aeronaveId);

    const responsavel = await funcionarioRepository.exists(responsavelId);
    if (!responsavel) throw new AppError('Responsável não encontrado', 404);

    return ordemRepository.create({
      ...data,
      aeronaveId: aeronaveInternalId,
      responsavelId,
    });
  },

  async atualizar(id: string, data: UpdateInput) {
    const ordem = await ordemRepository.findById(id);
    if (!ordem) throw new AppError('Ordem de fabricação não encontrada', 404);

    if (data.status && data.status !== ordem.status) {
      const transicoesPossiveis = TRANSICOES_VALIDAS[ordem.status] ?? [];
      if (!transicoesPossiveis.includes(data.status)) {
        const possiveis = transicoesPossiveis.join(', ') || 'nenhuma';
        throw new AppError(
          `Transição inválida: ${ordem.status} → ${data.status}. Permitidas: ${possiveis}`,
          422,
        );
      }
    }

    const updateData: Parameters<typeof ordemRepository.update>[1] = {
      descricao: data.descricao,
      prioridade: data.prioridade,
      status: data.status,
      dataFechamento: data.dataFechamento ? new Date(data.dataFechamento) : undefined,
    };

    // Fecha automaticamente ao concluir ou cancelar
    if (
      (data.status === StatusOrdem.CONCLUIDA || data.status === StatusOrdem.CANCELADA) &&
      !updateData.dataFechamento
    ) {
      updateData.dataFechamento = new Date();
    }

    return ordemRepository.update(id, updateData);
  },

  async remover(id: string) {
    const ordem = await ordemRepository.findById(id);
    if (!ordem) throw new AppError('Ordem de fabricação não encontrada', 404);

    if (ordem.status === StatusOrdem.EM_ANDAMENTO) {
      throw new AppError('Não é possível remover uma ordem em andamento', 422);
    }

    await ordemRepository.delete(id);
  },

  async adicionarPeca(ordemId: string, pecaId: string, quantidade: number) {
    const ordem = await ordemRepository.findById(ordemId);
    if (!ordem) throw new AppError('Ordem de fabricação não encontrada', 404);

    if (ordem.status === StatusOrdem.CONCLUIDA || ordem.status === StatusOrdem.CANCELADA) {
      throw new AppError('Não é possível modificar peças de uma ordem concluída ou cancelada', 422);
    }

    const peca = await pecaRepository.findById(pecaId);
    if (!peca) throw new AppError('Peça não encontrada', 404);

    if (peca.aeronaveId !== ordem.aeronaveId) {
      throw new AppError('A peça não pertence à aeronave desta ordem', 422);
    }

    const jaExiste = await ordemRepository.findOrdemPeca(ordemId, pecaId);
    if (jaExiste) throw new AppError('Peça já adicionada a esta ordem', 409);

    return ordemRepository.addPeca({ ordemId, pecaId, quantidade });
  },

  async atualizarQuantidadePeca(ordemId: string, pecaId: string, quantidade: number) {
    const ordem = await ordemRepository.findById(ordemId);
    if (!ordem) throw new AppError('Ordem de fabricação não encontrada', 404);

    const item = await ordemRepository.findOrdemPeca(ordemId, pecaId);
    if (!item) throw new AppError('Peça não encontrada nesta ordem', 404);

    return ordemRepository.updateQuantidadePeca(ordemId, pecaId, quantidade);
  },

  async removerPeca(ordemId: string, pecaId: string) {
    const ordem = await ordemRepository.findById(ordemId);
    if (!ordem) throw new AppError('Ordem de fabricação não encontrada', 404);

    const item = await ordemRepository.findOrdemPeca(ordemId, pecaId);
    if (!item) throw new AppError('Peça não encontrada nesta ordem', 404);

    await ordemRepository.removePeca(ordemId, pecaId);
  },
};
