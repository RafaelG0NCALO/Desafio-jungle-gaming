import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/criadores')({
  component: () => <main className="p-4"><h1 className="text-2xl font-bold">Criadores</h1></main>,
})
