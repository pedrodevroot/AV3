import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Botao from '../../components/Botao'
import Input from '../../components/Input'
import Logo from '../../components/Logo'

export default function Login() {
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCarregando(true)
    setErro('')

    window.setTimeout(() => {
      const ok = login(nome, senha)
      setCarregando(false)
      if (!ok) {
        setErro('Usuário ou senha inválidos')
        return
      }
      navigate('/aeronaves')
    }, 250)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute top-1/4 -left-40 w-[28rem] h-[28rem] bg-blue-600 rounded-full blur-[120px] opacity-20" />
      <div className="pointer-events-none absolute bottom-1/4 -right-40 w-[28rem] h-[28rem] bg-cyan-400 rounded-full blur-[120px] opacity-10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-slate-100 mb-1">
              Acessar Sistema
            </h1>
            <p className="text-sm text-slate-400">Entre com suas credenciais</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Usuário"
              value={nome}
              onChange={(v) => {
                setNome(v)
                if (erro) setErro('')
              }}
              required
              autoFocus
              autoComplete="username"
            />
            <Input
              label="Senha"
              type="password"
              value={senha}
              onChange={(v) => {
                setSenha(v)
                if (erro) setErro('')
              }}
              required
              autoComplete="current-password"
            />

            <Botao
              type="submit"
              carregando={carregando}
              tamanho="lg"
              className="mt-2 w-full"
            >
              {carregando ? 'Autenticando...' : 'Entrar'}
            </Botao>

            {erro && (
              <div className="px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-md text-sm text-rose-300 text-center">
                {erro}
              </div>
            )}
          </form>

          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 text-center mt-6 pt-5 border-t border-slate-800">
            Aerocode · Global Aerospace Systems
          </p>
        </div>
      </div>
    </div>
  )
}
