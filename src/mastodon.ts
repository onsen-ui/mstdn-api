import { resolve as resolveUrl } from 'url'
import { stringify as stringifyQuery } from 'querystring'
import * as superagent from 'superagent'

import { normalizeBaseUrl } from './utils'
import StreamListener from './streamlistener'

import Scope from './scope'
import OAuth from './oauth'
const NO_REDIRECT = 'urn:ietf:wg:oauth:2.0:oob'

/**
 * for Mastodon API
 *
 * using superagent for request, you will handle promises
 */
export default class Mastodon {
  static Scope = Scope
  static NO_REDIRECT = NO_REDIRECT

  private accessToken: string
  private baseUrl: string
  private apiUrl: string
  private streamingApiUrl: string

  /**
   * @param accessToken access token from OAuth2 authorization
   * @param baseUrl hostname or base URL
   */
  constructor (accessToken: string, baseUrl = 'mstdn.jp') {
    this.accessToken = accessToken
    this.baseUrl = normalizeBaseUrl(baseUrl || 'mstdn.jp')
    this.apiUrl = resolveUrl(this.baseUrl, '/api/v1/')
    this.streamingApiUrl = resolveUrl(this.baseUrl, '/api/v1/streaming/')
  }

  /**
   * unauthorized GET request to mastodon REST API
   * @param path relative path from ${baseUrl}/api/v1/ or absolute path
   * @param params Query parameters
   * @param baseUrl base URL of the target
   */
  public static get (path: string, params = {}, baseUrl = 'mstdn.jp'): Promise<object> {
    const apiUrl = resolveUrl(normalizeBaseUrl(baseUrl), '/api/v1/')
    return superagent
      .get(resolveUrl(apiUrl, path))
      .query(params)
      .then(resp => resp.body)
  }

  /**
   * Wrapper for personal OAuth Application (createApp and generateAuthUrl)
   *
   * First, [POST /api/v1/apps](https://github.com/tootsuite/documentation/blob/master/Using-the-API/API.md#apps)
   * only client_name is required, so others are optional.
   * Secound, generate an authorization url.
   * finally, return promise of OAuth.AppData instance, which has client_id, client_secret, url, and so on.
   * @param client_name Form Data, which is sent to /api/v1/apps
   * @param options Form Data, which is sent to /api/v1/apps. and properties should be **snake_case**
   * @param baseUrl base URL of the target
   */
  public static registerApp (
    client_name: string,
    options: Partial<{scopes: Scope[], redirect_uris: string, website: string}> = {
      scopes: Scope.DEFAULT,
      redirect_uris: NO_REDIRECT
    },
    baseUrl = 'mstdn.jp'
  ): Promise<OAuth.AppData> {
    const scopes = options.scopes
    return this.createApp(client_name, options, baseUrl)
      .then(appData => {
        appData.generateUrl(scopes, baseUrl)
        return appData
      })
  }

  /**
   * Fetch OAuth access token
   * @param client_id will be generated by #createApp or #registerApp
   * @param client_secret will be generated by #createApp or #registerApp
   * @param code will be generated by the link of #generateAuthUrl or #registerApp
   * @param redirect_uri must be the same uri as the time when you register your OAuth application
   * @param baseUrl base URL of the target
   */
  public static fetchAccessToken (
    client_id: string,
    client_secret: string,
    code: string,
    redirect_uri = NO_REDIRECT,
    baseUrl = 'mstdn.jp'
  ): Promise<OAuth.TokenData> {
    return this._post('/oauth/token', {
      client_id,
      client_secret,
      code,
      redirect_uri,
      grant_type: 'authorization_code'
    }, baseUrl).then(data => OAuth.TokenData.from(data as OAuth.TokenDataFromServer))
  }

  /**
   * generate authorization url
   *
   * @param client_id your OAuth app's client ID
   * @param options as property, redirect_uri and scope are available, and must be the same as when you register your app
   * @param baseUrl base URL of the target
   */
  public static generateAuthUrl (
    client_id: string,
    options: Partial<{redirect_uri: string, scope: Scope[]}> = {
      redirect_uri: NO_REDIRECT,
      scope: Scope.DEFAULT
    },
    baseUrl = 'mstdn.jp'
  ) {
    const apiUrl = resolveUrl(normalizeBaseUrl(baseUrl), '/oauth/authorize')
    const redirect_uri = options.redirect_uri || NO_REDIRECT
    const scope = options.scope || Scope.DEFAULT

    const query: {
      client_id: string,
      redirect_uri: string,
      scope: string,
      response_type: string
    } = {
      client_id,
      redirect_uri,
      scope: scope.join(' '),
      response_type: 'code'
    }
    return `${apiUrl}?${stringifyQuery(query)}`
  }

  /**
   * Create an application
   *
   * First, [POST /api/v1/apps](https://github.com/tootsuite/documentation/blob/master/Using-the-API/API.md#apps)
   * @param client_name your application's name
   * @param options Form Data
   * @param baseUrl target of base URL
   */
  public static createApp (
    client_name: string,
    options: Partial<{redirect_uris: string, scopes: Scope[], website: string}> = {
      redirect_uris: NO_REDIRECT,
      scopes: Scope.DEFAULT
    },
    baseUrl = 'mstdn.jp'
  ): Promise<OAuth.AppData> {
    const redirect_uris = options.redirect_uris || NO_REDIRECT
    const scopes = options.scopes || Scope.DEFAULT

    let params: {
      client_name: string,
      redirect_uris: string,
      scopes: string,
      website?: string
    } = {
      client_name,
      redirect_uris,
      scopes: scopes.join(' ')
    }
    if (options.website) params.website = options.website

    return this._post('apps', params, baseUrl)
      .then(data => OAuth.AppData.from(data as OAuth.AppDataFromServer))
  }

  private static _post (path: string, params = {}, baseUrl = 'mstdn.jp'): Promise<object> {
    const apiUrl = resolveUrl(normalizeBaseUrl(baseUrl), '/api/v1/')
    return superagent
      .post(resolveUrl(apiUrl, path))
      .send(params)
      .then(resp => resp.body)
  }

  /**
   * GET request to mastodon REST API
   * @param path relative path from ${baseUrl}/api/v1/ or absolute path
   * @param params Query parameters
   */
  public get (path: string, params = {}): Promise<object> {
    return superagent
      .get(resolveUrl(this.apiUrl, path))
      .set('Authorization', `Bearer ${this.accessToken}`)
      .query(params)
      .then(resp => resp.body)
  }

  /**
   * POST request to mastodon REST API
   * @param path relative path from ${baseUrl}/api/v1/ or absolute path
   * @param params Form data
   */
  public post (path: string, params = {}): Promise<object> {
    return superagent
      .post(resolveUrl(this.apiUrl, path))
      .set('Authorization', `Bearer ${this.accessToken}`)
      .send(params)
      .then(resp => resp.body)
  }

  /**
   * DELETE request to mastodon REST API
   * @param path relative path from ${baseUrl}/api/v1/ or absolute path
   */
  public del (path: string): Promise<object> {
    return superagent
      .del(resolveUrl(this.apiUrl, path))
      .set('Authorization', `Bearer ${this.accessToken}`)
      .then(resp => resp.body)
  }

  /**
   * receive Server-sent Events from Mastodon Streaming API
   * @param path relative path from ${baseUrl}/api/v1/streaming/ or absolute path
   *             'public', 'public/local', 'user' and 'hashtag?tag=${tag}' are available.
   * @param reconnectInterval interval of reconnect
   * @returns streamListener, which inherits from EventEmitter and has event, 'update', 'notification', 'delete', and so on.
   */
  public stream (path: string, reconnectInterval = 1000) {
    const headers = {
      'Cache-Control': 'no-cache',
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${this.accessToken}`
    }
    const url = resolveUrl(this.streamingApiUrl, path)
    return new StreamListener(url, headers, reconnectInterval)
  }
}
