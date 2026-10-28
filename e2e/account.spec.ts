import { expect, test, USERS } from './support/kurio'

const submitSignup = (page: import('@playwright/test').Page) =>
  page.locator('#signup-username').locator('xpath=ancestor::form').getByRole('button', { name: /^Criar (conta|perfil)$/ }).click()

test.describe('Cadastro, logout e troca de usuário', () => {
  test('cadastro com dados novos cria a conta, entra e mantém a sessão após refresh', async ({ page }) => {
    await page.goto('/?auth=signup')
    await page.locator('#signup-username').fill('nova_pessoa')
    await page.locator('#signup-email').fill('nova@email.com')
    await page.locator('#signup-password').fill('Senha@1234')
    await page.locator('#signup-confirm').fill('Senha@1234')
    await submitSignup(page)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('kurio.session.token'))).not.toBeNull()

    await page.goto('/perfil')
    await expect(page.locator('#username')).toHaveValue('nova_pessoa')
    await page.reload()
    await expect(page.locator('#username')).toHaveValue('nova_pessoa')
  })

  test('conflito no cadastro mostra o erro da API no campo certo', async ({ page }) => {
    await page.goto('/?auth=signup')
    await page.locator('#signup-username').fill('marina_costa')
    await page.locator('#signup-email').fill(USERS.marina.email)
    await page.locator('#signup-password').fill('Senha@1234')
    await page.locator('#signup-confirm').fill('Senha@1234')
    await submitSignup(page)
    await expect(page.getByText('Este e-mail já está cadastrado.')).toBeVisible()
    await expect(page.getByText('Este nome de usuário já está em uso.')).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('kurio.session.token'))).toBeNull()
  })

  test('logout encerra a sessão, limpa o cache privado e bloqueia as rotas privadas', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/perfil')
    await expect(page.locator('#displayName')).toHaveValue('Marina Costa')
    await page.getByRole('button', { name: 'Sair' }).filter({ visible: true }).first().click()
    await expect.poll(() => page.evaluate(() => localStorage.getItem('kurio.session.token'))).toBeNull()
    await page.goto('/perfil')
    await expect(page.locator('#login-email')).toBeVisible()
  })

  test('troca de usuário na mesma aba não mostra o perfil do anterior', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/perfil')
    await expect(page.locator('#displayName')).toHaveValue('Marina Costa')
    await page.getByRole('button', { name: 'Sair' }).filter({ visible: true }).first().click()
    await expect.poll(() => page.evaluate(() => localStorage.getItem('kurio.session.token'))).toBeNull()
    await app.login('rafael')
    await page.goto('/perfil')
    await expect(page.locator('#displayName')).toHaveValue('Rafael Dias')
  })

  test('itens do visitante são preservados ao entrar', async ({ app, page }) => {
    await page.goto('/nfts/nft-002')
    await page.getByRole('button', { name: /^(COMPRAR|Comprar NFT)$/ }).filter({ visible: true }).click()
    await page.waitForURL('**/carrinho')
    await expect(page.getByText('Sage Nomad #009').filter({ visible: true }).first()).toBeVisible()
    await app.login('rafael', { withCart: false })
    await page.goto('/carrinho')
    await expect(page.getByText('Sage Nomad #009').filter({ visible: true }).first()).toBeVisible()
  })
})

test.describe('Perfil', () => {
  test('edição de dados é validada, salva e permanece após refresh', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/perfil')
    await page.locator('#displayName').fill('M')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Informe o nome de exibição')).toBeVisible()

    await page.locator('#displayName').fill('Marina Editada')
    await page.locator('#walletNickname').fill('Minha carteira')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Alterações salvas.')).toBeVisible()
    await page.reload()
    await expect(page.locator('#displayName')).toHaveValue('Marina Editada')
    await expect(page.locator('#walletNickname')).toHaveValue('Minha carteira')
  })

  test('erro de conflito da API aparece no campo (nome de usuário de outra conta)', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/perfil')
    await page.locator('#username').fill('rafael_dias')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Este nome de usuário já está em uso.')).toBeVisible()
  })

  test('senha: valida o formulário, recusa a atual incorreta e aceita a troca', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/perfil')

    await page.locator('#currentPassword').fill(USERS.marina.password)
    await page.locator('#newPassword').fill('curta')
    await page.locator('#confirmNewPassword').fill('outra')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Use pelo menos 8 caracteres')).toBeVisible()
    await expect(page.getByText('As senhas não coincidem')).toBeVisible()

    await page.locator('#currentPassword').fill('Errada@999')
    await page.locator('#newPassword').fill('Nova@12345')
    await page.locator('#confirmNewPassword').fill('Nova@12345')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Senha atual incorreta.')).toBeVisible()

    await page.locator('#currentPassword').fill(USERS.marina.password)
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Dados e senha atualizados.')).toBeVisible()

    await page.evaluate(() => localStorage.removeItem('kurio.session.token'))
    await page.goto('/?auth=login')
    await page.locator('#login-email').fill(USERS.marina.email)
    await page.locator('#login-password').fill(USERS.marina.password)
    await page.locator('#login-email').locator('xpath=ancestor::form').getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
    await page.locator('#login-password').fill('Nova@12345')
    await page.locator('#login-email').locator('xpath=ancestor::form').getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect.poll(() => page.evaluate(() => localStorage.getItem('kurio.session.token'))).not.toBeNull()
  })

  test('avatar: envia uma imagem, recusa arquivo que não é imagem e remove', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/perfil')
    const input = page.locator('input[type="file"]')
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    await input.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: png })
    await expect(page.getByRole('button', { name: 'Remover' })).toBeEnabled()
    await expect(page.getByRole('img', { name: 'Sem avatar' })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('button', { name: 'Remover' })).toBeEnabled()

    await input.setInputFiles({ name: 'nota.txt', mimeType: 'text/plain', buffer: Buffer.from('não sou imagem') })
    await expect(page.getByRole('alert').filter({ hasText: /imagem/i })).toBeVisible()

    await page.getByRole('button', { name: 'Remover' }).click()
    await expect(page.getByRole('img', { name: 'Sem avatar' })).toBeVisible()
  })
})

test.describe('Carteiras', () => {
  test('carteira principal: valida os campos, salva e mantém após refresh', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carteiras')
    await expect(page.locator('#primary-label')).toBeVisible()

    await page.locator('#primary-address').fill('0x123')
    await page.getByRole('button', { name: 'Salvar carteira' }).first().click()
    await expect(page.getByText('Informe o nome de exibição')).toBeVisible()
    await expect(page.getByText('Informe o código de indicação').first()).toBeVisible()
    await expect(page.locator('p[id$="address-error"]').first()).toBeVisible()

    await page.locator('#primary-displayName').fill('Marina Costa')
    await page.locator('#primary-label').fill('Principal editada')
    await page.locator('#primary-network').selectOption('ethereum')
    await page.locator('#primary-walletType').selectOption({ index: 1 })
    await page.locator('#primary-profileName').fill('Marina')
    await page.locator('#primary-address').fill(`0x${'b'.repeat(40)}`)
    await page.locator('#primary-referralCode').fill('KURIO-1')
    await page.locator('#primary-email').fill('marina@email.com')
    await page.getByRole('button', { name: 'Salvar carteira' }).first().click()
    await expect(page.getByText('Carteira salva.').first()).toBeVisible()
    await page.reload()
    await expect(page.locator('#primary-label')).toHaveValue('Principal editada')
  })

  test('carteira secundária: adicionar, salvar e persistir', async ({ app, page }) => {
    await app.login('marina')
    await page.goto('/carteiras')
    await page.getByRole('button', { name: 'Adicionar' }).last().click()
    await expect(page.locator('#secondary-label')).toBeVisible()
    await page.locator('#secondary-displayName').fill('Marina Costa')
    await page.locator('#secondary-label').fill('Reserva')
    await page.locator('#secondary-network').selectOption('ethereum')
    await page.locator('#secondary-walletType').selectOption({ index: 1 })
    await page.locator('#secondary-profileName').fill('Marina')
    await page.locator('#secondary-address').fill(`0x${'c'.repeat(40)}`)
    await page.locator('#secondary-referralCode').fill('KURIO-2')
    await page.locator('#secondary-email').fill('marina@email.com')
    await page.getByRole('button', { name: 'Salvar carteira' }).last().click()
    await expect(page.getByText('Carteira salva.').last()).toBeVisible()
    await page.reload()
    await expect(page.locator('#secondary-label')).toHaveValue('Reserva')
  })
})
