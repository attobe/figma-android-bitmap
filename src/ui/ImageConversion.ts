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
  private _qualityPercentage?: string

  constructor(
    readonly figmaImageData: FigmaImageData,
    public name: string|null = figmaImageData.name,
    public format: ImageFormat = ImageFormat.webp,
    private _quality: number = 1.0
  ) {
    this._qualityPercentage = Math.round(_quality * 100).toString()
  }

  get quality(): number {
    return this._quality
  }

  get qualityPercentage(): string|null {
    return this._qualityPercentage
  }

  set qualityPercentage(value: string|null) {
    this._qualityPercentage= value
    if (value !== null) {
      const quality = parseInt(value, 10)
      if (!isNaN(quality) && quality >= 0 && quality <= 100) {
        this._quality = quality / 100.0
      }
    }
  }

  get dataUri(): string {
    const format = ImageFormat.formatByName(this.figmaImageData.formatName)
    const base64Data = btoa(String.fromCharCode.apply(null, this.figmaImageData.data))
    return `data:${format.mimeType};base64,${base64Data}`
  }

  convertAll(densities: Set<Density>): Promise<ConversionResult> {
    const promises: Promise<DensityBlob>[] = []
    densities.forEach(density => {
      promises.push(this.convert(density)
        .then(blob => {
          return { density, blob }
        }))
    })
    return Promise.all(promises)
      .then(densityBlobs => {
        return { conversion: this, densityBlobs }
      })
  }

  convert(density: Density): Promise<Blob> {
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
          resolve(blob)
        }, this.format.mimeType, this.quality)
      }
      image.src = this.dataUri
    })
  }
}
