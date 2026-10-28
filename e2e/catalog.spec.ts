import { expect, test } from './support/kurio'

test.describe('Catálogo e falhas de rede', () => {
  test('lista o catálogo, filtra pela URL e pagina', async ({ page }) => {
    await page.goto('/mercado')
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible()

    await page.goto('/mercado?q=Emerald')
    await expect(page.getByRole('heading', { level: 3, name: /Emerald/ }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /Violet/ })).toHaveCount(0)

    await page.goto('/mercado')
    await page.getByRole('button', { name: 'Página 2' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
  })

  test('catálogo vazio mostra o estado vazio', async ({ app, page }) => {
    await app.scenario('catalog-empty')
    await page.goto('/mercado')
    await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible()
  })

  test('erro 500 mostra a falha e "Tentar novamente" recupera quando o servidor volta', async ({ app, page }) => {
    await app.scenario('server-error')
    await page.goto('/mercado')
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível carregar os NFTs' })).toBeVisible({ timeout: 20_000 })
    await page.evaluate(() => window.__mocks!.setScenario('default'))
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible()
  })

  test('falha transitória (503) é retentada sozinha e o catálogo aparece', async ({ app, page }) => {
    await app.scenario('flaky')
    await page.goto('/mercado')
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible({ timeout: 20_000 })
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível carregar' })).toHaveCount(0)
  })

  test('sem conexão (falha de rede) mostra o erro em vez de travar no skeleton', async ({ app, page }) => {
    await app.scenario('offline')
    await page.goto('/mercado')
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível carregar os NFTs' })).toBeVisible({ timeout: 20_000 })
  })

  test('timeout: a requisição estoura e o usuário pode tentar de novo', async ({ app, page }) => {
    test.setTimeout(90_000)
    await app.scenario('timeout')
    await page.goto('/mercado')
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível carregar os NFTs' })).toBeVisible({ timeout: 75_000 })
  })

  test('respostas fora de ordem: a lista final corresponde à última busca', async ({ app, page }) => {
    await app.scenario('out-of-order')
    await page.goto('/mercado?q=Violet', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('#root')).not.toBeEmpty()
    await page.goto('/mercado?q=Emerald', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { level: 3, name: /Emerald/ }).first()).toBeVisible()
    await page.waitForTimeout(2000)
    await expect(page.getByRole('heading', { level: 3, name: /Violet/ })).toHaveCount(0)
  })

  test('o destaque do início troca sozinho, com o relógio sob controle do teste', async ({ page }) => {
    await page.clock.install()
    await page.goto('/')
    const current = page.getByLabel('NFTs em destaque').locator('[aria-current="true"]').first()
    await expect(current).toHaveAttribute('aria-label', /destaque 1 de/)
    await page.clock.runFor(4100)
    await expect(current).toHaveAttribute('aria-label', /destaque 2 de/)
  })
})
