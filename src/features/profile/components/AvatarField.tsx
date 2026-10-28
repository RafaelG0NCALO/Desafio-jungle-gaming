import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { UserRound } from 'lucide-react'
import { apiErrorMessage } from '@/api/cart'
import { fieldErrorsOf, type Profile } from '@/api/profile'
import { useRemoveAvatar, useUploadAvatar } from '../hooks'

const MAX_BYTES = 500 * 1024

export function AvatarField({ profile }: { profile: Profile }) {
  const input = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const upload = useUploadAvatar()
  const remove = useRemoveAvatar()

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setMessage('')
    if (!file.type.startsWith('image/')) return setMessage('O arquivo precisa ser uma imagem.')
    if (file.size > MAX_BYTES) return setMessage('A imagem deve ter até 500 KB.')
    upload.mutate(file, {
      onError: (error) => setMessage(fieldErrorsOf(error)?.avatar ?? apiErrorMessage(error, 'Não foi possível enviar a imagem. Tente novamente.')),
    })
  }

  return (
    <div>
      <p id="avatar-label" className="mb-2 text-xs">
        Avatar
      </p>
      <div className="flex items-center gap-4" role="group" aria-labelledby="avatar-label">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-surface text-nav-active">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Seu avatar" width={48} height={48} className="size-full object-cover" />
          ) : (
            <UserRound className="size-5" aria-label="Sem avatar" role="img" />
          )}
        </span>

        <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={onFile} />
        <button
          type="button"
          disabled={upload.isPending}
          onClick={() => input.current?.click()}
          className="h-9 rounded-md bg-nav-accent px-5 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active disabled:opacity-60"
        >
          {upload.isPending ? 'Enviando…' : 'Alterar'}
        </button>
        <button
          type="button"
          disabled={!profile.avatarUrl || remove.isPending}
          onClick={() => {
            setMessage('')
            remove.mutate(undefined, { onError: (error) => setMessage(apiErrorMessage(error, 'Não foi possível remover o avatar.')) })
          }}
          className="rounded-sm text-xs hover:text-nav-active focus-visible:outline-2 focus-visible:outline-nav-active disabled:cursor-not-allowed disabled:opacity-40"
        >
          Remover
        </button>
      </div>
      {message && (
        <p role="alert" className="mt-2 text-xs text-nav-active">
          {message}
        </p>
      )}
    </div>
  )
}
