import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
import { realtimeHandlers } from './realtime/handler'
import { connectionCount, dropConnections, publishNft, resendRecent, sendStale } from './realtime/hub'
import { resumePendingOrders } from './realtime/settle'
import { loadAuth, saveAuth } from './db/authStore'
import { expireCoupon, findNft, updateNft } from './db/catalogStore'
import { dropAllConnections } from './db/connectionStore'
import { resetMockData } from './db/reset'
import { ensureMockSchema } from './db/schema'
import { getScenario, setScenario } from './scenarios/engine'
import { SCENARIOS } from './scenarios/presets'

ensureMockSchema()

export const worker = setupWorker(...handlers, ...realtimeHandlers)
resumePendingOrders()

export const mockControls = {
  scenarios: SCENARIOS,
  getScenario,
  setScenario,
  reset: resetMockData,
  updateNft(...args: Parameters<typeof updateNft>) {
    const nft = updateNft(...args)
    publishNft(nft)
    return nft
  },
  expireCoupon,
  disconnectWallet: dropAllConnections,
  realtime: {
    drop: dropConnections,
    resend: resendRecent,
    sendStale: (id: string) => sendStale(findNft(id)!),
    connections: connectionCount,
  },
  async expireSession() {
    const db = await loadAuth()
    db.sessions = {}
    saveAuth(db)
  },
}

declare global {
  interface Window {
    __mocks?: typeof mockControls
  }
}

if (typeof window !== 'undefined') window.__mocks = mockControls
