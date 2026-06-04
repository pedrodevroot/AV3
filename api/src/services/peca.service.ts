import { StatusPeca, TipoPeca } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { pecaRepository } from '../repositories/peca.repository';
import { aeronaveService } from './aeronave.service';

interface CreateInput {
  nome: string;
  tipo: TipoPeca;
  fornecedor: string;
  status: StatusPeca;
}

interface UpdateInput {
  nome?: string;
  tipo?: TipoPeca;
  fornecedor?: string;
  status?: StatusPeca;
}

export const pecaService = {
  async listar(codigoAeronave: string) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    return pecaRepository.findAllByAeronave(aeronave.id);
  },

  async buscarPorId(codigoAeronave: string, pecaId: string) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    const peca = await pecaRepository.findById(pecaId);

    if (!peca || peca.aeronaveId !== aeronave.id) {
      throw new AppError('Peça não encontrada', 404);
    }

    return peca;
  },

  async criar(codigoAeronave: string, data: CreateInput) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    return pecaRepository.create({ ...data, aeronaveId: aeronave.id });
  },

  async atualizar(codigoAeronave: string, pecaId: string, data: UpdateInput) {
    await this.buscarPorId(codigoAeronave, pecaId);
    return pecaRepository.update(pecaId, data);
  },

  async remover(codigoAeronave: string, pecaId: string) {
    await this.buscarPorId(codigoAeronave, pecaId);
    await pecaRepository.delete(pecaId);
  },
};
