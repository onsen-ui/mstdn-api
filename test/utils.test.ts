import 'mocha'
import * as assert from 'power-assert'

import * as utils from '../src/utils'

describe('normalizeBaseUrl', () => {
  it('hostname returns https base Url', () => {
    assert.strictEqual(utils.normalizeBaseUrl('mstdn.jp'), 'https://mstdn.jp')
  })
  it('if argument includes protocol, it echoes', () => {
    assert.strictEqual(utils.normalizeBaseUrl('https://pawoo.net'), 'https://pawoo.net')
  })
})
