import { StatusEtapa } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { etapaRepository } from '../repositories/etapa.repository';
import { aeronaveService } from './aeronave.service';
import { funcionarioRepository } from '../repositories/funcionario.repository';

interface CreateInput {
  nome: string;
  prazo: string;
}

interface UpdateInput {
  nome?: string;
  prazo?: string;
}

export const etapaService = {
  async listar(codigoAeronave: string) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    return etapaRepository.findAllByAeronave(aeronave.id);
  },

  async buscarPorId(codigoAeronave: string, etapaId: string) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    const etapa = await etapaRepository.findById(etapaId);

    if (!etapa || etapa.aeronaveId !== aeronave.id) {
      throw new AppError('Etapa não encontrada', 404);
    }

    return etapa;
  },

  async criar(codigoAeronave: string, data: CreateInput) {
    const aeronave = await aeronaveService.verificarExistencia(codigoAeronave);
    return etapaRepository.create({
      aeronaveId: aeronave.id,
      nome: data.nome,
      prazo: new Date(data.prazo),
    });
  },

  async atualizar(codigoAeronave: string, etapaId: string, data: UpdateInput) {
    await this.buscarPorId(codigoAeronave, etapaId);
    return etapaRepository.update(etapaId, {
      nome: data.nome,
      prazo: data.prazo ? new Date(data.prazo) : undefined,
    });
  },

  async iniciar(codigoAeronave: string, etapaId: string) {
    const etapa = await this.buscarPorId(codigoAeronave, etapaId);

    if (etapa.status !== StatusEtapa.PENDENTE) {
      throw new AppError(
        `A etapa não pode ser iniciada pois está com status: ${etapa.status}`,
        422,
      );
    }

    return etapaRepository.updateStatus(etapaId, StatusEtapa.ANDAMENTO);
  },

  async finalizar(codigoAeronave: string, etapaId: string) {
    const etapa = await this.buscarPorId(codigoAeronave, etapaId);

    if (etapa.status !== StatusEtapa.ANDAMENTO) {
      throw new AppError(
        `A etapa não pode ser finalizada pois está com status: ${etapa.status}`,
        422,
      );
    }

    return etapaRepository.updateStatus(etapaId, StatusEtapa.CONCLUIDA);
  },

  async associarFuncionario(codigoAeronave: string, etapaId: string, funcionarioId: string) {
    await this.buscarPorId(codigoAeronave, etapaId);

    const funcionario = await funcionarioRepository.exists(funcionarioId);
    if (!funcionario) throw new AppError('Funcionário não encontrado', 404);

    const jaAssociado = await etapaRepository.funcionarioJaAssociado(etapaId, funcionarioId);
    if (jaAssociado) throw new AppError('Funcionário já está associado a esta etapa', 409);

    await etapaRepository.associarFuncionario(etapaId, funcionarioId);
    return etapaRepository.findById(etapaId);
  },

  async desassociarFuncionario(codigoAeronave: string, etapaId: string, funcionarioId: string) {
    await this.buscarPorId(codigoAeronave, etapaId);

    const associacao = await etapaRepository.funcionarioJaAssociado(etapaId, funcionarioId);
    if (!associacao) throw new AppError('Funcionário não está associado a esta etapa', 404);

    await etapaRepository.desassociarFuncionario(etapaId, funcionarioId);
  },

  async remover(codigoAeronave: string, etapaId: string) {
    const etapa = await this.buscarPorId(codigoAeronave, etapaId);

    if (etapa.status === StatusEtapa.ANDAMENTO) {
      throw new AppError('Não é possível remover uma etapa em andamento', 422);
    }

    await etapaRepository.delete(etapaId);
  },
};
