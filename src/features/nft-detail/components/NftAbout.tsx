import type { NftDetail } from '@/api/nfts'

export function NftAbout({ nft }: { nft: NftDetail }) {
  return (
    <div className="flex flex-col gap-6 text-xs leading-relaxed text-nav-tab">
      <div className="flex flex-col gap-6">
        {nft.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <dl className="flex flex-col gap-4">
        {nft.technicalDetails.map(({ label, text }) => (
          <div key={label}>
            <dt className="text-nav-text font-bold">{label}:</dt>
            <dd className="mt-1">{text}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
