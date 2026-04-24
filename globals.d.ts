export declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void
    removeEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void,
    ): void
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K] | UIEvent): void
  }
  interface Window {
    spaNavigate(url: URL, isBack: boolean = false)
    addCleanup(fn: (...args: any[]) => void)
    __immersiveImageState?: {
      viewer: {
        root: HTMLDivElement
        backdrop: HTMLDivElement
        topbar: HTMLDivElement
        title: HTMLDivElement
        close: HTMLButtonElement
        stage: HTMLDivElement
        image: HTMLImageElement
      } | null
      activeImage: HTMLImageElement | null
      scale: number
      translateX: number
      translateY: number
      pointerDrag: { x: number; y: number; startX: number; startY: number } | null
      pinchStartDistance: number
      pinchStartScale: number
      isPinching: boolean
      lastTouchEnd: number
      controller: AbortController | null
    }
  }
}
