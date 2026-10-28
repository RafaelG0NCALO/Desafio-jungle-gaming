import type { AxiosInstance } from 'axios'

/**
 * O service worker do MSW guarda em memória quais abas ele deve interceptar. Com a aba em segundo plano o
 * navegador o encerra por ociosidade, e ao voltar essa lista está vazia: as requisições deixam de ser
 * interceptadas e vão para o servidor de verdade. Depois de a aba ficar oculta, a primeira requisição
 * reativa o mock e espera a confirmação do worker antes de seguir.
 */
export function installMockKeepAlive(http: AxiosInstance) {
  if (!('serviceWorker' in navigator)) return

  let needsReactivation = false
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) needsReactivation = true
  })

  async function reactivate() {
    const worker = navigator.serviceWorker.controller
    if (!worker) return
    await new Promise<void>((resolve) => {
      const finish = () => {
        navigator.serviceWorker.removeEventListener('message', onMessage)
        clearTimeout(timer)
        resolve()
      }
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type === 'MOCKING_ENABLED') finish()
      }
      const timer = setTimeout(finish, 1500)
      navigator.serviceWorker.addEventListener('message', onMessage)
      worker.postMessage('MOCK_ACTIVATE')
    })
  }

  http.interceptors.request.use(async (config) => {
    if (needsReactivation && !document.hidden) {
      needsReactivation = false
      await reactivate()
    }
    return config
  })
}
