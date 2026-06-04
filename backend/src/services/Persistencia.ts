import * as fs from "fs";

export class Persistencia {

  static salvar(caminho: string, dados: unknown): void {
    try {
      fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), "utf-8");
      console.log(`Dados salvos em: ${caminho}`);
    } catch (erro) {
      console.log(`Erro ao salvar arquivo: ${erro}`);
    }
  }

  static carregar(caminho: string): unknown {
    try {
      if (!fs.existsSync(caminho)) {
        console.log(`Arquivo não encontrado: ${caminho}`);
        return null;
      }
      const conteudo = fs.readFileSync(caminho, "utf-8");
      return JSON.parse(conteudo);
    } catch (erro) {
      console.log(`Erro ao carregar arquivo: ${erro}`);
      return null;
    }
  }
}