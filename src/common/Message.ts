import { FigmaImageData } from './FigmaImageData'
import { isSandbox } from './Environment'

function addHandler(handler: (any) => void) {
  const container = isSandbox() ? figma.ui : window
  const originalHandler = container.onmessage
  container.onmessage = function(msg) {
    if (isSandbox()) {
      handler(msg)
    } else {
      handler(msg.data.pluginMessage)
    }

    if (originalHandler) {
      originalHandler.apply(this, arguments)
    }
  }
}

function post(message: any) {
  if (isSandbox()) {
    figma.ui.postMessage(message)
  } else {
    window.parent.postMessage({ pluginMessage: message }, '*')
  }
}

const typeFigmaImageDataRequested = "figma-image-data-requested"

export function postFigmaImageDataRequested() {
  post({ type: typeFigmaImageDataRequested })
}

export function addFigmaImageDataRequestedHandler(handler: () => void) {
  addHandler(msg => {
    if (msg.type === typeFigmaImageDataRequested) {
      handler()
    }
  })
}

const typeFigmaImageDataLoaded = "figma-image-data-loaded"

export function postFigmaImageDataLoaded(imageData: FigmaImageData[]) {
  post({ type: typeFigmaImageDataLoaded, imageData })
}

export function addFigmaImageDataLoadedHandler(handler: (imageData: FigmaImageData[]) => void) {
  addHandler(msg => {
    if (msg.type === typeFigmaImageDataLoaded) {
      handler(msg.imageData)
    }
  })
}

const typeExported = "exported"

export function postExported() {
  post({ type: typeExported })
}

export function addExportedHandler(handler: () => void) {
  addHandler(msg => {
    if (msg.type === typeExported) {
      handler()
    }
  })
}
