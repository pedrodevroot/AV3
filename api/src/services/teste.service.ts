import { TipoTeste, ResultadoTeste } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { testeRepository } from '../repositories/teste.repository';
import { aeronaveService } from './aeronave.service';

interface CreateInput {
  tipo: TipoTeste;
  resultado: ResultadoTeste;
}

export const testeService = {
  async listar(codigoAeronave: string) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    return testeRepository.findAllByAeronave(aeronave.id);
  },

  async criar(codigoAeronave: string, data: CreateInput) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    return testeRepository.create({ ...data, aeronaveId: aeronave.id });
  },

  async remover(codigoAeronave: string, testeId: string) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    const teste = await testeRepository.findById(testeId);

    if (!teste || teste.aeronaveId !== aeronave.id) {
      throw new AppError('Teste não encontrado', 404);
    }

    await testeRepository.delete(testeId);
  },
};
