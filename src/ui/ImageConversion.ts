import { ImageFormat } from '../common/ImageFormat'
import { FigmaImageData } from '../common/FigmaImageData'
import { Density } from '../common/Density'

interface DensityBlob {
  density: Density
  blob: Blob
}

interface ConversionResult {
  conversion: ImageConversion
  densityBlobs: DensityBlob[]
}

export class ImageConversion {
  constructor(
    readonly figmaImageData: FigmaImageData,
    public name: string = figmaImageData.name,
    public format: ImageFormat = ImageFormat.webp,
    public quality: number = 1.0
  ) {}

  get dataUri(): string {
    const format = ImageFormat.formatByName(this.figmaImageData.formatName)
    const base64Data = btoa(String.fromCharCode.apply(null, this.figmaImageData.data))
    return `data:${format.mimeType};base64,${base64Data}`
  }

  convert(densities: Set<Density>): Promise<ConversionResult> {
    const promises: Promise<DensityBlob>[] = []
    densities.forEach(density => {
      promises.push(this.convertWithDensity(density))
    })
    return Promise.all(promises)
      .then(densityBlobs => {
        return { conversion: this, densityBlobs }
      })
  }

  private convertWithDensity(density: Density): Promise<DensityBlob> {
    return new Promise(resolve => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = image.width * density.scale
        canvas.height = image.height * density.scale

        const ctx = canvas.getContext('2d')
        ctx.scale(density.scale, density.scale)
        ctx.drawImage(image, 0, 0)

        canvas.toBlob(blob => {
          resolve({ density, blob })
        }, this.format.mimeType, this.quality)
      }
      image.src = this.dataUri
    })
  }
}
