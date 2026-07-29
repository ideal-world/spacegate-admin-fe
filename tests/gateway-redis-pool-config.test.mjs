import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const frontendRoot = new URL('../', import.meta.url)

test('gateway configuration exposes Redis pool controls and initializes their values', async () => {
  const [form, gateways, selector] = await Promise.all([
    readFile(new URL('components/config/src/components/GatewayForm.vue', frontendRoot), 'utf8'),
    readFile(new URL('src/views/Gateways.vue', frontendRoot), 'utf8'),
    readFile(new URL('components/config/src/components/SelectGateway.vue', frontendRoot), 'utf8'),
  ])

  for (const field of [
    'redis_pool_max_size',
    'redis_pool_wait_timeout_ms',
    'redis_pool_create_timeout_ms',
    'redis_pool_recycle_timeout_ms',
  ]) {
    assert.match(form, new RegExp(`parameters\\.${field}`))
    assert.match(gateways, new RegExp(`${field}: null`))
    assert.match(selector, new RegExp(`${field}: null`))
  }
})
