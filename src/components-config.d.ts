declare module '@components/config' {
  import type { App, DefineComponent } from 'vue'

  const plugin: {
    install(app: App): void
  }

  export default plugin
  export const SelectGateway: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const Gateway: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const Routes: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const GatewayForm: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const RouteForm: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const PluginListForm: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const PluginPanel: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const AiGatewayQueueDrawer: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const TenantRateLimitTable: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const InstanceList: DefineComponent<Record<string, never>, Record<string, never>, any>
  export const Login: DefineComponent<Record<string, never>, Record<string, never>, any>
}
