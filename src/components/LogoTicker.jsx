import { mediaSrc } from './Brand'

export default function LogoTicker({ companies = [] }) {
  const logos = companies.filter((c) => c.logo).slice(0, 12)
  const items = logos.length ? [...logos, ...logos] : []
  if (!items.length) return null

  return (
    <div className="relative w-full max-w-full overflow-hidden py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-page to-transparent dark:from-night" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-page to-transparent dark:from-night" />
      <div className="logo-ticker flex w-max items-center gap-7 sm:gap-10">
        {items.map((c, i) => (
          <div key={`${c.slug}-${i}`} className="flex h-7 items-center sm:h-8">
            <img src={mediaSrc(c.logo)} alt={c.name} className="max-h-7 max-w-[88px] object-contain sm:max-h-8 sm:max-w-[120px]" />
          </div>
        ))}
      </div>
    </div>
  )
}
