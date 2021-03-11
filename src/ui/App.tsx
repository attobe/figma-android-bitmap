import * as React from 'react'
import * as M from 'materialize-css'
import { Density } from '../common/Density'
import { ImageFormat } from '../common/ImageFormat'
import { FigmaImageData } from '../common/FigmaImageData'
import * as Message from '../common/Message'
import { ImageConversion } from './ImageConversion'
import { ImagePreview } from './ImagePreview'
import * as JSZip from 'jszip'

interface State {
  densities: Set<Density>
  directoryFormat?: string
  imageConversions?: ImageConversion[]
}

export default class App extends React.Component<{}, State> {
  static readonly defaultDirectoryFormat = 'drawable-{}'

  constructor(props) {
    super(props)

    this.state = {
      densities: new Set(Density.densities.filter(density => density.isFamous)),
      directoryFormat: null
    }

    Message.addFigmaImageDataLoadedHandler(imageData => {
      const imageConversions = imageData.map(data => new ImageConversion(data))
      this.setState({ imageConversions })
    })
  }

  componentDidMount() {
    Message.postFigmaImageDataRequested()
  }

  onDensityChange(density: Density): void {
    const densities = this.state.densities
    if (densities.has(density)) {
      densities.delete(density)
    } else {
      densities.add(density)
    }
    this.setState({ densities })
  }

  onDirectoryFormatChange(textField: HTMLInputElement): void {
    const directoryFormat = textField.value || null
    this.setState({ directoryFormat })
  }

  onImageNameChange(i: number, name?: string): void {
    const imageConversions = this.state.imageConversions
    imageConversions[i].name = name
    this.setState({ imageConversions })
  }

  onImageFormatChange(i: number, formatName: string): void {
    const imageConversions = this.state.imageConversions
    imageConversions[i].format = ImageFormat.formatByName(formatName)
    this.setState({ imageConversions })
  }

  onImageQualityChange(i: number, quality?: string): void {
    if (quality != null) {
      const percentage = parseInt(quality, 10)
      if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
        const imageConversions = this.state.imageConversions
        imageConversions[i].quality = percentage / 100.0
        this.setState({ imageConversions })
      }
    }
  }

  onExport(): void {
    const convertPromises = this.state.imageConversions
      .map(conversion => conversion.convert(this.state.densities))

    Promise.all(convertPromises)
      .then(conversionResults => {
        const zip = JSZip()
        const directoryFormat = this.state.directoryFormat || App.defaultDirectoryFormat

        conversionResults.forEach(conversionResult => {
          const conversion = conversionResult.conversion
          conversionResult.densityBlobs.forEach(({ density, blob }) => {
            const directoryName = directoryFormat.replace('{}', density.name)
            const fileName = `${conversion.name}.${conversion.format.ext}`
            const path = `res/${directoryName}/${fileName}`
            zip.file(path, blob)
          })
        })

        return zip.generateAsync({ type: 'blob' })
      })
      .then(blob => {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = 'res.zip'
        link.click()
        Message.postExported()
      })
  }

  onSelectRef(ref: HTMLSelectElement): void {
    M.FormSelect.init(ref)
  }

  render() {
    return (
      <div className="e4a-plugin row">

        <div className="input-field col s12">
          <label className="active">Densities</label>

          {Density.densities.map(density =>
            <p key={`density-${density.name}`}>
              <label>
                <input
                  className="filled-in"
                  type="checkbox"
                  checked={this.state.densities.has(density)}
                  onChange={() => this.onDensityChange(density)}
                  />
                <span>{density.name} (x{density.scale})</span>
              </label>
            </p>
          )}
        </div>

        <div className="input-field col s12">
          <input
            className="validate"
            pattern="[a-zA-Z0-9-]+\{\}[a-zA-Z0-9-]*"
            type="text"
            id="directory-name"
            placeholder={App.defaultDirectoryFormat}
            value={this.state.directoryFormat || ''}
            onChange={(event) => this.onDirectoryFormatChange(event.target)}
            />
          <label className="active" htmlFor="directory-name">Directory Name</label>
          <span className="helper-text" data-error="Invalid format">
            Specify directory name format; such as <code>drawable-ja-{'{}'}-v29</code>.<br />
            <code>{'{}'}</code> will be replaced with densities.
          </span>
        </div>

        {this.state.imageConversions && (
          <div className="input-field col s12">
            <ul className="collection e4a-image-conversion">
              {this.state.imageConversions.map((imageConversion, i) =>
                <li key={`vector-image-${i}`} className="collection-item row">
                  <div className="input-field col s4">
                    <input
                      className="validate"
                      pattern="[a-zA-Z0-9_]+"
                      type="text"
                      id={`image-name-${i}`}
                      value={imageConversion.name || ''}
                      onChange={event => this.onImageNameChange(i, event.target.value || null)}
                      />
                    <label className="active" htmlFor={`image-name-${i}`}>Name</label>
                  </div>
                  <div className="col s3 valign-wrapper e4a-image-source">
                    <ImagePreview src={imageConversion.dataUri} width={96} height={96} />
                  </div>
                  <div className="input-field col s3">
                    <select
                      ref={ref => this.onSelectRef(ref)}
                      id={`image-format-${i}`}
                      value={imageConversion.format.name}
                      onChange={event => this.onImageFormatChange(i, event.target.value)}>
                      {ImageFormat.bitmaps.map(format => (
                        <option
                          key={`image-format-${i}-${format.ext}`}
                          value={format.name}>{format.name}</option>
                      ))}
                    </select>
                    <label >Format</label>
                  </div>
                  <div className={`input-field col s2 ${imageConversion.format.hasQuality ? '' : 'hide'}`}>
                    <input
                      className="validate"
                      pattern="[a-zA-Z0-9_]+"
                      type="text"
                      id={`image-quality-${i}`}
                      value={Math.round(imageConversion.quality * 100) || ''}
                      onChange={event => this.onImageQualityChange(i, event.target.value || null)}
                      />
                    <label className="active" htmlFor={`image-quality-${i}`}>Quality</label>
                  </div>
                </li>
              )}
            </ul>
          </div>
        ) || (
          <div className="input-field col s12">
            <div className="progress">
              <div className="indeterminate" />
            </div>
          </div>
        )}

        <div className="input-field col s12">
          <button
            className="btn waves-effect waves-light"
            type="submit"
            name="action"
            onClick={() => this.onExport()}>
            Export
          </button>
        </div>

      </div>
    )
  }
}
