/**
 * simple authorizaion tool via command line
 */

import { createInterface } from 'readline'
import Mastodon from '../../src/mastodon'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

const SCOPES = [Mastodon.Scope.READ, Mastodon.Scope.WRITE]

let clientId: string
let clientSecret: string

Mastodon.registerApp('Test App', {
  scopes: SCOPES
}).then(appData => {
  clientId = appData.clientId,
  clientSecret = appData.clientSecret
  console.log('Authorization URL is generated.')
  console.log(appData.url)
  console.log()
  return new Promise<string>(resolve => {
    rl.question('Enter the authorization code from website: ', code => {
      resolve(code)
      rl.close()
    })
  })
}).then(code => Mastodon.fetchAccessToken(clientId, clientSecret, code))
  .then(tokenData => {
    console.log('\naccess_token:')
    console.log(tokenData.accessToken)
    console.log()
  })
  .catch(err => console.error(err))
