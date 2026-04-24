const IMAGE_SELECTOR = ".center article img"
const EXCLUDED_PARENTS = [
  ".hero-visual",
  ".category-hero",
  ".entry-card",
  ".theme-card",
  ".feature-step",
  ".popover",
]

type ViewerEls = {
  root: HTMLDivElement
  backdrop: HTMLDivElement
  topbar: HTMLDivElement
  title: HTMLDivElement
  close: HTMLButtonElement
  stage: HTMLDivElement
  image: HTMLImageElement
}

type ImmersiveImageState = {
  viewer: ViewerEls | null
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

const state = (window.__immersiveImageState ??= {
  viewer: null,
  activeImage: null,
  scale: 1,
  translateX: 0,
  translateY: 0,
  pointerDrag: null,
  pinchStartDistance: 0,
  pinchStartScale: 1,
  isPinching: false,
  lastTouchEnd: 0,
  controller: null,
} satisfies ImmersiveImageState)

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function isOpen() {
  return state.viewer?.root.classList.contains("active") ?? false
}

function getImageTitle(img: HTMLImageElement) {
  return (
    img.getAttribute("data-viewer-title") ??
    img.getAttribute("alt") ??
    img.closest("figure")?.querySelector("figcaption")?.textContent?.trim() ??
    "唐卡图像"
  )
}

/** Check whether an image element qualifies for immersive viewing */
function isImmersiveTarget(img: Element): img is HTMLImageElement {
  if (img.tagName !== "IMG") return false
  if (!img.matches(IMAGE_SELECTOR)) return false
  if (EXCLUDED_PARENTS.some((sel) => img.closest(sel))) return false
  if (img.closest("a")) return false
  return true
}

function ensureViewer() {
  if (state.viewer) {
    if (!document.body.contains(state.viewer.root)) {
      document.body.appendChild(state.viewer.root)
    }
    return state.viewer
  }

  const root = document.createElement("div")
  root.className = "immersive-image-viewer"
  root.dataset.persist = ""
  // Use `inert` instead of `aria-hidden` to avoid the browser warning
  // "Blocked aria-hidden on an element because its descendant retained focus"
  root.inert = true

  const backdrop = document.createElement("div")
  backdrop.className = "immersive-image-backdrop"

  const topbar = document.createElement("div")
  topbar.className = "immersive-image-topbar"

  const title = document.createElement("div")
  title.className = "immersive-image-title"

  const close = document.createElement("button")
  close.className = "immersive-image-close"
  close.type = "button"
  close.setAttribute("aria-label", "关闭看图")
  close.textContent = "关闭"

  const stage = document.createElement("div")
  stage.className = "immersive-image-stage"

  const image = document.createElement("img")
  image.className = "immersive-image-stage-img"
  image.alt = ""
  image.draggable = false

  topbar.append(title, close)
  stage.appendChild(image)
  root.append(backdrop, topbar, stage)
  document.body.appendChild(root)

  close.addEventListener("click", () => closeViewer())
  backdrop.addEventListener("click", () => closeViewer())
  root.addEventListener("click", (event) => {
    if (event.target === root) closeViewer()
  })

  stage.addEventListener("dblclick", (event) => {
    event.preventDefault()
    toggleZoom()
  })

  stage.addEventListener("pointerdown", (event) => {
    if (state.scale <= 1) return
    state.pointerDrag = {
      x: event.clientX,
      y: event.clientY,
      startX: state.translateX,
      startY: state.translateY,
    }
    stage.setPointerCapture(event.pointerId)
  })

  stage.addEventListener("pointermove", (event) => {
    if (!state.pointerDrag || state.scale <= 1) return
    state.translateX = state.pointerDrag.startX + (event.clientX - state.pointerDrag.x)
    state.translateY = state.pointerDrag.startY + (event.clientY - state.pointerDrag.y)
    applyTransform()
  })

  const releasePointer = (event: PointerEvent) => {
    if (!state.pointerDrag) return
    state.pointerDrag = null
    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId)
    }
  }

  stage.addEventListener("pointerup", releasePointer)
  stage.addEventListener("pointercancel", releasePointer)

  stage.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length === 2) {
        state.isPinching = true
        state.pinchStartDistance = getTouchDistance(event.touches)
        state.pinchStartScale = state.scale
      }
    },
    { passive: true },
  )

  stage.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length === 2) {
        event.preventDefault()
        const nextDistance = getTouchDistance(event.touches)
        const ratio = nextDistance / Math.max(state.pinchStartDistance, 1)
        setScale(state.pinchStartScale * ratio)
        return
      }

      if (event.touches.length === 1 && state.scale > 1) {
        event.preventDefault()
        const touch = event.touches[0]
        if (!state.pointerDrag) {
          state.pointerDrag = {
            x: touch.clientX,
            y: touch.clientY,
            startX: state.translateX,
            startY: state.translateY,
          }
        } else {
          state.translateX = state.pointerDrag.startX + (touch.clientX - state.pointerDrag.x)
          state.translateY = state.pointerDrag.startY + (touch.clientY - state.pointerDrag.y)
          applyTransform()
        }
      }
    },
    { passive: false },
  )

  stage.addEventListener("touchend", (event) => {
    state.pointerDrag = null

    // If we were pinching and all fingers are now up, just clear the flag.
    // Do NOT count this as a tap — otherwise two rapid touchend events
    // from a simultaneous two-finger lift get misread as a double-tap,
    // resetting the zoom the user just performed.
    if (state.isPinching) {
      if (event.touches.length === 0) {
        state.isPinching = false
      }
      state.lastTouchEnd = 0
      return
    }

    const now = Date.now()
    if (now - state.lastTouchEnd < 260) {
      toggleZoom()
      state.lastTouchEnd = 0
    } else {
      state.lastTouchEnd = now
    }
  })

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return
    if (event.key === "Escape") {
      event.preventDefault()
      closeViewer()
    }
  })

  state.viewer = { root, backdrop, topbar, title, close, stage, image }
  return state.viewer
}

function getTouchDistance(touches: TouchList) {
  const [a, b] = [touches[0], touches[1]]
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

function applyTransform() {
  if (!state.viewer) return
  state.viewer.image.style.transform = `translate3d(${state.translateX}px, ${state.translateY}px, 0) scale(${state.scale})`
}

function resetTransform() {
  state.scale = 1
  state.translateX = 0
  state.translateY = 0
  applyTransform()
}

function setScale(nextScale: number) {
  state.scale = clamp(nextScale, 1, 5)
  if (state.scale === 1) {
    state.translateX = 0
    state.translateY = 0
  }
  applyTransform()
}

function toggleZoom() {
  if (state.scale > 1) {
    resetTransform()
  } else {
    setScale(2.2)
  }
}

function openViewer(img: HTMLImageElement) {
  const els = ensureViewer()
  state.activeImage = img
  els.title.textContent = getImageTitle(img)
  els.image.src = img.dataset.detailSrc || img.currentSrc || img.src
  els.image.alt = img.alt || ""
  resetTransform()
  els.root.classList.add("active")
  els.root.inert = false
  document.documentElement.classList.add("immersive-image-open")
}

function closeViewer() {
  if (!state.viewer) return
  state.viewer.root.classList.remove("active")
  state.viewer.root.inert = true
  document.documentElement.classList.remove("immersive-image-open")
  state.activeImage = null
  resetTransform()
}

/**
 * Apply the `cursor: zoom-in` class to all qualifying article images.
 * Called on every "nav" event so that freshly-morphed DOM nodes get styled.
 */
function styleImages() {
  const images = document.querySelectorAll(IMAGE_SELECTOR)
  for (const img of images) {
    if (!isImmersiveTarget(img)) continue
    img.classList.add("immersive-image-target")
  }
}

/**
 * Single delegated click handler registered once on the document.
 * Because it does not hold references to individual <img> elements,
 * it is immune to DOM-node replacement by micromorph during SPA navigation.
 */
function onImageClick(event: MouseEvent) {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
  const img = (event.target as Element)?.closest?.(IMAGE_SELECTOR)
  if (!img || !isImmersiveTarget(img)) return

  event.preventDefault()
  event.stopPropagation()
  openViewer(img as HTMLImageElement)
}

state.controller?.abort()
state.controller = new AbortController()

document.addEventListener(
  "nav",
  () => {
    closeViewer()
    styleImages()
  },
  { signal: state.controller.signal },
)

document.addEventListener("click", onImageClick, {
  capture: true,
  signal: state.controller.signal,
})
