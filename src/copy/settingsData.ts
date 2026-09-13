/**
 * Copy for Settings → Data & Storage.
 *
 * "Download my data" is not a nicety here. It is the thing someone needs BEFORE
 * they delete their account, which is why the delete flow links straight to
 * this screen — a couple's whole shared record lives in this app.
 */
export const SETTINGS_DATA_COPY = {
  title: 'Data & Storage',
  lede: 'What this app is keeping, and how much room it takes.',

  usageGroup: 'On this device',
  totalPrefix: 'Using',

  cacheGroup: 'Cache',
  clearCache: 'Clear cache',
  clearCacheDetail: 'Frees space. Nothing you made is lost.',
  clearCacheTitle: 'Clear the cache?',
  clearCacheBody:
    'Temporary files are removed and will be downloaded again when you next need them. Your photos, messages and memories are not touched.',
  clearCacheCancel: 'Keep it',
  clearCacheConfirm: 'Clear cache',
  cacheCleared: 'Cache cleared.',

  transferGroup: 'Downloads & uploads',
  autoDownloadLabel: 'Download media automatically',
  never: 'Never',
  wifi: 'Wi-Fi',
  always: 'Always',
  qualityLabel: 'Upload quality',
  standard: 'Standard',
  high: 'High',
  qualityDetail: 'High keeps the full photograph. Standard uses less of your data.',

  exportGroup: 'Your copy',
  download: 'Download my data',
  downloadDetail: 'Every memory, message and date, as files you keep.',
  downloadRequested: 'We will email you a link when your copy is ready.',
} as const
