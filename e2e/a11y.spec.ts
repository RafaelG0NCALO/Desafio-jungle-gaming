import { expect, test } from './support/kurio'

test.describe('Teclado, foco e formulários', () => {
  test('modal de login: foco entra, fica preso, Esc fecha e o foco volta ao gatilho', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No mobile/iPad o login é uma página, não uma modal.')
    await page.goto('/')
    const trigger = page.getByRole('link', { name: 'Entrar' })
    await trigger.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.locator('#login-email')).toBeFocused().catch(async () => {
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    })

    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Shift+Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('painel de filtros (mobile/iPad): foco dentro, Esc fecha e o foco volta ao botão', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'O painel de filtros só existe abaixo de 1024 px.')
    await page.goto('/mercado')
    const open = page.getByRole('button', { name: 'Filtros' }).first()
    await open.click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab')
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(sheet).toHaveCount(0)
    await expect(open).toBeFocused()
  })

  test('formulário de login: erros ficam associados aos campos e anunciados', async ({ page }) => {
    await page.goto('/?auth=login')
    const email = page.locator('#login-email')
    await email.locator('xpath=ancestor::form').getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    const describedBy = await email.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    await expect(page.locator(`#${describedBy}`)).toBeVisible()
    await expect(page.getByLabel('E-mail').filter({ visible: true }).first()).toBeVisible()
    await expect(page.getByLabel('Senha').filter({ visible: true }).first()).toBeVisible()
  })

  test('foco visível: o primeiro Tab da página mostra um contorno no elemento focado', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab')
      if (await page.evaluate(() => document.activeElement !== document.body)) break
    }
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement
      let node: HTMLElement | null = el
      for (let i = 0; i < 3 && node; i++, node = node.parentElement) {
        const style = getComputedStyle(node)
        if (style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0) return { tag: el.tagName, width: style.outlineWidth, style: style.outlineStyle }
      }
      return { tag: el.tagName, width: '0px', style: 'none' }
    })
    expect(outline.tag).not.toBe('BODY')
    expect(outline.style).not.toBe('none')
    expect(Number.parseFloat(outline.width)).toBeGreaterThan(0)
  })

  test('estados que não dependem só de cor: aba ativa e página atual têm aria-current/aria-selected', async ({ page }) => {
    await page.goto('/mercado')
    await expect(page.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page')
    await expect(page.getByRole('navigation', { name: 'Seções do catálogo' }).locator('[aria-current="true"]')).toHaveCount(1)
  })
})

test.describe('Skeleton e carregamento lento', () => {
  test('com rede lenta o catálogo mostra skeletons, reserva o espaço e depois troca pelo conteúdo', async ({ app, page }) => {
    await app.slowNetwork(4000)
    await page.goto('/mercado')
    const skeletons = page.locator('.skeleton')
    await expect(skeletons.filter({ visible: true }).first()).toBeVisible()
    await expect(page.locator('section[aria-busy="true"], [aria-busy="true"]').first()).toBeAttached()

    const heightBefore = await page.evaluate(() => document.documentElement.scrollHeight)
    await expect(page.getByRole('heading', { level: 3 }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 })
    await expect(skeletons).toHaveCount(0)
    const heightAfter = await page.evaluate(() => document.documentElement.scrollHeight)
    expect(Math.abs(heightAfter - heightBefore)).toBeLessThan(160)
  })

  test('o detalhe também mostra skeleton enquanto carrega', async ({ app, page }) => {
    await app.slowNetwork(4000)
    await page.goto('/nfts/nft-001')
    await expect(page.locator('.skeleton').filter({ visible: true }).first()).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Emerald Ape', { timeout: 15_000 })
  })

  test('movimento reduzido desliga a animação do shimmer', async ({ app, page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await app.mocksReady()
    await page.evaluate(() =>
      (window.__mocks!.setScenario as unknown as (scenario: object) => unknown)({ name: 'lenta', description: 'teste', latency: { base: 5000 } }),
    )
    await page.goto('/mercado')
    await page.waitForFunction(() => document.querySelector('.skeleton') !== null)
    const animation = await page.evaluate(() => {
      const el = document.querySelector('.skeleton')!
      return getComputedStyle(el).animationName
    })
    expect(animation).toBe('none')
  })

  test('falha de carregamento mostra o erro e a nova tentativa recupera', async ({ app, page }) => {
    await app.scenario('server-error')
    await page.goto('/mercado')
    await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível carregar os NFTs' })).toBeVisible({ timeout: 20_000 })
    await page.evaluate(() => window.__mocks!.setScenario('default'))
    await page.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(page.getByRole('heading', { level: 3 }).filter({ visible: true }).first()).toBeVisible()
  })
})

test.describe('Responsividade: sem overflow horizontal em 390, 768 e 1440', () => {
  test.skip(({ isMobile }) => isMobile, 'Os três tamanhos são percorridos no projeto desktop.')

  const widths = [320, 390, 768, 1440]
  const pages = ['/', '/mercado', '/nfts/nft-001', '/carrinho', '/login', '/cadastro']

  for (const width of widths) {
    test(`largura ${width}px (${width === 320 ? 'equivale a zoom de 400%' : 'sem perda de conteúdo'})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      for (const path of pages) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await expect(page.locator('.skeleton')).toHaveCount(0, { timeout: 15_000 })
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `${path} em ${width}px`).toBeLessThanOrEqual(0)
      }
    })
  }

  test('páginas privadas também cabem em 390 e 768', async ({ app, page }) => {
    await app.login('marina')
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 })
      for (const path of ['/pagamento', '/perfil', '/carteiras', '/favoritos']) {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        await expect(page.locator('.skeleton')).toHaveCount(0, { timeout: 15_000 })
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `${path} em ${width}px`).toBeLessThanOrEqual(0)
      }
    }
  })
})
