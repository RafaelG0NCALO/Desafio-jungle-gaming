import { delay, http, HttpResponse } from 'msw'
import { authenticate } from '../db/authStore'
import { loadFavorites, saveFavorites } from '../db/favoritesStore'
import { allNfts, findNft } from '../db/catalogStore'

const fail = (status: number, code: string, message: string) => HttpResponse.json({ code, message }, { status })

const listOf = (ids: string[]) => ({ items: ids.flatMap((id) => allNfts().filter((n) => n.id === id)) })

export const favoriteHandlers = [
  http.get('/api/favorites', async ({ request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    return HttpResponse.json(listOf(loadFavorites(auth.user.id)))
  }),

  http.post('/api/favorites', async ({ request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const { nftId } = (await request.json()) as { nftId?: string }
    if (!nftId || !findNft(nftId)) return fail(404, 'not_found', 'NFT não encontrado.')
    const ids = loadFavorites(auth.user.id)
    if (!ids.includes(nftId)) saveFavorites(auth.user.id, [...ids, nftId])
    return HttpResponse.json(listOf(loadFavorites(auth.user.id)), { status: 201 })
  }),

  http.delete('/api/favorites/:nftId', async ({ params, request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    saveFavorites(auth.user.id, loadFavorites(auth.user.id).filter((id) => id !== params.nftId))
    return HttpResponse.json(listOf(loadFavorites(auth.user.id)))
  }),
]
