import { dismissNotice, useLiveNotices, type LiveNotice } from './store'

interface LiveNoticesProps {
  scopes: LiveNotice['scope'][]
  resourceId?: string
}

export function LiveNotices({ scopes, resourceId }: LiveNoticesProps) {
  const notices = useLiveNotices().filter(
    (n) => scopes.includes(n.scope) && (n.scope === 'connection' || resourceId === undefined || n.resourceId === undefined || n.resourceId === resourceId),
  )

  return (
    <div role="status" aria-live="polite" className={notices.length ? 'mb-4 flex flex-col gap-2' : 'sr-only'}>
      {notices.map((notice) => (
        <p key={notice.id} className="flex items-start justify-between gap-3 rounded-md border border-nav-active/60 bg-surface px-3 py-2 text-xs text-nav-active">
          <span>{notice.message}</span>
          {notice.scope !== 'connection' && (
            <button
              type="button"
              onClick={() => dismissNotice(notice.id)}
              className="shrink-0 rounded-sm font-bold underline focus-visible:outline-2 focus-visible:outline-nav-active"
            >
              Dispensar
            </button>
          )}
        </p>
      ))}
    </div>
  )
}
