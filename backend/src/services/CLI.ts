import * as readline from "readline";
import { Aeronave } from "../models/Aeronave.js";
import { Funcionario } from "../models/Funcionario.js";
import { Peca } from "../models/Peca.js";
import { Etapa } from "../models/Etapa.js";
import { Teste } from "../models/Teste.js";
import { Autenticacao } from "./Autenticacao.js";
import { TipoAeronave } from "../enums/TipoAeronave.js";
import { TipoPeca } from "../enums/TipoPeca.js";
import { StatusPeca } from "../enums/StatusPeca.js";
import { TipoTeste } from "../enums/TipoTeste.js";
import { ResultadoTeste } from "../enums/ResultadoTeste.js";
import { NivelPermissao } from "../enums/NivelPermissao.js";
import { Persistencia } from "./Persistencia.js";
import { Relatorio } from "./Relatorio.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pergunta = (texto: string): Promise<string> => {
  return new Promise(resolve => rl.question(texto, resolve));
};

let aeronaves: Aeronave[] = [];
let funcionarios: Funcionario[] = [];

const ARQUIVO_AERONAVES = "data/dados_aeronaves.json";
const ARQUIVO_FUNCIONARIOS = "data/dados_funcionarios.json";

async function iniciarEtapa(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ENGENHEIRO)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  if (aeronave.etapas.length === 0) { console.log(`\nNenhuma etapa cadastrada.`); return; }

  console.log(`\nEtapas disponíveis:`);
  aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} [${e.status}]`));

  const opc = parseInt(await pergunta(`Escolha a etapa: `)) - 1;
  if (opc < 0 || opc >= aeronave.etapas.length) { console.log(`\nOpção inválida.`); return; }

  aeronave.etapas[opc]!.iniciar();
}

async function finalizarEtapa(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ENGENHEIRO)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  if (aeronave.etapas.length === 0) { console.log(`\nNenhuma etapa cadastrada.`); return; }

  console.log(`\nEtapas disponíveis:`);
  aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} [${e.status}]`));

  const opc = parseInt(await pergunta(`Escolha a etapa: `)) - 1;
  if (opc < 0 || opc >= aeronave.etapas.length) { console.log(`\nOpção inválida.`); return; }

  if (opc > 0 && aeronave.etapas[opc - 1]!.status !== "CONCLUIDA") {
    console.log(`\nA etapa anterior ainda não foi concluída!`);
    return;
  }

  aeronave.etapas[opc]!.finalizar();
}

async function atualizarStatusPeca(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.OPERADOR)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  if (aeronave.pecas.length === 0) { console.log(`\nNenhuma peça cadastrada.`); return; }

  console.log(`\nPeças disponíveis:`);
  aeronave.pecas.forEach((p, i) => console.log(`${i + 1}. ${p.nome} [${p.status}]`));

  const opc = parseInt(await pergunta(`Escolha a peça: `)) - 1;
  if (opc < 0 || opc >= aeronave.pecas.length) { console.log(`\nOpção inválida.`); return; }

  console.log(`Status: 1. EM_PRODUCAO  2. EM_TRANSPORTE  3. PRONTA`);
  const statusOpc = await pergunta(`Novo status: `);
  const novoStatus = statusOpc === "1" ? StatusPeca.EM_PRODUCAO
    : statusOpc === "2" ? StatusPeca.EM_TRANSPORTE
    : StatusPeca.PRONTA;

  aeronave.pecas[opc]!.atualizarStatus(novoStatus);
}

async function associarFuncionarioEtapa(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ADMINISTRADOR)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  if (aeronave.etapas.length === 0) { console.log(`\nNenhuma etapa cadastrada.`); return; }

  console.log(`\nEtapas disponíveis:`);
  aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} [${e.status}]`));
  const etapaOpc = parseInt(await pergunta(`Escolha a etapa: `)) - 1;
  if (etapaOpc < 0 || etapaOpc >= aeronave.etapas.length) { console.log(`\nOpção inválida.`); return; }

  if (funcionarios.length === 0) { console.log(`\nNenhum funcionário cadastrado.`); return; }

  console.log(`\nFuncionários disponíveis:`);
  funcionarios.forEach((f, i) => console.log(`${i + 1}. ${f.nome} [${f.nivelPermissao}]`));
  const funcOpc = parseInt(await pergunta(`Escolha o funcionário: `)) - 1;
  if (funcOpc < 0 || funcOpc >= funcionarios.length) { console.log(`\nOpção inválida.`); return; }

  aeronave.etapas[etapaOpc]!.associarFuncionario(funcionarios[funcOpc]!);
}

async function gerarRelatorio(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ENGENHEIRO)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  if (!aeronave.producaoConcluida()) {
    console.log(`\nAtenção: nem todas as etapas foram concluídas!`);
    const continuar = await pergunta(`Deseja gerar o relatório mesmo assim? (s/n): `);
    if (continuar.toLowerCase() !== "s") return;
  }

  const cliente = await pergunta(`Nome do cliente: `);
  const dataEntrega = await pergunta(`Data de entrega (dd/mm/aaaa): `);

  const relatorio = new Relatorio(aeronave, cliente, dataEntrega);
  relatorio.salvar();
}

async function listarFuncionariosEtapa(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ENGENHEIRO)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  if (aeronave.etapas.length === 0) { console.log(`\nNenhuma etapa cadastrada.`); return; }

  console.log(`\nEtapas disponíveis:`);
  aeronave.etapas.forEach((e, i) => console.log(`${i + 1}. ${e.nome} [${e.status}]`));

  const opc = parseInt(await pergunta(`Escolha a etapa: `)) - 1;
  if (opc < 0 || opc >= aeronave.etapas.length) { console.log(`\nOpção inválida.`); return; }

  aeronave.etapas[opc]!.listarFuncionarios();
}

function carregarDados(): void {
  const dadosAeronaves = Persistencia.carregar(ARQUIVO_AERONAVES) as any[];
  if (dadosAeronaves) {
    aeronaves = dadosAeronaves.map((d: any) => {
      const a = new Aeronave(d.codigo, d.modelo, d.tipo, d.capacidade, d.alcance);
      d.pecas?.forEach((p: any) => a.adicionarPeca(new Peca(p.nome, p.tipo, p.fornecedor, p.status)));
      d.etapas?.forEach((e: any) => {
        const etapa = new Etapa(e.nome, e.prazo);
        etapa["_status"] = e.status;
        e.funcionarios?.forEach((f: any) => {
          const func = new Funcionario(f.id, f.nome, f.telefone, f.endereco, f.usuario, "", f.nivelPermissao);
          etapa["_funcionarios"].push(func);
        });
        a.adicionarEtapa(etapa);
      });
      d.testes?.forEach((t: any) => a.adicionarTeste(new Teste(t.tipo, t.resultado)));
      return a;
    });
  }

  const dadosFuncionarios = Persistencia.carregar(ARQUIVO_FUNCIONARIOS) as any[];
  if (dadosFuncionarios) {
    funcionarios = dadosFuncionarios.map((f: any) =>
      new Funcionario(f.id, f.nome, f.telefone, f.endereco, f.usuario, f.senha, f.nivelPermissao)
    );
  }
}

function salvarDados(): void {
  Persistencia.salvar(ARQUIVO_AERONAVES, aeronaves.map(a => ({
    codigo: a.codigo,
    modelo: a.modelo,
    tipo: a.tipo,
    capacidade: a.capacidade,
    alcance: a.alcance,
    pecas: a.pecas.map(p => ({
      nome: p.nome,
      tipo: p.tipo,
      fornecedor: p.fornecedor,
      status: p.status
    })),
    etapas: a.etapas.map(e => ({
      nome: e.nome,
      prazo: e.prazo,
      status: e.status,
      funcionarios: e.funcionarios.map(f => ({
        id: f.id,
        nome: f.nome,
        telefone: f.telefone,
        endereco: f.endereco,
        usuario: f.usuario,
        nivelPermissao: f.nivelPermissao
      }))
    })),
    testes: a.testes.map(t => ({
      tipo: t.tipo,
      resultado: t.resultado
    }))
  })));

  Persistencia.salvar(ARQUIVO_FUNCIONARIOS, funcionarios.map(f => ({
    id: f.id,
    nome: f.nome,
    telefone: f.telefone,
    endereco: f.endereco,
    usuario: f.usuario,
    senha: f.getSenha(),
    nivelPermissao: f.nivelPermissao
  })));
}

async function menuPrincipal(): Promise<void> {
  console.log(`\n===== AEROCODE =====`);
  console.log(`1. Login`);
  console.log(`2. Sair`);
  const opcao = await pergunta(`Escolha: `);

  if (opcao === "1") {
    const usuario = await pergunta(`Usuário: `);
    const senha = await pergunta(`Senha: `);
    const logado = Autenticacao.login(usuario, senha, funcionarios);
    if (logado) await menuLogado();
  } else if (opcao === "2") {
    salvarDados();
    console.log(`\nSistema encerrado. Dados salvos!`);
    rl.close();
    return;
  }

  await menuPrincipal();
}

async function menuLogado(): Promise<void> {
  console.log(`\n===== MENU PRINCIPAL =====`);
  console.log(`1. Gerenciar Aeronaves`);
  console.log(`2. Gerenciar Funcionários`);
  console.log(`3. Logout`);
  const opcao = await pergunta(`Escolha: `);

  if (opcao === "1") await menuAeronaves();
  else if (opcao === "2") await menuFuncionarios();
  else if (opcao === "3") {
    Autenticacao.logout();
    return;
  }

  await menuLogado();
}

async function menuAeronaves(): Promise<void> {
  console.log(`\n===== AERONAVES =====`);
  console.log(`1. Cadastrar aeronave`);
  console.log(`2. Listar aeronaves`);
  console.log(`3. Adicionar peça`);
  console.log(`4. Adicionar etapa`);
  console.log(`5. Adicionar teste`);
  console.log(`6. Iniciar etapa`);
  console.log(`7. Finalizar etapa`);
  console.log(`8. Atualizar status de peça`);
  console.log(`9. Associar funcionário a etapa`);
  console.log(`10. Gerar relatório final`);
  console.log(`11. Listar funcionários de uma etapa`);
  console.log(`0. Voltar`);
  const opcao = await pergunta(`Escolha: `);

  if (opcao === "1") await cadastrarAeronave();
  else if (opcao === "2") listarAeronaves();
  else if (opcao === "3") await adicionarPeca();
  else if (opcao === "4") await adicionarEtapa();
  else if (opcao === "5") await adicionarTeste();
  else if (opcao === "6") await iniciarEtapa();
  else if (opcao === "7") await finalizarEtapa();
  else if (opcao === "8") await atualizarStatusPeca();
  else if (opcao === "9") await associarFuncionarioEtapa();
  else if (opcao === "10") await gerarRelatorio();
  else if (opcao === "11") await listarFuncionariosEtapa();
  else if (opcao === "0") return;

  await menuAeronaves();
}

async function cadastrarAeronave(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ADMINISTRADOR)) return;

  const codigo = await pergunta(`Código: `);
  const jaExiste = aeronaves.some(a => a.codigo === codigo);
  if (jaExiste) {
    console.log(`\nJá existe uma aeronave com esse código!`);
    return;
  }

  const modelo = await pergunta(`Modelo: `);

  if (modelo.trim().toLowerCase() === "bae 146-200") {
    console.log(`\nEsse avião derrubou o time da Chapecoense em 2016, não é seguro estamos encerrando a aplicação...`);
    salvarDados();
    rl.close();
    process.exit(0);
  }

  console.log(`Tipos: 1. COMERCIAL  2. MILITAR`);
  const tipoOpc = await pergunta(`Tipo: `);
  const tipo = tipoOpc === "1" ? TipoAeronave.COMERCIAL : TipoAeronave.MILITAR;
  const capacidade = parseInt(await pergunta(`Capacidade: `));
  const alcance = parseInt(await pergunta(`Alcance (km): `));

  const aeronave = new Aeronave(codigo, modelo, tipo, capacidade, alcance);
  aeronaves.push(aeronave);
  console.log(`\nAeronave cadastrada com sucesso!`);
}

function listarAeronaves(): void {
  if (!Autenticacao.temPermissao(NivelPermissao.OPERADOR)) return;

  if (aeronaves.length === 0) {
    console.log(`\nNenhuma aeronave cadastrada.`);
    return;
  }
  aeronaves.forEach(a => a.exibirDetalhes());
}

async function adicionarPeca(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.OPERADOR)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  const nome = await pergunta(`Nome da peça: `);
  console.log(`Tipos: 1. NACIONAL  2. IMPORTADA`);
  const tipoOpc = await pergunta(`Tipo: `);
  const tipo = tipoOpc === "1" ? TipoPeca.NACIONAL : TipoPeca.IMPORTADA;
  const fornecedor = await pergunta(`Fornecedor: `);

  aeronave.adicionarPeca(new Peca(nome, tipo, fornecedor, StatusPeca.EM_PRODUCAO));
}

async function adicionarEtapa(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ENGENHEIRO)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  const nome = await pergunta(`Nome da etapa: `);
  const prazo = await pergunta(`Prazo: `);

  aeronave.adicionarEtapa(new Etapa(nome, prazo));
}

async function adicionarTeste(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ENGENHEIRO)) return;

  const codigo = await pergunta(`Código da aeronave: `);
  const aeronave = aeronaves.find(a => a.codigo === codigo);
  if (!aeronave) { console.log(`\nAeronave não encontrada.`); return; }

  console.log(`Tipos: 1. ELETRICO  2. HIDRAULICO  3. AERODINAMICO`);
  const tipoOpc = await pergunta(`Tipo: `);
  const tipo = tipoOpc === "1" ? TipoTeste.ELETRICO : tipoOpc === "2" ? TipoTeste.HIDRAULICO : TipoTeste.AERODINAMICO;

  console.log(`Resultado: 1. APROVADO  2. REPROVADO`);
  const resultOpc = await pergunta(`Resultado: `);
  const resultado = resultOpc === "1" ? ResultadoTeste.APROVADO : ResultadoTeste.REPROVADO;

  aeronave.adicionarTeste(new Teste(tipo, resultado));
}

async function menuFuncionarios(): Promise<void> {
  console.log(`\n===== FUNCIONÁRIOS =====`);
  console.log(`1. Cadastrar funcionário`);
  console.log(`2. Listar funcionários`);
  console.log(`3. Voltar`);
  const opcao = await pergunta(`Escolha: `);

  if (opcao === "1") await cadastrarFuncionario();
  else if (opcao === "2") listarFuncionarios();
  else if (opcao === "3") return;

  await menuFuncionarios();
}

async function cadastrarFuncionario(): Promise<void> {
  if (!Autenticacao.temPermissao(NivelPermissao.ADMINISTRADOR)) return;

  const id = await pergunta(`ID: `);
  const jaExiste = funcionarios.some(f => f.id === id);
  if (jaExiste) { console.log(`\nJá existe um funcionário com esse ID!`); return; }

  const nome = await pergunta(`Nome: `);
  const telefone = await pergunta(`Telefone: `);
  const endereco = await pergunta(`Endereço: `);
  const usuario = await pergunta(`Usuário: `);
  const senha = await pergunta(`Senha: `);
  console.log(`Permissão: 1. ADMINISTRADOR  2. ENGENHEIRO  3. OPERADOR`);
  const permOpc = await pergunta(`Permissão: `);
  const nivel = permOpc === "1" ? NivelPermissao.ADMINISTRADOR
    : permOpc === "2" ? NivelPermissao.ENGENHEIRO
    : NivelPermissao.OPERADOR;

  funcionarios.push(new Funcionario(id, nome, telefone, endereco, usuario, senha, nivel));
  console.log(`\nFuncionário cadastrado com sucesso!`);
}

function listarFuncionarios(): void {
  if (!Autenticacao.temPermissao(NivelPermissao.ADMINISTRADOR)) return;

  if (funcionarios.length === 0) {
    console.log(`\nNenhum funcionário cadastrado.`);
    return;
  }
  funcionarios.forEach(f => f.exibirDetalhes());
}

carregarDados();

if (funcionarios.length === 0) {
  funcionarios.push(new Funcionario(
    "1", "Administrador", "00000000000",
    "Sede Aerocode", "admin", "admin123",
    NivelPermissao.ADMINISTRADOR
  ));
  console.log(`\nUsuário padrão criado: admin / admin123`);
}

menuPrincipal();