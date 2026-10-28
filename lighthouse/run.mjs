import { execSync, spawn } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { launch } from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { CATEGORIES, PAGES, PORT, PROFILES, RUNS, TARGETS } from './config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const reports = path.join(root, 'lighthouse', 'reports')
const origin = `http://localhost:${PORT}`

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(origin)).ok) return
    } catch {
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`O servidor de preview não respondeu em ${origin}`)
}

async function audit(url, profile) {
  const chrome = await launch({ chromeFlags: ['--headless=new', '--incognito'] })
  try {
    const result = await lighthouse(
      url,
      { port: chrome.port, output: ['html', 'json'], logLevel: 'error', onlyCategories: CATEGORIES },
      profile === 'desktop' ? desktopConfig : undefined,
    )
    return { html: result.report[0], json: result.report[1], lhr: result.lhr }
  } finally {
    await chrome.kill()
  }
}

if (!process.argv.includes('--skip-build')) execSync('npm run build', { cwd: root, stdio: 'inherit' })

rmSync(reports, { recursive: true, force: true })
mkdirSync(reports, { recursive: true })

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, shell: true, stdio: 'ignore' })
const rows = []
let environment = {}

try {
  await waitForServer()
  for (const page of PAGES) {
    for (const profile of PROFILES) {
      const runs = []
      for (let n = 1; n <= RUNS; n++) {
        const { html, json, lhr } = await audit(origin + page.path, profile)
        const base = path.join(reports, `${page.name}-${profile}-${n}`)
        writeFileSync(`${base}.html`, html)
        writeFileSync(`${base}.json`, json)
        environment = { lighthouse: lhr.lighthouseVersion, chrome: lhr.environment.hostUserAgent, benchmarkIndex: lhr.environment.benchmarkIndex }
        runs.push({
          scores: Object.fromEntries(CATEGORIES.map((c) => [c, Math.round(lhr.categories[c].score * 100)])),
          lcp: lhr.audits['largest-contentful-paint'].numericValue,
          cls: lhr.audits['cumulative-layout-shift'].numericValue,
          tbt: lhr.audits['total-blocking-time'].numericValue,
        })
        console.log(`${page.name} ${profile} #${n}: ${JSON.stringify(runs.at(-1).scores)}`)
      }
      rows.push({
        page: page.name,
        profile,
        runs: runs.length,
        scores: Object.fromEntries(CATEGORIES.map((c) => [c, median(runs.map((r) => r.scores[c]))])),
        lcp: median(runs.map((r) => r.lcp)),
        cls: median(runs.map((r) => r.cls)),
        tbt: median(runs.map((r) => r.tbt)),
      })
    }
  }
} finally {
  server.kill()
  if (process.platform === 'win32') spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' })
}

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const summary = {
  generatedAt: new Date().toISOString(),
  environment: { ...environment, node: process.version, os: `${os.type()} ${os.release()} (${os.arch()})`, cpus: os.cpus().length, vite: pkg.devDependencies.vite },
  conditions: 'Build de produção (vite build + vite preview), cenário padrão dos mocks, Chrome headless novo e anônimo a cada medição, três medições por página e perfil (mediana).',
  targets: TARGETS,
  results: rows,
}
writeFileSync(path.join(reports, 'summary.json'), JSON.stringify(summary, null, 2))

const header = `| Página | Perfil | ${CATEGORIES.join(' | ')} | LCP | CLS | TBT |`
const divider = `|---|---|${CATEGORIES.map(() => '---').join('|')}|---|---|---|`
const lines = rows.map((r) => {
  const cells = CATEGORIES.map((c) => `${r.scores[c]}${r.scores[c] < TARGETS[c] ? ' ⚠' : ''}`)
  return `| ${r.page} | ${r.profile} | ${cells.join(' | ')} | ${(r.lcp / 1000).toFixed(1)} s | ${r.cls.toFixed(3)} | ${Math.round(r.tbt)} ms |`
})
writeFileSync(
  path.join(reports, 'summary.md'),
  [
    '# Lighthouse — medianas de 3 medições',
    '',
    `Metas: ${CATEGORIES.map((c) => `${c} ≥ ${TARGETS[c]}`).join(', ')}. ⚠ = abaixo da meta.`,
    '',
    header,
    divider,
    ...lines,
    '',
    `Ambiente: Lighthouse ${summary.environment.lighthouse}, ${summary.environment.chrome}, Node ${summary.environment.node}, ${summary.environment.os}, ${summary.environment.cpus} CPUs.`,
    summary.conditions,
    '',
  ].join('\n'),
)
console.log(`\n${readFileSync(path.join(reports, 'summary.md'), 'utf8')}`)
