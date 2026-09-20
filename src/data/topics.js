export const topics = [
  { id: 'for-you', label: 'For you', sparkle: true },
  { id: 'remote', label: 'Remote', slug: 'remote' },
  { id: 'web3', label: 'Web3' },
  { id: 'non-tech', label: 'Non Technical', slug: 'non-tech' },
  { id: 'nft', label: 'NFT', slug: 'nft' },
  { id: 'solidity', label: 'Solidity', slug: 'solidity' },
  { id: 'developer', label: 'Developer', slug: 'developer' },
  { id: 'marketing', label: 'Marketing', slug: 'marketing' },
  { id: 'defi', label: 'DeFi', slug: 'defi' },
  { id: 'internships', label: 'Internships', slug: 'internship' },
  { id: 'entry-level', label: 'Entry Level', slug: 'entry-level' },
  { id: 'compliance', label: 'Compliance', slug: 'compliance' },
  { id: 'community', label: 'Community', slug: 'community' },
  { id: 'designer', label: 'Designer', slug: 'designer' },
  { id: 'trading', label: 'Trading', slug: 'trading' },
  { id: 'zk', label: 'Zero Knowledge', slug: 'zk' },
  { id: 'ethereum', label: 'Ethereum', slug: 'ethereum' },
  { id: 'solana', label: 'Solana', slug: 'solana' },
  { id: 'rust', label: 'Rust', slug: 'rust' },
  { id: 'legal', label: 'Legal', slug: 'legal' },
  { id: 'aml', label: 'Anti Money Laundering', slug: 'aml' },
  { id: 'content-writer', label: 'Content Writer', slug: 'content-writer' },
  { id: 'cpp', label: 'C++', slug: 'c-plus-plus' },
  { id: 'react', label: 'React', slug: 'react' },
  { id: 'hr', label: 'Human Resources', slug: 'human-resources' },
  { id: 'content', label: 'Content', slug: 'content' },
  { id: 'memes', label: 'Memes', slug: 'meme' },
]

export function topicToTag(id) {
  if (!id || id === 'for-you' || id === 'web3') return ''
  const topic = topics.find((item) => item.id === id)
  return topic?.slug || ''
}
