import test from 'ava'

import { Router } from '../src/router'

test('should match route with wildcard', async t => {
  const router = new Router<string>()

  router
    .head('*', 'foo1')
    .get('/', 'foo2')
    .get('/foo', 'foo3')

  const match1 = router.match('HEAD', '/foo')
  const match2 = router.match('GET', '/')
  const match3 = router.match('GET', '/foo')
  const match4 = router.match('POST', '/foo')

  t.true(match1 instanceof Object)
  t.true(match2 instanceof Object)
  t.true(match3 instanceof Object)
  t.false(match4 instanceof Object)

  if (match1) {
    t.is(match1.handler, 'foo1')
  }
  if (match2) {
    t.is(match2.handler, 'foo2')
  }
  if (match3) {
    t.is(match3.handler, 'foo3')

    t.true(match3.matches && match3.matches.length === 1)
    t.is(match3.method, 'GET')
    t.deepEqual(match3.options, {})
    t.deepEqual(match3.params, {})
    t.is(match3.path, '/foo')
  }
})

test('should match wildcard OPTIONS', async t => {
  const router = new Router<string>()

  router.options('*', 'foo1')

  const match1 = router.match('GET', '/foo')
  const match2 = router.match('OPTIONS', '/foo')

  t.false(match1 instanceof Object)
  t.true(match2 instanceof Object)

  if (match2) {
    t.is(match2.handler, 'foo1')
  }
})

test('should match wildcard method', async t => {
  const router = new Router<string>()

  router.all('/secret', 'foo1')

  const match1 = router.match('GET', '/foo')
  const match2 = router.match('OPTIONS', '/secret')

  t.false(match1 instanceof Object)
  t.true(match2 instanceof Object)

  if (match2) {
    t.is(match2.handler, 'foo1')
  }
})

test('should match route with named params', async t => {
  const router = new Router<string>()

  router
    .get('/(v1|v2)/:name/:age', 'foo1') // ok!
    .get('/(v1|v2)/:name/:age/*', 'foo2') // Not ok!
    .get('/(v1|v2)/:name/:age/(.*)', 'foo3') // ok!
    .get('/v2/:name/:age', 'foo4')
    .get('/v3/alice', 'foo5')

  const match1 = router.match('GET', '/v1/')
  const match2 = router.match('GET', '/v1/bob/22')
  const match3 = router.match('GET', '/v1/bob/22/hello')
  const match4 = router.match('GET', '/v2/keith,89')

  t.false(match1 instanceof Object)
  t.true(match2 instanceof Object)
  t.true(match3 instanceof Object)
  t.false(match4 instanceof Object)

  if (match2) {
    t.is(match2.handler, 'foo1')
    t.is(match2.params.name, 'bob')
    t.is(match2.params.age, '22')
    t.is(match2.params['0'], 'v1')
  }
  if (match3) {
    t.is(match3.handler, 'foo3')
    t.is(match3.params.name, 'bob')
    t.is(match3.params.age, '22')
    t.is(match3.params['0'], 'v1')
    t.is(match3.params['1'], 'hello')
  }
})

test('should not be case sensitive by default', async t => {
  // By default not case sensitive
  const router = new Router<string>()
  router.all('/:name/LOCATION', 'foo1')
  const match1 = router.match('GET', '/bob/')
  const match2 = router.match('GET', '/bob/location')
  const match3 = router.match('GET', '/bob/LOCATION')
  t.false(match1 instanceof Object)
  t.true(match2 instanceof Object)
  t.true(match3 instanceof Object)
})

test('should allow options to be case sensitive', async t => {
  // By default not case sensitive
  const router = new Router<string>()
  router.all('/:name/LOCATION', 'foo1', { sensitive: true })
  const match1 = router.match('GET', '/bob/')
  const match2 = router.match('GET', '/bob/location')
  const match3 = router.match('GET', '/bob/LOCATION')
  t.false(match1 instanceof Object)
  t.false(match2 instanceof Object)
  t.true(match3 instanceof Object)
})

type HandlerType = () => Response

test('should allow functions as handlers', async t => {
  const router = new Router<HandlerType>()
  router.all('*', () => new Response('Hello'))

  const match1 = router.match('GET', '/foo')
  t.true(match1 instanceof Object)
})

test('should allow async functions as handlers', async t => {
  const router = new Router<() => Promise<number>>()
  router.all('*', async () => 123)

  const match = router.match('GET', '/foo')
  t.true(match instanceof Object)

  if (match) {
    const response = await match.handler()
    console.log(response)
    // => Response('Hello')
  }
})
