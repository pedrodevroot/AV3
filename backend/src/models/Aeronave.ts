import { TipoAeronave } from "../enums/TipoAeronave.js";
import { Peca } from "./Peca.js";
import { Etapa } from "./Etapa.js";
import { Teste } from "./Teste.js";
import { StatusEtapa } from "../enums/StatusEtapa.js";
import { Persistencia } from "../services/Persistencia.js";

export class Aeronave {
  private _codigo: string;
  private _modelo: string;
  private _tipo: TipoAeronave;
  private _capacidade: number;
  private _alcance: number;
  private _pecas: Peca[];
  private _etapas: Etapa[];
  private _testes: Teste[];

  constructor(
    codigo: string,
    modelo: string,
    tipo: TipoAeronave,
    capacidade: number,
    alcance: number
  ) {
    this._codigo = codigo;
    this._modelo = modelo;
    this._tipo = tipo;
    this._capacidade = capacidade;
    this._alcance = alcance;
    this._pecas = [];
    this._etapas = [];
    this._testes = [];
  }

  get codigo(): string { return this._codigo; }
  get modelo(): string { return this._modelo; }
  get tipo(): TipoAeronave { return this._tipo; }
  get capacidade(): number { return this._capacidade; }
  get alcance(): number { return this._alcance; }
  get pecas(): Peca[] { return this._pecas; }
  get etapas(): Etapa[] { return this._etapas; }
  get testes(): Teste[] { return this._testes; }

  set modelo(valor: string) { this._modelo = valor; }
  set tipo(valor: TipoAeronave) { this._tipo = valor; }
  set capacidade(valor: number) { this._capacidade = valor; }
  set alcance(valor: number) { this._alcance = valor; }

  adicionarPeca(peca: Peca): void {
    this._pecas.push(peca);
    console.log(`Peça "${peca.nome}" adicionada à aeronave "${this._modelo}".`);
  }

  adicionarEtapa(etapa: Etapa): void {
    this._etapas.push(etapa);
    console.log(`Etapa "${etapa.nome}" adicionada à aeronave "${this._modelo}".`);
  }

  adicionarTeste(teste: Teste): void {
    this._testes.push(teste);
    console.log(`Teste "${teste.tipo}" adicionado à aeronave "${this._modelo}".`);
  }

  producaoConcluida(): boolean {
    return this._etapas.every(e => e.status === StatusEtapa.CONCLUIDA);
  }

  exibirDetalhes(): void {
    console.log(`\n===== AERONAVE =====`);
    console.log(`Código: ${this._codigo}`);
    console.log(`Modelo: ${this._modelo}`);
    console.log(`Tipo: ${this._tipo}`);
    console.log(`Capacidade: ${this._capacidade} passageiros`);
    console.log(`Alcance: ${this._alcance} km`);

    console.log(`\n--- Peças (${this._pecas.length}) ---`);
    this._pecas.forEach(p => p.exibirDetalhes());

    console.log(`\n--- Etapas (${this._etapas.length}) ---`);
    this._etapas.forEach(e => e.exibirDetalhes());

    console.log(`\n--- Testes (${this._testes.length}) ---`);
    this._testes.forEach(t => t.exibirDetalhes());
  }

  salvar(caminho: string): void {
    Persistencia.salvar(caminho, {
      codigo: this._codigo,
      modelo: this._modelo,
      tipo: this._tipo,
      capacidade: this._capacidade,
      alcance: this._alcance,
      pecas: this._pecas.map(p => ({
        nome: p.nome,
        tipo: p.tipo,
        fornecedor: p.fornecedor,
        status: p.status
      })),
      etapas: this._etapas.map(e => ({
        nome: e.nome,
        prazo: e.prazo,
        status: e.status,
        funcionarios: e.funcionarios.map(f => ({
          id: f.id,
          nome: f.nome,
          telefone: f.telefone,
          endereco: f.endereco,
          usuario: f.usuario,
          nivelPermissao: f.nivelPermissao
        }))
      })),
      testes: this._testes.map(t => ({
        tipo: t.tipo,
        resultado: t.resultado
      }))
    });
  }

  static carregar(caminho: string): Aeronave | null {
    const dados = Persistencia.carregar(caminho) as any;
    if (!dados) return null;

    const aeronave = new Aeronave(
      dados.codigo,
      dados.modelo,
      dados.tipo,
      dados.capacidade,
      dados.alcance
    );

    dados.pecas?.forEach((p: any) => {
      aeronave._pecas.push(new Peca(p.nome, p.tipo, p.fornecedor, p.status));
    });

    dados.etapas?.forEach((e: any) => {
      const etapa = new Etapa(e.nome, e.prazo);
      etapa["_status"] = e.status;
      aeronave._etapas.push(etapa);
    });

    dados.testes?.forEach((t: any) => {
      aeronave._testes.push(new Teste(t.tipo, t.resultado));
    });

    return aeronave;
  }
}