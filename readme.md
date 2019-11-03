# tiny-request-router [![ ](https://travis-ci.org/berstend/tiny-request-router.svg?branch=master)](https://travis-ci.org/berstend/tiny-request-router) [![ ](https://img.shields.io/npm/v/tiny-request-router.svg)](https://www.npmjs.com/package/tiny-request-router)

> Fast, generic and type safe router (match request method and path).

## Features

* Minimal and opinionless router, can be used in any script and environment.
* Matches a request method (e.g. `GET`) and a path (e.g. `/foobar`) against a list of routes
* Uses [path-to-regexp](https://github.com/pillarjs/path-to-regexp), which is used by express and therefore familiar
* Allows wildcards (e.g. `/user/(.*)/age`) and named parameters (e.g. `/info/:username/:age`)
* Will not call your handlers automatically, as it only cares about matching
* No magic, no assumptions, no fluff, tested

### Route testing

* You can use the [Express Route Tester](https://forbeslindesay.github.io/express-route-tester/) (select `2.0.0`) to debug your path patterns quickly


## Installation

```bash
yarn add tiny-request-router
# or
npm install --save tiny-request-router
```

## Usage (JavaScript/TypeScript)

```typescript
import { Router } from 'tiny-request-router'
// NodeJS: const { Router } = require('tiny-request-router')

const router = new Router()

router
  .get('/(v1|v2)/:name/:age', 'foo1')
  .get('/info/(.*)/export', 'foo2')
  .post('/upload/user', 'foo3')

const match1 = router.match('GET', '/v1/')
// => null

const match2 = router.match('GET', '/v1/bob/22')
// => { handler: 'foo1', params: { name: 'bob', age: '22' }, ... }
```

### Make your handlers type safe (TypeScript)

```typescript
import { Router, Method, Params } from 'tiny-request-router'

// Let the router know that handlers are async functions returning a Response
type Handler = (params: Params) => Promise<Response>

const router = new Router<Handler>()
router.all('*', async () => new Response('Hello'))

const match = router.match('GET' as Method, '/foobar')
if (match) {
  // Call the async function of that match
  const response = await match.handler()
  console.log(response) // => Response('Hello')
}
```

## Example: Cloudflare Workers (JavaScript)

_Use something like [wrangler](https://github.com/cloudflare/wrangler) to bundle the router with your worker code._

```js
import { Router } from 'tiny-request-router'

const router = new Router()
router.get("/worker", async () => new Response('Hi from worker!'))
router.get("/hello/:name", async (params) => new Response(`Hello ${params.name}!`))
router.post("/test", async () => new Response('Post received!'))

// Main entry point in workers
addEventListener('fetch', event => {
  const request = event.request
  const { pathname } = new URL(request.url)

  const match = router.match(request.method, pathname)
  if (match) {
    event.respondWith(match.handler(match.params))
  }
})

```

## API

The API is extremely minimal and what you would expect (`.get()`, `.all()`, etc). Please check out the [tiny source code](src/router.ts) or [tests](test/functionality.ts) for more info.

## License

MIT
