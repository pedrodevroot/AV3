import { TipoAeronave } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { aeronaveRepository } from '../repositories/aeronave.repository';

interface CreateInput {
  codigo: string;
  modelo: string;
  tipo: TipoAeronave;
  capacidade: number;
  alcance: number;
}

interface UpdateInput {
  modelo?: string;
  tipo?: TipoAeronave;
  capacidade?: number;
  alcance?: number;
}

export const aeronaveService = {
  async listar() {
    return aeronaveRepository.findAll();
  },

  async buscarPorCodigo(codigo: string) {
    const aeronave = await aeronaveRepository.findByCodigo(codigo);
    if (!aeronave) throw new AppError('Aeronave não encontrada', 404);
    return aeronave;
  },

  async criar(data: CreateInput) {
    const existente = await aeronaveRepository.findByCodigo(data.codigo);
    if (existente) throw new AppError(`Código "${data.codigo}" já está em uso`, 409);
    return aeronaveRepository.create(data);
  },

  async atualizar(codigo: string, data: UpdateInput) {
    const aeronave = await aeronaveRepository.findByCodigo(codigo);
    if (!aeronave) throw new AppError('Aeronave não encontrada', 404);
    return aeronaveRepository.update(codigo, data);
  },

  async remover(codigo: string) {
    const aeronave = await aeronaveRepository.findByCodigo(codigo);
    if (!aeronave) throw new AppError('Aeronave não encontrada', 404);
    await aeronaveRepository.delete(codigo);
  },

  async verificarExistencia(codigo: string) {
    const aeronave = await aeronaveRepository.findByCodigo(codigo);
    if (!aeronave) throw new AppError('Aeronave não encontrada', 404);
    return aeronave;
  },
};
