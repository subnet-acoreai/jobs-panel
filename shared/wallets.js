const EVM_CHAIN_NAMES = {
  '0x1': 'Ethereum',
  '0x5': 'Goerli',
  '0xaa36a7': 'Sepolia',
  '0xa': 'Optimism',
  '0x38': 'BNB Chain',
  '0x89': 'Polygon',
  '0xa4b1': 'Arbitrum',
  '0xa86a': 'Avalanche',
  '0x2105': 'Base',
  '0xfa': 'Fantom',
  '0x144': 'zkSync',
  '0xe708': 'Linea',
  '0x82750': 'Scroll',
  '0x13e31': 'Blast',
  '0x1388': 'Mantle',
  '0xa4ec': 'Celo',
  '0x19': 'Cronos',
  '0x64': 'Gnosis',
  '0x76adf1': 'Zora',
  '0xcc': 'opBNB',
  '0x504': 'Moonbeam',
  '0x7e4': 'Ronin',
  '0x171': 'PulseChain',
}

export const WALLET_HINTS = {
  'io.metamask': { name: 'MetaMask', chains: ['Ethereum', 'EVM'] },
  'io.metamask.flask': { name: 'MetaMask Flask', chains: ['Ethereum', 'EVM'] },
  'com.coinbase.wallet': { name: 'Coinbase Wallet', chains: ['Ethereum', 'EVM', 'Base'] },
  'io.rabby': { name: 'Rabby', chains: ['Ethereum', 'EVM'] },
  'com.brave.wallet': { name: 'Brave Wallet', chains: ['Ethereum', 'EVM', 'Solana'] },
  'me.rainbow': { name: 'Rainbow', chains: ['Ethereum', 'EVM'] },
  'com.okex.wallet': { name: 'OKX Wallet', chains: ['Ethereum', 'EVM', 'Bitcoin', 'Solana'] },
  'com.okx.wallet': { name: 'OKX Wallet', chains: ['Ethereum', 'EVM', 'Bitcoin', 'Solana'] },
  'com.trustwallet.app': { name: 'Trust Wallet', chains: ['Ethereum', 'EVM', 'BNB Chain'] },
  'app.phantom': { name: 'Phantom', chains: ['Solana', 'Ethereum', 'Bitcoin'] },
  'com.bitget.wallet': { name: 'Bitget Wallet', chains: ['Ethereum', 'EVM'] },
  'io.zerion.wallet': { name: 'Zerion', chains: ['Ethereum', 'EVM'] },
  'org.uniswap.app': { name: 'Uniswap Wallet', chains: ['Ethereum', 'EVM'] },
  'com.binance.wallet': { name: 'Binance Wallet', chains: ['BNB Chain', 'EVM'] },
  'com.roninchain.wallet': { name: 'Ronin Wallet', chains: ['Ronin', 'EVM'] },
  'app.core.extension': { name: 'Core', chains: ['Avalanche', 'EVM', 'Bitcoin'] },
  'io.xdefi': { name: 'Ctrl Wallet', chains: ['Ethereum', 'EVM', 'Bitcoin'] },
  'pro.tokenpocket': { name: 'TokenPocket', chains: ['Ethereum', 'EVM'] },
  'com.crypto.wallet': { name: 'Crypto.com Onchain', chains: ['Cronos', 'EVM'] },
  'app.backpack': { name: 'Backpack', chains: ['Solana', 'Ethereum'] },
  'io.safepal.wallet': { name: 'SafePal', chains: ['Ethereum', 'EVM', 'Bitcoin'] },
  'xyz.talisman': { name: 'Talisman', chains: ['Polkadot', 'Ethereum', 'EVM'] },
  'app.subwallet': { name: 'SubWallet', chains: ['Polkadot', 'Ethereum', 'EVM'] },
  'app.keplr': { name: 'Keplr', chains: ['Cosmos'] },
  'io.leapwallet.LeapWalletExtension': { name: 'Leap', chains: ['Cosmos'] },
}

const emptySnapshot = () => ({
  wallets: [],
  chains: [],
  activeEvmChain: '',
  detected: false,
})

function uniqueStrings(values) {
  const seen = new Set()
  const out = []
  for (const value of values || []) {
    const text = String(value || '').trim()
    if (!text || seen.has(text)) continue
    seen.add(text)
    out.push(text)
  }
  return out
}

export function normalizeChainId(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'number' && Number.isFinite(value)) return `0x${value.toString(16)}`
  const text = String(value).trim().toLowerCase()
  if (/^0x[0-9a-f]+$/.test(text)) return text
  if (/^\d+$/.test(text)) return `0x${Number(text).toString(16)}`
  return ''
}

export function chainNameFromId(chainId) {
  const hex = normalizeChainId(chainId)
  return hex ? EVM_CHAIN_NAMES[hex] || `EVM ${hex}` : ''
}

export function walletDedupeKey(rdns, name) {
  const id = String(rdns || '').trim().toLowerCase()
  if (id) return id
  const label = String(name || '').trim().toLowerCase()
  const match = Object.entries(WALLET_HINTS).find(([, hint]) => hint.name.toLowerCase() === label)
  return match?.[0] || label
}

export function hintsForWallet(rdns, name) {
  const known = WALLET_HINTS[String(rdns || '').trim()]
  if (known) return known
  const label = String(name || '').trim() || 'Unknown wallet'
  const lower = label.toLowerCase()
  if (lower.includes('phantom')) return { name: label, chains: ['Solana', 'Ethereum', 'Bitcoin'] }
  if (lower.includes('solflare') || lower.includes('backpack')) return { name: label, chains: ['Solana'] }
  if (lower.includes('tron')) return { name: label, chains: ['Tron'] }
  if (lower.includes('keplr') || lower.includes('leap') || lower.includes('cosmostation')) {
    return { name: label, chains: ['Cosmos'] }
  }
  if (lower.includes('petra') || lower.includes('martian') || lower.includes('aptos')) {
    return { name: label, chains: ['Aptos'] }
  }
  if (lower.includes('sui')) return { name: label, chains: ['Sui'] }
  if (lower.includes('unisat') || lower.includes('xverse') || lower.includes('leather')) {
    return { name: label, chains: ['Bitcoin'] }
  }
  if (lower.includes('ton')) return { name: label, chains: ['TON'] }
  return { name: label, chains: ['EVM'] }
}

export function sanitizeWalletSnapshot(raw) {
  let parsed = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return emptySnapshot()
    }
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptySnapshot()

  const wallets = []
  for (const item of Array.isArray(parsed.wallets) ? parsed.wallets.slice(0, 24) : []) {
    if (!item || typeof item !== 'object') continue
    const hints = hintsForWallet(item.rdns, item.name)
    const name = String(item.name || hints.name).trim().slice(0, 80)
    if (!name) continue
    const chainId = normalizeChainId(item.chainId)
    const chains = uniqueStrings([...(item.chains || []), ...hints.chains, item.activeChain, chainNameFromId(chainId)]).slice(
      0,
      12,
    )
    wallets.push({
      name,
      rdns: String(item.rdns || '').trim().slice(0, 80),
      chains,
      chainId,
      activeChain: String(item.activeChain || chainNameFromId(chainId) || '').trim().slice(0, 40),
    })
  }

  const chains = uniqueStrings([
    ...(Array.isArray(parsed.chains) ? parsed.chains : []),
    ...wallets.flatMap((wallet) => wallet.chains),
    parsed.activeEvmChain,
  ]).slice(0, 20)

  return {
    wallets,
    chains,
    activeEvmChain: String(parsed.activeEvmChain || '').trim().slice(0, 40),
    detected: wallets.length > 0,
  }
}
