import * as React from 'react'
import * as Message from '../common/Message'
import { Density } from '../common/Density'
import { DensityField } from './DensityField'
import { ImageConversion } from './ImageConversion'
import { ImageConversionItem } from './ImageConversionItem'
import * as JSZip from 'jszip'

interface State {
  densities: Set<Density>
  directoryFormat?: string
  conversions?: ImageConversion[]
}

export default class App extends React.Component<{}, State> {
  static readonly directoryFormatPattern = '[a-zA-Z0-9-]+\\{\\}[a-zA-Z0-9-]*'
  static readonly defaultDirectoryFormat = 'drawable-{}'

  constructor(props) {
    super(props)

    this.state = {
      densities: new Set(Density.densities.filter(density => density.isFamous)),
      directoryFormat: null
    }

    Message.addFigmaImageDataLoadedHandler(imageData => {
      const conversions = imageData.map(data => new ImageConversion(data))
      this.setState({ conversions })
    })
  }

  componentDidMount() {
    Message.postFigmaImageDataRequested()
  }

  get canExport(): boolean {
    if (this.state.densities.size === 0) {
      return false
    }

    const directoryFormat = this.state.directoryFormat
    if (directoryFormat !== null) {
      const pattern = new RegExp(App.directoryFormatPattern)
      const result = directoryFormat.match(pattern)
      if (result === null || result[0] !== directoryFormat) {
        return false
      }
    }

    const conversions = this.state.conversions
    if (conversions === null) {
      return false
    }

    return true
  }

  onDensitiesChange(densities: Set<Density>): void {
    this.setState({ densities })
  }

  onDirectoryFormatChange(textField: HTMLInputElement): void {
    const directoryFormat = textField.value || null
    this.setState({ directoryFormat })
  }

  onConversionChange(i: number, conversion: ImageConversion): void {
    const conversions = this.state.conversions
    conversions[i] = conversion
    this.setState({ conversions })
  }

  onExport(): void {
    const convertPromises = this.state.conversions
      .map(conversion => conversion.convertAll(this.state.densities))

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

  render() {
    return (
      <div className="e4a-plugin row">

        <DensityField
          className="input-field col s12"
          densities={this.state.densities}
          onChange={densities => this.onDensitiesChange(densities)}
          />

        <div className="input-field col s12">
          <input
            className="validate"
            pattern={App.directoryFormatPattern}
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

        {this.state.conversions && (
          <div className="input-field col s12">
            <ul className="collection e4a-image-conversion">
              {this.state.conversions.map((conversion, i) =>
                <ImageConversionItem
                  key={`image-conversion-item-${i}`}
                  uniquifier={i}
                  conversion={conversion}
                  className="collection-item row"
                  onChange={(conversion: ImageConversion) => this.onConversionChange(i, conversion)}
                  />
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
            disabled={!this.canExport}
            onClick={() => this.onExport()}>
            Export
          </button>
        </div>

      </div>
    )
  }
}
