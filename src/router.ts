import { Key as TokenKey, pathToRegexp, TokensToRegexpOptions } from 'path-to-regexp'

// https://basarat.gitbooks.io/typescript/docs/tips/barrel.html
export { pathToRegexp }

/** Valid HTTP methods for matching. */
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
export type MethodWildcard = 'ALL'

export interface Params {
  [key: string]: string
}

/**
 * Optional route options.
 *
 * @example
 * // When `true` the regexp will be case sensitive. (default: `false`)
 * sensitive?: boolean;
 *
 * // When `true` the regexp allows an optional trailing delimiter to match. (default: `false`)
 * strict?: boolean;
 *
 * // When `true` the regexp will match to the end of the string. (default: `true`)
 * end?: boolean;
 *
 * // When `true` the regexp will match from the beginning of the string. (default: `true`)
 * start?: boolean;
 *
 * // Sets the final character for non-ending optimistic matches. (default: `/`)
 * delimiter?: string;
 *
 * // List of characters that can also be "end" characters.
 * endsWith?: string;
 *
 * // Encode path tokens for use in the `RegExp`.
 * encode?: (value: string) => string;
 */
export interface RouteOptions extends TokensToRegexpOptions {}

export interface Route<HandlerType> {
  method: Method | MethodWildcard
  path: string
  regexp: RegExp
  options: RouteOptions
  keys: Keys
  handler: HandlerType
}

/**
 * The object returned when a route matches.
 *
 * The handler can then be used to execute the relevant function.
 *
 * @example
 * {
 *   params: Params
 *   matches?: RegExpExecArray
 *   method: Method | MethodWildcard
 *   path: string
 *   regexp: RegExp
 *   options: RouteOptions
 *   keys: Keys
 *   handler: HandlerType
 * }
 */
export interface RouteMatch<HandlerType> extends Route<HandlerType> {
  params: Params
  matches?: RegExpExecArray
}

export type Key = TokenKey
export type Keys = Array<Key>

/**
 * Tiny request router. Allows overloading of handler type to be fully type safe.
 *
 * @example
 * import { Router, Method, Params } from 'tiny-request-router'
 *
 * // Let the router know that handlers are async functions returning a Response
 * type Handler = (params: Params) => Promise<Response>
 *
 * const router = new Router<Handler>()
 */
export class Router<HandlerType = any> {
  /** List of all registered routes. */
  public routes: Array<Route<HandlerType>> = []

  /** Add a route that matches any method. */
  public all(path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('ALL', path, handler, options)
  }
  /** Add a route that matches the GET method. */
  public get(path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('GET', path, handler, options)
  }
  /** Add a route that matches the POST method. */
  public post(path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('POST', path, handler, options)
  }
  /** Add a route that matches the PUT method. */
  public put(path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('PUT', path, handler, options)
  }
  /** Add a route that matches the PATCH method. */
  public patch(path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('PATCH', path, handler, options)
  }
  /** Add a route that matches the DELETE method. */
  public delete(path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('DELETE', path, handler, options)
  }
  /** Add a route that matches the HEAD method. */
  public head(path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('HEAD', path, handler, options)
  }
  /** Add a route that matches the OPTIONS method. */
  public options(path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('OPTIONS', path, handler, options)
  }
  /**
   * Match the provided method and path against the list of registered routes.
   *
   * @example
   * router.get('/foobar', async () => new Response('Hello'))
   *
   * const match = router.match('GET', '/foobar')
   * if (match) {
   *   // Call the async function of that match
   *   const response = await match.handler()
   *   console.log(response) // => Response('Hello')
   * }
   */
  public match(method: Method, path: string): RouteMatch<HandlerType> | null {
    for (const route of this.routes) {
      // Skip immediately if method doesn't match
      if (route.method !== method && route.method !== 'ALL') continue
      // Speed optimizations for catch all wildcard routes
      if (route.path === '(.*)') {
        return { ...route, params: { '0': route.path } }
      }
      if (route.path === '/' && route.options.end === false) {
        return { ...route, params: {} }
      }
      // If method matches try to match path regexp
      const matches = route.regexp.exec(path)
      if (!matches || !matches.length) continue
      return { ...route, matches, params: keysToParams(matches, route.keys) }
    }
    return null
  }

  /**
   * Match the provided method and path against the list of registered routes.
   *
   * @example
   * router.get('/foobar', async () => {})
   *
   * const matches = router.matchAll('GET', '/foobar')
   * // Call the async function for each match
   * for (const match of matches) {
   *   await match.handler()
   * }
   */
  public matchAll(method: Method, path: string): RouteMatch<HandlerType>[] {
    const routes: RouteMatch<HandlerType>[] = []
    for (const route of this.routes) {
      // Skip immediately if method doesn't match
      if (route.method !== method && route.method !== 'ALL') continue
      // If method matches try to match path regexp
      const matches = route.regexp.exec(path)
      if (!matches || !matches.length) continue
      routes.push({ ...route, matches, params: keysToParams(matches, route.keys) })
    }
    return routes
  }

  private _push(
    method: Method | MethodWildcard,
    path: string,
    handler: HandlerType,
    options: RouteOptions
  ) {
    const keys: Keys = []
    if (path === '*') {
      path = '(.*)'
    }
    const regexp = pathToRegexp(path, keys, options)
    this.routes.push({ method, path, handler, keys, options, regexp })
    return this
  }
}

// Convert an array of keys and matches to a params object
const keysToParams = (matches: RegExpExecArray, keys: Keys): Params => {
  const params: Params = {}
  for (let i = 1; i < matches.length; i++) {
    const key = keys[i - 1]
    const prop = key.name
    const val = matches[i]
    if (val !== undefined) {
      params[prop] = val
    }
  }
  return params
}
