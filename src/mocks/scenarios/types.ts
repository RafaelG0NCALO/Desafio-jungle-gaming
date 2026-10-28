export type Effect =
  | { type: 'error'; status: number; code?: string; message?: string }
  | { type: 'network' }
  | { type: 'timeout' }
  | { type: 'delay'; ms: number }

export interface Rule {
  method?: string
  path: string
  nth?: number
  times?: number
  effect: Effect
}

export interface OrderScenario {
  outcome?: 'confirmed' | 'declined' | 'pending'
  settleAfterMs?: number
  settleTo?: 'confirmed' | 'declined'
  responseTimeouts?: number
}

export interface Scenario {
  name: string
  description: string
  latency?: { base: number; jitter?: number; seed?: number }
  rules?: Rule[]
  catalogEmpty?: boolean
  orders?: OrderScenario
}
