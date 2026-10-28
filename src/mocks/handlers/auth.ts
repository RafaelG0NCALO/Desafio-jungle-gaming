import { delay, http, HttpResponse } from 'msw'
import type { LoginInput, SignupInput } from '@/api/auth'
import { authenticate, loadAuth, publicUser, saveAuth, startSession } from '../db/authStore'
import { sha256 } from '../db/hash'

const fail = (status: number, code: string, message: string, errors?: Record<string, string>) =>
  HttpResponse.json({ code, message, errors }, { status })

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME = /^[a-z0-9_]+$/i

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    await delay(400)
    const { email, password } = (await request.json()) as LoginInput
    const db = await loadAuth()
    const user = db.users.find((u) => u.email.toLowerCase() === (email ?? '').trim().toLowerCase())
    if (!user || user.passwordHash !== (await sha256(password ?? ''))) {
      return fail(401, 'invalid_credentials', 'E-mail ou senha incorretos.')
    }
    const token = startSession(db, user.id)
    saveAuth(db)
    return HttpResponse.json({ user: publicUser(user), token })
  }),

  http.post('/api/auth/signup', async ({ request }) => {
    await delay(500)
    const { username, email, password } = (await request.json()) as SignupInput
    const errors: Record<string, string> = {}
    if (!username || username.trim().length < 3 || !USERNAME.test(username.trim())) errors.username = 'Nome de usuário inválido.'
    if (!EMAIL.test(email ?? '')) errors.email = 'E-mail inválido.'
    if (!password || password.length < 8) errors.password = 'A senha deve ter pelo menos 8 caracteres.'
    if (Object.keys(errors).length) return fail(422, 'validation_error', 'Revise os campos do cadastro.', errors)

    const db = await loadAuth()
    if (db.users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      errors.username = 'Este nome de usuário já está em uso.'
    }
    if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      errors.email = 'Este e-mail já está cadastrado.'
    }
    if (Object.keys(errors).length) return fail(409, 'conflict', 'Alguns dados já estão em uso.', errors)

    const user = {
      id: `u-${crypto.randomUUID().slice(0, 8)}`,
      name: username.trim(),
      username: username.trim(),
      email: email.trim(),
      passwordHash: await sha256(password),
    }
    db.users.push(user)
    const token = startSession(db, user.id)
    saveAuth(db)
    return HttpResponse.json({ user: publicUser(user), token }, { status: 201 })
  }),

  http.get('/api/auth/session', async ({ request }) => {
    await delay(150)
    const auth = await authenticate(request)
    if (!auth.ok) return auth.response
    return HttpResponse.json({ user: publicUser(auth.user) })
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    await delay(150)
    const auth = await authenticate(request)
    if (auth.ok) {
      delete auth.db.sessions[auth.token]
      saveAuth(auth.db)
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
