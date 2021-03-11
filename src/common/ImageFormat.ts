export class ImageFormat {
  constructor(
    readonly name: string,
    readonly mimeType: string,
    readonly ext: string,
    readonly hasQuality: boolean,
    readonly isVector: boolean
  ) {}

  static webp: ImageFormat = new ImageFormat('WEBP', 'image/webp', 'webp', true, false)
  static png: ImageFormat = new ImageFormat('PNG', 'image/png', 'png', false, false)
  static jpeg: ImageFormat = new ImageFormat('JPEG', 'image/jpeg', 'jpg', true, false)
  static svg: ImageFormat = new ImageFormat('SVG', 'image/svg+xml', 'svg', false, true)

  static readonly bitmaps: ImageFormat[] = [
    ImageFormat.webp, ImageFormat.png, ImageFormat.jpeg
  ]

  static readonly formats: ImageFormat[] = [
    ImageFormat.webp, ImageFormat.png, ImageFormat.jpeg, ImageFormat.svg
  ]

  static formatByName(name: string): ImageFormat {
    return ImageFormat.formats.find(format => format.name === name)
  }
}
