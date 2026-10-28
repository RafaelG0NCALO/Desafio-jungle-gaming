const KEY = 'kurio.session.token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(KEY, token)
  } catch {
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
  }
}

const VISITOR_KEY = 'kurio.visitor.id'

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return 'sem-armazenamento'
  }
}
