import { expect, test } from './support/kurio'

const rows = (page: import('@playwright/test').Page) => page.locator('[aria-label="Itens do carrinho"] > li')

test.describe('Carrinho', () => {
  test('comprar a partir do detalhe leva ao carrinho com o item', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/nfts/nft-002')
    await page.getByRole('button', { name: /^(COMPRAR|Comprar NFT)$/ }).filter({ visible: true }).click()
    await page.waitForURL('**/carrinho')
    await expect(page.getByText('Sage Nomad #009').filter({ visible: true }).first()).toBeVisible()
  })

  test('altera a quantidade, respeita o limite e remove o item', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
    await expect(rows(page)).toHaveCount(3)

    const first = rows(page).first()
    const quantity = first.locator('output:visible')
    await expect(quantity).toHaveText('2')
    await first.getByLabel('Aumentar quantidade').locator('visible=true').click()
    await expect(quantity).toHaveText('3')

    const ivory = rows(page).nth(2)
    await ivory.getByLabel('Aumentar quantidade').locator('visible=true').click()
    await expect(ivory.getByLabel('Aumentar quantidade').locator('visible=true')).toBeDisabled()

    await page.getByRole('button', { name: /Remover Violet/ }).click()
    await expect(rows(page)).toHaveCount(2)
  })

  test('cupom: inválido, expirado e válido', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
    await expect(rows(page)).toHaveCount(3)
    const code = page.getByLabel('Código promocional')

    await code.fill('XYZ')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.locator('#coupon-error')).toBeVisible()

    await code.fill('expirado')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.locator('#coupon-error')).toContainText(/expirou|expirado/i)

    await code.fill('kurio10')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText(/aplicado/).first()).toBeVisible()
  })

  test('o carrinho persiste ao recarregar a página', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
    await expect(rows(page)).toHaveCount(3)
    const saved = page.waitForResponse((r) => r.url().includes('/api/cart/items/') && r.request().method() === 'PATCH')
    await rows(page).first().getByLabel('Aumentar quantidade').locator('visible=true').click()
    await saved
    await page.reload()
    await expect(rows(page).first().locator('output:visible')).toHaveText('3')
  })

  test('recusa da API (409) desfaz a alteração otimista e avisa', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
    await expect(rows(page)).toHaveCount(3)
    await page.evaluate(() => window.__mocks!.setScenario('client-error'))
    const first = rows(page).first()
    await first.getByLabel('Aumentar quantidade').locator('visible=true').click()
    await expect(page.getByRole('alert').filter({ hasText: /indisponível|Quantidade/i })).toBeVisible()
    await expect(first.locator('output:visible')).toHaveText('2')
  })

  test('carrinhos são separados por usuário', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
    await expect(rows(page)).toHaveCount(3)
    const saved = page.waitForResponse((r) => r.url().includes('/api/cart/items/') && r.request().method() === 'PATCH')
    await rows(page).first().getByLabel('Aumentar quantidade').locator('visible=true').click()
    await saved

    await page.evaluate(() => localStorage.removeItem('kurio.session.token'))
    await app.login('rafael')
    await page.goto('/carrinho')
    await expect(page.getByText('Emerald Ape #042')).toHaveCount(0)
    await expect(rows(page)).toHaveCount(0)

    await page.evaluate(() => localStorage.removeItem('kurio.session.token'))
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(rows(page).first().locator('output:visible')).toHaveText('3')
  })

  test.describe('Cotação (POST /api/quote)', () => {
    type Quote = {
      quote: { subtotal: string; discount: string; total: string }
      coupon: { code: string | null; status: string; message?: string }
      items: { id: string; available: boolean; maxQuantity: number }[]
      available: boolean
    }

    const quote = (page: import('@playwright/test').Page, body: object) =>
      page.evaluate(async (payload) => {
        const token = localStorage.getItem('kurio.session.token')
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(payload),
        })
        return { status: response.status, body: (await response.json()) as Quote }
      }, body)

    test('cota o carrinho atual sem gravar nada e informa a disponibilidade', async ({ app, page }) => {
      await app.login('marina')
      await page.goto('/carrinho')
      await app.mocksReady()
      const none = await quote(page, {})
      expect(none.status).toBe(200)
      expect(none.body.coupon).toEqual({ code: null, status: 'none' })
      expect(none.body.items).toHaveLength(3)
      expect(none.body.available).toBe(true)

      await app.updateNft('nft-006', { availability: { open: 5 } })
      const tight = await quote(page, {})
      expect(tight.body.available).toBe(false)
      expect(tight.body.items.filter((item) => !item.available)).toHaveLength(1)
    })

    test('valida o cupom: válido reduz o total (sem aplicar), inválido e expirado voltam como estado', async ({ app, page }) => {
      await app.login('marina')
      await page.goto('/carrinho')
      await app.mocksReady()
      const base = await quote(page, { couponCode: null })
      const valid = await quote(page, { couponCode: 'kurio10' })
      expect(valid.body.coupon).toEqual({ code: 'KURIO10', status: 'valid' })
      expect(Number(valid.body.quote.discount)).toBeGreaterThan(0)
      expect(Number(valid.body.quote.total)).toBeLessThan(Number(base.body.quote.total))

      const expired = await quote(page, { couponCode: 'expirado' })
      expect(expired.status).toBe(200)
      expect(expired.body.coupon).toMatchObject({ status: 'expired', message: 'Este cupom expirou.' })
      expect(expired.body.quote.total).toBe(base.body.quote.total)

      const invalid = await quote(page, { couponCode: 'xyz' })
      expect(invalid.body.coupon).toMatchObject({ status: 'invalid', message: 'Cupom inválido.' })

      await page.reload()
      await expect(page.getByText(/aplicado/)).toHaveCount(0)
    })

    test('a tela de cupom usa a cotação: código inválido mostra o erro e nada é aplicado', async ({ app, page }) => {
      await app.login('marina')
      await page.goto('/carrinho')
      await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
      const requests: string[] = []
      page.on('request', (request) => {
        if (request.url().includes('/api/quote') || request.url().includes('/api/cart/coupon')) requests.push(new URL(request.url()).pathname)
      })
      await page.getByLabel('Código promocional').fill('xyz')
      await page.getByRole('button', { name: 'Aplicar' }).click()
      await expect(page.locator('#coupon-error')).toHaveText('Cupom inválido.')
      expect(requests).toEqual(['/api/quote'])
    })
  })
})
