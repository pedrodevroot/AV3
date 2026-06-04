import { AppError } from '../errors/AppError';
import { relatorioRepository } from '../repositories/relatorio.repository';
import { aeronaveRepository } from '../repositories/aeronave.repository';

interface CreateInput {
  cliente: string;
  dataEntrega: string;
}

function buildConteudo(
  aeronave: Awaited<ReturnType<typeof aeronaveRepository.findByCodigo>>,
  cliente: string,
  dataEntrega: Date,
): string {
  if (!aeronave) return '';

  const sep = '========================================';
  const linhas: string[] = [];

  linhas.push(sep);
  linhas.push('       RELATÓRIO FINAL DE ENTREGA       ');
  linhas.push(sep);
  linhas.push(`Data de Entrega: ${dataEntrega.toLocaleDateString('pt-BR')}`);
  linhas.push(`Cliente: ${cliente}`);
  linhas.push('');
  linhas.push(sep);
  linhas.push('             AERONAVE                   ');
  linhas.push(sep);
  linhas.push(`Código: ${aeronave.codigo}`);
  linhas.push(`Modelo: ${aeronave.modelo}`);
  linhas.push(`Tipo: ${aeronave.tipo}`);
  linhas.push(`Capacidade: ${aeronave.capacidade} passageiros`);
  linhas.push(`Alcance: ${aeronave.alcance} km`);
  linhas.push('');
  linhas.push(sep);
  linhas.push('               PEÇAS                    ');
  linhas.push(sep);

  if (aeronave.pecas.length === 0) {
    linhas.push('Nenhuma peça registrada.');
  } else {
    aeronave.pecas.forEach((p, i) => {
      linhas.push(`Peça ${i + 1}:`);
      linhas.push(`  Nome: ${p.nome}`);
      linhas.push(`  Tipo: ${p.tipo}`);
      linhas.push(`  Fornecedor: ${p.fornecedor}`);
      linhas.push(`  Status: ${p.status}`);
    });
  }

  linhas.push('');
  linhas.push(sep);
  linhas.push('              ETAPAS                    ');
  linhas.push(sep);

  if (aeronave.etapas.length === 0) {
    linhas.push('Nenhuma etapa registrada.');
  } else {
    aeronave.etapas.forEach((e, i) => {
      const funcionariosNomes = e.funcionarios.map(ef => ef.funcionario.nome).join(', ') || 'Nenhum';
      linhas.push(`Etapa ${i + 1}:`);
      linhas.push(`  Nome: ${e.nome}`);
      linhas.push(`  Prazo: ${new Date(e.prazo).toLocaleDateString('pt-BR')}`);
      linhas.push(`  Status: ${e.status}`);
      linhas.push(`  Funcionários: ${funcionariosNomes}`);
    });
  }

  linhas.push('');
  linhas.push(sep);
  linhas.push('              TESTES                    ');
  linhas.push(sep);

  if (aeronave.testes.length === 0) {
    linhas.push('Nenhum teste registrado.');
  } else {
    aeronave.testes.forEach((t, i) => {
      linhas.push(`Teste ${i + 1}:`);
      linhas.push(`  Tipo: ${t.tipo}`);
      linhas.push(`  Resultado: ${t.resultado}`);
    });
  }

  linhas.push('');
  linhas.push(sep);
  linhas.push('           FIM DO RELATÓRIO             ');
  linhas.push(sep);

  return linhas.join('\n');
}

export const relatorioService = {
  async listar(codigoAeronave: string) {
    const aeronave = await aeronaveRepository.findByCodigo(codigoAeronave);
    if (!aeronave) throw new AppError('Aeronave não encontrada', 404);
    return relatorioRepository.findAllByAeronave(aeronave.id);
  },

  async buscarPorId(codigoAeronave: string, relatorioId: string) {
    const aeronave = await aeronaveRepository.findByCodigo(codigoAeronave);
    if (!aeronave) throw new AppError('Aeronave não encontrada', 404);

    const relatorio = await relatorioRepository.findById(relatorioId);
    if (!relatorio || relatorio.aeronaveId !== aeronave.id) {
      throw new AppError('Relatório não encontrado', 404);
    }

    return relatorio;
  },

  async gerar(codigoAeronave: string, data: CreateInput) {
    const aeronave = await aeronaveRepository.findByCodigo(codigoAeronave);
    if (!aeronave) throw new AppError('Aeronave não encontrada', 404);

    if (aeronave.etapas.length === 0) {
      throw new AppError('A aeronave não possui etapas cadastradas', 422);
    }

    const todasConcluidas = aeronave.etapas.every(e => e.status === 'CONCLUIDA');
    if (!todasConcluidas) {
      throw new AppError(
        'Produção não concluída. Todas as etapas devem estar com status CONCLUIDA para gerar o relatório.',
        422,
      );
    }

    const dataEntrega = new Date(data.dataEntrega);
    const conteudo = buildConteudo(aeronave, data.cliente, dataEntrega);

    return relatorioRepository.create({
      aeronaveId: aeronave.id,
      cliente: data.cliente,
      dataEntrega,
      conteudo,
    });
  },
};
