import * as fs from "fs";
import { Aeronave } from "../models/Aeronave.js";

export class Relatorio {
  private _aeronave: Aeronave;
  private _cliente: string;
  private _dataEntrega: string;

  constructor(aeronave: Aeronave, cliente: string, dataEntrega: string) {
    this._aeronave = aeronave;
    this._cliente = cliente;
    this._dataEntrega = dataEntrega;
  }

  get aeronave(): Aeronave { return this._aeronave; }
  get cliente(): string { return this._cliente; }
  get dataEntrega(): string { return this._dataEntrega; }

  set cliente(valor: string) { this._cliente = valor; }
  set dataEntrega(valor: string) { this._dataEntrega = valor; }

  gerar(): string {
    const linhas: string[] = [];

    linhas.push(`========================================`);
    linhas.push(`       RELATÓRIO FINAL DE ENTREGA       `);
    linhas.push(`========================================`);
    linhas.push(`Data de Entrega: ${this._dataEntrega}`);
    linhas.push(`Cliente: ${this._cliente}`);
    linhas.push(``);

    linhas.push(`========================================`);
    linhas.push(`             AERONAVE                   `);
    linhas.push(`========================================`);
    linhas.push(`Código: ${this._aeronave.codigo}`);
    linhas.push(`Modelo: ${this._aeronave.modelo}`);
    linhas.push(`Tipo: ${this._aeronave.tipo}`);
    linhas.push(`Capacidade: ${this._aeronave.capacidade} passageiros`);
    linhas.push(`Alcance: ${this._aeronave.alcance} km`);
    linhas.push(``);

    linhas.push(`========================================`);
    linhas.push(`               PEÇAS                    `);
    linhas.push(`========================================`);
    if (this._aeronave.pecas.length === 0) {
      linhas.push(`Nenhuma peça registrada.`);
    } else {
      this._aeronave.pecas.forEach((p, i) => {
        linhas.push(`Peça ${i + 1}:`);
        linhas.push(`  Nome: ${p.nome}`);
        linhas.push(`  Tipo: ${p.tipo}`);
        linhas.push(`  Fornecedor: ${p.fornecedor}`);
        linhas.push(`  Status: ${p.status}`);
      });
    }
    linhas.push(``);

    linhas.push(`========================================`);
    linhas.push(`              ETAPAS                    `);
    linhas.push(`========================================`);
    if (this._aeronave.etapas.length === 0) {
      linhas.push(`Nenhuma etapa registrada.`);
    } else {
      this._aeronave.etapas.forEach((e, i) => {
        linhas.push(`Etapa ${i + 1}:`);
        linhas.push(`  Nome: ${e.nome}`);
        linhas.push(`  Prazo: ${e.prazo}`);
        linhas.push(`  Status: ${e.status}`);
        linhas.push(`  Funcionários: ${e.funcionarios.map(f => f.nome).join(", ") || "Nenhum"}`);
      });
    }
    linhas.push(``);

    linhas.push(`========================================`);
    linhas.push(`              TESTES                    `);
    linhas.push(`========================================`);
    if (this._aeronave.testes.length === 0) {
      linhas.push(`Nenhum teste registrado.`);
    } else {
      this._aeronave.testes.forEach((t, i) => {
        linhas.push(`Teste ${i + 1}:`);
        linhas.push(`  Tipo: ${t.tipo}`);
        linhas.push(`  Resultado: ${t.resultado}`);
      });
    }
    linhas.push(``);
    linhas.push(`========================================`);
    linhas.push(`           FIM DO RELATÓRIO             `);
    linhas.push(`========================================`);

    return linhas.join("\n");
  }

  salvar(): void {
    const conteudo = this.gerar();
    const nomeArquivo = `data/relatorio_${this._aeronave.codigo}_${Date.now()}.txt`;

    try {
      fs.writeFileSync(nomeArquivo, conteudo, "utf-8");
      console.log(`\nRelatório gerado com sucesso: ${nomeArquivo}`);
    } catch (erro) {
      console.log(`\nErro ao gerar relatório: ${erro}`);
    }
  }
}