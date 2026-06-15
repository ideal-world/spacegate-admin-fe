import { Model } from 'spacegate-admin-client'

export function listenerSummary(gateway?: Model.SgGateway | null) {
  if (!gateway?.listeners?.length) return '-'
  return gateway.listeners
    .map((listener) => `${listener.name || 'listener'}:${listener.port}/${listener.protocol.type}`)
    .join(', ')
}

export function pluginCount(plugins?: unknown[] | null) {
  return Array.isArray(plugins) ? plugins.length : 0
}

export function routeMatchSummary(route?: Model.SgHttpRoute | null) {
  const rule = route?.rules?.[0]
  if (!rule) return 'match all'
  if (rule.matches === null) return 'match all'
  const match = rule.matches?.[0]
  if (!match) return 'custom match'
  if (match.path) return `${match.path.kind} ${match.path.value}`
  if (match.method?.length) return match.method.join(', ')
  if (match.header?.length) return `${match.header.length} header matches`
  if (match.query?.length) return `${match.query.length} query matches`
  return 'custom match'
}

export function backendSummary(route?: Model.SgHttpRoute | null) {
  const backend = route?.rules?.find((rule) => rule.backends?.length)?.backends?.[0]
  if (!backend) return '-'
  const host = backend.host
  if (host.kind === 'Host') return `${host.host}:${backend.port ?? 80}`
  if (host.kind === 'K8sService') return `${host.name}.${host.namespace}:${backend.port ?? 80}`
  if (host.kind === 'File') return host.path
  return '-'
}

export function hostnameSummary(route?: Model.SgHttpRoute | null) {
  if (!route?.hostnames?.length) return '*'
  return route.hostnames.join(', ')
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}
