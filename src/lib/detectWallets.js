import { chainNameFromId, hintsForWallet, sanitizeWalletSnapshot, walletDedupeKey } from '../../shared/wallets.js'

function addWallet(map, wallet) {
  const hints = hintsForWallet(wallet.rdns, wallet.name)
  const name = String(wallet.name || hints.name).trim()
  const key = walletDedupeKey(wallet.rdns, name)
  if (!name || !key) return
  const prev = map.get(key) || { name, rdns: wallet.rdns || '', chains: [], provider: null }
  map.set(key, {
    name,
    rdns: wallet.rdns || prev.rdns || '',
    chains: [...new Set([...(prev.chains || []), ...(wallet.chains || []), ...hints.chains])],
    provider: wallet.provider || prev.provider,
  })
}

function collectEip6963() {
  return new Promise((resolve) => {
    const found = new Map()
    const onAnnounce = (event) => {
      const info = event.detail?.info
      if (!info) return
      addWallet(found, {
        name: info.name,
        rdns: info.rdns,
        provider: event.detail?.provider,
      })
    }
    window.addEventListener('eip6963:announceProvider', onAnnounce)
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    window.setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce)
      resolve(found)
    }, 180)
  })
}

function addLegacyEvm(map, provider) {
  if (!provider) return
  const name =
    (provider.isRabby && 'Rabby') ||
    (provider.isRainbow && 'Rainbow') ||
    (provider.isCoinbaseWallet && 'Coinbase Wallet') ||
    ((provider.isOkxWallet || provider.isOKExWallet) && 'OKX Wallet') ||
    (provider.isTrust && 'Trust Wallet') ||
    (provider.isBraveWallet && 'Brave Wallet') ||
    (provider.isMetaMask && 'MetaMask') ||
    'Injected EVM wallet'
  addWallet(map, { name, provider, chains: ['Ethereum', 'EVM'] })
}

function collectLegacy(map) {
  const eth = window.ethereum
  if (eth?.providers?.length) eth.providers.forEach((provider) => addLegacyEvm(map, provider))
  else if (eth) addLegacyEvm(map, eth)

  const solana = window.phantom?.solana || window.solana
  if (solana?.isPhantom || window.phantom?.solana) addWallet(map, { name: 'Phantom', rdns: 'app.phantom', chains: ['Solana'] })
  if (window.solflare) addWallet(map, { name: 'Solflare', chains: ['Solana'] })
  if (window.backpack) addWallet(map, { name: 'Backpack', rdns: 'app.backpack', chains: ['Solana'] })
  if (window.tronLink || window.tronWeb) addWallet(map, { name: 'TronLink', chains: ['Tron'] })
  if (window.keplr) addWallet(map, { name: 'Keplr', chains: ['Cosmos'] })
  if (window.leap) addWallet(map, { name: 'Leap', chains: ['Cosmos'] })
  if (window.aptos || window.petra) addWallet(map, { name: 'Petra', chains: ['Aptos'] })
  if (window.martian) addWallet(map, { name: 'Martian', chains: ['Aptos'] })
  if (window.suiWallet || window.sui) addWallet(map, { name: 'Sui Wallet', chains: ['Sui'] })
  if (window.unisat) addWallet(map, { name: 'Unisat', chains: ['Bitcoin'] })
  if (window.XverseProviders || window.xverse) addWallet(map, { name: 'Xverse', chains: ['Bitcoin'] })
  if (window.LeatherProvider || window.BitcoinProvider) addWallet(map, { name: 'Leather', chains: ['Bitcoin'] })
  if (window.tonkeeper || window.ton) addWallet(map, { name: 'Tonkeeper', chains: ['TON'] })
  if (window.okxwallet) addWallet(map, { name: 'OKX Wallet', rdns: 'com.okex.wallet' })
}

async function readChainId(provider) {
  if (!provider?.request) return ''
  try {
    const value = await Promise.race([
      provider.request({ method: 'eth_chainId' }),
      new Promise((_, reject) => window.setTimeout(() => reject(new Error('timeout')), 400)),
    ])
    return value || ''
  } catch {
    return ''
  }
}

export async function detectWallets() {
  if (typeof window === 'undefined') return sanitizeWalletSnapshot(null)

  const found = await collectEip6963()
  collectLegacy(found)

  const wallets = []
  let activeEvmChain = ''
  for (const wallet of found.values()) {
    const chainId = await readChainId(wallet.provider)
    const activeChain = chainNameFromId(chainId)
    if (activeChain && !activeEvmChain) activeEvmChain = activeChain
    wallets.push({
      name: wallet.name,
      rdns: wallet.rdns,
      chains: wallet.chains,
      chainId,
      activeChain,
    })
  }

  return sanitizeWalletSnapshot({ wallets, chains: wallets.flatMap((wallet) => wallet.chains), activeEvmChain })
}
