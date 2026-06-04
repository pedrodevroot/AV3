import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Funcionario } from "../types";
import { Armazenamento } from "../services/Armazenamento";

interface AuthContextValue {
  usuario: Funcionario | null;
  login: (usuario: string, senha: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CHAVE_FUNCIONARIOS = "funcionarios";
const CHAVE_USUARIO = "usuarioAtual";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Funcionario | null>(() =>
    Armazenamento.carregar<Funcionario>(CHAVE_USUARIO)
  );

  function login(nomeUsuario: string, senha: string): boolean {
    const funcionarios =
      Armazenamento.carregar<Funcionario[]>(CHAVE_FUNCIONARIOS) ?? [];

    const encontrado = funcionarios.find(
      (f) => f.usuario === nomeUsuario && f.senha === senha
    );

    if (!encontrado) return false;

    setUsuario(encontrado);
    Armazenamento.salvar<Funcionario>(CHAVE_USUARIO, encontrado);
    return true;
  }

  function logout(): void {
    setUsuario(null);
    Armazenamento.remover(CHAVE_USUARIO);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
