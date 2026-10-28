import { expect, test } from './support/kurio'

test.describe('Service worker do mock encerrado pelo navegador', () => {
  test('voltar à aba depois de o service worker ser derrubado não quebra o app', async ({ app, page, context }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
    await app.mocksReady()

    const cdp = await context.newCDPSession(page)
    await cdp.send('ServiceWorker.enable')
    await cdp.send('ServiceWorker.stopAllWorkers')

    await page.evaluate(() => {
      const setHidden = (hidden: boolean) => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
        document.dispatchEvent(new Event('visibilitychange'))
      }
      setHidden(true)
      setHidden(false)
    })

    const first = page.locator('[aria-label="Itens do carrinho"] > li').first()
    const saved = page.waitForResponse((r) => r.url().includes('/api/cart/items/') && r.request().method() === 'PATCH')
    await first.getByLabel('Aumentar quantidade').locator('visible=true').click()
    const response = await saved
    expect(response.headers()['content-type']).toContain('application/json')
    await expect(first.locator('output:visible')).toHaveText('3')
  })
})
