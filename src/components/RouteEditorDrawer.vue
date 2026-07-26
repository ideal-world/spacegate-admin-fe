<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Model } from 'spacegate-admin-client'
import { Check, CopyDocument, Delete, Plus, Reading, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PluginListForm } from '@components/config'

const { locale } = useI18n()

const props = defineProps<{
  open: boolean
  modelValue: Model.SgRoute
  mode: 'create' | 'edit'
  gatewayName?: string
  saving?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:modelValue': [value: Model.SgRoute]
  save: []
}>()

const activeTab = ref('basic')
const activeRules = ref<string[]>(['0'])
const jsonText = ref('')
const isDirty = ref(false)
let routeSnapshot = ''

const texts = computed(() => locale.value.startsWith('zh') ? {
  keepOneRule: '至少保留一条规则',
  keepOneBackend: '每条规则至少保留一个后端',
  validateName: '请输入路由名称',
  validateRule: '至少需要一条规则',
  validateBackend: '每条规则至少需要一个后端',
  validateMcpBackend: '至少需要一个后端',
  validatePath: '路径必须以 / 开头',
  validateSsePath: 'SSE 路径必须以 / 开头',
  validateMessagePath: '消息路径必须以 / 开头',
  validateRewrite: '路径重写必须以 / 开头',
  validatePort: '后端端口必须在 1-65535',
  validateWeight: '后端权重不能小于 0',
  jsonApplied: 'JSON 已应用',
  jsonInvalid: 'JSON 格式错误',
  jsonCopied: 'JSON 已复制',
  clipboardWriteDenied: '当前浏览器不允许写入剪贴板',
  clipboardReadDenied: '当前浏览器不允许读取剪贴板',
  createTitle: '新建路由',
  editTitle: '编辑路由',
  titleDesc: '配置匹配条件、目标后端、插件链和高级 JSON。',
  routeType: '路由类型',
  httpRoute: 'HTTPRoute',
  mcpRoute: 'MCPRoute',
  reloadHint: '保存后配置写入 admin-server；如需生效，请在实例运维中触发网关重载。',
  examples: '快速示例',
  apiRoute: 'API 路由',
  staticFiles: '静态文件',
  k8sService: 'K8s 服务',
  tabBasic: '基础信息',
  tabMatch: '匹配条件',
  tabBackend: '目标后端',
  tabPlugins: '插件链',
  tabAdvanced: '高级 JSON',
  basicTitle: '路由基础信息',
  basicDesc: '路由名称用于配置项保存，主机名为空时匹配所有域名。',
  mcpBasicDesc: 'MCPRoute 用于透明代理外部 MCP 服务，运行时编译为流式 HTTP 代理。',
  routeName: '路由名称',
  routeNamePlaceholder: '例如 api-route',
  priority: '优先级',
  hostname: '主机名',
  specifyHostname: '指定域名',
  matchAllHostnames: '匹配所有',
  addHostname: '添加主机名',
  allHostnames: '* 匹配所有主机名',
  matchTitle: '规则和匹配条件',
  matchDesc: '同一条规则内可以配置路径、请求方法、请求头、查询参数；规则按优先级和配置顺序参与匹配。',
  rulePrefix: '规则',
  matchPrefix: '匹配',
  matchAll: '匹配所有请求',
  matchAllTag: '匹配全部',
  matchesTag: (count: number) => `${count} 个匹配`,
  pathKind: '路径类型',
  path: '路径',
  rewrite: '重写路径',
  noRewrite: '不重写则留空',
  method: '请求方法',
  methodPlaceholder: '不选择则不限方法',
  headerMatch: '请求头匹配',
  headerMatchDesc: '按 HTTP Header 名称和值进行匹配，可用于租户、认证、灰度标识等场景。',
  addHeader: '添加请求头条件',
  headerName: 'Header 名称',
  headerValue: 'Header 值',
  headerRewrite: '重写 Header',
  emptyHeader: '未配置请求头条件',
  regex: '正则表达式',
  optionalRewrite: '可选重写',
  queryMatch: '查询参数匹配',
  queryMatchDesc: '按 URL Query 参数进行匹配，适合版本号、渠道、调试开关等轻量条件。',
  addQuery: '添加查询参数条件',
  queryName: '参数 Key',
  queryValue: '参数值',
  emptyQuery: '未配置查询参数条件',
  requestConstraint: '请求约束',
  requestConstraintDesc: '请求头和查询参数为空时不会参与匹配；同一匹配块内的条件同时满足才会命中。',
  addMatch: '添加匹配',
  addRule: '添加规则',
  backendTitle: '目标服务',
  backendDesc: '支持普通 Host、K8s Service 和本地文件后端；多后端按权重分配。',
  mcpTransportTitle: 'MCP 传输',
  mcpTransportDesc: 'Streamable HTTP 在同一路径接收 GET/POST；Legacy SSE 使用独立 SSE 和消息路径。',
  transport: '传输协议',
  streamableHttp: 'Streamable HTTP',
  legacySse: 'Legacy SSE',
  mcpPath: 'MCP 路径',
  ssePath: 'SSE 路径',
  messagePath: '消息路径',
  timeoutMode: '超时模式',
  sessionAffinity: '会话保持',
  mcpBackendDesc: 'MCPRoute 的所有传输路径共享同一组后端；默认按 Mcp-Session-Id 做粘性路由。',
  backendPrefix: '后端',
  kind: '类型',
  fileDirectory: '文件目录',
  port: '端口',
  protocol: '协议',
  default: '默认',
  weight: '权重',
  timeoutMs: '超时 ms',
  inherit: '继承',
  http2Downgrade: 'HTTP/2 降级',
  backendPlugins: '后端插件',
  addBackend: '添加后端',
  pluginTitle: '插件执行位置',
  pluginDesc: '路由插件作用于整条路由；规则插件作用于单条规则；后端插件作用于具体后端。',
  mcpPluginDesc: 'MCPRoute 插件作用于整条 MCP 代理链；避免挂载会缓存或完整读取流式响应体的插件。',
  routePlugins: '路由插件',
  rulePlugins: (index: number) => `规则 #${index + 1} 插件`,
  jsonTitle: '原始 JSON',
  jsonDesc: '用于批量调整或导入已有配置。应用 JSON 前会做基础结构校验。',
  copyJson: '复制 JSON',
  readClipboard: '读取剪贴板',
  applyJson: '应用 JSON',
  cancel: '取消',
  save: '保存',
  unsavedChanges: '有未保存的修改，确认放弃并关闭？',
} : {
  keepOneRule: 'Keep at least one rule.',
  keepOneBackend: 'Each rule must keep at least one backend.',
  validateName: 'Enter a route name.',
  validateRule: 'At least one rule is required.',
  validateBackend: 'Each rule needs at least one backend.',
  validateMcpBackend: 'At least one backend is required.',
  validatePath: 'Path must start with /.',
  validateSsePath: 'SSE path must start with /.',
  validateMessagePath: 'Message path must start with /.',
  validateRewrite: 'Path rewrite must start with /.',
  validatePort: 'Backend port must be between 1 and 65535.',
  validateWeight: 'Backend weight cannot be less than 0.',
  jsonApplied: 'JSON applied.',
  jsonInvalid: 'Invalid JSON.',
  jsonCopied: 'JSON copied.',
  clipboardWriteDenied: 'This browser does not allow writing to the clipboard.',
  clipboardReadDenied: 'This browser does not allow reading from the clipboard.',
  createTitle: 'Create Route',
  editTitle: 'Edit Route',
  titleDesc: 'Configure match conditions, backend targets, plugin chains, and advanced JSON.',
  routeType: 'Route Type',
  httpRoute: 'HTTPRoute',
  mcpRoute: 'MCPRoute',
  reloadHint: 'After saving, the config is written to admin-server. Trigger Gateway reload in Instances to apply it.',
  examples: 'Examples',
  apiRoute: 'API Route',
  staticFiles: 'Static Files',
  k8sService: 'K8s Service',
  tabBasic: 'Basic',
  tabMatch: 'Match',
  tabBackend: 'Backends',
  tabPlugins: 'Plugins',
  tabAdvanced: 'Advanced JSON',
  basicTitle: 'Route Basics',
  basicDesc: 'The route name is used as the config key. Empty hostname matches all domains.',
  mcpBasicDesc: 'MCPRoute transparently proxies external MCP services and compiles to the streaming HTTP runtime.',
  routeName: 'Route Name',
  routeNamePlaceholder: 'For example api-route',
  priority: 'Priority',
  hostname: 'Hostname',
  specifyHostname: 'Specify',
  matchAllHostnames: 'Match All',
  addHostname: 'Add Hostname',
  allHostnames: '* Match all hostnames',
  matchTitle: 'Rules and Match Conditions',
  matchDesc: 'A rule can include path, method, header, and query matches. Rules participate by priority and config order.',
  rulePrefix: 'Rule',
  matchPrefix: 'Match',
  matchAll: 'Match all requests',
  matchAllTag: 'match all',
  matchesTag: (count: number) => `${count} matches`,
  pathKind: 'Path Type',
  path: 'Path',
  rewrite: 'Rewrite',
  noRewrite: 'Leave empty to keep original path',
  method: 'Method',
  methodPlaceholder: 'Leave empty to allow all methods',
  headerMatch: 'Header Match',
  headerMatchDesc: 'Match by HTTP header name and value. Useful for tenants, auth markers, and canary labels.',
  addHeader: 'Add Header Condition',
  headerName: 'Header Name',
  headerValue: 'Header Value',
  headerRewrite: 'Rewrite Header',
  emptyHeader: 'No header conditions configured.',
  regex: 'Regular expression',
  optionalRewrite: 'Optional rewrite',
  queryMatch: 'Query Match',
  queryMatchDesc: 'Match by URL query parameters. Useful for versions, channels, and debug flags.',
  addQuery: 'Add Query Condition',
  queryName: 'Parameter Key',
  queryValue: 'Parameter Value',
  emptyQuery: 'No query conditions configured.',
  requestConstraint: 'Request Constraints',
  requestConstraintDesc: 'Empty header/query sections do not affect matching. Conditions in one match block must all pass.',
  addMatch: 'Add Match',
  addRule: 'Add Rule',
  backendTitle: 'Target Services',
  backendDesc: 'Supports Host, K8s Service, and local File backends. Multiple backends are distributed by weight.',
  mcpTransportTitle: 'MCP Transport',
  mcpTransportDesc: 'Streamable HTTP accepts GET/POST on one path. Legacy SSE uses separate SSE and message paths.',
  transport: 'Transport',
  streamableHttp: 'Streamable HTTP',
  legacySse: 'Legacy SSE',
  mcpPath: 'MCP Path',
  ssePath: 'SSE Path',
  messagePath: 'Message Path',
  timeoutMode: 'Timeout Mode',
  sessionAffinity: 'Session Affinity',
  mcpBackendDesc: 'All MCP transport paths share these backends. Mcp-Session-Id affinity is enabled by default.',
  backendPrefix: 'Backend',
  kind: 'Type',
  fileDirectory: 'File Directory',
  port: 'Port',
  protocol: 'Protocol',
  default: 'Default',
  weight: 'Weight',
  timeoutMs: 'Timeout ms',
  inherit: 'Inherit',
  http2Downgrade: 'HTTP/2 Downgrade',
  backendPlugins: 'Backend Plugins',
  addBackend: 'Add Backend',
  pluginTitle: 'Plugin Execution Position',
  pluginDesc: 'Route plugins apply to the full route. Rule plugins apply to one rule. Backend plugins apply to one backend.',
  mcpPluginDesc: 'MCPRoute plugins apply to the whole MCP proxy chain. Avoid plugins that buffer or fully read streaming responses.',
  routePlugins: 'Route Plugins',
  rulePlugins: (index: number) => `Rule #${index + 1} Plugins`,
  jsonTitle: 'Raw JSON',
  jsonDesc: 'Use this for bulk edits or importing existing config. Basic structure validation runs before applying JSON.',
  copyJson: 'Copy JSON',
  readClipboard: 'Read Clipboard',
  applyJson: 'Apply JSON',
  cancel: 'Cancel',
  save: 'Save',
  unsavedChanges: 'You have unsaved changes. Discard and close?',
})

const drawerOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const routeModel = computed({
  get: () => props.modelValue,
  set: (value: Model.SgRoute) => emit('update:modelValue', value),
})

function isMcpRoute(route: Model.SgRoute): route is Model.SgMcpRoute {
  return (route as Model.SgMcpRoute).kind === 'MCPRoute'
}

const routeType = computed({
  get: () => isMcpRoute(routeModel.value) ? 'mcp' : 'http',
  set: (value: 'http' | 'mcp') => {
    const routeName = routeModel.value.route_name || (value === 'mcp' ? 'mcp-route' : 'http-route')
    routeModel.value = value === 'mcp' ? defaultMcpRoute(routeName) : defaultHttpRoute(routeName)
    activeTab.value = 'basic'
    normalizeRoute()
    syncJson()
  },
})

const hasHostnames = computed({
  get: () => Array.isArray(routeModel.value.hostnames),
  set: (value: boolean) => {
    routeModel.value.hostnames = value ? ['example.com'] : null
  },
})

function defaultMatch(): Model.SgHttpRouteMatch {
  return {
    path: { kind: 'Prefix', value: '/', replace: null },
    header: null,
    query: null,
    method: null,
  }
}

function defaultBackend(): Model.SgBackendRef {
  return {
    host: { kind: 'Host', host: '127.0.0.1' },
    port: 80,
    timeout_ms: null,
    timeout_mode: null,
    protocol: 'http',
    weight: 1,
    plugins: [],
    downgrade_http2: false,
  }
}

function defaultHttpRoute(routeName = 'new-route'): Model.SgHttpRoute {
  return {
    route_name: routeName,
    hostnames: null,
    plugins: [],
    rules: [defaultRule()],
    priority: 0,
  }
}

function defaultMcpRoute(routeName = 'mcp-route'): Model.SgMcpRoute {
  return {
    kind: 'MCPRoute',
    route_name: routeName,
    hostnames: null,
    transport: 'streamable_http',
    path: '/mcp',
    legacy_sse: null,
    backends: [{ ...defaultBackend(), timeout_mode: 'disabled' }],
    plugins: [],
    timeout_mode: 'disabled',
    session_affinity: 'mcp_session',
  }
}

function defaultRule(): Model.SgHttpRouteRule {
  return {
    matches: [defaultMatch()],
    plugins: [],
    backends: [defaultBackend()],
    timeout_ms: null,
    timeout_mode: null,
    balance_policy: null,
  }
}

function normalizeHttpRoute(route: Model.SgHttpRoute) {
  if (!Array.isArray(route.plugins)) route.plugins = []
  if (!Array.isArray(route.rules) || route.rules.length === 0) {
    route.rules = [defaultRule()]
  }
  route.rules.forEach((rule) => {
    if (!Array.isArray(rule.plugins)) rule.plugins = []
    if (rule.matches !== null) {
      if (!Array.isArray(rule.matches) || rule.matches.length === 0) rule.matches = [defaultMatch()]
      rule.matches.forEach((match) => {
        if (!match.path) match.path = { kind: 'Prefix', value: '/', replace: null }
        // Element Plus clears an input to an empty string, while `null` means no rewrite in the route model.
        if (match.path.replace?.trim() === '') match.path.replace = null
      })
    }
    if (!Array.isArray(rule.backends) || rule.backends.length === 0) rule.backends = [defaultBackend()]
    rule.backends.forEach((backend) => {
      if (!Array.isArray(backend.plugins)) backend.plugins = []
      if (backend.weight === undefined || backend.weight === null) backend.weight = 1
      if (backend.host.kind !== 'File' && !backend.port) backend.port = 80
    })
  })
  activeRules.value = route.rules.map((_, index) => `${index}`)
}

function normalizeMcpRoute(route: Model.SgMcpRoute) {
  route.kind = 'MCPRoute'
  if (!Array.isArray(route.plugins)) route.plugins = []
  if (!Array.isArray(route.backends) || route.backends.length === 0) {
    route.backends = [{ ...defaultBackend(), timeout_mode: route.timeout_mode ?? 'disabled' }]
  }
  route.transport = route.transport ?? 'streamable_http'
  route.path = route.path || '/mcp'
  route.timeout_mode = route.timeout_mode ?? 'disabled'
  route.session_affinity = route.session_affinity ?? 'mcp_session'
  if (route.transport === 'legacy_sse') {
    route.legacy_sse = route.legacy_sse ?? { sse_path: '/sse', message_path: '/message' }
  } else {
    route.legacy_sse = null
  }
  route.backends.forEach((backend) => {
    if (!Array.isArray(backend.plugins)) backend.plugins = []
    if (backend.weight === undefined || backend.weight === null) backend.weight = 1
    if (backend.timeout_mode === undefined) backend.timeout_mode = route.timeout_mode
    if (backend.host.kind !== 'File' && !backend.port) backend.port = 80
  })
  activeRules.value = []
}

function normalizeRoute() {
  if (isMcpRoute(routeModel.value)) {
    normalizeMcpRoute(routeModel.value)
  } else {
    normalizeHttpRoute(routeModel.value)
  }
}

function addHostname() {
  if (!Array.isArray(routeModel.value.hostnames)) routeModel.value.hostnames = []
  routeModel.value.hostnames.push('example.com')
}

function removeHostname(index: number) {
  routeModel.value.hostnames?.splice(index, 1)
  if (routeModel.value.hostnames?.length === 0) routeModel.value.hostnames = null
}

function addRule() {
  if (isMcpRoute(routeModel.value)) return
  routeModel.value.rules.push(defaultRule())
  activeRules.value.push(`${routeModel.value.rules.length - 1}`)
}

function removeRule(index: number) {
  if (isMcpRoute(routeModel.value)) return
  if (routeModel.value.rules.length === 1) {
    ElMessage.warning(texts.value.keepOneRule)
    return
  }
  routeModel.value.rules.splice(index, 1)
  activeRules.value = routeModel.value.rules.map((_, idx) => `${idx}`)
}

function matchList(rule: Model.SgHttpRouteRule) {
  if (rule.matches === null) return []
  if (!Array.isArray(rule.matches)) rule.matches = []
  return rule.matches
}

function setMatchAll(rule: Model.SgHttpRouteRule, value: boolean) {
  rule.matches = value ? null : [defaultMatch()]
}

function addMatch(rule: Model.SgHttpRouteRule) {
  if (rule.matches === null) rule.matches = []
  rule.matches.push(defaultMatch())
}

function removeMatch(rule: Model.SgHttpRouteRule, index: number) {
  if (rule.matches === null) return
  rule.matches.splice(index, 1)
  if (rule.matches.length === 0) rule.matches.push(defaultMatch())
}

function addHeader(match: Model.SgHttpRouteMatch) {
  if (!Array.isArray(match.header)) match.header = []
  match.header.push({ kind: 'exact', name: 'x-api-key', value: '', replace: null })
}

function removeHeader(match: Model.SgHttpRouteMatch, index: number) {
  match.header?.splice(index, 1)
  if (match.header?.length === 0) match.header = null
}

function addQuery(match: Model.SgHttpRouteMatch) {
  if (!Array.isArray(match.query)) match.query = []
  match.query.push({ kind: 'exact', value: { key: 'version', value: '' } })
}

function removeQuery(match: Model.SgHttpRouteMatch, index: number) {
  match.query?.splice(index, 1)
  if (match.query?.length === 0) match.query = null
}

function addBackend(rule: Model.SgHttpRouteRule) {
  rule.backends.push(defaultBackend())
}

function removeBackend(rule: Model.SgHttpRouteRule, index: number) {
  if (rule.backends.length === 1) {
    ElMessage.warning(texts.value.keepOneBackend)
    return
  }
  rule.backends.splice(index, 1)
}

function addMcpBackend() {
  if (!isMcpRoute(routeModel.value)) return
  routeModel.value.backends.push({ ...defaultBackend(), timeout_mode: routeModel.value.timeout_mode })
}

function removeMcpBackend(index: number) {
  if (!isMcpRoute(routeModel.value)) return
  if (routeModel.value.backends.length === 1) {
    ElMessage.warning(texts.value.validateMcpBackend)
    return
  }
  routeModel.value.backends.splice(index, 1)
}

function changeBackendKind(backend: Model.SgBackendRef, kind: Model.BackendHost['kind']) {
  if (kind === 'Host') {
    backend.host = { kind: 'Host', host: '127.0.0.1' }
    backend.port = backend.port || 80
  }
  if (kind === 'K8sService') {
    backend.host = { kind: 'K8sService', name: 'service-name', namespace: 'default' }
    backend.port = backend.port || 80
  }
  if (kind === 'File') {
    backend.host = { kind: 'File', path: '/var/www/html' }
    backend.port = null
  }
}

function applyTemplate(type: 'api' | 'static' | 'k8s') {
  const keepName = routeModel.value.route_name && routeModel.value.route_name !== 'new-route'
  const routeName = keepName ? routeModel.value.route_name : `${type}-route`
  if (type === 'api') {
    routeModel.value = {
      route_name: routeName,
      hostnames: null,
      plugins: [],
      priority: 100,
      rules: [{
        matches: [{ ...defaultMatch(), path: { kind: 'Prefix', value: '/api/', replace: '/' } }],
        plugins: [],
        backends: [{ ...defaultBackend(), host: { kind: 'Host', host: '127.0.0.1' }, port: 8080 }],
        timeout_ms: 5000,
        timeout_mode: null,
        balance_policy: null,
      }],
    }
  }
  if (type === 'static') {
    routeModel.value = {
      route_name: routeName,
      hostnames: null,
      plugins: [],
      priority: 0,
      rules: [{
        matches: [{ ...defaultMatch(), path: { kind: 'Prefix', value: '/', replace: null } }],
        plugins: [],
        backends: [{ ...defaultBackend(), host: { kind: 'File', path: '/var/www/spacegate-admin' }, port: null }],
        timeout_ms: null,
        timeout_mode: null,
        balance_policy: null,
      }],
    }
  }
  if (type === 'k8s') {
    routeModel.value = {
      route_name: routeName,
      hostnames: ['api.example.com'],
      plugins: [],
      priority: 50,
      rules: [{
        matches: [{ ...defaultMatch(), path: { kind: 'Prefix', value: '/', replace: null } }],
        plugins: [],
        backends: [{ ...defaultBackend(), host: { kind: 'K8sService', name: 'service-name', namespace: 'default' }, port: 80 }],
        timeout_ms: 5000,
        timeout_mode: null,
        balance_policy: null,
      }],
    }
  }
  normalizeRoute()
  syncJson()
}

function validateRoute() {
  if (!routeModel.value.route_name?.trim()) return texts.value.validateName
  if (isMcpRoute(routeModel.value)) {
    if (routeModel.value.transport === 'legacy_sse') {
      if (!routeModel.value.legacy_sse?.sse_path?.startsWith('/')) return texts.value.validateSsePath
      if (!routeModel.value.legacy_sse?.message_path?.startsWith('/')) return texts.value.validateMessagePath
    } else if (!routeModel.value.path?.startsWith('/')) {
      return texts.value.validatePath
    }
    if (!Array.isArray(routeModel.value.backends) || routeModel.value.backends.length === 0) return texts.value.validateMcpBackend
    for (const backend of routeModel.value.backends) {
      if (backend.host.kind !== 'File' && (!backend.port || backend.port < 1 || backend.port > 65535)) return texts.value.validatePort
      if (backend.weight !== null && backend.weight !== undefined && backend.weight < 0) return texts.value.validateWeight
    }
    return ''
  }
  if (!Array.isArray(routeModel.value.rules) || routeModel.value.rules.length === 0) return texts.value.validateRule
  for (const rule of routeModel.value.rules) {
    if (!Array.isArray(rule.backends) || rule.backends.length === 0) return texts.value.validateBackend
    for (const match of rule.matches ?? []) {
      if (match.path?.value && !match.path.value.startsWith('/')) return texts.value.validatePath
      if (match.path?.replace && !match.path.replace.startsWith('/')) return texts.value.validateRewrite
    }
    for (const backend of rule.backends) {
      if (backend.host.kind !== 'File' && (!backend.port || backend.port < 1 || backend.port > 65535)) return texts.value.validatePort
      if (backend.weight !== null && backend.weight !== undefined && backend.weight < 0) return texts.value.validateWeight
    }
  }
  return ''
}

function requestSave() {
  normalizeRoute()
  const message = validateRoute()
  if (message) {
    ElMessage.warning(message)
    return
  }
  emit('save')
}

function syncJson() {
  jsonText.value = JSON.stringify(routeModel.value, null, 2)
}

function applyJson() {
  try {
    routeModel.value = JSON.parse(jsonText.value)
    normalizeRoute()
    ElMessage.success(texts.value.jsonApplied)
  } catch {
    ElMessage.error(texts.value.jsonInvalid)
  }
}

async function copyJson() {
  syncJson()
  try {
    await navigator.clipboard.writeText(jsonText.value)
    ElMessage.success(texts.value.jsonCopied)
  } catch {
    ElMessage.warning(texts.value.clipboardWriteDenied)
  }
}

async function readClipboard() {
  try {
    jsonText.value = await navigator.clipboard.readText()
  } catch {
    ElMessage.warning(texts.value.clipboardReadDenied)
  }
}

watch(() => props.open, async (open) => {
  if (!open) {
    isDirty.value = false
    return
  }
  activeTab.value = 'basic'
  normalizeRoute()
  syncJson()
  await nextTick()
  routeSnapshot = JSON.stringify(props.modelValue)
  isDirty.value = false
}, { immediate: true })

watch(() => props.modelValue, () => {
  if (!props.open) return
  isDirty.value = JSON.stringify(props.modelValue) !== routeSnapshot
}, { deep: true })

function handleBeforeClose(done: () => void) {
  if (!isDirty.value) { done(); return }
  ElMessageBox.confirm(texts.value.unsavedChanges, '', {
    confirmButtonText: locale.value.startsWith('zh') ? '确认' : 'Confirm',
    cancelButtonText: locale.value.startsWith('zh') ? '取消' : 'Cancel',
  }).then(() => { isDirty.value = false; done() }).catch(() => {})
}

watch(activeTab, (tab) => {
  if (tab === 'advanced') syncJson()
})

watch(() => isMcpRoute(routeModel.value) ? routeModel.value.transport : null, () => {
  if (isMcpRoute(routeModel.value)) {
    normalizeMcpRoute(routeModel.value)
  }
})
</script>

<template>
  <el-drawer v-model="drawerOpen" size="78%" destroy-on-close class="route-editor-drawer" :before-close="handleBeforeClose">
    <template #header>
      <div class="drawer-title route-editor-drawer__title">
        <div>
          <span>{{ mode === 'create' ? texts.createTitle : texts.editTitle }}</span>
          <p>{{ texts.titleDesc }}</p>
        </div>
        <el-tag v-if="gatewayName" effect="plain">{{ gatewayName }}</el-tag>
      </div>
    </template>

    <div class="route-editor">
      <el-alert
        type="info"
        show-icon
        :closable="false"
        :title="texts.reloadHint"
      />

      <div v-if="!isMcpRoute(routeModel)" class="route-editor__examples">
        <span>{{ texts.examples }}</span>
        <el-button :icon="Reading" @click="applyTemplate('api')">{{ texts.apiRoute }}</el-button>
        <el-button :icon="Reading" @click="applyTemplate('static')">{{ texts.staticFiles }}</el-button>
        <el-button :icon="Reading" @click="applyTemplate('k8s')">{{ texts.k8sService }}</el-button>
      </div>

      <el-tabs v-model="activeTab" class="route-editor__tabs">
        <el-tab-pane :label="texts.tabBasic" name="basic">
          <section class="form-section">
            <div class="form-section__header">
              <h3>{{ texts.basicTitle }}</h3>
              <p>{{ isMcpRoute(routeModel) ? texts.mcpBasicDesc : texts.basicDesc }}</p>
            </div>
            <el-form label-position="top">
              <el-form-item v-if="mode === 'create'" :label="texts.routeType">
                <el-segmented v-model="routeType" :options="[
                  { label: texts.httpRoute, value: 'http' },
                  { label: texts.mcpRoute, value: 'mcp' },
                ]" />
              </el-form-item>
              <el-row :gutter="14">
                <el-col :span="isMcpRoute(routeModel) ? 24 : 14">
                  <el-form-item :label="texts.routeName">
                    <el-input v-model="routeModel.route_name" :placeholder="texts.routeNamePlaceholder" />
                  </el-form-item>
                </el-col>
                <el-col v-if="!isMcpRoute(routeModel)" :span="10">
                  <el-form-item :label="texts.priority">
                    <el-input-number v-model="routeModel.priority" :min="-5000" :max="5000" class="w-full" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item>
                <template #label>
                  <div class="form-label-row">
                    <span>{{ texts.hostname }}</span>
                    <el-switch v-model="hasHostnames" :active-text="texts.specifyHostname" :inactive-text="texts.matchAllHostnames" />
                  </div>
                </template>
                <div v-if="hasHostnames" class="field-list">
                  <div v-for="(_, index) in routeModel.hostnames" :key="index" class="field-row">
                    <el-input v-model="routeModel.hostnames![index]" placeholder="api.example.com" />
                    <el-button :icon="Delete" text type="danger" @click="removeHostname(index)" />
                  </div>
                  <el-button :icon="Plus" @click="addHostname">{{ texts.addHostname }}</el-button>
                </div>
                <el-tag v-else type="info">{{ texts.allHostnames }}</el-tag>
              </el-form-item>
            </el-form>
          </section>
        </el-tab-pane>

        <el-tab-pane v-if="isMcpRoute(routeModel)" :label="texts.transport" name="transport">
          <section class="form-section">
            <div class="form-section__header">
              <h3>{{ texts.mcpTransportTitle }}</h3>
              <p>{{ texts.mcpTransportDesc }}</p>
            </div>
            <el-form label-position="top">
              <el-form-item :label="texts.transport">
                <el-segmented v-model="routeModel.transport" :options="[
                  { label: texts.streamableHttp, value: 'streamable_http' },
                  { label: texts.legacySse, value: 'legacy_sse' },
                ]" />
              </el-form-item>
              <el-form-item v-if="routeModel.transport === 'streamable_http'" :label="texts.mcpPath">
                <el-input v-model="routeModel.path" placeholder="/mcp" />
              </el-form-item>
              <el-row v-if="routeModel.transport === 'legacy_sse' && routeModel.legacy_sse" :gutter="12">
                <el-col :span="12">
                  <el-form-item :label="texts.ssePath">
                    <el-input v-model="routeModel.legacy_sse.sse_path" placeholder="/sse" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="texts.messagePath">
                    <el-input v-model="routeModel.legacy_sse.message_path" placeholder="/message" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="12">
                <el-col :span="12">
                  <el-form-item :label="texts.timeoutMode">
                    <el-select v-model="routeModel.timeout_mode">
                      <el-option label="disabled" value="disabled" />
                      <el-option label="request" value="request" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="texts.sessionAffinity">
                    <el-select v-model="routeModel.session_affinity">
                      <el-option label="mcp_session" value="mcp_session" />
                      <el-option label="none" value="none" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </section>
        </el-tab-pane>

        <el-tab-pane v-if="!isMcpRoute(routeModel)" :label="texts.tabMatch" name="match">
          <section class="form-section">
            <div class="form-section__header">
              <h3>{{ texts.matchTitle }}</h3>
              <p>{{ texts.matchDesc }}</p>
            </div>
            <el-collapse v-model="activeRules">
              <el-collapse-item v-for="(rule, ruleIndex) in routeModel.rules" :key="ruleIndex" :name="`${ruleIndex}`">
                <template #title>
                  <div class="rule-title">
                    <span>{{ texts.rulePrefix }} #{{ ruleIndex + 1 }}</span>
                    <span class="rule-title__meta">
                      <el-tag size="small" type="info">{{ rule.matches === null ? texts.matchAllTag : texts.matchesTag(rule.matches?.length || 0) }}</el-tag>
                      <el-button :icon="Delete" text type="danger" @click.stop="removeRule(ruleIndex)" />
                    </span>
                  </div>
                </template>
                <div class="rule-panel">
                  <div class="form-label-row">
                    <span>{{ texts.matchAll }}</span>
                    <el-switch :model-value="rule.matches === null" @update:model-value="(value) => setMatchAll(rule, Boolean(value))" />
                  </div>

                  <div v-if="rule.matches !== null" class="match-list">
                    <div v-for="(match, matchIndex) in matchList(rule)" :key="matchIndex" class="match-block">
                      <div class="match-block__header">
                        <strong>{{ texts.matchPrefix }} #{{ matchIndex + 1 }}</strong>
                        <el-button :icon="Delete" text type="danger" @click="removeMatch(rule, matchIndex)" />
                      </div>
                      <el-row :gutter="12" class="match-primary-grid">
                        <el-col :span="7">
                          <el-form-item :label="texts.pathKind">
                            <el-select v-model="match.path!.kind">
                              <el-option label="Prefix" value="Prefix" />
                              <el-option label="Exact" value="Exact" />
                              <el-option label="RegExp" value="RegExp" />
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :span="7">
                          <el-form-item :label="texts.path">
                            <el-input v-model="match.path!.value" placeholder="/api/" />
                          </el-form-item>
                        </el-col>
                        <el-col :span="10">
                          <el-form-item :label="texts.rewrite">
                            <el-input v-model="match.path!.replace" clearable :placeholder="texts.noRewrite" />
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-form-item :label="texts.method">
                        <el-select v-model="match.method" multiple clearable :placeholder="texts.methodPlaceholder">
                          <el-option v-for="method in ['GET','POST','PUT','DELETE','PATCH','HEAD','OPTIONS']" :key="method" :label="method" :value="method" />
                        </el-select>
                      </el-form-item>

                      <div class="request-constraints">
                        <div class="request-constraints__header">
                          <div>
                            <strong>{{ texts.requestConstraint }}</strong>
                            <p>{{ texts.requestConstraintDesc }}</p>
                          </div>
                        </div>

                        <div class="condition-grid">
                          <section class="condition-panel">
                            <div class="condition-panel__header">
                              <div>
                                <strong>{{ texts.headerMatch }}</strong>
                                <p>{{ texts.headerMatchDesc }}</p>
                              </div>
                              <el-button :icon="Plus" @click="addHeader(match)">{{ texts.addHeader }}</el-button>
                            </div>
                            <el-empty v-if="!match.header?.length" :description="texts.emptyHeader" :image-size="48" />
                            <div v-else class="condition-list">
                              <div v-for="(header, headerIndex) in match.header || []" :key="headerIndex" class="condition-row condition-row--header">
                                <el-select v-model="header.kind" class="condition-kind">
                                  <el-option label="Exact" value="exact" />
                                  <el-option label="RegExp" value="reg_exp" />
                                </el-select>
                                <el-input v-model="header.name" :placeholder="texts.headerName" />
                                <el-input v-if="header.kind === 'exact'" v-model="header.value" :placeholder="texts.headerValue" />
                                <el-input v-else v-model="header.re" :placeholder="texts.regex" />
                                <el-input v-model="header.replace" clearable :placeholder="texts.headerRewrite" />
                                <el-button :icon="Delete" text type="danger" @click="removeHeader(match, headerIndex)" />
                              </div>
                            </div>
                          </section>

                          <section class="condition-panel">
                            <div class="condition-panel__header">
                              <div>
                                <strong>{{ texts.queryMatch }}</strong>
                                <p>{{ texts.queryMatchDesc }}</p>
                              </div>
                              <el-button :icon="Plus" @click="addQuery(match)">{{ texts.addQuery }}</el-button>
                            </div>
                            <el-empty v-if="!match.query?.length" :description="texts.emptyQuery" :image-size="48" />
                            <div v-else class="condition-list">
                              <div v-for="(query, queryIndex) in match.query || []" :key="queryIndex" class="condition-row condition-row--query">
                                <el-select v-model="query.kind" class="condition-kind">
                                  <el-option label="Exact" value="exact" />
                                  <el-option label="RegExp" value="regular" />
                                </el-select>
                                <el-input v-model="query.value.key" :placeholder="texts.queryName" />
                                <el-input v-if="query.kind === 'exact'" v-model="query.value.value" :placeholder="texts.queryValue" />
                                <el-input v-else v-model="query.value.re" :placeholder="texts.regex" />
                                <el-button :icon="Delete" text type="danger" @click="removeQuery(match, queryIndex)" />
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>
                    </div>
                    <el-button :icon="Plus" class="w-full" @click="addMatch(rule)">{{ texts.addMatch }}</el-button>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
            <el-button :icon="Plus" type="primary" plain class="w-full route-editor__add-rule" @click="addRule">{{ texts.addRule }}</el-button>
          </section>
        </el-tab-pane>

        <el-tab-pane :label="texts.tabBackend" name="backend">
          <section class="form-section">
            <div class="form-section__header">
              <h3>{{ texts.backendTitle }}</h3>
              <p>{{ isMcpRoute(routeModel) ? texts.mcpBackendDesc : texts.backendDesc }}</p>
            </div>
            <div v-if="isMcpRoute(routeModel)">
              <div v-for="(backend, backendIndex) in routeModel.backends" :key="backendIndex" class="backend-block">
                <div class="match-block__header">
                  <strong>{{ texts.backendPrefix }} #{{ backendIndex + 1 }}</strong>
                  <el-button :icon="Delete" text type="danger" @click="removeMcpBackend(backendIndex)" />
                </div>
                <el-row :gutter="12">
                  <el-col :span="6">
                    <el-form-item :label="texts.kind">
                      <el-select :model-value="backend.host.kind" @update:model-value="(value) => changeBackendKind(backend, value)">
                        <el-option label="Host" value="Host" />
                        <el-option label="K8sService" value="K8sService" />
                        <el-option label="File" value="File" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col v-if="backend.host.kind === 'Host'" :span="12">
                    <el-form-item label="Host">
                      <el-input v-model="backend.host.host" placeholder="127.0.0.1" />
                    </el-form-item>
                  </el-col>
                  <template v-if="backend.host.kind === 'K8sService'">
                    <el-col :span="8">
                      <el-form-item label="Service">
                        <el-input v-model="backend.host.name" placeholder="service-name" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item label="Namespace">
                        <el-input v-model="backend.host.namespace" placeholder="default" />
                      </el-form-item>
                    </el-col>
                  </template>
                  <el-col v-if="backend.host.kind === 'File'" :span="16">
                    <el-form-item :label="texts.fileDirectory">
                      <el-input v-model="backend.host.path" placeholder="/var/www/html" />
                    </el-form-item>
                  </el-col>
                  <el-col v-if="backend.host.kind !== 'File'" :span="6">
                    <el-form-item :label="texts.port">
                      <el-input-number v-model="backend.port" :min="1" :max="65535" class="w-full" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="12">
                  <el-col :span="6">
                    <el-form-item :label="texts.protocol">
                      <el-select v-model="backend.protocol" clearable :placeholder="texts.default">
                        <el-option label="http" value="http" />
                        <el-option label="https" value="https" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item :label="texts.weight">
                      <el-input-number v-model="backend.weight" :min="0" class="w-full" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item :label="texts.timeoutMs">
                      <el-input-number v-model="backend.timeout_ms" :min="0" class="w-full" :placeholder="texts.inherit" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item :label="texts.http2Downgrade">
                      <el-switch v-model="backend.downgrade_http2" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item :label="texts.backendPlugins">
                  <PluginListForm
                    v-model="backend.plugins"
                    binding-scope="backend"
                    :binding-name="`${routeModel.route_name}-mcp-backend-${backendIndex + 1}`"
                  />
                </el-form-item>
              </div>
              <el-button :icon="Plus" class="w-full" @click="addMcpBackend">{{ texts.addBackend }}</el-button>
            </div>
            <el-collapse v-else v-model="activeRules">
              <el-collapse-item v-for="(rule, ruleIndex) in routeModel.rules" :key="ruleIndex" :name="`${ruleIndex}`" :title="`${texts.rulePrefix} #${ruleIndex + 1}`">
                <div v-for="(backend, backendIndex) in rule.backends" :key="backendIndex" class="backend-block">
                  <div class="match-block__header">
                    <strong>{{ texts.backendPrefix }} #{{ backendIndex + 1 }}</strong>
                    <el-button :icon="Delete" text type="danger" @click="removeBackend(rule, backendIndex)" />
                  </div>
                  <el-row :gutter="12">
                    <el-col :span="6">
                      <el-form-item :label="texts.kind">
                        <el-select :model-value="backend.host.kind" @update:model-value="(value) => changeBackendKind(backend, value)">
                          <el-option label="Host" value="Host" />
                          <el-option label="K8sService" value="K8sService" />
                          <el-option label="File" value="File" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col v-if="backend.host.kind === 'Host'" :span="12">
                      <el-form-item label="Host">
                        <el-input v-model="backend.host.host" placeholder="127.0.0.1" />
                      </el-form-item>
                    </el-col>
                    <template v-if="backend.host.kind === 'K8sService'">
                      <el-col :span="8">
                        <el-form-item label="Service">
                          <el-input v-model="backend.host.name" placeholder="service-name" />
                        </el-form-item>
                      </el-col>
                      <el-col :span="6">
                        <el-form-item label="Namespace">
                          <el-input v-model="backend.host.namespace" placeholder="default" />
                        </el-form-item>
                      </el-col>
                    </template>
                    <el-col v-if="backend.host.kind === 'File'" :span="16">
                      <el-form-item :label="texts.fileDirectory">
                        <el-input v-model="backend.host.path" placeholder="/var/www/html" />
                      </el-form-item>
                    </el-col>
                    <el-col v-if="backend.host.kind !== 'File'" :span="6">
                      <el-form-item :label="texts.port">
                        <el-input-number v-model="backend.port" :min="1" :max="65535" class="w-full" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row :gutter="12">
                    <el-col :span="6">
                      <el-form-item :label="texts.protocol">
                        <el-select v-model="backend.protocol" clearable :placeholder="texts.default">
                          <el-option label="http" value="http" />
                          <el-option label="https" value="https" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item :label="texts.weight">
                        <el-input-number v-model="backend.weight" :min="0" class="w-full" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item :label="texts.timeoutMs">
                        <el-input-number v-model="backend.timeout_ms" :min="0" class="w-full" :placeholder="texts.inherit" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="6">
                      <el-form-item :label="texts.http2Downgrade">
                        <el-switch v-model="backend.downgrade_http2" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-form-item :label="texts.backendPlugins">
                    <PluginListForm
                      v-model="backend.plugins"
                      binding-scope="backend"
                      :binding-name="`${routeModel.route_name}-rule-${ruleIndex + 1}-backend-${backendIndex + 1}`"
                    />
                  </el-form-item>
                </div>
                <el-button :icon="Plus" class="w-full" @click="addBackend(rule)">{{ texts.addBackend }}</el-button>
              </el-collapse-item>
            </el-collapse>
          </section>
        </el-tab-pane>

        <el-tab-pane :label="texts.tabPlugins" name="plugins">
          <section class="form-section">
            <div class="form-section__header">
              <h3>{{ texts.pluginTitle }}</h3>
              <p>{{ isMcpRoute(routeModel) ? texts.mcpPluginDesc : texts.pluginDesc }}</p>
            </div>
            <el-form label-position="top">
              <el-form-item :label="texts.routePlugins">
                <PluginListForm
                  v-model="routeModel.plugins"
                  binding-scope="route"
                  :binding-name="`${routeModel.route_name}-route`"
                />
              </el-form-item>
              <template v-if="!isMcpRoute(routeModel)">
              <el-form-item v-for="(rule, index) in routeModel.rules" :key="index" :label="texts.rulePlugins(index)">
                <PluginListForm
                  v-model="rule.plugins"
                  binding-scope="rule"
                  :binding-name="`${routeModel.route_name}-rule-${index + 1}`"
                />
              </el-form-item>
              </template>
            </el-form>
          </section>
        </el-tab-pane>

        <el-tab-pane :label="texts.tabAdvanced" name="advanced">
          <section class="form-section">
            <div class="form-section__header">
              <h3>{{ texts.jsonTitle }}</h3>
              <p>{{ texts.jsonDesc }}</p>
            </div>
            <div class="json-actions">
              <el-button :icon="CopyDocument" @click="copyJson">{{ texts.copyJson }}</el-button>
              <el-button :icon="Upload" @click="readClipboard">{{ texts.readClipboard }}</el-button>
              <el-button type="primary" plain @click="applyJson">{{ texts.applyJson }}</el-button>
            </div>
            <el-input v-model="jsonText" type="textarea" :rows="20" spellcheck="false" class="json-editor" />
          </section>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="drawerOpen = false">{{ texts.cancel }}</el-button>
      <el-button type="primary" :icon="Check" :loading="saving" @click="requestSave">{{ texts.save }}</el-button>
    </template>
  </el-drawer>
</template>
