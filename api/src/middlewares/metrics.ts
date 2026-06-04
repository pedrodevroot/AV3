import { Request, Response, NextFunction } from 'express';

interface MetricEntry {
  rota: string;
  metodo: string;
  statusCode: number;
  tempoProcessamentoMs: number;
  timestamp: Date;
}

interface Resumo {
  total: number;
  minMs: number;
  maxMs: number;
  mediaMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

class MetricsStore {
  private entradas: MetricEntry[] = [];
  private readonly MAX_ENTRADAS = 50_000;

  registrar(entrada: MetricEntry): void {
    if (this.entradas.length >= this.MAX_ENTRADAS) {
      this.entradas.shift();
    }
    this.entradas.push(entrada);
  }

  resumo(): Resumo | null {
    if (this.entradas.length === 0) return null;

    const tempos = this.entradas
      .map(e => e.tempoProcessamentoMs)
      .sort((a, b) => a - b);

    const soma = tempos.reduce((acc, v) => acc + v, 0);
    const n = tempos.length;

    return {
      total: n,
      minMs: parseFloat(tempos[0].toFixed(3)),
      maxMs: parseFloat(tempos[n - 1].toFixed(3)),
      mediaMs: parseFloat((soma / n).toFixed(3)),
      p50Ms: parseFloat(tempos[Math.floor(n * 0.50)].toFixed(3)),
      p95Ms: parseFloat(tempos[Math.floor(n * 0.95)].toFixed(3)),
      p99Ms: parseFloat(tempos[Math.floor(n * 0.99)].toFixed(3)),
    };
  }

  todas(): MetricEntry[] {
    return [...this.entradas];
  }

  limpar(): void {
    this.entradas = [];
  }
}

export const metricsStore = new MetricsStore();

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const inicio = process.hrtime.bigint();

  res.on('finish', () => {
    const fim = process.hrtime.bigint();
    const ms = Number(fim - inicio) / 1_000_000;

    metricsStore.registrar({
      rota: req.route?.path ?? req.path,
      metodo: req.method,
      statusCode: res.statusCode,
      tempoProcessamentoMs: ms,
      timestamp: new Date(),
    });
  });

  next();
}
