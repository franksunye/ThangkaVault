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

let viewer: ViewerEls | null = null
let activeImage: HTMLImageElement | null = null
let scale = 1
let translateX = 0
let translateY = 0
let pointerDrag: { x: number; y: number; startX: number; startY: number } | null = null
let pinchStartDistance = 0
let pinchStartScale = 1
let lastTouchEnd = 0

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function isOpen() {
  return viewer?.root.classList.contains("active") ?? false
}

function getImageTitle(img: HTMLImageElement) {
  return (
    img.getAttribute("data-viewer-title") ??
    img.getAttribute("alt") ??
    img.closest("figure")?.querySelector("figcaption")?.textContent?.trim() ??
    "唐卡图像"
  )
}

function ensureViewer() {
  if (viewer) return viewer

  const root = document.createElement("div")
  root.className = "immersive-image-viewer"
  root.setAttribute("aria-hidden", "true")

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
    if (scale <= 1) return
    pointerDrag = {
      x: event.clientX,
      y: event.clientY,
      startX: translateX,
      startY: translateY,
    }
    stage.setPointerCapture(event.pointerId)
  })

  stage.addEventListener("pointermove", (event) => {
    if (!pointerDrag || scale <= 1) return
    translateX = pointerDrag.startX + (event.clientX - pointerDrag.x)
    translateY = pointerDrag.startY + (event.clientY - pointerDrag.y)
    applyTransform()
  })

  const releasePointer = (event: PointerEvent) => {
    if (!pointerDrag) return
    pointerDrag = null
    stage.releasePointerCapture(event.pointerId)
  }

  stage.addEventListener("pointerup", releasePointer)
  stage.addEventListener("pointercancel", releasePointer)

  stage.addEventListener(
    "touchstart",
    (event) => {
      if (event.touches.length === 2) {
        pinchStartDistance = getTouchDistance(event.touches)
        pinchStartScale = scale
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
        const ratio = nextDistance / Math.max(pinchStartDistance, 1)
        setScale(pinchStartScale * ratio)
        return
      }

      if (event.touches.length === 1 && scale > 1) {
        event.preventDefault()
        const touch = event.touches[0]
        if (!pointerDrag) {
          pointerDrag = {
            x: touch.clientX,
            y: touch.clientY,
            startX: translateX,
            startY: translateY,
          }
        } else {
          translateX = pointerDrag.startX + (touch.clientX - pointerDrag.x)
          translateY = pointerDrag.startY + (touch.clientY - pointerDrag.y)
          applyTransform()
        }
      }
    },
    { passive: false },
  )

  stage.addEventListener("touchend", () => {
    pointerDrag = null
    const now = Date.now()
    if (now - lastTouchEnd < 260) {
      toggleZoom()
      lastTouchEnd = 0
    } else {
      lastTouchEnd = now
    }
  })

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) return
    if (event.key === "Escape") {
      event.preventDefault()
      closeViewer()
    }
  })

  viewer = { root, backdrop, topbar, title, close, stage, image }
  return viewer
}

function getTouchDistance(touches: TouchList) {
  const [a, b] = [touches[0], touches[1]]
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
}

function applyTransform() {
  if (!viewer) return
  viewer.image.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`
}

function resetTransform() {
  scale = 1
  translateX = 0
  translateY = 0
  applyTransform()
}

function setScale(nextScale: number) {
  scale = clamp(nextScale, 1, 5)
  if (scale === 1) {
    translateX = 0
    translateY = 0
  }
  applyTransform()
}

function toggleZoom() {
  if (scale > 1) {
    resetTransform()
  } else {
    setScale(2.2)
  }
}

function openViewer(img: HTMLImageElement) {
  const els = ensureViewer()
  activeImage = img
  els.title.textContent = getImageTitle(img)
  els.image.src = img.currentSrc || img.src
  els.image.alt = img.alt || ""
  resetTransform()
  els.root.classList.add("active")
  els.root.setAttribute("aria-hidden", "false")
  document.documentElement.classList.add("immersive-image-open")
}

function closeViewer() {
  if (!viewer) return
  viewer.root.classList.remove("active")
  viewer.root.setAttribute("aria-hidden", "true")
  document.documentElement.classList.remove("immersive-image-open")
  activeImage = null
  resetTransform()
}

function bindImages() {
  const images = Array.from(document.querySelectorAll(IMAGE_SELECTOR)) as HTMLImageElement[]
  for (const img of images) {
    if (EXCLUDED_PARENTS.some((selector) => img.closest(selector))) continue
    if (img.closest("a")) continue
    if (img.dataset.immersiveBound === "true") continue
    img.dataset.immersiveBound = "true"
    img.classList.add("immersive-image-target")
    const onClick = (event: MouseEvent) => {
      event.preventDefault()
      openViewer(img)
    }
    img.addEventListener("click", onClick)
    window.addCleanup(() => {
      img.removeEventListener("click", onClick)
      delete img.dataset.immersiveBound
      img.classList.remove("immersive-image-target")
    })
  }
}

document.addEventListener("nav", () => {
  closeViewer()
  bindImages()
})
