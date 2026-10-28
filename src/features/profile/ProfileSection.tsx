import { AccountLayout } from '@/features/account/AccountLayout'
import { ProfileForm } from './components/ProfileForm'
import { useProfile } from './hooks'

function ProfileSkeleton() {
  return (
    <div aria-hidden className="grid gap-x-6 gap-y-5 md:grid-cols-2">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="skeleton h-16 rounded-md" />
      ))}
      <div className="skeleton h-12 rounded-md" />
    </div>
  )
}

export function ProfileSection() {
  const query = useProfile()

  let content
  if (query.isPending) {
    content = <ProfileSkeleton />
  } else if (query.isError) {
    content = (
      <div role="alert" className="rounded-xl bg-surface px-6 py-12 text-center">
        <p className="text-sm">Não foi possível carregar seu perfil.</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-4 h-9 rounded-md bg-nav-accent px-5 text-xs font-bold text-background hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nav-active"
        >
          Tentar novamente
        </button>
      </div>
    )
  } else {
    content = <ProfileForm profile={query.data} />
  }

  return (
    <AccountLayout title="Meu perfil">
      <h1 className="sr-only">Dados do perfil</h1>
      <div aria-busy={query.isPending}>{content}</div>
    </AccountLayout>
  )
}
