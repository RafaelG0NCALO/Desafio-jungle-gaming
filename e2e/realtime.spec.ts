import { expect, test } from './support/kurio'

const price = (page: import('@playwright/test').Page) => page.getByText(/^\d+\.\d+ ETH$/).first()

test.describe('Tempo real (Socket.IO)', () => {
  test('nft.updated atualiza o preço do detalhe sem recarregar, com aviso', async ({ app, page }) => {
    await page.goto('/nfts/nft-001')
    await app.waitForRealtime()
    await expect(price(page)).toHaveText('1.19 ETH')
    await app.updateNft('nft-001', { price: '2.10', previousPrice: '1.19' })
    await expect(price(page)).toHaveText('2.10 ETH')
    await expect(page.getByText('O preço de Emerald Ape #042 mudou de 1.19 para 2.10 ETH.')).toBeVisible()
  })

  test('evento duplicado e evento antigo não são aplicados', async ({ app, page }) => {
    await page.goto('/nfts/nft-001')
    await expect(price(page)).toHaveText('1.19 ETH')
    await app.waitForRealtime()
    await app.updateNft('nft-001', { price: '2.10', previousPrice: '1.19' })
    await expect(price(page)).toHaveText('2.10 ETH')
    const notices = page.getByText(/mudou de 1.19 para 2.10/)
    await expect(notices).toHaveCount(1)

    await app.realtime.resend()
    await app.realtime.sendStale('nft-001')
    await page.waitForTimeout(500)
    await expect(price(page)).toHaveText('2.10 ETH')
    await expect(notices).toHaveCount(1)
  })

  test('mudança de preço e de estoque chega ao carrinho aberto', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Emerald Ape #042').filter({ visible: true }).first()).toBeVisible()
    await app.waitForRealtime()
    await app.updateNft('nft-001', { price: '3.00' })
    await expect(page.getByText('Emerald Ape #042: o preço mudou de 1.19 para 3.00 ETH.')).toBeVisible()
    await expect(page.getByText(/^(3\.00|6\.00) ETH$/).filter({ visible: true }).first()).toBeVisible()
    await app.updateNft('nft-006', { availability: { open: 4 } })
    await expect(page.getByText(/Ivory Baron #088 \(ABERTA\): restam 4 unidades e o carrinho tem 9/)).toBeVisible()
  })

  test('queda da conexão: o evento perdido é recuperado pela API ao reconectar', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await expect(page.getByText('Emerald Ape #042').filter({ visible: true }).first()).toBeVisible()
    await app.waitForRealtime()
    await app.realtime.drop(2500)
    await expect(page.getByText('A conexão em tempo real caiu. Reconectando…')).toBeVisible()
    await app.updateNft('nft-001', { price: '3.50' })
    await expect(page.getByText('A conexão em tempo real caiu. Reconectando…')).toHaveCount(0, { timeout: 15_000 })
    await expect(page.getByText(/^(3\.50|7\.00) ETH$/).filter({ visible: true }).first()).toBeVisible()
  })

  test('pedido pendente é resolvido por order.updated, sem consulta periódica', async ({ app, page }) => {
    await app.login('marina')
    await app.scenario('payment-pending')
    await app.openCheckout()
    const polls: string[] = []
    page.on('request', (request) => {
      if (/\/api\/orders\/ord-/.test(request.url())) polls.push(request.url())
    })
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**')
    await expect(page.getByText('Estamos confirmando seu pedido')).toBeVisible()
    await expect(page.getByText('Detalhes da transação')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Seu pedido foi confirmado.')).toBeVisible()
    expect(polls.length).toBeLessThanOrEqual(1)
  })

  test('pedido pendente com a conexão interrompida: o estado final vem pela API ao reconectar', async ({ app, page }) => {
    test.setTimeout(60_000)
    await app.login('marina')
    await app.scenario('payment-pending')
    await app.openCheckout()
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**')
    await app.waitForRealtime()
    await app.realtime.drop(7000)
    await expect(page.getByText('Estamos confirmando seu pedido')).toBeVisible()
    await expect(page.getByText('Detalhes da transação')).toBeVisible({ timeout: 30_000 })
  })

  test('a conexão é refeita na troca de sessão: eventos de pedido não vazam para outro usuário', async ({ app, page }) => {
    await app.login('marina')
    await app.scenario('payment-pending')
    await app.openCheckout()
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**')
    const orderUrl = page.url()

    await page.evaluate(() => localStorage.removeItem('kurio.session.token'))
    await app.login('rafael')
    await page.goto(orderUrl)
    await expect(page.getByText('Sem acesso a este pedido')).toBeVisible()
    await page.waitForTimeout(5500)
    await expect(page.getByText('Seu pedido foi confirmado.')).toHaveCount(0)
    await expect(page.getByText('Detalhes da transação')).toHaveCount(0)
  })
})
