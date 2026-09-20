import { mediaSrc } from './Brand'

export default function LogoTicker({ companies = [] }) {
  const logos = companies.filter((c) => c.logo).slice(0, 12)
  const items = logos.length ? [...logos, ...logos] : []
  if (!items.length) return null

  return (
    <div className="relative overflow-hidden py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent dark:from-night" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent dark:from-night" />
      <div className="logo-ticker flex w-max items-center gap-10">
        {items.map((c, i) => (
          <div key={`${c.slug}-${i}`} className="flex h-8 items-center">
            <img src={mediaSrc(c.logo)} alt={c.name} className="max-h-8 max-w-[120px] object-contain" />
          </div>
        ))}
      </div>
    </div>
  )
}
