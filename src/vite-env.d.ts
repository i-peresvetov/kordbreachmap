/// <reference types="vite/client" />

declare const __APP_VERSION__: string

declare module 'virtual:screenshot-index' {
  /** mapId/pointName → file extension (no dot) */
  const index: Record<string, string>
  export default index
}
