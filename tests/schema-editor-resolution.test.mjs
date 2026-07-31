import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { transform } from 'esbuild'

const frontendRoot = new URL('../', import.meta.url)

async function loadSchemaEditor() {
  const source = await readFile(new URL('components/config/src/utils/schemaEditor.ts', frontendRoot), 'utf8')
  const { code } = await transform(source, { loader: 'ts', format: 'esm', target: 'node18' })
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}

test('resolves an allOf enum reference as a scalar field', async () => {
  const { isSchemaJsonValue, resolveSchema } = await loadSchemaEditor()
  const root = {
    definitions: {
      HeaderModifierKind: { type: 'string', enum: ['Request', 'Response'] },
    },
  }
  const schema = resolveSchema({
    title: '类型',
    allOf: [{ $ref: '#/definitions/HeaderModifierKind' }],
  }, root)

  assert.equal(schema.type, 'string')
  assert.deepEqual(schema.enum, ['Request', 'Response'])
  assert.equal(isSchemaJsonValue(schema, 'Request'), false)
})

test('resolves a nullable anyOf reference as an object field', async () => {
  const { resolveSchema } = await loadSchemaEditor()
  const root = {
    definitions: {
      PathModifier: { type: 'object', properties: { value: { type: 'string' } } },
    },
  }
  const schema = resolveSchema({
    anyOf: [{ $ref: '#/definitions/PathModifier' }, { type: 'null' }],
  }, root)

  assert.equal(schema.type, 'object')
  assert.deepEqual(schema.properties, { value: { type: 'string' } })
})

test('flattens scalar oneOf variants into a selectable enum', async () => {
  const { resolveSchema } = await loadSchemaEditor()
  const schema = resolveSchema({
    oneOf: [
      { type: 'string', enum: ['Request'] },
      { type: 'string', enum: ['Response'] },
    ],
  }, {})

  assert.equal(schema.type, 'string')
  assert.deepEqual(schema.enum, ['Request', 'Response'])
})
