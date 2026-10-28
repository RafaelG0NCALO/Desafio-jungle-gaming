import { expect, test, USERS } from './support/kurio'

test.describe('Conta e sessão', () => {
  test('login com credenciais válidas guarda a sessão e libera as rotas privadas', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/perfil')
    await expect(page.locator('#displayName')).toBeVisible()
  })

  test('credenciais inválidas mostram o erro e não criam sessão', async ({ page }) => {
    await page.goto('/?auth=login')
    await page.locator('#login-email').fill(USERS.marina.email)
    await page.locator('#login-password').fill('senha-errada')
    await page.locator('#login-email').locator('xpath=ancestor::form').getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('kurio.session.token'))).toBeNull()
  })

  test('rota privada sem sessão leva ao login e volta ao destino depois de entrar', async ({ page }) => {
    await page.goto('/carteiras')
    await expect(page.locator('#login-email')).toBeVisible()
    expect(decodeURIComponent(page.url())).toContain('redirect=/carteiras')
    await page.locator('#login-email').fill(USERS.marina.email)
    await page.locator('#login-password').fill(USERS.marina.password)
    await page.locator('#login-email').locator('xpath=ancestor::form').getByRole('button', { name: 'Entrar', exact: true }).click()
    await page.waitForURL('**/carteiras')
    await expect(page.getByRole('heading', { name: /carteira/i }).first()).toBeVisible()
  })

  test('cadastro valida o formulário antes de enviar', async ({ page }) => {
    await page.goto('/?auth=signup')
    await page.locator('#signup-username').fill('ab')
    await page.locator('#signup-email').fill('x')
    await page.locator('#signup-password').fill('12345678')
    await page.locator('#signup-confirm').fill('1234')
    await page.getByRole('button', { name: /^Criar (conta|perfil)$/ }).last().click()
    await expect(page.locator('p[id$="-error"]').first()).toBeVisible()
    expect(await page.locator('p[id$="-error"]').count()).toBeGreaterThanOrEqual(3)
  })

  test('sessão que expira no meio do uso leva ao login com aviso e retoma a página', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/perfil')
    await expect(page.locator('#displayName')).toBeVisible()
    await app.expireSession()
    await page.locator('#walletNickname').fill('Apelido editado')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.getByText(/sessão expirou/i).first()).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('kurio.session.token'))).toBeNull()

    await page.locator('#login-email').fill(USERS.marina.email)
    await page.locator('#login-password').fill(USERS.marina.password)
    await page.locator('#login-email').locator('xpath=ancestor::form').getByRole('button', { name: 'Entrar', exact: true }).click()
    await page.waitForURL('**/perfil')
    await expect(page.locator('#displayName')).toBeVisible()
  })

  test('os dados de um usuário não aparecem para o outro no mesmo navegador', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/nfts/nft-001')
    const favorite = page.getByRole('button', { name: /Favoritar|Favoritado|Remover dos favoritos/ }).locator('visible=true').first()
    const saved = page.waitForResponse((r) => r.url().includes('/api/favorites') && r.request().method() === 'POST')
    await favorite.click()
    await expect(favorite).toHaveAttribute('aria-pressed', 'true')
    await saved
    await page.goto('/favoritos')
    await expect(page.getByText('Emerald Ape #042').filter({ visible: true }).first()).toBeVisible()

    await page.evaluate(() => localStorage.removeItem('kurio.session.token'))
    await app.login('rafael')
    await page.goto('/favoritos')
    await expect(page.getByText('Emerald Ape #042')).toHaveCount(0)
  })
})
