import { http, HttpResponse } from 'msw'
import { scenarioMiddleware } from '../scenarios/engine'
import { authHandlers } from './auth'
import { cartHandlers } from './cart'
import { connectionHandlers } from './connection'
import { favoriteHandlers } from './favorites'
import { nftHandlers } from './nfts'
import { orderHandlers } from './orders'
import { profileHandlers } from './profile'
import { quoteHandlers } from './quote'
import { walletHandlers } from './wallets'

export const handlers = [
  scenarioMiddleware,
  http.get('/api/health', () => HttpResponse.json({ status: 'ok' })),
  ...authHandlers,
  ...nftHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...favoriteHandlers,
  ...orderHandlers,
  ...walletHandlers,
  ...connectionHandlers,
  ...profileHandlers,
]
