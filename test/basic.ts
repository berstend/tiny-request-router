import test from 'ava'

import { Router } from '../src/router'

test('is class', t => {
  t.is(typeof Router, 'function')
})

test('should have the basic class members', async t => {
  const instance = new Router()

  t.true(instance.all instanceof Function)
  t.true(instance.get instanceof Function)
  t.true(instance.post instanceof Function)
  t.true(instance.put instanceof Function)
  t.true(instance.patch instanceof Function)
  t.true(instance.delete instanceof Function)
  t.true(instance.head instanceof Function)
  t.true(instance.options instanceof Function)

  t.true(instance.match instanceof Function)
})
