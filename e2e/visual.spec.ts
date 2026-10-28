import { expect, test } from './support/kurio'

test.use({ reducedMotion: 'reduce' })

const shot = { animations: 'disabled', fullPage: true, maxDiffPixelRatio: 0.001 } as const

async function settled(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    window.scrollTo(0, 0)
  })
  await expect.poll(() => page.evaluate(() => [...document.images].every((img) => img.complete || img.getClientRects().length === 0))).toBe(true)
  await expect(page.locator('.skeleton')).toHaveCount(0)
}

test.describe('Regressão visual', () => {
  test('Início', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible()
    await settled(page)
    await expect(page).toHaveScreenshot('inicio.png', shot)
  })

  test('Detalhe do NFT', async ({ page }) => {
    await page.goto('/nfts/nft-001')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await settled(page)
    await expect(page).toHaveScreenshot('detalhe.png', shot)
  })

  test('Carrinho', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
    await expect(page.locator('[aria-label="Itens do carrinho"] > li')).toHaveCount(3)
    await settled(page)
    await expect(page).toHaveScreenshot('carrinho.png', shot)
  })

  test('Pagamento', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/pagamento')
    await expect(page.locator('#displayName')).toBeVisible()
    await settled(page)
    await expect(page).toHaveScreenshot('pagamento.png', shot)
  })
})
