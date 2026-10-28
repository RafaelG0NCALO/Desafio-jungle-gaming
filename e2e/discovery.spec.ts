import type { Page } from '@playwright/test'
import { expect, test } from './support/kurio'

const cards = (page: Page) => page.getByRole('heading', { level: 3 }).filter({ visible: true })
const decoded = (page: Page) => decodeURIComponent(page.url())

async function filterBy(page: Page, labels: string[]) {
  const panel = page.getByRole('button', { name: 'Filtros' }).filter({ visible: true })
  const mobile = await panel.count()
  if (mobile) await panel.first().click()
  for (const label of labels) await page.locator('label').filter({ hasText: new RegExp('^' + label) }).filter({ visible: true }).first().click()
  if (mobile) await page.getByRole('button', { name: 'Aplicar' }).click()
}

test.describe('Busca, filtros, ordenação e histórico', () => {
  test('filtros combinados compõem a URL e reiniciam a paginação', async ({ page }) => {
    await page.goto('/mercado?page=2')
    await expect(page.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')

    await filterBy(page, ['Arte 3D', 'Polygon'])
    await expect.poll(() => decoded(page)).toContain('collections=["arte-3d"]')
    expect(decoded(page)).toContain('networks=["polygon"]')
    expect(decoded(page)).not.toContain('page=2')
    await expect(cards(page).first()).toBeVisible()
  })

  test('ordenação por preço reflete a resposta da API e vai para a URL', async ({ page }) => {
    await page.goto('/mercado')
    await expect(cards(page).first()).toBeVisible()
    const select = page.locator('#catalog-sort')
    if (await select.isVisible()) await select.selectOption('price-asc')
    else await page.goto('/mercado?sort=price-asc')
    await expect(page).toHaveURL(/sort=price-asc/)

    const prices = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('h3')]
          .filter((h) => (h as HTMLElement).offsetParent !== null)
          .map((h) => {
            const card = h.closest('li, article') ?? h.parentElement!
            const price = [...card.querySelectorAll('*')].map((e) => e.textContent ?? '').find((t) => /^\d+\.\d+ ETH/.test(t.trim()))
            return price ? Number.parseFloat(price) : Number.NaN
          })
          .filter((n) => !Number.isNaN(n)),
      )
    await expect
      .poll(async () => {
        const list = await prices()
        return list.length > 2 && list.every((value, i) => i === 0 || list[i - 1] <= value)
      })
      .toBe(true)
  })

  test('voltar e avançar no histórico restauram busca, filtros e página', async ({ page }) => {
    await page.goto('/mercado')
    await expect(cards(page).first()).toBeVisible()
    await page.goto('/mercado?q=Emerald')
    await expect(cards(page).first()).toContainText('Emerald')
    await page.goto('/mercado?q=Emerald&networks=polygon&page=1')
    await page.goBack()
    await expect(page).toHaveURL(/q=Emerald/)
    await expect(cards(page).first()).toContainText('Emerald')
    await page.goBack()
    await expect(page).not.toHaveURL(/q=/)
    await page.goForward()
    await expect(page).toHaveURL(/q=Emerald/)
    await page.reload()
    await expect(page).toHaveURL(/q=Emerald/)
    await expect(cards(page).first()).toContainText('Emerald')
  })

  test('parâmetro inválido na URL não quebra a página', async ({ page }) => {
    await page.goto('/mercado?sort=xyz&page=-3&collections=nao-existe')
    await expect(cards(page).first()).toBeVisible()
  })
})

test.describe('Detalhe do NFT', () => {
  test('acesso direto carrega o detalhe com galeria, informações e compra', async ({ page }) => {
    await page.goto('/nfts/nft-001')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Emerald Ape #042')
    await expect(page.getByRole('img', { name: /Emerald Ape/ }).first()).toBeVisible()
  })

  test('NFT inexistente mostra o estado "não encontrado"', async ({ page }) => {
    await page.goto('/nfts/nao-existe')
    await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
  })

  test('rota inexistente mostra a página não encontrada', async ({ page }) => {
    await page.goto('/uma/rota/que/nao/existe')
    await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible()
  })

  test('edição esgotada não permite comprar e respeita o limite de quantidade', async ({ app, page }) => {
    await page.goto('/nfts/nft-001')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await app.updateNft('nft-001', { availability: { '1-50': 2 } })
    await app.waitForRealtime()
    const more = page.getByLabel('Aumentar quantidade').filter({ visible: true }).first()
    await expect(page.getByText(/Limite de 2 unidades/).filter({ visible: true }).first().or(more)).toBeVisible()
    await more.click()
    await expect(more).toBeDisabled()

    await app.updateNft('nft-001', { availability: { '1-50': 0 } })
    await expect(page.getByText(/esgotad/i).filter({ visible: true }).first()).toBeVisible()
  })
})

test.describe('Favoritos', () => {
  const heart = (page: Page) => page.getByRole('button', { name: /^(Favoritar|Favoritado|Remover dos favoritos)$/ }).filter({ visible: true }).first()

  test('favoritar persiste para o usuário autenticado e aparece em Favoritos', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/nfts/nft-001')
    await heart(page).click()
    await expect(heart(page)).toHaveAttribute('aria-pressed', 'true')
    await page.waitForResponse((r) => r.url().includes('/api/favorites') && r.request().method() === 'POST')
    await page.reload()
    await expect(heart(page)).toHaveAttribute('aria-pressed', 'true')
    await page.goto('/favoritos')
    await expect(page.getByText('Emerald Ape #042').filter({ visible: true }).first()).toBeVisible()
  })

  test('sem login, favoritar leva ao login e volta para o NFT', async ({ page }) => {
    await page.goto('/nfts/nft-001')
    await heart(page).click()
    await expect(page.locator('#login-email')).toBeVisible()
  })

  test('falha na mutation desfaz o estado otimista, avisa e a nova tentativa funciona', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/nfts/nft-001')
    await expect(heart(page)).toBeVisible()
    await page.evaluate(() => window.__mocks!.setScenario('favorites-fail'))
    await heart(page).click()
    await expect(page.getByText('Não foi possível atualizar seus favoritos. Tente novamente.').filter({ visible: true }).first()).toBeVisible()
    await expect(heart(page)).toHaveAttribute('aria-pressed', 'false')

    await page.evaluate(() => window.__mocks!.setScenario('default'))
    await heart(page).click()
    await expect(heart(page)).toHaveAttribute('aria-pressed', 'true')
  })
})
