import { TipoTeste } from "../enums/TipoTeste.js";
import { ResultadoTeste } from "../enums/ResultadoTeste.js";
import { Persistencia } from "../services/Persistencia.js";

export class Teste {
  private _tipo: TipoTeste;
  private _resultado: ResultadoTeste;

  constructor(tipo: TipoTeste, resultado: ResultadoTeste) {
    this._tipo = tipo;
    this._resultado = resultado;
  }

  get tipo(): TipoTeste { return this._tipo; }
  get resultado(): ResultadoTeste { return this._resultado; }

  set tipo(valor: TipoTeste) { this._tipo = valor; }
  set resultado(valor: ResultadoTeste) { this._resultado = valor; }

  exibirDetalhes(): void {
    console.log(`Tipo de Teste: ${this._tipo}`);
    console.log(`Resultado: ${this._resultado}`);
  }

  salvar(caminho: string): void {
    Persistencia.salvar(caminho, {
      tipo: this._tipo,
      resultado: this._resultado
    });
  }

  static carregar(caminho: string): Teste | null {
    const dados = Persistencia.carregar(caminho) as any;
    if (!dados) return null;
    return new Teste(
      dados.tipo,
      dados.resultado
    );
  }
}