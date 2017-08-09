import { resolve as resolveUrl } from 'url'
import { stringify as stringifyQuery } from 'querystring'

import { normalizeBaseUrl } from './utils'
import Scope from './scope'

namespace OAuth {
  export interface AppDataFromServer {
    id: number,
    name: string,
    website: string | null,
    redirect_uri: string,
    client_id: string,
    client_secret: string
  }

  export interface TokenDataFromServer {
    access_token: string,
    token_type: string,
    scope: string,
    created_at: number
  }

  export class AppData {
    public url: string
    constructor (
      public id: number,
      public name: string,
      public website: string | null,
      public redirect_uri: string,
      public client_id: string,
      public client_secret: string
    ) {}

    /**
     * Serialize raw application data from server
     * @param raw from server
     */
    static from (raw: AppDataFromServer) {
      return new this(raw.id, raw.name, raw.website, raw.redirect_uri, raw.client_id, raw.client_secret)
    }

    get redirectUri () {
      return this.redirect_uri
    }
    get clientId () {
      return this.client_id
    }
    get clientSecret () {
      return this.client_secret
    }

    /**
     * generate url for authorization, and set it as this property 'url'
     * later, you can get this url from property 'url'
     * @param scope must be the same as when you register your app
     */
    generateUrl (scope = Scope.DEFAULT, baseUrl = 'mstdn.jp'): void {
      const apiUrl = resolveUrl(normalizeBaseUrl(baseUrl), '/oauth/authorize')
      const query = {
        client_id: this.client_id,
        redirect_uri: this.redirect_uri,
        scope: scope.join(' '),
        response_type: 'code'
      }
      this.url = `${apiUrl}?${stringifyQuery(query)}`
    }
  }

  export class TokenData {
    public _scope: string
    constructor (
      public access_token: string,
      public token_type: string,
      scope: string,
      public created_at: number
    ) {
      this._scope = scope
    }

    /**
     * Serialize raw token data from server
     * @param raw from server
     */
    static from (raw: TokenDataFromServer) {
      return new this(raw.access_token, raw.token_type, raw.scope, raw.created_at)
    }

    /**
     * OAuth Aceess Token
     */
    get accessToken () {
      return this.access_token
    }
    get tokenType () {
      return this.token_type
    }
    get scope () {
      return Scope.parse(this._scope)
    }
    /**
     * Application ID
     */
    get createdAt () {
      return this.created_at
    }
  }
}

export default OAuth
