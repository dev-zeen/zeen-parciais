/**
 * Log de diagnóstico, só em desenvolvimento. Some do build de produção.
 * Uso: debugLog('mercado', 'abriu', { posicao: 3 })
 */
export function debugLog(tag: string, ...args: unknown[]) {
  if (__DEV__) console.log(`[${tag}]`, ...args);
}
