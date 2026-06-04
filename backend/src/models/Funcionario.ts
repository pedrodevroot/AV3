import { NivelPermissao } from "../enums/NivelPermissao.js";
import { Persistencia } from "../services/Persistencia.js";

export class Funcionario {
  private _id: string;
  private _nome: string;
  private _telefone: string;
  private _endereco: string;
  private _usuario: string;
  private _senha: string;
  private _nivelPermissao: NivelPermissao;

  constructor(
    id: string,
    nome: string,
    telefone: string,
    endereco: string,
    usuario: string,
    senha: string,
    nivelPermissao: NivelPermissao
  ) {
    this._id = id;
    this._nome = nome;
    this._telefone = telefone;
    this._endereco = endereco;
    this._usuario = usuario;
    this._senha = senha;
    this._nivelPermissao = nivelPermissao;
  }

  get id(): string { return this._id; }
  get nome(): string { return this._nome; }
  get telefone(): string { return this._telefone; }
  get endereco(): string { return this._endereco; }
  get usuario(): string { return this._usuario; }
  get nivelPermissao(): NivelPermissao { return this._nivelPermissao; }
  getSenha(): string { return this._senha; }

  set nome(valor: string) { this._nome = valor; }
  set telefone(valor: string) { this._telefone = valor; }
  set endereco(valor: string) { this._endereco = valor; }
  set usuario(valor: string) { this._usuario = valor; }
  set senha(valor: string) { this._senha = valor; }
  set nivelPermissao(valor: NivelPermissao) { this._nivelPermissao = valor; }

  autenticar(usuario: string, senha: string): boolean {
    return this._usuario === usuario && this._senha === senha;
  }

  exibirDetalhes(): void {
    console.log(`ID: ${this._id}`);
    console.log(`Nome: ${this._nome}`);
    console.log(`Telefone: ${this._telefone}`);
    console.log(`Endereço: ${this._endereco}`);
    console.log(`Usuário: ${this._usuario}`);
    console.log(`Nível de Permissão: ${this._nivelPermissao}`);
  }

  salvar(caminho: string): void {
    Persistencia.salvar(caminho, {
      id: this._id,
      nome: this._nome,
      telefone: this._telefone,
      endereco: this._endereco,
      usuario: this._usuario,
      senha: this._senha,
      nivelPermissao: this._nivelPermissao
    });
  }

  static carregar(caminho: string): Funcionario | null {
    const dados = Persistencia.carregar(caminho) as any;
    if (!dados) return null;
    return new Funcionario(
      dados.id,
      dados.nome,
      dados.telefone,
      dados.endereco,
      dados.usuario,
      dados.senha,
      dados.nivelPermissao
    );
  }
}