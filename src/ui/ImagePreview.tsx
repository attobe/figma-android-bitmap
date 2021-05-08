import * as React from 'react'

interface Props {
  src: string
  width: number
  height: number
}

export class ImagePreview extends React.Component<Props, {}> {
  private canvasRef?: HTMLCanvasElement

  onCanvasRef(ref: HTMLCanvasElement) {
    this.canvasRef = ref
  }

  componentDidMount() {
    const image = new Image()
    image.onload = () => {
      const canvas = this.canvasRef

      const imageWidth = image.width
      const imageHeight = image.height
      const gridPixel = 10

      const scale = Math.min(canvas.width / imageWidth, canvas.height / imageHeight)

      const canvasWidth = canvas.width / scale
      const canvasHeight = canvas.height / scale
      const x = (canvasWidth - imageWidth) / 2.0
      const y = (canvasHeight - imageHeight) / 2.0

      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)

      for (let i = 0; i < imageWidth / gridPixel; i++) {
        for (let j = 0; j < imageHeight / gridPixel; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillStyle = 'lightgray'
          } else {
            ctx.fillStyle = 'whitesmoke'
          }
          ctx.fillRect(
            x + i * gridPixel,
            y + j * gridPixel,
            Math.min(gridPixel, imageWidth - i * gridPixel),
            Math.min(gridPixel, imageHeight - j * gridPixel)
          )
        }
      }

      ctx.drawImage(image, x, y, imageWidth, imageHeight)
    }
    image.src = this.props.src
  }

  render() {
    return (
      <canvas
        className="e4a-image-preview"
        ref={ref => this.onCanvasRef(ref)}
        width={this.props.width}
        height={this.props.height}
        />
    )
  }
}
