import { Density } from '../common/Density'
import { FigmaImageData } from '../common/FigmaImageData'
import { ImageFormat} from '../common/ImageFormat'
import * as Message from '../common/Message'

const selections = figma.currentPage.selection
if (selections.length == 0) {
  figma.closePlugin('Please select at least one node')
} else {
  figma.showUI(__html__, { width: 560, height: 720 })

  Message.addFigmaImageDataRequestedHandler(() => {
    const format = ImageFormat.svg
    const exportData = selections.map(selection => {
      // wrap figma exportAsync for error handling
      const exportAsync = new Promise<Uint8Array>((resolve, reject) =>
        selection.exportAsync({ format: 'SVG' })
          .then(image => resolve(image), error => reject(error))
      )

      return exportAsync
        .then((image): FigmaImageData => {
          return {
            name: selection.name,
            width: selection.width,
            height: selection.height,
            formatName: format.name,
            data: image
          }
        })
    })

    Promise.all(exportData)
      .then(images => {
        Message.postFigmaImageDataLoaded(images)
      }, error => {
        figma.closePlugin(`Fail converting node to vector image: ${error}`)
      })
  })

  Message.addExportedHandler(() => {
      figma.closePlugin()
  })
}
