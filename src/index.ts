import Mastodon from './mastodon'

/**
 * browser support
 */
declare const window: any

if (typeof window === 'object') {
  window['温泉'] = Mastodon
  if (!window.Mastodon) {
    window.Mastodon = Mastodon
  }
}
export default Mastodon
