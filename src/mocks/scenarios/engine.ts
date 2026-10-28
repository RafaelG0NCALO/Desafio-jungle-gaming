import { delay, http, HttpResponse } from 'msw'
import { DEFAULT_SCENARIO, SCENARIOS } from './presets'
import type { Rule, Scenario } from './types'

const STORAGE_KEY = 'kurio.mock.scenario'

let current: Scenario | null = null
let counters: number[] = []
let seen = new Map<string, number>()

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function start(scenario: Scenario) {
  current = scenario
  counters = (scenario.rules ?? []).map(() => 0)
  seen = new Map()
}

export function getScenario(): Scenario {
  if (!current) {
    let loaded: Scenario | undefined
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) loaded = raw.startsWith('{') ? (JSON.parse(raw) as Scenario) : SCENARIOS[raw]
    } catch {
    }
    start(loaded ?? DEFAULT_SCENARIO)
  }
  return current!
}

export function setScenario(scenario: string | Scenario): Scenario {
  const next = typeof scenario === 'string' ? SCENARIOS[scenario] : scenario
  if (!next) throw new Error(`Cenário desconhecido: ${String(scenario)}`)
  start(next)
  try {
    localStorage.setItem(STORAGE_KEY, typeof scenario === 'string' ? scenario : JSON.stringify(scenario))
  } catch {
  }
  return next
}

export function resetScenario() {
  start(DEFAULT_SCENARIO)
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
  }
}

const matches = (rule: Rule, method: string, path: string) => {
  if (rule.method && rule.method.toUpperCase() !== method) return false
  if (!rule.path.includes('*')) return rule.path === path
  const pattern = new RegExp(`^${rule.path.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`)
  return pattern.test(path)
}

function unit(text: string): number {
  let hash = 2166136261
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return mulberry32(hash >>> 0)()
}

function latencyFor(scenario: Scenario, method: string, path: string): number {
  const { latency } = scenario
  if (!latency) return 0
  const key = `${method} ${path}`
  const count = (seen.get(key) ?? 0) + 1
  seen.set(key, count)
  const jitter = latency.jitter ? unit(`${latency.seed ?? 1}:${key}:${count}`) * latency.jitter : 0
  return Math.round(latency.base + jitter)
}

export const scenarioMiddleware = http.all('/api/*', async ({ request }) => {
  const scenario = getScenario()
  const { pathname } = new URL(request.url)
  const wait = latencyFor(scenario, request.method, pathname)
  if (wait) await delay(wait)

  const rules = scenario.rules ?? []
  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i]
    if (!matches(rule, request.method, pathname)) continue
    counters[i] += 1
    const applies = rule.nth ? counters[i] === rule.nth : rule.times ? counters[i] <= rule.times : true
    if (!applies) continue

    const { effect } = rule
    if (effect.type === 'delay') await delay(effect.ms)
    else if (effect.type === 'network') return HttpResponse.error()
    else if (effect.type === 'timeout') await delay('infinite')
    else if (effect.type === 'error') {
      return HttpResponse.json(
        { code: effect.code ?? 'error', message: effect.message ?? 'Erro simulado.' },
        { status: effect.status },
      )
    }
  }
  return undefined
})
