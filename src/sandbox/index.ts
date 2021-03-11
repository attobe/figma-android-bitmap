import { Density } from '../common/Density'
import { FigmaImageData } from '../common/FigmaImageData'
import { ImageFormat} from '../common/ImageFormat'
import * as Message from '../common/Message'

const selections = figma.currentPage.selection
if (selections.length == 0) {
  figma.closePlugin('Please select at least one node')
} else {
  figma.showUI(__html__, { width: 480, height: 720 })

  Message.addFigmaImageDataRequestedHandler(() => {
    const format = ImageFormat.svg
    const exportData = selections.map(selection => {
      return selection
        .exportAsync({ format: 'SVG' })
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
