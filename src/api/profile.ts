import { isAxiosError } from 'axios'
import { http } from './http'

export interface Profile {
  displayName: string
  username: string
  email: string
  ensName: string
  ensSuffix: string
  walletNickname: string
  avatarUrl: string | null
}

export type ProfileUpdate = Omit<Profile, 'avatarUrl'>

export interface PasswordChange {
  currentPassword: string
  newPassword: string
}

export interface FieldErrorsBody {
  code: string
  message: string
  errors?: Record<string, string>
}

export const fieldErrorsOf = (error: unknown): Record<string, string> | undefined =>
  isAxiosError<FieldErrorsBody>(error) ? error.response?.data?.errors : undefined

export async function fetchProfile(signal?: AbortSignal): Promise<Profile> {
  const { data } = await http.get<Profile>('/profile', { signal })
  return data
}

export async function updateProfile(input: ProfileUpdate): Promise<Profile> {
  const { data } = await http.patch<Profile>('/profile', input)
  return data
}

export async function uploadAvatar(file: File): Promise<Profile> {
  const body = new FormData()
  body.append('avatar', file)
  const { data } = await http.post<Profile>('/profile/avatar', body)
  return data
}

export async function removeAvatar(): Promise<Profile> {
  const { data } = await http.delete<Profile>('/profile/avatar')
  return data
}

export async function changePassword(input: PasswordChange): Promise<void> {
  await http.post('/profile/password', input)
}
