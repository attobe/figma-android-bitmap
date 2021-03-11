import * as React from 'react'
import * as M from 'materialize-css'
import { ImageFormat } from '../common/ImageFormat'
import { ImageConversion } from './ImageConversion'
import { ImagePreview } from './ImagePreview'

interface Props {
  uniquifier: number
  conversion: ImageConversion
  className?: string
  onChange: ((conversion: ImageConversion) => void)
}

export class ImageConversionItem extends React.Component<Props, {}> {

  onSelectRef(ref: HTMLSelectElement): void {
    M.FormSelect.init(ref)
  }

  onNameChange(name?: string): void {
    this.props.conversion.name = name
    this.props.onChange(this.props.conversion)
  }

  onFormatChange(formatName: string): void {
    this.props.conversion.format = ImageFormat.formatByName(formatName)
    this.props.onChange(this.props.conversion)
  }

  onQualityChange(qualityPercentage?: string): void {
    this.props.conversion.qualityPercentage = qualityPercentage
    this.props.onChange(this.props.conversion)
  }

  render() {
    const { uniquifier, conversion, className } = this.props
    return (
      <li className={className}>
        <div className="input-field col s4">
          <input
            className="validate"
            pattern="[a-zA-Z0-9_]+"
            type="text"
            id={`image-name-${uniquifier}`}
            value={conversion.name || ''}
            onChange={event => this.onNameChange(event.target.value || null)}
            />
          <label className="active" htmlFor={`image-name-${uniquifier}`}>Name</label>
        </div>

        <div className="col s3 valign-wrapper e4a-image-source">
          <ImagePreview src={conversion.dataUri} width={96} height={96} />
        </div>

        <div className="input-field col s3">
          <select
            ref={ref => this.onSelectRef(ref)}
            id={`image-format-${uniquifier}`}
            value={conversion.format.name}
            onChange={event => this.onFormatChange(event.target.value)}>
            {ImageFormat.bitmaps.map(format => (
              <option
                key={`image-format-${uniquifier}-${format.ext}`}
                value={format.name}>{format.name}</option>
            ))}
          </select>
          <label >Format</label>
        </div>

        <div className={`input-field col s2 ${conversion.format.hasQuality ? '' : 'hide'}`}>
          <input
            className="validate"
            pattern="[a-zA-Z0-9_]+"
            type="text"
            id={`image-quality-${uniquifier}`}
            value={conversion.qualityPercentage || ''}
            onChange={event => this.onQualityChange(event.target.value || null)}
            />
          <label className="active" htmlFor={`image-quality-${uniquifier}`}>Quality</label>
        </div>
      </li>
    )
  }
}
