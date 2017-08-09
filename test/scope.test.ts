import 'mocha'
import * as assert from 'power-assert'

import Scope from '../src/scope'

describe('Scope', () => {
  it('Scope.READ === "read"', () => {
    assert.strictEqual(Scope.READ, 'read')
  })
  it('Scope.WRITE === "write"', () => {
    assert.strictEqual(Scope.WRITE, 'write')
  })
  it('Scope.FOLLOW === "follow"', () => {
    assert.strictEqual(Scope.FOLLOW, 'follow')
  })
})

describe('Scope.parse', () => {
  it('"read" must be parsed [Scope.READ]', () => {
    assert.deepStrictEqual(Scope.parse('read'), [Scope.READ])
  })
  it('"follow write" must be parsed [Scope.FOLLOW, Scope.WRITE]', () => {
    assert.deepStrictEqual(Scope.parse('follow write'), [Scope.FOLLOW, Scope.WRITE])
  })
  it('invalid string must be ignored', () => {
    assert.deepStrictEqual(Scope.parse('read useless write'), [Scope.READ, Scope.WRITE])
  })
})
