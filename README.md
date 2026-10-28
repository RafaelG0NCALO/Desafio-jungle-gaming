# Kurio — marketplace de NFTs

Decisões de arquitetura e UX, desvios do layout e limitações: [ARCHITECTURE.md](ARCHITECTURE.md).

Front-end do desafio: catálogo, detalhe, carrinho, pagamento com carteira, confirmação de pedido, perfil, carteiras e favoritos, com API, tempo real e falhas **simulados no navegador** (MSW). Não há back-end: tudo roda com `npm run dev`.

## Stack

React 19 · TypeScript · Vite 8 · TanStack Router (rotas por arquivo) · TanStack Query v5 · Axios · Socket.IO client · Tailwind CSS v4 · shadcn/ui (Dialog, Sheet e Tabs sobre Radix) · react-hook-form + zod · decimal.js · MSW 3 + `@mswjs/socket.io-binding` · Playwright.

## Como rodar

```bash
npm install          # o .npmrc (legacy-peer-deps) é necessário: o @mswjs/socket.io-binding declara peer msw ^2 e o projeto usa o MSW 3
npm run dev          # http://localhost:5173, com os mocks ligados
npm run build        # tsc -b + vite build
npm run typecheck
npm run test:e2e     # constrói, serve em :4173 e roda a suíte (desktop + mobile)
```

Variáveis de ambiente (opcionais: sem nenhuma, o projeto roda com os mocks ligados; `.env.example` lista os nomes):

| Variável | Valor | Efeito |
|---|---|---|
| `VITE_ENABLE_MOCKS` | ligado por padrão | Mocks (MSW: REST e Socket.IO simulados). `false` desliga e o app fala com a API real. |
| `VITE_API_URL` | `/api` (padrão) | Base do Axios. |
| `VITE_SOCKET_URL` | (opcional) | Origem do Socket.IO; por padrão, a do app. |

Usuários de teste: `marina@email.com` / `Kurio@123` e `rafael@email.com` / `Kurio@456`.

## Dados para testar

**Cupons** (campo "Código promocional", no carrinho e no pagamento; maiúsculas e minúsculas valem):

| Código | Resultado |
|---|---|
| `KURIO10` | Válido, 10% de desconto |
| `EXPIRADO` | Expirado: "Este cupom expirou." |
| qualquer outro (ex.: `XYZ`) | Inválido: "Cupom inválido." |

Para ver um cupom expirar depois de aplicado: aplique `KURIO10`, rode `__mocks.expireCoupon('KURIO10')` no console e confirme a compra; a API remove o desconto e pede nova confirmação.

**Endereço de carteira** (pagamento e tela Carteiras): `0x` seguido de 40 caracteres hexadecimais, por exemplo `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`. Endereço curto ou sem `0x` mostra erro de validação. Evite `0x7B3C…9D0A` e `0xA91F…E82C`: já estão cadastrados em contas do mock e dão conflito.

**Compra completa em 1 minuto:**
1. Entre como `marina@email.com` (o carrinho começa vazio), abra um NFT (ex.: `/nfts/nft-001`) e clique em **COMPRAR**; no carrinho, clique em **Conectar e finalizar**. Para ver o carrinho cheio como no layout, rode `__mocks.seedCart()` no console e recarregue.
2. No pagamento, preencha nome de exibição, nome de usuário, nome do perfil, e-mail e código de indicação (qualquer texto, ex.: `KURIO-1`), escolha a rede e informe o endereço acima.
3. Confirme a carteira escolhida e clique em **Conectar carteira**; a compra só confirma com a carteira conectada.
4. Clique em **Confirmar compra**. O recibo aparece quando o pedido é confirmado.

Para os fluxos de falha (carteira recusada, preço ou estoque mudando, pagamento recusado ou pendente, timeout com recuperação), use os cenários da seção "Mocks e cenários".

## Estrutura

```
src/
  api/          clientes Axios por recurso, contratos (tipos) e o cliente Socket.IO
  features/     uma pasta por área (catalog, cart, checkout, order, auth, wallets, profile, favorites, realtime…)
  components/   layout e UI compartilhada
  routes/       rotas (TanStack Router, `beforeLoad` protege as privadas)
  mocks/        tudo do servidor simulado (handlers, bancos locais, cenários, tempo real)
e2e/            testes Playwright e baselines de regressão visual
```

Rotas: `/`, `/mercado`, `/nfts/$id`, `/carrinho`, `/pagamento`, `/pedido/$id`, `/perfil`, `/carteiras`, `/favoritos`, `/criadores`, `/aprenda`, `/login`, `/cadastro`. Privadas: `/pagamento`, `/pedido/$id`, `/perfil`, `/carteiras`, `/favoritos`. Filtros, ordenação, aba e página do catálogo vivem na URL (`?q=&collections=&networks=&min=&max=&sort=&tab=&page=`), validados com zod.

## Sessão e dados por usuário

- Login/cadastro devolvem `{ user, token }`. O token fica em `localStorage` (`kurio.session.token`) e vai em `Authorization: Bearer`. O visitante tem um id (`X-Visitor-Id`) e um carrinho próprio, que é mesclado ao do usuário ao entrar.
- Sessão dura 8 h no mock. Resposta `401` com `session_expired` descarta os dados privados do cache, leva ao login (`?auth=login&redirect=<página>&reason=expired`) e retoma a página depois de entrar; o rascunho do checkout é guardado por usuário.
- Toda chave de cache de dado privado inclui o dono (`['cart', owner]`, `['orders', owner, id]`…). Login, logout e troca de usuário removem do cache tudo que não é a sessão.
- Pedido de outro usuário responde `403 forbidden`.

## Contratos REST (mock em `src/mocks/handlers`)

Erros seguem `{ "code": string, "message": string, ...extras }`. Códigos usados: `validation_error` (422, com `errors` por campo), `unauthenticated` / `session_expired` (401), `forbidden` (403), `not_found` (404), `availability_conflict` / `quote_changed` / `wallet_disconnected` / `idempotency_conflict` (409), `wallet_rejected` (422), `empty_cart` (422), `server_error` (500), `unavailable` (503).

| Recurso | Endpoints |
|---|---|
| Auth | `POST /auth/login`, `POST /auth/signup`, `GET /auth/session`, `POST /auth/logout` |
| Catálogo | `GET /nfts` (filtros, ordenação, paginação e facetas), `GET /nfts/featured`, `GET /nfts/:id`, `GET /nfts/:id/related`, `GET /nfts/:id/reviews`, `GET /nfts/also-viewed` |
| Carrinho | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`, `POST /cart/coupon`, `DELETE /cart/coupon`, `POST /cart/merge` |
| Cotação | `POST /quote` |
| Favoritos | `GET /favorites`, `POST /favorites`, `DELETE /favorites/:nftId` |
| Carteira conectada | `GET/POST/DELETE /wallet-connection` |
| Carteiras cadastradas | `GET /wallets`, `GET /wallets/connected`, `PUT /wallets/:kind`, `PATCH /wallets/settings` |
| Perfil | `GET/PATCH /profile`, `POST/DELETE /profile/avatar`, `POST /profile/password` |
| Pedidos | `POST /orders`, `GET /orders/:id` |

Pontos de contrato que merecem atenção:

- **Cotação** (`POST /quote`): valida cupom e disponibilidade e calcula desconto, taxa e total do carrinho de quem chama, sem gravar nada. Corpo opcional `{ couponCode }`: ausente usa o cupom já aplicado, `null` cota sem cupom, um código cota "e se eu aplicar este". Resposta: `quote` (`subtotal`, `discount`, `discountLabel`, `networkFee`, `feeEstimated`, `total`, `currency`), `coupon` (`code`, `status`: `none`/`valid`/`invalid`/`expired`, `message`), `items[]` (com `maxQuantity` e `available`) e `available` (todos os itens cabem). Cupom inválido ou expirado volta como estado (200), não como erro. A mesma `quote` também vem dentro de `GET /cart` e das mutações do carrinho, e o formulário de cupom valida por `POST /quote` antes de aplicar (`POST /cart/coupon`). A cotação da API é a referência no pedido: `POST /orders` revalida contra ela. Valores em ETH são **strings decimais** (decimal.js no cliente, sem `number`).
- **Criação de pedido** exige `Idempotency-Key`. Mesma chave e mesmo corpo devolvem o mesmo pedido; mesma chave com corpo diferente dá `409 idempotency_conflict`. A chave vale por usuário.
- **Revalidação** (`POST /orders`): o corpo traz `reviewed` (total e preço unitário que o usuário viu). A API checa, nesta ordem: carrinho vazio, carteira conectada (igual à escolhida), disponibilidade, cupom (expirado sai e é listado), preço de cada item e total. Se algo mudou, responde `409` com `code` (`availability_conflict` ou `quote_changed`), a `quote` atual e `changes[]` (`price`, `availability`, `coupon`, `fee`). O pedido **não** é criado e o usuário precisa confirmar de novo.
- **Estados do pedido**: `confirmed`, `declined`, `pending`. Só `confirmed` esvazia o carrinho. O recibo é um snapshot do pedido, independente do catálogo atual. `Order.version` sobe a cada mudança de estado.
- **Reduzir quantidade** no carrinho é sempre permitido, mesmo acima do limite novo; aumentar acima do limite dá `409`.

## Política de cache, retry e sincronização

- `staleTime`: catálogo e detalhe 30 s; destaque, relacionados, avaliações, favoritos, perfil, carteiras 60 s; carrinho 10 s; sessão 5 min; pedido infinito (snapshot).
- **Retry** só em leituras e só para falha transitória (rede ou 5xx): até 2 tentativas. `4xx` nunca é repetido. **Mutations não são repetidas**, para não duplicar operações; a criação de pedido é segura de reenviar pela chave de idempotência. Timeout do Axios: 10 s.
- **Cancelamento**: cada leitura recebe o `AbortSignal` do Query, então trocar filtros cancela a busca anterior e respostas atrasadas são descartadas.
- **Otimismo com rollback**: quantidade do carrinho e favoritos atualizam na hora e voltam atrás se a API recusar. Com vários cliques em voo, só a última resposta escreve no cache.
- **Tempo real tem prioridade sobre polling**: o pedido pendente só é consultado a cada 3 s se o socket estiver fora do ar.

## Tempo real (Socket.IO)

- Transporte: **somente WebSocket** (sem long polling), caminho `/socket.io`. O token vai no pacote de conexão (`auth`), lido de novo a cada tentativa. A biblioteca é carregada sob demanda.
- Eventos (`src/api/events.ts`), todos com `id` estável, `resource`, `resourceId`, `version` e `occurredAt`:
  - `nft.updated` → `data: { price, previousPrice, editions: { [edição]: unidades|null } }`, para todos.
  - `order.updated` → `data: { status }`, só para o dono do pedido.
- Cliente (`src/features/realtime`): ignora evento malformado, id já visto e versão menor ou igual à do cache; atualiza detalhe, listas e destaque; avisa mudança de preço/estoque no carrinho, no checkout e no detalhe (região `aria-live`); pede o carrinho de novo (a cotação é da API).
- **Queda e reconexão**: reconecta com backoff (0,5 s a 4 s); ao voltar, busca de novo pela REST catálogo, carrinho e pedidos, recuperando o que se perdeu. A conexão é refeita a cada troca de sessão, e os ouvintes são removidos na desmontagem.
- **Limites do mock**: o servidor de eventos vive na própria aba (não há eventos entre abas); o binding do MSW não tem salas nem broadcast, então a entrega por usuário é feita por um registro de conexões em `src/mocks/realtime/hub.ts`.

## Mocks e cenários

Estado persistido em `localStorage` (`kurio.mock.*`), com versão de esquema: dados de uma versão antiga são reiniciados sozinhos. A latência é determinística (mesma sequência a cada execução).

Tudo é controlado pelo console, em `window.__mocks`:

```js
__mocks.setScenario('payment-pending')   // aplica um cenário (persiste)
__mocks.getScenario()
__mocks.reset()                          // reset único: apaga mocks, sessão e visitante
__mocks.seedCart()                       // enche o carrinho com os 3 NFTs do layout (recarregue a página)
__mocks.updateNft('nft-001', { price: '1.50' })                 // preço
__mocks.updateNft('nft-006', { availability: { open: 5 } })     // estoque (emite nft.updated)
__mocks.expireCoupon('KURIO10')          // cupom já aplicado expira
__mocks.disconnectWallet()               // a carteira cai sozinha
__mocks.expireSession()                  // próxima requisição autenticada dá 401
__mocks.realtime.drop(2500)              // derruba o socket e recusa reconectar por 2,5 s
__mocks.realtime.resend()                // reenvia os últimos eventos (mesmo id)
__mocks.realtime.sendStale('nft-001')    // evento com versão antiga
```

| Cenário | O que simula |
|---|---|
| `default` | Sucesso. |
| `slow` | +1,5 s em toda resposta (skeletons). |
| `variable-latency` | 100 ms a 1,6 s, sempre na mesma sequência. |
| `out-of-order` | 1ª listagem demora 1,5 s e a 2ª responde logo. |
| `offline` | Toda requisição falha sem resposta. |
| `timeout` | O catálogo nunca responde. |
| `server-error` | `500` no catálogo. |
| `flaky` | 2 primeiras consultas do catálogo dão `503`, a 3ª funciona. |
| `client-error` | Alterar o carrinho dá `409`. |
| `favorites-fail` | Favoritar/desfavoritar dá `500` (rollback). |
| `catalog-empty` | Catálogo sem NFTs. |
| `wallet-refused` | 1ª conexão de carteira é recusada, a seguinte é aceita. |
| `order-timeout` | O pedido é gravado mas a resposta não chega; reenviar recupera o mesmo pedido. |
| `payment-declined` | Pagamento recusado. |
| `payment-pending` | Pedido pendente por 4 s, depois confirmado (chega por `order.updated`). |

Também é possível passar um cenário personalizado (objeto com `latency`, `rules`, `orders`…) ao `setScenario`; os tipos estão em `src/mocks/scenarios/types.ts`.

## Testes (Playwright)

`npm run test:e2e` constrói o app, serve em `:4173` e roda 149 execuções em dois projetos (desktop 1440×900 e mobile 390×844). Os testes escolhem cenários e disparam eventos pelo `window.__mocks`; o relógio simulado do Playwright controla o carrossel. Relatório HTML em `playwright-report/` e traces nas falhas. Cada teste começa de um contexto novo (sem storage de outro).

| Arquivo | O que cobre |
|---|---|
| `auth.spec.ts` | login, credencial inválida, rota privada com retorno, validação, expiração de sessão, isolamento entre usuários |
| `account.spec.ts` | cadastro e conflito, logout, troca de usuário, itens do visitante ao entrar, perfil (validação, conflito, persistência), senha, avatar, carteiras principal e secundária |
| `discovery.spec.ts` | filtros combinados e reinício da paginação, ordenação, histórico (voltar/avançar/refresh), parâmetros inválidos, detalhe direto, NFT e rota inexistentes, edição esgotada e limite, favoritos (persistência, login, falha com rollback) |
| `catalog.spec.ts` | catálogo vazio, 500, 503 transitório, sem conexão, timeout, respostas fora de ordem, carrossel com relógio controlado |
| `cart.spec.ts` | quantidades e limite, remoção, cupom, persistência, rollback em 409, carrinhos por usuário |
| `checkout.spec.ts` | compra completa, carteira (recusa, desconexão), revalidação (preço, estoque, cupom), pagamento recusado, timeout com recuperação, clique repetido, 403 |
| `realtime.spec.ts` | `nft.updated`, duplicado e antigo, queda e reconciliação, pedido pendente, isolamento de sessão |
| `a11y.spec.ts` | foco e Esc em modal e painel, ciclo de Tab, erros associados aos campos, foco visível, skeleton em rede lenta e com movimento reduzido, sem overflow horizontal em 320, 390, 768 e 1440 px |
| `visual.spec.ts` | regressão visual de Início, detalhe, carrinho e pagamento (baselines versionadas) |

Os baselines visuais (`e2e/visual.spec.ts-snapshots`) são do Windows. Em outro sistema, gere-os com `npx playwright test --update-snapshots`. Depois de qualquer mudança visual intencional, regenere-os do mesmo modo.

## Lighthouse

```bash
npm run lighthouse                 # constrói, serve (vite preview) e audita
npm run lighthouse -- --skip-build # reaproveita o dist atual
```

`lighthouse/config.mjs` (versionado) define páginas (Início e detalhe do NFT), perfis (mobile e desktop), três medições por página e perfil, categorias e metas. `lighthouse/run.mjs` usa o Lighthouse 13.5.0 sobre o build de produção, com o cenário padrão dos mocks e um Chrome headless novo e anônimo a cada medição (sem cache, IndexedDB ou service worker de rodadas anteriores). Saída em `lighthouse/reports/`: um HTML e um JSON por medição, `summary.json` (com versões, ambiente e condições) e `summary.md` (medianas, LCP, CLS e TBT).

Medianas da última execução (metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90):

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| Início | mobile | **82** | 100 | 100 | 100 | 3,7 s | 0,000 | 23 ms |
| Início | desktop | 99 | 96 | 100 | 100 | 0,9 s | 0,006 | 0 ms |
| Detalhe | mobile | **81** | 100 | 100 | 100 | 4,0 s | 0,000 | 6 ms |
| Detalhe | desktop | 99 | 100 | 100 | 100 | 0,9 s | 0,000 | 0 ms |

**Performance mobile abaixo da meta (81–82) — causa.** O perfil mobile simula CPU 4× mais lenta e rede de 1,6 Mbps. Nele, o tempo até o primeiro conteúdo e o LCP (o primeiro cartão do catálogo, cuja imagem leva apenas 70 ms) são dominados por baixar e executar JavaScript antes de qualquer dado: React, roteador e Query (≈ 122 KB gzip), o cliente HTTP (≈ 53 KB) e o MSW (≈ 168 KB gzip, mais que o restante junto). O MSW é obrigatório no desafio e o app só consulta dados depois que ele sobe. TBT (≤ 23 ms) e CLS (0) estão ótimos; o problema é o caminho crítico, não bloqueio da thread nem instabilidade visual. No desktop, o mesmo build tira 99. Não há como chegar a 90 no mobile sem tirar o MSW do caminho ou alterar o código dele, e a auditoria não usa simplificações para melhorar a nota.

Já aplicado por causa dessas medições: imagens redimensionadas para 800 px (≈ 40 KB cada, a versão anterior, 1254×1254, está em `assets-source/`), diálogo de login e painel de filtros carregados sob demanda, `robots.txt`, idioma e descrição no `index.html`, e altura reservada no esqueleto do detalhe (o rodapé deslocava o layout, CLS 0,167).

## Acessibilidade

Tela navegável por teclado, com foco visível e devolvido ao elemento de origem ao fechar modal ou painel. Campos têm rótulo e erro ligados por `aria-describedby`. Estados assíncronos (carregando, erro, avisos de tempo real, resultado de ações) usam regiões `aria-live`. Abas seguem o padrão WAI-ARIA. Skeletons e o carrossel respeitam `prefers-reduced-motion`.

## Decisões e substituições

- **Componentes**: `dialog`, `sheet` e `tabs` vêm do CLI do shadcn/ui (estilo new-york, pacote `radix-ui`), adaptados às cores do projeto, ao botão "Fechar" em português e à devolução do foco (`useRestoreFocus`).
- **Ícones**: SVGs fornecidos em `src/assets/icons`; os demais vêm de `lucide-react`.
- **Fora do escopo**: links de rodapé, itens de conta sem tela (Atividade, Ofertas, Arquivos, Suporte), "Ler mais" do Diário, login social e "esqueci a senha" mostram um aviso em vez de simular sucesso.
- **Desvios do layout, por necessidade do escopo**: o bloco de conexão da carteira no pagamento (o escopo exige simular conexão/recusa/desconexão); ENS opcional no formulário de carteira (o usuário de teste Principal não tem ENS); "Conta" e "Perfil" levam a `/perfil`.
- **Segurança do protótipo**: token em `localStorage` (simples para a demonstração; em produção seria cookie `HttpOnly`).
