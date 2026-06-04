import { StatusEtapa } from "../enums/StatusEtapa.js";
import { Funcionario } from "./Funcionario.js";
import { Persistencia } from "../services/Persistencia.js";

export class Etapa {
  private _nome: string;
  private _prazo: string;
  private _status: StatusEtapa;
  private _funcionarios: Funcionario[];

  constructor(nome: string, prazo: string) {
    this._nome = nome;
    this._prazo = prazo;
    this._status = StatusEtapa.PENDENTE;
    this._funcionarios = [];
  }

  get nome(): string { return this._nome; }
  get prazo(): string { return this._prazo; }
  get status(): StatusEtapa { return this._status; }
  get funcionarios(): Funcionario[] { return this._funcionarios; }

  set nome(valor: string) { this._nome = valor; }
  set prazo(valor: string) { this._prazo = valor; }

  iniciar(): void {
    if (this._status !== StatusEtapa.PENDENTE) {
      console.log(`A etapa "${this._nome}" não pode ser iniciada pois está: ${this._status}`);
      return;
    }
    this._status = StatusEtapa.ANDAMENTO;
    console.log(`Etapa "${this._nome}" iniciada!`);
  }

  finalizar(): void {
    if (this._status !== StatusEtapa.ANDAMENTO) {
      console.log(`A etapa "${this._nome}" não pode ser finalizada pois está: ${this._status}`);
      return;
    }
    this._status = StatusEtapa.CONCLUIDA;
    console.log(`Etapa "${this._nome}" concluída!`);
  }

  associarFuncionario(funcionario: Funcionario): void {
    const jaExiste = this._funcionarios.some(f => f.id === funcionario.id);
    if (jaExiste) {
      console.log(`Funcionário "${funcionario.nome}" já está associado a esta etapa.`);
      return;
    }
    this._funcionarios.push(funcionario);
    console.log(`Funcionário "${funcionario.nome}" associado à etapa "${this._nome}".`);
  }

  listarFuncionarios(): void {
    if (this._funcionarios.length === 0) {
      console.log(`Nenhum funcionário associado à etapa "${this._nome}".`);
      return;
    }
    console.log(`Funcionários da etapa "${this._nome}":`);
    this._funcionarios.forEach(f => f.exibirDetalhes());
  }

  exibirDetalhes(): void {
    console.log(`Nome: ${this._nome}`);
    console.log(`Prazo: ${this._prazo}`);
    console.log(`Status: ${this._status}`);
    console.log(`Funcionários associados: ${this._funcionarios.length}`);
  }

  salvar(caminho: string): void {
    Persistencia.salvar(caminho, {
      nome: this._nome,
      prazo: this._prazo,
      status: this._status,
      funcionarios: this._funcionarios.map(f => ({
        id: f.id,
        nome: f.nome,
        telefone: f.telefone,
        endereco: f.endereco,
        usuario: f.usuario,
        nivelPermissao: f.nivelPermissao
      }))
    });
  }

  static carregar(caminho: string): Etapa | null {
    const dados = Persistencia.carregar(caminho) as any;
    if (!dados) return null;

    const etapa = new Etapa(dados.nome, dados.prazo);
    etapa._status = dados.status;

    dados.funcionarios?.forEach((f: any) => {
      const func = new Funcionario(
        f.id,
        f.nome,
        f.telefone,
        f.endereco,
        f.usuario,
        "",
        f.nivelPermissao
      );
      etapa._funcionarios.push(func);
    });

    return etapa;
  }
}