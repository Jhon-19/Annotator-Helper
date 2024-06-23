/// <reference types="vite/client" />

declare module '@/App.vue'
declare module '@/views/triple-annotator.vue'
declare module '@/views/event-annotator.vue'

export interface IElectronAPI {
  openFile: Function
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
