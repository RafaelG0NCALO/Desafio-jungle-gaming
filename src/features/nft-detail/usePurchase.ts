import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { apiErrorMessage } from '@/api/cart'
import { useAddToCart } from '@/features/cart/hooks'
import type { NftDetail, NftEdition } from '@/api/nfts'

const maxFor = (edition: NftEdition) =>
  edition.available === null ? edition.maxPerOrder : Math.min(edition.maxPerOrder, edition.available)

function initialEditionId(nft: NftDetail) {
  const isAvailable = (id: string) => nft.editions.find((e) => e.id === id)?.available !== 0
  if (isAvailable(nft.defaultEditionId)) return nft.defaultEditionId
  return nft.editions.find((e) => e.available !== 0)?.id ?? nft.defaultEditionId
}

export function usePurchase(nft: NftDetail) {
  const [editionId, setEditionId] = useState(() => initialEditionId(nft))
  const [requested, setRequested] = useState(1)
  const [notice, setNotice] = useState('')
  const add = useAddToCart()
  const navigate = useNavigate()

  const edition = nft.editions.find((e) => e.id === editionId)
  const soldOut = !edition || edition.available === 0
  const max = soldOut ? 1 : maxFor(edition)

  return {
    editionId,
    selectEdition: (id: string) => {
      setEditionId(id)
      setNotice('')
    },
    quantity: Math.min(requested, max),
    setQuantity: setRequested,
    max,
    soldOut,
    notice,
    adding: add.isPending,
    addToCart: (goToCart: boolean) => {
      if (soldOut) return
      setNotice('')
      add.mutate(
        { nftId: nft.id, editionId, quantity: Math.min(requested, max) },
        {
          onSuccess: () => (goToCart ? navigate({ to: '/carrinho' }) : setNotice('Adicionado ao carrinho.')),
          onError: (error) => setNotice(apiErrorMessage(error, 'Não foi possível adicionar ao carrinho. Tente novamente.')),
        },
      )
    },
    unavailable: (what: string) => setNotice(`${what} ainda não está disponível nesta demonstração.`),
  }
}

export type Purchase = ReturnType<typeof usePurchase>
