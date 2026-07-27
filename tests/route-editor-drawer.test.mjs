import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const source = await readFile(new URL('../src/components/RouteEditorDrawer.vue', import.meta.url), 'utf8')

test('HTTP route rules allow runtime plugins to provide the upstream without a backend', () => {
  assert.match(source, /if \(!Array\.isArray\(rule\.backends\)\) rule\.backends = \[\]/)
  assert.doesNotMatch(source, /if \(rule\.backends\.length === 1\)[\s\S]*?function addMcpBackend/)
  assert.doesNotMatch(source, /return texts\.value\.validateBackend/)
})

test('MCP routes still require a configured backend', () => {
  assert.match(source, /return texts\.value\.validateMcpBackend/)
})
