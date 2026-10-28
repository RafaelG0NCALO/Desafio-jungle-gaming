function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
    </svg>
  )
}

const PROVIDERS = [
  { label: 'Continuar com Google', icon: <GoogleIcon /> },
  { label: 'Continuar com Facebook', icon: <FacebookIcon /> },
]

interface SocialButtonsProps {
  onUnavailable: () => void
  bleed?: boolean
}

export function SocialButtons({ onUnavailable, bleed = true }: SocialButtonsProps) {
  return (
    <>
      <div className={`my-4 flex items-center gap-3 ${bleed ? '-mx-6' : ''}`}>
        <span className="h-px flex-1 bg-nav-accent/20" />
        <span className="text-sm text-nav-text">Ou continue com</span>
        <span className="h-px flex-1 bg-nav-accent/20" />
      </div>

      <div className="flex flex-col gap-3">
        {PROVIDERS.map(({ label, icon }) => (
          <button
            key={label}
            type="button"
            onClick={onUnavailable}
            className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-nav-accent/20 text-sm text-nav-tab hover:border-nav-accent/50 focus-visible:outline-2 focus-visible:outline-nav-active"
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </>
  )
}
