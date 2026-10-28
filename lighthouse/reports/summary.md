# Lighthouse — medianas de 3 medições

Metas: performance ≥ 90, accessibility ≥ 95, best-practices ≥ 95, seo ≥ 90. ⚠ = abaixo da meta.

| Página | Perfil | performance | accessibility | best-practices | seo | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| inicio | mobile | 82 ⚠ | 100 | 100 | 100 | 3.7 s | 0.000 | 23 ms |
| inicio | desktop | 99 | 96 | 100 | 100 | 0.9 s | 0.006 | 0 ms |
| detalhe | mobile | 81 ⚠ | 100 | 100 | 100 | 4.0 s | 0.000 | 6 ms |
| detalhe | desktop | 99 | 100 | 100 | 100 | 0.9 s | 0.000 | 0 ms |

Ambiente: Lighthouse 13.5.0, Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36, Node v22.22.0, Windows_NT 10.0.26200 (x64), 12 CPUs.
Build de produção (vite build + vite preview), cenário padrão dos mocks, Chrome headless novo e anônimo a cada medição, três medições por página e perfil (mediana).
