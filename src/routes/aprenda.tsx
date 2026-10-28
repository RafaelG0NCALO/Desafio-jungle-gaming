import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/aprenda')({
  component: () => <main className="p-4"><h1 className="text-2xl font-bold">Aprenda</h1></main>,
})
