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
  const rules = route?.rules
  if (!rules?.length) return 'match all'
  const rule = rules[0]
  let summary: string
  if (rule.matches === null) {
    summary = 'match all'
  } else {
    const match = rule.matches?.[0]
    if (!match) {
      summary = 'custom match'
    } else if (match.path) {
      summary = `${match.path.kind} ${match.path.value}`
    } else if (match.method?.length) {
      summary = match.method.join(', ')
    } else if (match.header?.length) {
      summary = `${match.header.length} header matches`
    } else if (match.query?.length) {
      summary = `${match.query.length} query matches`
    } else {
      summary = 'custom match'
    }
  }
  if (rules.length > 1) summary += `  +${rules.length - 1} more rules`
  return summary
}

export function backendSummary(route?: Model.SgHttpRoute | null) {
  const allBackends = route?.rules?.flatMap((rule) => rule.backends ?? []) ?? []
  if (!allBackends.length) return '-'
  const first = allBackends[0]
  const host = first.host
  let label: string
  if (host.kind === 'Host') label = `${host.host}:${first.port ?? 80}`
  else if (host.kind === 'K8sService') label = `${host.name}.${host.namespace}:${first.port ?? 80}`
  else if (host.kind === 'File') label = host.path
  else label = '-'
  if (allBackends.length > 1) label += `  +${allBackends.length - 1} more`
  return label
}

export function hostnameSummary(route?: Model.SgHttpRoute | null) {
  if (!route?.hostnames?.length) return '*'
  return route.hostnames.join(', ')
}

export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}
