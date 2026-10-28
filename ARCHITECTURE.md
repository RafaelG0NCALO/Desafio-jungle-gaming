# Arquitetura, decisões e limitações

Complementa o [README](README.md) (execução, contratos, cenários, testes e Lighthouse). Aqui estão as decisões de arquitetura, as de UX, os desvios do layout e as limitações conhecidas.

## Visão geral

```
UI (features/*)  ──hooks──▶  TanStack Query  ──▶  api/*  ──▶  Axios  ──▶  /api/*  ──▶  MSW (mocks/handlers)
                                  ▲                                                          │
                                  │ setQueryData / invalidate                                ▼
                         features/realtime  ◀── socket.io-client ◀── ws://…/socket.io ◀── MSW (mocks/realtime)
```

- **Rotas** (TanStack Router, por arquivo): `beforeLoad` protege as rotas privadas; filtros, ordenação, aba e página do catálogo vivem na URL e são validados com zod.
- **Estado remoto** (TanStack Query): toda leitura e mutation passa por hooks de `features/*/hooks.ts`. Não há estado de servidor em `useState`.
- **Transporte**: todo REST passa por uma instância única do Axios (`api/http.ts`), que anexa `Authorization` e `X-Visitor-Id` e trata a sessão vencida em um só lugar.
- **Mocks**: o MSW é o único lugar com respostas simuladas. Componentes, hooks e o Axios não têm dados nem caminhos alternativos de negócio. O mock vem ligado e é desligado com `VITE_ENABLE_MOCKS=false`.
- **Tempo real**: um único cliente `socket.io-client` (`features/realtime`) aplica eventos no cache do Query. A UI não recebe eventos por outro caminho.

Responsabilidades por pasta: `api/` (contratos tipados e chamadas), `features/` (uma pasta por área, com seus hooks e componentes), `components/` (layout e UI compartilhada), `mocks/` (servidor simulado), `lib/` (utilitários sem React de domínio).

## Sessão

- Login e cadastro devolvem `{ user, token }`. O token fica em `localStorage` (`kurio.session.token`) e a sessão é recuperada após refresh por `GET /auth/session`. Sessão de 8 h no mock.
- Resposta `401 session_expired` (em qualquer requisição autenticada, exceto a própria consulta da sessão) aciona um único tratamento: limpa o token, descarta os dados privados do cache e leva a `/?auth=login&redirect=<página>&reason=expired`. Depois de entrar, o usuário volta à página de onde saiu. O formulário do checkout é guardado em `sessionStorage` por usuário e volta preenchido.
- Toda chave de cache de dado privado inclui o dono (`['cart', owner]`, `['orders', owner, id]`, `['favorites', owner]`…). Login, logout e troca de usuário removem do cache tudo que não é a sessão, e a conexão Socket.IO é refeita, então nada de um usuário aparece para o outro.
- Senhas existem em claro apenas no código do mock para gerar o hash (SHA-256) dos dois usuários de teste; o armazenamento guarda só o hash.

## Carrinho

- Pertence ao usuário autenticado ou a um visitante (`X-Visitor-Id`). Ao entrar, os itens do visitante são mesclados ao carrinho do usuário (`POST /cart/merge`), respeitando o limite de cada edição.
- Cada item guarda NFT, edição e quantidade; o servidor calcula preço, limite (`maxQuantity`), subtotal, desconto, taxa de rede e total. A **cotação vem sempre da API**, dentro da resposta do carrinho, e o cliente só a exibe. Valores em ETH são strings decimais; contas no cliente (ex.: total da linha no cálculo otimista) usam `decimal.js`.
- A cotação também é um recurso próprio (`POST /quote`, sem efeito colateral): o formulário de cupom valida o código por ela antes de aplicar. O carrinho continua devolvendo a mesma `quote` embutida, para a tela não depender de duas chamadas.
- Alterar quantidade é otimista, com rollback se a API recusar. Com vários cliques em voo, só a última resposta escreve no cache, para uma resposta atrasada não desfazer a escolha do usuário. Reduzir a quantidade é sempre permitido, mesmo acima do limite novo.
- Visitantes começam com um carrinho de demonstração (o do layout).

## Pedido

- `POST /orders` exige `Idempotency-Key`, gerada por tentativa e reaproveitada enquanto o conteúdo for o mesmo (clique repetido, reenvio após timeout). Mesma chave e mesmo corpo devolvem o mesmo pedido; mesma chave com outro corpo dá `409`. A chave vale por usuário.
- Antes de criar, a API revalida carteira conectada, disponibilidade, cupom, preço e total contra o que o usuário revisou (`reviewed`). Se algo mudou, responde `409` com a cotação atual e a lista de mudanças, nada é criado e o usuário confirma de novo.
- Estados `pending`, `confirmed` e `declined`; os dois últimos são terminais. Só `confirmed` esvazia o carrinho. O recibo é um snapshot do pedido, independente do catálogo.
- A confirmação só aparece para pedido confirmado; pendente mostra "estamos confirmando" e recusado mostra o aviso de recusa.

## Cache, retry e sincronização

Detalhes de `staleTime` e retry estão no README. Princípios:

- Leitura: retry só para falha transitória (rede, 5xx), no máximo 2 vezes; 4xx não é repetido. Mutation: nunca repetida automaticamente.
- Cada leitura recebe o `AbortSignal`: trocar filtros cancela a busca anterior, e `keepPreviousData` evita piscar entre consultas.
- Depois de uma mutation, a resposta (que traz o recurso completo) é gravada no cache e, quando há cotação envolvida, o recurso é revalidado.

## REST × Socket.IO

- **Eventos** (`nft.updated`, `order.updated`) carregam `id` estável, recurso, `version` e instante. O cliente descarta evento malformado, id já visto (janela de 200) e versão menor ou igual à do cache; assim duplicado e antigo não regridem estado nem repetem efeito.
- **Efeito de `nft.updated`**: atualiza preço e disponibilidade no detalhe, nas listas e no destaque; no carrinho, avisa o que mudou e busca o carrinho de novo (a cotação é da API); o checkout continua impedindo a confirmação com cotação desatualizada, porque a API recusa com `409`.
- **Efeito de `order.updated`**: muda o estado do pedido em cache; confirmado também revalida o carrinho. O polling do pedido pendente só roda como contingência, com o socket fora do ar.
- **Reconexão**: com backoff, e ao reconectar o cliente reconcilia catálogo, carrinho e pedidos pela REST. Um evento perdido durante a queda é recuperado assim.
- **Sessão**: o token vai no pacote de conexão; a conexão é refeita a cada troca de sessão e o servidor só entrega `order.updated` ao dono do pedido.

## Mocks

- Estado em `localStorage` (`kurio.mock.*`) com versão de esquema; um reset único (`__mocks.reset()`) restaura o cenário conhecido, e dados de versão antiga são reiniciados sozinhos.
- Cenários são regras declarativas (método, caminho, N-ésima requisição) combinadas com latência determinística (hash de semente, método, caminho e contagem), então cada execução produz a mesma sequência.
- **Socket.IO**: `@mswjs/socket.io-binding` sobre o interceptador de WebSocket do MSW. Limites: só WebSocket (sem long polling), sem salas nem broadcast (a entrega por usuário é um registro de conexões em `mocks/realtime/hub.ts`), sem eventos entre abas. O MSW 3 remove o prefixo `/socket.io/` da URL ao casar, então o handler casa qualquer WebSocket e separa o Socket.IO pelo caminho original; os demais (HMR do Vite) seguem para o servidor real. O `socket.io-client` é carregado sob demanda porque guarda o `WebSocket` global ao ser importado.

## Decisões de UX

- **Login**: modal no desktop (`?auth=login`) e página (`/login`, `/cadastro`) abaixo de 1024 px; um link com `?auth=` vira a rota correspondente.
- **Ações fora do escopo** (rodapé, Atividade, Ofertas, Arquivos, Suporte, "Ler mais", login social, "esqueci a senha") mostram um aviso em vez de simular sucesso.
- **Feedback**: estados assíncronos e eventos em tempo real usam regiões `aria-live`; mudanças de preço ou estoque aparecem como aviso dispensável no carrinho, no checkout e no detalhe.
- **Foco**: modais e painéis devolvem o foco ao elemento de origem ao fechar.
- **Carregamento**: skeletons com shimmer reservam a altura final (inclusive abas e "Mais desta coleção" no detalhe) para não deslocar o layout, e respeitam `prefers-reduced-motion`.
- **Paginação**: mudar qualquer filtro reinicia a página. Na URL, listas viajam como JSON (`collections=["arte-3d"]`).

## Desvios do layout e escolhas fora dele

Estas são decisões minhas, não do Figma, e foram feitas para atender ao escopo ou por falta de definição no layout. Vale revisar:

- **Conexão da carteira no pagamento**: bloco de estado e botões Conectar/Desconectar que não existe no layout; o escopo exige simular conexão, recusa e desconexão.
- **ENS opcional** no formulário de carteira (o usuário de teste não tem ENS), mas obrigatório no perfil.
- **Perfil e carteiras no mobile**: sem frame; segui o padrão visual do restante. "Conta" e "Perfil" levam a `/perfil`.
- **Conteúdo sem fonte no layout**: aba de avaliações do detalhe e seus dados, textos dos slides 2 e 3 do carrossel, opções de ordenação além das desenhadas e regras das abas "Novos lançamentos" e "Em alta".
- **Imagens**: os quatro NFTs foram reexportados em 800×800 (≈ 40 KB) por desempenho; a versão anterior (1254×1254) está em `assets-source/`. Ícones fornecidos em `src/assets/icons`; os demais vêm de `lucide-react`.
- **Componentes**: `dialog`, `sheet` e `tabs` foram gerados pelo CLI do shadcn/ui (estilo new-york, pacote `radix-ui`) e adaptados: cores `surface` e `nav-*`, botão de fechar em português, devolução do foco ao elemento de origem e abas com a identidade do layout. O `button` do shadcn não foi mantido por não ter uso. Formulários, estepe de quantidade e demais peças são do projeto.

## Limitações conhecidas

- **Performance mobile** no Lighthouse fica em 81–82 (meta 90): o MSW (≈ 168 KB gzip) está no caminho crítico sob o perfil simulado de CPU lenta e rede de 1,6 Mbps. Análise no README. Desktop: 99.
- **Token em `localStorage`**: suficiente para a demonstração; em produção seria cookie `HttpOnly`.
- **Sem eventos entre abas** e sem backend real: tudo, inclusive a "persistência", vive no navegador.
- **Baselines visuais** são do Windows; em outro sistema precisam ser regeneradas.
- **Auditorias não feitas**: contraste de cor medido por ferramenta e leitor de tela real. A acessibilidade foi verificada por testes de teclado e foco, associação de erros, ausência de overflow até 320 px e pelo Lighthouse (96–100).
