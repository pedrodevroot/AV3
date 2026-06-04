import autocannon from 'autocannon';
import http from 'http';
import fs from 'fs';
import path from 'path';

const HOST = 'localhost';
const PORT = 3333;
const BASE_URL = `http://${HOST}:${PORT}`;
const DURACAO_SEGUNDOS = 10;
const USUARIOS_SIMULADOS = [1, 5, 10];

function httpRequest<T>(
  method: string,
  urlPath: string,
  body?: unknown,
  token?: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (payload) headers['Content-Length'] = String(Buffer.byteLength(payload));

    const req = http.request(
      { hostname: HOST, port: PORT, path: urlPath, method, headers },
      (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data) as T);
          } catch {
            reject(new Error(`Resposta inválida: ${data.slice(0, 200)}`));
          }
        });
      },
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function verificarServidor(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: HOST, port: PORT, path: '/health', method: 'GET' },
      (res) => { resolve(res.statusCode === 200); },
    );
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function obterToken(): Promise<string> {
  console.log('  Fazendo login...');
  let data: { token?: string; error?: string };
  try {
    data = await httpRequest<{ token?: string; error?: string }>(
      'POST',
      '/api/v1/auth/login',
      { usuario: 'admin', senha: 'admin123' },
    );
  } catch (err) {
    throw new Error(`Falha na conexao com a API: ${String(err)}`);
  }

  if (!data.token) {
    throw new Error(
      `Login falhou. Resposta da API: ${JSON.stringify(data)}\n` +
      `  Verifique se executou: npm run prisma:seed`,
    );
  }

  console.log('  Token obtido.\n');
  return data.token;
}

interface ResumoServidor {
  total: number;
  minMs: number;
  maxMs: number;
  mediaMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

async function limparMetricas(token: string): Promise<void> {
  await httpRequest('POST', '/api/v1/metrics/clear', {}, token);
}

async function obterMetricasServidor(token: string): Promise<ResumoServidor | null> {
  const data = await httpRequest<{ resumo: ResumoServidor | null }>(
    'GET',
    '/api/v1/metrics',
    undefined,
    token,
  );
  return data.resumo;
}

async function rodarTeste(conexoes: number, token: string): Promise<autocannon.Result> {
  return new Promise((resolve, reject) => {
    const instancia = autocannon(
      {
        url: `${BASE_URL}/api/v1/aeronaves`,
        connections: conexoes,
        duration: DURACAO_SEGUNDOS,
        headers: { Authorization: `Bearer ${token}` },
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
    autocannon.track(instancia, { renderProgressBar: true });
  });
}

interface ResultadoTeste {
  usuarios: number;
  latenciaMs: { media: number; p50: number; p95: number; p99: number };
  tempoProcessamentoMs: { media: number; p50: number; p95: number; p99: number };
  tempoRespostaMs: { media: number; p50: number; p95: number; p99: number };
  requisicoesPorSegundo: number;
  requisicoesConcluidas: number;
  erros: number;
}

async function main(): Promise<void> {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        AEROCODE — TESTE DE CARGA / METRICAS     ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const servidorOk = await verificarServidor();
  if (!servidorOk) {
    console.error('Servidor nao encontrado em ' + BASE_URL);
    console.error('Execute "npm run dev" em outro terminal primeiro.\n');
    process.exit(1);
  }
  console.log('✓ Servidor acessível\n');

  const token = await obterToken();
  const resultados: ResultadoTeste[] = [];

  for (const usuarios of USUARIOS_SIMULADOS) {
    console.log(`${'─'.repeat(52)}`);
    console.log(`▶ Testando com ${usuarios} usuario(s) simultâneo(s) — ${DURACAO_SEGUNDOS}s`);
    console.log('─'.repeat(52));

    await limparMetricas(token);

    const resultado = await rodarTeste(usuarios, token);
    const metricsServidor = await obterMetricasServidor(token);

    const resposta = {
      media: parseFloat(resultado.latency.mean.toFixed(3)),
      p50:   parseFloat(resultado.latency.p50.toFixed(3)),
      p95:   parseFloat(resultado.latency.p97_5.toFixed(3)),
      p99:   parseFloat(resultado.latency.p99.toFixed(3)),
    };

    const processamento = metricsServidor
      ? {
          media: metricsServidor.mediaMs,
          p50:   metricsServidor.p50Ms,
          p95:   metricsServidor.p95Ms,
          p99:   metricsServidor.p99Ms,
        }
      : { media: 0, p50: 0, p95: 0, p99: 0 };

    const latencia = {
      media: parseFloat(Math.max(0, resposta.media - processamento.media).toFixed(3)),
      p50:   parseFloat(Math.max(0, resposta.p50   - processamento.p50).toFixed(3)),
      p95:   parseFloat(Math.max(0, resposta.p95   - processamento.p95).toFixed(3)),
      p99:   parseFloat(Math.max(0, resposta.p99   - processamento.p99).toFixed(3)),
    };

    const r: ResultadoTeste = {
      usuarios,
      latenciaMs:            latencia,
      tempoProcessamentoMs:  processamento,
      tempoRespostaMs:       resposta,
      requisicoesPorSegundo: parseFloat(resultado.requests.mean.toFixed(2)),
      requisicoesConcluidas: resultado.requests.total,
      erros:                 resultado.errors,
    };

    resultados.push(r);

    console.log('\nResumo:');
    console.log(`  Latencia media:         ${r.latenciaMs.media} ms`);
    console.log(`  Processamento medio:    ${r.tempoProcessamentoMs.media} ms`);
    console.log(`  Resposta media:         ${r.tempoRespostaMs.media} ms`);
    console.log(`  Requisicoes/s:          ${r.requisicoesPorSegundo}`);
    console.log(`  Total concluidas:       ${r.requisicoesConcluidas}`);
    console.log(`  Erros:                  ${r.erros}\n`);
  }

  const pasta = path.join(process.cwd(), 'metrics');
  fs.mkdirSync(pasta, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const arquivoJson = path.join(pasta, `resultado_${timestamp}.json`);
  const arquivoCsv  = path.join(pasta, `resultado_${timestamp}.csv`);

  fs.writeFileSync(arquivoJson, JSON.stringify({
    geradoEm: new Date().toISOString(),
    configuracao: {
      url: `${BASE_URL}/api/v1/aeronaves`,
      duracaoSegundos: DURACAO_SEGUNDOS,
      usuariosTestados: USUARIOS_SIMULADOS,
    },
    resultados,
  }, null, 2), 'utf-8');

  const csv = [
    'Usuarios,Latencia_Media_ms,Latencia_p95_ms,Processamento_Media_ms,Processamento_p95_ms,Resposta_Media_ms,Resposta_p95_ms,Req_por_segundo,Erros',
    ...resultados.map(r => [
      r.usuarios,
      r.latenciaMs.media,
      r.latenciaMs.p95,
      r.tempoProcessamentoMs.media,
      r.tempoProcessamentoMs.p95,
      r.tempoRespostaMs.media,
      r.tempoRespostaMs.p95,
      r.requisicoesPorSegundo,
      r.erros,
    ].join(',')),
  ];

  fs.writeFileSync(arquivoCsv, csv.join('\n'), 'utf-8');

  console.log('══════════════════════════════════════════════════');
  console.log('RESULTADOS SALVOS:');
  console.log(`  JSON : ${arquivoJson}`);
  console.log(`  CSV  : ${arquivoCsv}`);
  console.log('\n  Agora execute: npm run charts');
  console.log('══════════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\nErro:', err.message);
  process.exit(1);
});
