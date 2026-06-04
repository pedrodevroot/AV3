import { TipoPeca } from "../enums/TipoPeca.js";
import { StatusPeca } from "../enums/StatusPeca.js";
import { Persistencia } from "../services/Persistencia.js";

export class Peca {
  private _nome: string;
  private _tipo: TipoPeca;
  private _fornecedor: string;
  private _status: StatusPeca;

  constructor(
    nome: string,
    tipo: TipoPeca,
    fornecedor: string,
    status: StatusPeca
  ) {
    this._nome = nome;
    this._tipo = tipo;
    this._fornecedor = fornecedor;
    this._status = status;
  }

  get nome(): string { return this._nome; }
  get tipo(): TipoPeca { return this._tipo; }
  get fornecedor(): string { return this._fornecedor; }
  get status(): StatusPeca { return this._status; }

  set nome(valor: string) { this._nome = valor; }
  set tipo(valor: TipoPeca) { this._tipo = valor; }
  set fornecedor(valor: string) { this._fornecedor = valor; }

  atualizarStatus(novoStatus: StatusPeca): void {
    this._status = novoStatus;
    console.log(`Status da peça "${this._nome}" atualizado para: ${novoStatus}`);
  }

  exibirDetalhes(): void {
    console.log(`Nome: ${this._nome}`);
    console.log(`Tipo: ${this._tipo}`);
    console.log(`Fornecedor: ${this._fornecedor}`);
    console.log(`Status: ${this._status}`);
  }

  salvar(caminho: string): void {
    Persistencia.salvar(caminho, {
      nome: this._nome,
      tipo: this._tipo,
      fornecedor: this._fornecedor,
      status: this._status
    });
  }

  static carregar(caminho: string): Peca | null {
    const dados = Persistencia.carregar(caminho) as any;
    if (!dados) return null;
    return new Peca(
      dados.nome,
      dados.tipo,
      dados.fornecedor,
      dados.status
    );
  }
}

