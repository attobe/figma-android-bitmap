import * as React from 'react'
import * as M from 'materialize-css'
import { Density } from '../common/Density'
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
    this.setState({ densities: densities })
  }

  onDirectoryFormatChange(textField: HTMLInputElement): void {
    const directoryFormat = textField.value || null
    this.setState({ directoryFormat: directoryFormat })
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
                  <div className="col s4 valign-wrapper e4a-image-source">
                    <ImagePreview src={imageConversion.dataUri} width={96} height={96} />
                  </div>
                  {/*
                  <div className="col s4">
                    <select ref={ref => this.onSelectRef(ref)} value="image/webp">
                      <option value="image/webp">WEBP</option>
                      <option value="image/png">PNG</option>
                      <option value="image/jpeg">JPEG</option>
                    </select>
                  </div>
                  <div className="col s4">Alvin</div>
                  */}
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
