export const HIRE_DRAFT_KEY = 'cjl-hire-draft'
export const LISTING_PRICE = 199

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'Singapore',
  'United Arab Emirates',
  'India',
  'Australia',
  'Brazil',
  'Portugal',
  'Netherlands',
  'Switzerland',
]

export function readHireDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(HIRE_DRAFT_KEY) || 'null')
  } catch {
    return null
  }
}

export function writeHireDraft(draft) {
  sessionStorage.setItem(HIRE_DRAFT_KEY, JSON.stringify(draft))
}

export function clearHireDraft() {
  sessionStorage.removeItem(HIRE_DRAFT_KEY)
}

export const CHAINS = [
  {
    id: 'solana',
    name: 'Solana',
    token: 'SOL',
    amount: '1.35 SOL',
    address: 'CJLHiRePaySoL1111111111111111111111111111111',
    color: '#14F195',
    note: 'Send SOL on Solana mainnet.',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    token: 'BTC',
    amount: '0.00185 BTC',
    address: 'bc1qcjlhirepaydemo00000000000000000000000',
    color: '#F7931A',
    note: 'Send BTC on Bitcoin mainnet.',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    token: 'ETH',
    amount: '0.055 ETH',
    address: '0xCJL00000000000000000000000000000000PAY',
    color: '#627EEA',
    note: 'Send ETH on Ethereum mainnet.',
  },
  {
    id: 'tron',
    name: 'Tron',
    token: 'TRX',
    amount: '820 TRX',
    address: 'TCJLHirePaymentDemo111111111111111',
    color: '#FF0013',
    note: 'Send TRX on Tron mainnet.',
  },
]
