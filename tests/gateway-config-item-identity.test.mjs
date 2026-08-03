import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const frontendRoot = new URL('../', import.meta.url)

test('gateway actions retain the selected configuration item identity', async () => {
  const gateways = await readFile(new URL('src/views/Gateways.vue', frontendRoot), 'utf8')

  assert.match(gateways, /const configItemNames = ref<Record<string, string>>\(\{\}\)/)
  assert.match(gateways, /configItemNames\.value\[gateway\.name\] = configItemName/)
  assert.match(gateways, /Api\.putConfigItemGateway\(editingConfigItemName\.value \?\? configItemNameFor\(formModel\.value\), formModel\.value\)/)
  assert.match(gateways, /Api\.deleteConfigItemGateway\(configItemNameFor\(gateway\)\)/)
  assert.match(gateways, /gatewayName: configItemNameFor\(gateway\)/)
})
