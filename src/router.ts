import pathToRegexp, { Key, RegExpOptions } from 'path-to-regexp'

// https://basarat.gitbooks.io/typescript/docs/tips/barrel.html
export { pathToRegexp }

export interface Route<HandlerType> {
  method: Method | MethodWildcard
  path: string
  regexp: RegExp
  options: RouteOptions
  keys: Keys
  handler: HandlerType
}

export interface RouteMatch<HandlerType> extends Route<HandlerType> {
  params: Params
  matches?: RegExpExecArray
}

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
export type MethodWildcard = 'ALL'

export interface Params {
  [key: string]: string
}

export interface RouteOptions extends RegExpOptions {}

export type Key = Key
export type Keys = Array<Key>

export class Router<HandlerType = any> {
  public routes: Array<Route<HandlerType>> = []

  public all (path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('ALL', path, handler, options)
  }
  public get (path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('GET', path, handler, options)
  }
  public post (path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('POST', path, handler, options)
  }
  public put (path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('PUT', path, handler, options)
  }
  public patch (path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('PATCH', path, handler, options)
  }
  public delete (path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('DELETE', path, handler, options)
  }
  public head (path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('HEAD', path, handler, options)
  }
  public options (path: string, handler: HandlerType, options: RouteOptions = {}) {
    return this._push('OPTIONS', path, handler, options)
  }

  public match (method: Method, path: string): RouteMatch<HandlerType> | null {
    for (const route of this.routes) {
      // Skip immediately if method doesn't match
      if (route.method !== method && route.method !== 'ALL') continue
      // Speed optimizations for catch all wildcard routes
      if (route.path === '*' || route.path === '(.*)') {
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

  private _push (
    method: Method | MethodWildcard,
    path: string,
    handler: HandlerType,
    options: RouteOptions
  ) {
    const keys: Keys = []
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
