import { useRef } from 'react'

export function useRestoreFocus() {
  const opener = useRef<HTMLElement | null>(null)
  return {
    onOpenAutoFocus: () => {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    },
    onCloseAutoFocus: (event: Event) => {
      const element = opener.current
      if (element?.isConnected) {
        event.preventDefault()
        element.focus()
      }
    },
  }
}
