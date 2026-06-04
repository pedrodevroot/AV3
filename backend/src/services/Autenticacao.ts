import { Funcionario } from "../models/Funcionario.js";
import { NivelPermissao } from "../enums/NivelPermissao.js";

export class Autenticacao {
  private static funcionarioLogado: Funcionario | null = null;

  static login(usuario: string, senha: string, funcionarios: Funcionario[]): boolean {
    const encontrado = funcionarios.find(f => f.autenticar(usuario, senha));
    if (encontrado) {
      this.funcionarioLogado = encontrado;
      console.log(`\nBem-vindo, ${encontrado.nome}! [${encontrado.nivelPermissao}]`);
      return true;
    }
    console.log(`\nUsuário ou senha inválidos.`);
    return false;
  }

  static logout(): void {
    console.log(`\nAté logo, ${this.funcionarioLogado?.nome}!`);
    this.funcionarioLogado = null;
  }

  static getFuncionarioLogado(): Funcionario | null {
    return this.funcionarioLogado;
  }

  static estaLogado(): boolean {
    return this.funcionarioLogado !== null;
  }

  static temPermissao(nivel: NivelPermissao): boolean {
    if (!this.funcionarioLogado) {
      console.log(`\nAcesso negado. Faça login primeiro.`);
      return false;
    }

    const hierarquia = [
      NivelPermissao.OPERADOR,
      NivelPermissao.ENGENHEIRO,
      NivelPermissao.ADMINISTRADOR
    ];

    const nivelUsuario = hierarquia.indexOf(this.funcionarioLogado.nivelPermissao);
    const nivelNecessario = hierarquia.indexOf(nivel);

    if (nivelUsuario < nivelNecessario) {
      console.log(`\nAcesso negado. Você não tem permissão suficiente.`);
      return false;
    }

    return true;
  }
}