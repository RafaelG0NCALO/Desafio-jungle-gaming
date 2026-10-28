import type { Scenario } from './types'

export const SCENARIOS: Record<string, Scenario> = {
  default: {
    name: 'default',
    description: 'Sucesso: respostas normais, sem falhas.',
  },
  slow: {
    name: 'slow',
    description: 'Lentidão: toda resposta demora 1,5 s a mais (para ver os skeletons).',
    latency: { base: 1500 },
  },
  'variable-latency': {
    name: 'variable-latency',
    description: 'Latência variável e reproduzível: de 100 ms a 1,6 s, sempre na mesma sequência.',
    latency: { base: 100, jitter: 1500, seed: 7 },
  },
  'out-of-order': {
    name: 'out-of-order',
    description: 'Respostas fora de ordem: a 1ª listagem do catálogo demora 1,5 s e a 2ª responde logo.',
    rules: [
      { method: 'GET', path: '/api/nfts', nth: 1, effect: { type: 'delay', ms: 1500 } },
      { method: 'GET', path: '/api/nfts', nth: 2, effect: { type: 'delay', ms: 100 } },
    ],
  },
  offline: {
    name: 'offline',
    description: 'Indisponibilidade de conexão: toda requisição falha sem resposta.',
    rules: [{ path: '/api/*', effect: { type: 'network' } }],
  },
  timeout: {
    name: 'timeout',
    description: 'Timeout: o catálogo nunca responde.',
    rules: [{ method: 'GET', path: '/api/nfts', effect: { type: 'timeout' } }],
  },
  'server-error': {
    name: 'server-error',
    description: 'Erro 500 no catálogo.',
    rules: [{ method: 'GET', path: '/api/nfts', effect: { type: 'error', status: 500, code: 'server_error', message: 'Erro interno do servidor.' } }],
  },
  flaky: {
    name: 'flaky',
    description: 'Falha transitória: as 2 primeiras consultas ao catálogo dão 503 e a 3ª funciona.',
    rules: [{ method: 'GET', path: '/api/nfts', times: 2, effect: { type: 'error', status: 503, code: 'unavailable', message: 'Serviço temporariamente indisponível.' } }],
  },
  'client-error': {
    name: 'client-error',
    description: 'Erro 4xx: o carrinho recusa alterações com 409.',
    rules: [{ method: 'PATCH', path: '/api/cart/items/*', effect: { type: 'error', status: 409, code: 'availability_conflict', message: 'Quantidade indisponível no momento.' } }],
  },
  'favorites-fail': {
    name: 'favorites-fail',
    description: 'Falha de mutation: favoritar e desfavoritar respondem 500 (para testar o rollback).',
    rules: [
      { method: 'POST', path: '/api/favorites', effect: { type: 'error', status: 500, code: 'server_error', message: 'Erro interno do servidor.' } },
      { method: 'DELETE', path: '/api/favorites/*', effect: { type: 'error', status: 500, code: 'server_error', message: 'Erro interno do servidor.' } },
    ],
  },
  'catalog-empty': {
    name: 'catalog-empty',
    description: 'Resultado vazio: o catálogo não tem nenhum NFT.',
    catalogEmpty: true,
  },
  'wallet-refused': {
    name: 'wallet-refused',
    description: 'Recusa da carteira: a 1ª tentativa de conexão é recusada e a seguinte é aceita.',
    rules: [
      {
        method: 'POST',
        path: '/api/wallet-connection',
        times: 1,
        effect: { type: 'error', status: 422, code: 'wallet_rejected', message: 'Conexão recusada pela carteira.' },
      },
    ],
  },
  'order-timeout': {
    name: 'order-timeout',
    description: 'Timeout após criar o pedido: a 1ª criação grava o pedido mas a resposta não chega; reenviar recupera o mesmo pedido.',
    orders: { responseTimeouts: 1 },
  },
  'payment-declined': {
    name: 'payment-declined',
    description: 'Pagamento recusado: o pedido nasce recusado e os itens ficam no carrinho.',
    orders: { outcome: 'declined' },
  },
  'payment-pending': {
    name: 'payment-pending',
    description: 'Pagamento pendente: o pedido fica pendente por 4 s e depois é confirmado.',
    orders: { outcome: 'pending', settleAfterMs: 4000, settleTo: 'confirmed' },
  },
}

export const DEFAULT_SCENARIO = SCENARIOS.default
