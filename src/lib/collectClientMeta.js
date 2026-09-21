export async function collectClientMeta() {
  if (typeof navigator === 'undefined') return {}

  const meta = {
    userAgent: navigator.userAgent || '',
    platform: navigator.platform || '',
    uaPlatform: navigator.userAgentData?.platform || '',
    mobile: Boolean(navigator.userAgentData?.mobile),
    platformVersion: '',
    architecture: '',
    bitness: '',
  }

  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const high = await navigator.userAgentData.getHighEntropyValues([
        'platform',
        'platformVersion',
        'architecture',
        'bitness',
      ])
      meta.uaPlatform = high.platform || meta.uaPlatform
      meta.platformVersion = high.platformVersion || ''
      meta.architecture = high.architecture || ''
      meta.bitness = high.bitness || ''
    }
  } catch {
    // Keep the low-entropy fields if the browser blocks extra UA details.
  }

  return meta
}
