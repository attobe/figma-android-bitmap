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
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height)

      const width = canvas.width / scale
      const height = canvas.height / scale
      const x = (width - image.width) / 2.0
      const y = (height - image.height) / 2.0

      const ctx = canvas.getContext('2d')
      ctx.scale(scale, scale)

      const gridPixel = 10
      for (let i = 0; i < image.width / gridPixel; i++) {
        for (let j = 0; j < image.height / gridPixel; j++) {
          if ((i + j) % 2 === 0) {
            ctx.fillStyle = 'black'
          } else {
            ctx.fillStyle = 'gray'
          }
          ctx.fillRect(
            x + i * gridPixel,
            y + j * gridPixel,
            Math.min(gridPixel, image.width - i * gridPixel),
            Math.min(gridPixel, image.height - j * gridPixel)
          )
        }
      }

      ctx.drawImage(image, x, y)
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
