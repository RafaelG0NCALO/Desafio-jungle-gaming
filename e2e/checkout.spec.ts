import { expect, test } from './support/kurio'

test.describe('Pagamento', () => {
  test('compra confirmada mostra o recibo e esvazia o carrinho', async ({ app, page }) => {
    await app.login('marina')
    await app.openCheckout()
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**')
    await expect(page.getByText('Detalhes da transação')).toBeVisible()
    await page.goto('/carrinho')
    await expect(page.getByRole('heading', { name: /vazio|nenhum/i }).first()).toBeVisible()
  })

  test('sem carteira conectada a compra não é confirmada', async ({ app, page }) => {
    await app.login('marina')
    await app.openCheckout({ connected: false })
    await app.confirmButton().click()
    await expect(page.getByText('Conecte sua carteira para confirmar a compra.')).toBeVisible()
    expect(await app.orderCount()).toBe(0)
  })

  test('carteira recusa a conexão e a nova tentativa funciona', async ({ app, page }) => {
    await app.login('marina')
    await app.scenario('wallet-refused')
    await app.openCheckout({ connected: false })
    await page.getByRole('button', { name: 'Conectar carteira' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'Conexão recusada pela carteira.' })).toBeVisible()
    await app.connectWallet()
    await expect(page.getByRole('alert').filter({ hasText: 'recusada' })).toHaveCount(0)
  })

  test('carteira desconectada antes de confirmar bloqueia a compra até reconectar', async ({ app, page }) => {
    await app.login('marina')
    await app.openCheckout()
    await app.disconnectWallet()
    await app.confirmButton().click()
    await expect(page.getByText(/carteira não está conectada/i)).toBeVisible()
    expect(await app.orderCount()).toBe(0)
    await app.connectWallet()
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**')
  })

  test('preço muda durante a compra: revalida, lista a mudança e exige nova confirmação', async ({ app, page }) => {
    await app.login('marina')
    await app.openCheckout()
    await app.updateNft('nft-001', { price: '1.50' })
    await app.confirmButton().click()
    await expect(page.getByText('Os valores do pedido mudaram. Revise o resumo e confirme novamente.')).toBeVisible()
    await expect(page.getByRole('listitem').filter({ hasText: 'Emerald Ape #042: o preço mudou de 1.19 para 1.50 ETH.' })).toBeVisible()
    expect(await app.orderCount()).toBe(0)
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**')
  })

  test('disponibilidade cai: pede ajuste no carrinho e libera depois de ajustar', async ({ app, page }) => {
    await app.login('marina')
    await app.openCheckout()
    await app.updateNft('nft-006', { availability: { open: 5 } })
    await app.confirmButton().click()
    await expect(page.getByText(/restam 5 unidades e o carrinho tem 9/)).toBeVisible()
    expect(await app.orderCount()).toBe(0)

    await page.getByRole('link', { name: 'Ajustar no carrinho' }).click()
    await page.waitForURL('**/carrinho')
    await expect(page.getByRole('alert').filter({ hasText: 'Só restam 5 unidades' })).toBeVisible()
    const ivory = page.locator('[aria-label="Itens do carrinho"] > li').nth(2)
    for (let i = 0; i < 4; i++) {
      await ivory.getByLabel('Diminuir quantidade').locator('visible=true').click()
      await expect(ivory.locator('output:visible')).toHaveText(String(8 - i))
    }
    await expect(page.getByRole('alert').filter({ hasText: 'Só restam' })).toHaveCount(0)
  })

  test('cupom expira antes de confirmar: o desconto sai e o total é atualizado', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carrinho')
    await page.getByLabel('Código promocional').fill('kurio10')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText(/aplicado/).first()).toBeVisible()
    await app.openCheckout()
    await app.expireCoupon('KURIO10')
    await app.confirmButton().click()
    await expect(page.getByText('O cupom KURIO10 expirou e o desconto foi removido.')).toBeVisible()
    expect(await app.orderCount()).toBe(0)
  })

  test('pagamento recusado não confirma o pedido nem esvazia o carrinho', async ({ app, page }) => {
    await app.login('marina')
    await app.scenario('payment-declined')
    await app.openCheckout()
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**')
    await expect(page.getByText(/recusad/i).first()).toBeVisible()
    await expect(page.getByText('Detalhes da transação')).toHaveCount(0)
    await page.goto('/carrinho')
    await expect(page.getByText('Ivory Baron #088').filter({ visible: true }).first()).toBeVisible()
    await expect(page.locator('[aria-label="Itens do carrinho"] > li')).toHaveCount(3)
  })

  test('timeout depois de criar o pedido: reenviar recupera o mesmo pedido, sem duplicar', async ({ app, page }) => {
    test.setTimeout(90_000)
    await app.login('marina')
    await app.scenario('order-timeout')
    await app.openCheckout()
    await app.confirmButton().click()
    await expect(page.getByText(/tempo|demor|novamente/i).first()).toBeVisible({ timeout: 60_000 })
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**', { timeout: 60_000 })
    expect(await app.orderCount()).toBe(1)
  })

  test('clique repetido em "Confirmar compra" cria um único pedido', async ({ app, page }) => {
    await app.login('marina')
    await app.openCheckout()
    await app.confirmButton().dblclick()
    await page.waitForURL('**/pedido/**')
    expect(await app.orderCount()).toBe(1)
    await page.goBack()
    await page.waitForTimeout(500)
    expect(await app.orderCount()).toBe(1)
  })

  test('pedido de outro usuário responde 403 e não vaza dados', async ({ app, page }) => {
    await app.login('marina')
    await app.openCheckout()
    await app.confirmButton().click()
    await page.waitForURL('**/pedido/**')
    const orderUrl = page.url()

    await page.evaluate(() => localStorage.removeItem('kurio.session.token'))
    await app.login('rafael')
    await page.goto(orderUrl)
    await expect(page.getByText('Sem acesso a este pedido')).toBeVisible()
    await expect(page.getByText('Detalhes da transação')).toHaveCount(0)
  })
})
