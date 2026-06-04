import morgan, { StreamOptions } from 'morgan';

const devFormat = ':method :url :status :response-time ms — :res[content-length] bytes';

const prodFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  ip: ':remote-addr',
  date: ':date[iso]',
});

const stream: StreamOptions = {
  write: (message: string) => process.stdout.write(message),
};

export const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  { stream },
);
