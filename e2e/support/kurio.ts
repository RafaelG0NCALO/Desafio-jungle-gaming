import { expect, test as base, type Page } from '@playwright/test'

export const USERS = {
  marina: { email: 'marina@email.com', password: 'Kurio@123' },
  rafael: { email: 'rafael@email.com', password: 'Kurio@456' },
} as const

type Edition = Record<string, number | null>

interface Mocks {
  setScenario: (name: string) => unknown
  updateNft: (id: string, patch: { price?: string; previousPrice?: string | null; availability?: Edition }) => unknown
  expireCoupon: (code: string) => void
  expireSession: () => Promise<void>
  seedCart: () => Promise<void>
  disconnectWallet: () => void
  realtime: { drop: (blockMs?: number) => void; resend: () => number; sendStale: (id: string) => unknown; connections: () => number }
}

declare global {
  interface Window {
    __mocks?: Mocks
  }
}

export class Kurio {
  constructor(readonly page: Page) {}

  async mocksReady() {
    await this.page.waitForFunction(() => window.__mocks !== undefined && navigator.serviceWorker.controller !== null)
  }

  async scenario(name: string) {
    await this.page.goto('/')
    await this.mocksReady()
    await this.page.evaluate((n) => window.__mocks!.setScenario(n), name)
  }

  async slowNetwork(ms = 4000) {
    await this.page.goto('/')
    await this.mocksReady()
    await this.page.evaluate(
      (latency) => (window.__mocks!.setScenario as unknown as (scenario: object) => unknown)({ name: 'lenta', description: 'teste', latency: { base: latency } }),
      ms,
    )
  }

  async updateNft(id: string, patch: Parameters<Mocks['updateNft']>[1]) {
    await this.mocksReady()
    return this.page.evaluate(([i, p]) => window.__mocks!.updateNft(i, p), [id, patch] as const)
  }

  async expireCoupon(code: string) {
    await this.mocksReady()
    await this.page.evaluate((c) => window.__mocks!.expireCoupon(c), code)
  }

  async expireSession() {
    await this.mocksReady()
    await this.page.evaluate(() => window.__mocks!.expireSession())
  }

  async disconnectWallet() {
    await this.mocksReady()
    await this.page.evaluate(() => window.__mocks!.disconnectWallet())
  }

  realtime = {
    drop: async (blockMs: number) => {
      await this.mocksReady()
      await this.page.evaluate((ms) => window.__mocks!.realtime.drop(ms), blockMs)
    },
    resend: async () => {
      await this.mocksReady()
      return this.page.evaluate(() => window.__mocks!.realtime.resend())
    },
    sendStale: async (id: string) => {
      await this.mocksReady()
      await this.page.evaluate((i) => window.__mocks!.realtime.sendStale(i), id)
    },
    connections: async () => {
      await this.mocksReady()
      return this.page.evaluate(() => window.__mocks!.realtime.connections())
    },
  }

  async waitForRealtime() {
    await expect.poll(() => this.realtime.connections()).toBeGreaterThan(0)
  }

  async login(user: keyof typeof USERS = 'marina', { withCart = true } = {}) {
    const { email, password } = USERS[user]
    await this.page.goto('/?auth=login')
    if (withCart) {
      await this.mocksReady()
      await this.page.evaluate(() => window.__mocks!.seedCart())
    }
    await this.page.locator('#login-email').fill(email)
    await this.page.locator('#login-password').fill(password)
    await this.page.locator('#login-email').locator('xpath=ancestor::form').getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect.poll(() => this.page.evaluate(() => localStorage.getItem('kurio.session.token'))).not.toBeNull()
    await expect(this.page.getByRole('link', { name: /^Carrinho,/ }).or(this.page.getByRole('link', { name: 'Carrinho' })).first()).toBeAttached()
  }

  async fillCollector() {
    const { page } = this
    await page.locator('#displayName').fill('Marina Costa')
    await page.locator('#username').fill('marina_costa')
    await page.locator('#network').selectOption('ethereum')
    await page.locator('#profileName').fill('Marina')
    await page.locator('#walletAddress').fill(`0x${'a'.repeat(40)}`)
    await page.locator('#referralCode').fill('KURIO-1')
    await page.locator('#email').fill('marina@email.com')
  }

  async connectWallet() {
    await this.page.getByRole('button', { name: 'Conectar carteira' }).click()
    await expect(this.page.getByText(/Carteira conectada:/)).toBeVisible()
  }

  async openCheckout({ connected = true } = {}) {
    await this.page.goto('/pagamento')
    await expect(this.page.locator('#displayName')).toBeVisible()
    await this.fillCollector()
    if (connected) await this.connectWallet()
  }

  confirmButton() {
    return this.page.getByRole('button', { name: 'Confirmar compra' })
  }

  orderCount() {
    return this.page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('kurio.mock.orders') ?? '{"orders":{}}').orders).length)
  }
}

export const test = base.extend<{ app: Kurio }>({
  app: async ({ page }, provide) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await provide(new Kurio(page))
    expect(errors, 'exceções não tratadas na página').toEqual([])
  },
})

export { expect }
