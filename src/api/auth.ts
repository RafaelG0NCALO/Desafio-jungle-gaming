import { http } from './http'

export interface SessionUser {
  id: string
  name: string
  username: string
  email: string
}

export interface AuthResponse {
  user: SessionUser
  token: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface SignupInput {
  username: string
  email: string
  password: string
}

export type SignupFieldErrors = Partial<Record<keyof SignupInput, string>>

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/login', input)
  return data
}

export async function signup(input: SignupInput): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/signup', input)
  return data
}

export async function fetchSession(signal?: AbortSignal): Promise<{ user: SessionUser }> {
  const { data } = await http.get<{ user: SessionUser }>('/auth/session', { signal })
  return data
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout')
}
