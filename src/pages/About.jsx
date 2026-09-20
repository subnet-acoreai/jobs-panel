export default function About() {
  const stats = [
    ['23.3k', 'Jobs Live'],
    ['392.7k', 'Live Audience'],
    ['3,723', 'Web3 Projects'],
    ['~140', 'Avg Applications per Job'],
  ]
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">
        CryptoJobsList is the largest web3 & blockchain hiring platform.
      </h1>
      <p className="mt-4 text-[15px] leading-7 text-gray-600 dark:text-gray-300">
        Since 2017 the board has focused on quality and security — screening listings while connecting crypto-native
        talent with companies across DeFi, exchanges, infrastructure, and consumer web3.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([n, l]) => (
          <div key={l} className="rounded-xl border border-gray-200 p-4 dark:border-night-line">
            <p className="text-2xl font-extrabold text-brand">{n}</p>
            <p className="mt-1 text-xs text-gray-500">{l}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-xl font-bold">Our Mission</h2>
      <p className="mt-3 text-[15px] leading-7 text-gray-600 dark:text-gray-300">
        Grow the decentralized economy by matching people to real work — building companies, not just trading the tape.
        Headquarters in Singapore, with a global remote footprint.
      </p>
      <h2 className="mt-10 text-xl font-bold">Core Team</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          ['Raman Sha', 'Founder / CEO / CTO'],
          ['Ismael', 'Community'],
          ['Richard', 'Research & Marketing'],
          ['Evey', 'Social Media'],
        ].map(([n, r]) => (
          <li key={n} className="rounded-xl border border-gray-200 p-4 dark:border-night-line">
            <p className="font-semibold">{n}</p>
            <p className="text-sm text-gray-500">{r}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
