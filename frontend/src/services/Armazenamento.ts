const PREFIXO = "aerocode:";

export class Armazenamento {

  static salvar<T>(chave: string, dados: T): void {
    try {
      const json = JSON.stringify(dados);
      localStorage.setItem(PREFIXO + chave, json);
    } catch (erro) {
      console.error(`Erro ao salvar "${chave}":`, erro);
    }
  }

  static carregar<T>(chave: string): T | null {
    try {
      const conteudo = localStorage.getItem(PREFIXO + chave);
      if (conteudo === null) return null;
      return JSON.parse(conteudo) as T;
    } catch (erro) {
      console.error(`Erro ao carregar "${chave}":`, erro);
      return null;
    }
  }

  static remover(chave: string): void {
    localStorage.removeItem(PREFIXO + chave);
  }

  static limpar(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIXO))
      .forEach((k) => localStorage.removeItem(k));
  }
}
