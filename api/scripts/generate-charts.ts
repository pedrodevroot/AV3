import fs from 'fs';
import path from 'path';

interface ResultadoTeste {
  usuarios: number;
  latenciaMs: { media: number; p50: number; p95: number; p99: number };
  tempoProcessamentoMs: { media: number; p50: number; p95: number; p99: number };
  tempoRespostaMs: { media: number; p50: number; p95: number; p99: number };
  requisicoesPorSegundo: number;
  requisicoesConcluidas: number;
  erros: number;
}

interface ArquivoMetrics {
  geradoEm: string;
  configuracao: { url: string; duracaoSegundos: number; usuariosTestados: number[] };
  resultados: ResultadoTeste[];
}

function encontrarArquivoMaisRecente(): string {
  const pasta = path.join(process.cwd(), 'metrics');

  if (!fs.existsSync(pasta)) {
    console.error('Pasta metrics/ não encontrada.');
    console.error('Execute "npm run test:metrics" primeiro.\n');
    process.exit(1);
  }

  const arquivos = fs
    .readdirSync(pasta)
    .filter(f => f.startsWith('resultado_') && f.endsWith('.json'))
    .map(f => ({ nome: f, caminho: path.join(pasta, f) }))
    .sort((a, b) => b.nome.localeCompare(a.nome));

  if (arquivos.length === 0) {
    console.error('Nenhum arquivo de resultado encontrado em metrics/');
    console.error('Execute "npm run test:metrics" primeiro.\n');
    process.exit(1);
  }

  return arquivos[0].caminho;
}

function gerarHTML(dados: ArquivoMetrics): string {
  const r = dados.resultados;
  const usuarios = r.map(x => `${x.usuarios} usuário${x.usuarios > 1 ? 's' : ''}`);
  const dataFormatada = new Date(dados.geradoEm).toLocaleString('pt-BR');

  const latMedia = r.map(x => x.latenciaMs.media);
  const latP95   = r.map(x => x.latenciaMs.p95);

  const procMedia = r.map(x => x.tempoProcessamentoMs.media);
  const procP95   = r.map(x => x.tempoProcessamentoMs.p95);

  const respMedia = r.map(x => x.tempoRespostaMs.media);
  const respP95   = r.map(x => x.tempoRespostaMs.p95);

  const tabelaLinhas = r.map(x => `
    <tr>
      <td>${x.usuarios}</td>
      <td>${x.latenciaMs.media}</td>
      <td>${x.latenciaMs.p95}</td>
      <td>${x.tempoProcessamentoMs.media}</td>
      <td>${x.tempoProcessamentoMs.p95}</td>
      <td>${x.tempoRespostaMs.media}</td>
      <td>${x.tempoRespostaMs.p95}</td>
      <td>${x.requisicoesPorSegundo}</td>
      <td>${x.erros}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatório de Qualidade — Aerocode API</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #f4f6f9;
      color: #1a1a2e;
      padding: 32px;
    }

    h1 {
      text-align: center;
      font-size: 24px;
      margin-bottom: 4px;
      color: #1a1a2e;
    }

    .subtitle {
      text-align: center;
      color: #555;
      font-size: 13px;
      margin-bottom: 36px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #3a86ff;
    }

    .section-desc {
      font-size: 13px;
      color: #555;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 28px;
      margin-bottom: 40px;
    }

    .card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    }

    .chart-container {
      position: relative;
      height: 280px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      background: #fff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    }

    thead {
      background: #1a1a2e;
      color: #fff;
    }

    th, td {
      padding: 10px 14px;
      text-align: center;
      border-bottom: 1px solid #eee;
    }

    tbody tr:hover { background: #f0f4ff; }
    tbody tr:last-child td { border-bottom: none; }

    .legend {
      display: flex;
      gap: 20px;
      justify-content: center;
      font-size: 13px;
      margin-top: 12px;
    }

    .legend-dot {
      width: 12px; height: 12px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 5px;
      vertical-align: middle;
    }

    .footer {
      text-align: center;
      margin-top: 36px;
      font-size: 12px;
      color: #aaa;
    }

    @media print {
      body { background: #fff; padding: 16px; }
      .card { box-shadow: none; border: 1px solid #ddd; }
    }
  </style>
</head>
<body>

  <h1>Relatório de Qualidade — Aerocode API</h1>
  <p class="subtitle">Gerado em ${dataFormatada} &nbsp;|&nbsp; Endpoint testado: ${dados.configuracao.url} &nbsp;|&nbsp; Duração por teste: ${dados.configuracao.duracaoSegundos}s</p>

  <div class="charts-grid">

    <div class="card">
      <p class="section-title">1. Latência (ms)</p>
      <p class="section-desc">
        Tempo de transmissão na rede: intervalo entre o cliente enviar a requisição
        e o servidor começar a processá-la, mais o retorno. Calculada como:
        <strong>Tempo de resposta − Tempo de processamento</strong>.
      </p>
      <div class="chart-container">
        <canvas id="chart-latencia"></canvas>
      </div>
    </div>

    <div class="card">
      <p class="section-title">2. Tempo de Processamento (ms)</p>
      <p class="section-desc">
        Tempo que o servidor levou para processar a requisição: desde o recebimento
        até o envio da resposta. Medido internamente via <code>process.hrtime.bigint()</code>
        no middleware da API.
      </p>
      <div class="chart-container">
        <canvas id="chart-processamento"></canvas>
      </div>
    </div>

    <div class="card">
      <p class="section-title">3. Tempo de Resposta (ms)</p>
      <p class="section-desc">
        Tempo total percebido pelo usuário: do envio da requisição até o recebimento
        completo da resposta. Engloba latência de rede + tempo de processamento.
        Medido pela ferramenta autocannon no lado cliente.
      </p>
      <div class="chart-container">
        <canvas id="chart-resposta"></canvas>
      </div>
    </div>

  </div>

  <div class="card" style="margin-bottom:32px;">
    <p class="section-title" style="margin-bottom:16px;">Dados Completos</p>
    <table>
      <thead>
        <tr>
          <th>Usuários</th>
          <th>Latência Média</th>
          <th>Latência p95</th>
          <th>Processamento Média</th>
          <th>Processamento p95</th>
          <th>Resposta Média</th>
          <th>Resposta p95</th>
          <th>Req/s</th>
          <th>Erros</th>
        </tr>
      </thead>
      <tbody>
        ${tabelaLinhas}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Aerocode — Sistema de Gerenciamento da Produção de Aeronaves &nbsp;|&nbsp;
    Métricas coletadas com autocannon + middleware Express
  </div>

  <script>
    const USUARIOS = ${JSON.stringify(usuarios)};

    const CORES = {
      media: { bg: 'rgba(58, 134, 255, 0.7)', borda: 'rgba(58, 134, 255, 1)' },
      p95:   { bg: 'rgba(255, 107, 53, 0.7)',  borda: 'rgba(255, 107, 53, 1)' },
    };

    const OPCOES_BASE = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + ctx.parsed.y.toFixed(3) + ' ms'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Tempo (ms)', font: { size: 12 } },
          ticks: { callback: v => v + ' ms' }
        },
        x: {
          title: { display: true, text: 'Usuários Simultâneos', font: { size: 12 } }
        }
      }
    };

    function criarGrafico(id, label, dadosMedia, dadosP95) {
      const ctx = document.getElementById(id).getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: USUARIOS,
          datasets: [
            {
              label: label + ' — Média',
              data: dadosMedia,
              backgroundColor: CORES.media.bg,
              borderColor: CORES.media.borda,
              borderWidth: 2,
              borderRadius: 6,
            },
            {
              label: label + ' — p95',
              data: dadosP95,
              backgroundColor: CORES.p95.bg,
              borderColor: CORES.p95.borda,
              borderWidth: 2,
              borderRadius: 6,
            }
          ]
        },
        options: OPCOES_BASE
      });
    }

    criarGrafico('chart-latencia',       'Latência',               ${JSON.stringify(latMedia)},  ${JSON.stringify(latP95)});
    criarGrafico('chart-processamento',  'Tempo de Processamento', ${JSON.stringify(procMedia)}, ${JSON.stringify(procP95)});
    criarGrafico('chart-resposta',       'Tempo de Resposta',      ${JSON.stringify(respMedia)}, ${JSON.stringify(respP95)});
  </script>

</body>
</html>`;
}

function main(): void {
  const arquivoJson = encontrarArquivoMaisRecente();
  console.log(`Lendo: ${arquivoJson}\n`);

  const dados: ArquivoMetrics = JSON.parse(fs.readFileSync(arquivoJson, 'utf-8'));
  const html = gerarHTML(dados);

  const saida = arquivoJson.replace('.json', '_graficos.html');
  fs.writeFileSync(saida, html, 'utf-8');

  console.log('✓ Relatório gerado!\n');
  console.log(`  Arquivo: ${saida}`);
  console.log('\n  Abra esse arquivo no navegador para ver os gráficos.');
  console.log('  Para o trabalho: use Ctrl+P no navegador e salve como PDF.\n');
}

main();
