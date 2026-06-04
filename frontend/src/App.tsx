import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { DadosProvider } from './contexts/DadosContext'
import RotaProtegida from './components/RotaProtegida'
import Login from './pages/Login/Login'
import GerenciarAeronaves from './pages/Aeronaves/GerenciarAeronaves'
import AeronaveDetalhes from './pages/Aeronaves/AeronaveDetalhes'
import GerenciarFuncionarios from './pages/Funcionarios/GerenciarFuncionarios'

function App() {
  return (
    <BrowserRouter>
      <DadosProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/aeronaves"
              element={
                <RotaProtegida>
                  <GerenciarAeronaves />
                </RotaProtegida>
              }
            />

            <Route
              path="/aeronaves/:codigo"
              element={
                <RotaProtegida>
                  <AeronaveDetalhes />
                </RotaProtegida>
              }
            />

            <Route
              path="/funcionarios"
              element={
                <RotaProtegida>
                  <GerenciarFuncionarios />
                </RotaProtegida>
              }
            />
          </Routes>
        </AuthProvider>
      </DadosProvider>
    </BrowserRouter>
  )
}

export default App
