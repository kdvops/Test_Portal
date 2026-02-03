import type { ApolloServerPlugin } from '@apollo/server';
import { Logger } from '@nestjs/common';

const log = new Logger('GQL');

function safeJsonStringify(value: unknown, maxLen = 10_000) {
  try {
    let s = JSON.stringify(value);
    if (s.length > maxLen) s = s.slice(0, maxLen) + '…(truncated)';
    return s;
  } catch {
    return '"[Unserializable]"';
  }
}

function summarizeArrays(obj: any, maxItems = 10): any {
  if (Array.isArray(obj)) {
    const head = obj
      .slice(0, maxItems)
      .map((x) => summarizeArrays(x, maxItems));
    return {
      __type: 'Array',
      length: obj.length,
      preview: head,
      ...(obj.length > maxItems ? { truncated: true } : {}),
    };
  }
  if (obj && typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj))
      out[k] = summarizeArrays(v, maxItems);
    return out;
  }
  return obj;
}

function redactSecrets(obj: any): any {
  const REDACT_KEYS = new Set([
    'password',
    'pass',
    'token',
    'accessToken',
    'refreshToken',
    'authorization',
    'auth',
    'secret',
    'apiKey',
  ]);

  if (Array.isArray(obj)) return obj.map(redactSecrets);
  if (!obj || typeof obj !== 'object') return obj;

  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = REDACT_KEYS.has(k) ? '[REDACTED]' : redactSecrets(v);
  }
  return out;
}

export function graphqlLoggerPlugin(): ApolloServerPlugin {
  return {
    async requestDidStart(ctx) {
      const op = ctx.operationName ?? 'anonymous';
      const vars = redactSecrets(ctx.request.variables ?? {});
      const varsCompact = summarizeArrays(vars, 10);

      // Terminal-friendly: one line
      log.log(
        safeJsonStringify({
          type: 'gql.request',
          op,
          // keep query short: just first line to identify it
          queryHead: (ctx.request.query ?? '').split('\n')[0]?.slice(0, 200),
          vars: varsCompact,
        }),
      );

      return {
        async didEncounterErrors(errCtx) {
          for (const err of errCtx.errors) {
            const originalStack =
              (err as any).originalError?.stack ?? err.stack ?? undefined;

            // Keep stack single-line-ish in terminals
            const stackOneLine = originalStack
              ? String(originalStack).split('\n').slice(0, 3).join(' | ')
              : undefined;

            log.error(
              safeJsonStringify({
                type: 'gql.error',
                op,
                message: err.message,
                path: (err as any).path ?? null,
                code: (err as any).extensions?.code ?? null,
                stack: stackOneLine,
              }),
            );
          }
        },
      };
    },
  };
}
