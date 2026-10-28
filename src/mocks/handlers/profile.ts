import { delay, http, HttpResponse } from 'msw'
import type { PasswordChange, ProfileUpdate } from '@/api/profile'
import { authenticate, saveAuth } from '../db/authStore'
import { sha256 } from '../db/hash'
import { loadProfile, saveProfile } from '../db/profileStore'

const AVATAR_MAX_BYTES = 500 * 1024

const fail = (status: number, code: string, message: string, errors?: Record<string, string>) =>
  HttpResponse.json({ code, message, errors }, { status })

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export const profileHandlers = [
  http.get('/api/profile', async ({ request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    return HttpResponse.json(loadProfile(auth.user))
  }),

  http.patch('/api/profile', async ({ request }) => {
    await delay(400)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const input = (await request.json()) as ProfileUpdate

    const others = auth.db.users.filter((u) => u.id !== auth.user.id)
    const errors: Record<string, string> = {}
    if (others.some((u) => u.username.toLowerCase() === input.username.toLowerCase())) errors.username = 'Este nome de usuário já está em uso.'
    if (others.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) errors.email = 'Este e-mail já está cadastrado.'
    if (Object.keys(errors).length) return fail(409, 'conflict', 'Alguns dados já estão em uso.', errors)

    auth.user.name = input.displayName
    auth.user.username = input.username
    auth.user.email = input.email
    saveAuth(auth.db)

    const profile = { ...loadProfile(auth.user), ...input }
    saveProfile(auth.user.id, profile)
    return HttpResponse.json(profile)
  }),

  http.post('/api/profile/avatar', async ({ request }) => {
    await delay(400)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const file = (await request.formData()).get('avatar')
    if (!(file instanceof File)) return fail(422, 'validation_error', 'Envie uma imagem.', { avatar: 'Envie uma imagem.' })
    if (!file.type.startsWith('image/')) return fail(422, 'validation_error', 'O arquivo precisa ser uma imagem.', { avatar: 'O arquivo precisa ser uma imagem.' })
    if (file.size > AVATAR_MAX_BYTES) return fail(422, 'validation_error', 'A imagem deve ter até 500 KB.', { avatar: 'A imagem deve ter até 500 KB.' })

    const profile = { ...loadProfile(auth.user), avatarUrl: await toDataUrl(file) }
    saveProfile(auth.user.id, profile)
    return HttpResponse.json(profile)
  }),

  http.delete('/api/profile/avatar', async ({ request }) => {
    await delay(250)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const profile = { ...loadProfile(auth.user), avatarUrl: null }
    saveProfile(auth.user.id, profile)
    return HttpResponse.json(profile)
  }),

  http.post('/api/profile/password', async ({ request }) => {
    await delay(400)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    const { currentPassword, newPassword } = (await request.json()) as PasswordChange
    if ((await sha256(currentPassword)) !== auth.user.passwordHash) {
      return fail(422, 'validation_error', 'Senha atual incorreta.', { currentPassword: 'Senha atual incorreta.' })
    }
    auth.user.passwordHash = await sha256(newPassword)
    saveAuth(auth.db)
    return new HttpResponse(null, { status: 204 })
  }),
]
